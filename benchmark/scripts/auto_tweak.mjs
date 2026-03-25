#!/usr/bin/env node
/**
 * Scheduled Auto-Tweak (Suite / Testlab only)
 *
 * Hard guarantees:
 * - Requires classification=private_dev
 * - Refuses to write into public/
 * - Default output is private/tweaks/
 *
 * Usage:
 *   node scripts/auto_tweak.mjs --minutes 30 --artifact private/_inbox/artifact.json
 *
 * Optional:
 *   --objective syntax.pass_rate
 *   --tweakables scripts/tweakables.json
 *   --out private/tweaks
 *   --seed 123
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { CLASSIFICATION, assertSuiteOnly, assertNoPublicExportFromPrivate, classifyPath, readJson, writeJson } from "./guards.mjs";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

// Deterministic PRNG (Mulberry32)
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toIntSeed(s) {
  const h = sha256(s);
  return parseInt(h.slice(0, 8), 16) >>> 0;
}

function getObjective(metricsSummary, objective) {
  const parts = objective.split(".");
  const comp = parts[0];
  const key = parts[1];

  const c = metricsSummary?.summary?.[comp];
  if (!c) return -Infinity;

  if (key === "pass_rate") return Number(c.pass_rate ?? -Infinity);
  if (key === "score" && parts[2] === "mean") return Number(c.score?.mean ?? -Infinity);
  return -Infinity;
}

function defaultTweakables() {
  return {
    variables: [
      { name: "max_steps", type: "int", min: 1, max: 8 },
      { name: "beam_width", type: "int", min: 1, max: 5 },
      { name: "temperature", type: "float", min: 0.0, max: 0.9 },
      { name: "strictness", type: "enum", values: ["low", "medium", "high"] }
    ],
    mutation: { p_resample: 0.35, step_scale: 0.25 }
  };
}

function sampleVar(rand, spec, current) {
  if (spec.type === "enum") {
    const idx = Math.floor(rand() * spec.values.length);
    return spec.values[idx];
  }
  if (spec.type === "int") {
    if (current == null || rand() < 0.35) {
      return Math.floor(spec.min + rand() * (spec.max - spec.min + 1));
    }
    const range = spec.max - spec.min;
    const step = Math.max(1, Math.floor(range * 0.25));
    const delta = Math.floor((rand() * 2 - 1) * step);
    return Math.min(spec.max, Math.max(spec.min, Number(current) + delta));
  }
  if (spec.type === "float") {
    if (current == null || rand() < 0.35) {
      const v = spec.min + rand() * (spec.max - spec.min);
      return Number(v.toFixed(4));
    }
    const range = spec.max - spec.min;
    const step = range * 0.25;
    const delta = (rand() * 2 - 1) * step;
    const v = Math.min(spec.max, Math.max(spec.min, Number(current) + delta));
    return Number(v.toFixed(4));
  }
  return current;
}

function mutateConfig(rand, tweakables, baseConfig) {
  const next = { ...baseConfig };
  for (const v of tweakables.variables) {
    if (rand() < 0.55) next[v.name] = sampleVar(rand, v, baseConfig[v.name]);
  }
  return next;
}

function main() {
  const args = parseArgs(process.argv);

  const minutes = Number(args.minutes ?? "30");
  const artifactPath = args.artifact;
  const outRoot = args.out ?? "private/tweaks";
  const objective = args.objective ?? "syntax.pass_rate";
  const tweakablesPath = args.tweakables ?? "scripts/tweakables.json";

  if (!artifactPath) {
    console.error("Missing --artifact <path>");
    process.exit(2);
  }

  const artifact = readJson(artifactPath);

  const inputClass = artifact.classification ?? classifyPath(artifactPath) ?? null;
  if (!inputClass) {
    console.error("Artifact classification missing. Set artifact.classification or place under private/lab/public.");
    process.exit(2);
  }

  // Suite-only enforcement
  try {
    assertSuiteOnly(inputClass);
    assertNoPublicExportFromPrivate({ inputClassification: inputClass, outDir: outRoot });
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(2);
  }

  const tweakables = fs.existsSync(tweakablesPath) ? readJson(tweakablesPath) : defaultTweakables();

  const deadline = Date.now() + minutes * 60 * 1000;
  const seedBasis = `${artifact.protocol_hash}|${artifact.env_fingerprint}|${artifact.code_version}|AUTO_TWEAK|${args.seed ?? ""}`;
  const rand = mulberry32(toIntSeed(seedBasis));

  let bestConfig = null;
  let bestScore = -Infinity;

  const runId = `TWEAK-${sha256(`${artifact.artifact_id}|${nowIso()}`).slice(0, 10).toUpperCase()}`;
  const runDir = path.join(outRoot, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const historyPath = path.join(runDir, "history.jsonl");
  fs.writeFileSync(historyPath, "", "utf-8");

  console.log(`Auto-tweak run: ${runId}`);
  console.log(`Objective: ${objective}`);
  console.log(`Time budget: ${minutes} min`);
  console.log(`Outputs: ${runDir}`);
  console.log(`Classification: ${inputClass}`);

  let iter = 0;
  let baseConfig = {};

  while (Date.now() < deadline) {
    iter++;

    const candidateConfig = iter === 1
      ? mutateConfig(rand, tweakables, baseConfig)
      : mutateConfig(rand, tweakables, bestConfig ?? baseConfig);

    const iterArtifact = {
      ...artifact,
      created_at: nowIso(),
      artifact_id: `ART-${sha256(`${artifact.artifact_id}|${runId}|${iter}|${JSON.stringify(candidateConfig)}`).slice(0, 12).toUpperCase()}`,
      classification: CLASSIFICATION.PRIVATE_DEV,
      suite_params: candidateConfig
    };

    const inboxDir = path.join(runDir, "_inbox");
    fs.mkdirSync(inboxDir, { recursive: true });
    const iterArtifactPath = path.join(inboxDir, `artifact_iter_${iter}.json`);
    writeJson(iterArtifactPath, iterArtifact);

    const proc = spawnSync(
      process.execPath,
      ["scripts/run_benchmarks.mjs", "--artifact", iterArtifactPath, "--out", runDir],
      { stdio: "inherit" }
    );

    if (proc.status !== 0) {
      fs.appendFileSync(historyPath, JSON.stringify({ iter, timestamp: nowIso(), status: "incomplete", config: candidateConfig }) + "\n", "utf-8");
      continue;
    }

    const outDir = path.join(runDir, iterArtifact.artifact_id);
    const summaryPath = path.join(outDir, "metrics_summary.json");
    if (!fs.existsSync(summaryPath)) {
      fs.appendFileSync(historyPath, JSON.stringify({ iter, timestamp: nowIso(), status: "incomplete", reason: "missing_metrics_summary", config: candidateConfig }) + "\n", "utf-8");
      continue;
    }

    const summary = readJson(summaryPath);
    const score = getObjective(summary, objective);

    fs.appendFileSync(historyPath, JSON.stringify({ iter, timestamp: nowIso(), status: "complete", score, artifact_id: iterArtifact.artifact_id, config: candidateConfig }) + "\n", "utf-8");

    if (score > bestScore) {
      bestScore = score;
      bestConfig = candidateConfig;

      writeJson(path.join(runDir, "best_config.json"), bestConfig);
      writeJson(path.join(runDir, "best_result.json"), {
        objective,
        bestScore,
        bestArtifactId: iterArtifact.artifact_id,
        updated_at: nowIso()
      });
    }

    console.log(`Iter ${iter}: score=${Number.isFinite(score) ? score.toFixed(4) : String(score)} best=${Number.isFinite(bestScore) ? bestScore.toFixed(4) : String(bestScore)}`);
  }

  writeJson(path.join(runDir, "tweak_run_summary.json"), {
    run_id: runId,
    objective,
    bestScore,
    bestConfig,
    ended_at: nowIso(),
    classification: CLASSIFICATION.PRIVATE_DEV
  });

  console.log("Auto-tweak finished.");
  console.log(`Best score: ${bestScore}`);
  console.log(`Best config: ${path.join(runDir, "best_config.json")}`);
}

main();
