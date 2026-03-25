#!/usr/bin/env node
/**
 * Generate Artifact (Promotion)
 *
 * Hard guarantees:
 * - Only allowed transition: private_dev -> internal_benchmark
 * - Never mutates source run bundle; creates a new artifact
 *
 * Usage:
 *   node scripts/generate_artifact.mjs --run private/runs/runbundle.json --out lab/_inbox
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { CLASSIFICATION, classifyPath, assertPromotionAllowed, readJson, writeJson } from "./guards.mjs";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) args[key] = true;
    else { args[key] = next; i++; }
  }
  return args;
}

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function main() {
  const args = parseArgs(process.argv);
  const runPath = args.run;
  const outDir = args.out || "lab/_inbox";
  const actor = args.actor || "local-user";

  if (!runPath) {
    console.error("Missing --run <path-to-runbundle.json>");
    process.exit(2);
  }
  if (!fs.existsSync(runPath)) {
    console.error(`RunBundle not found: ${runPath}`);
    process.exit(2);
  }

  const run = readJson(runPath);

  const inputClass = run.classification ?? classifyPath(runPath) ?? null;
  if (!inputClass) {
    console.error("RunBundle classification missing. Set run.classification or place under private/lab/public.");
    process.exit(2);
  }

  try {
    assertPromotionAllowed(inputClass, CLASSIFICATION.INTERNAL_BENCHMARK);
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(2);
  }

  if (run.status && run.status !== "verified") {
    console.error("Promotion requires status=verified.");
    process.exit(2);
  }

  const artifact = {
    artifact_id: `ART-${sha256(`${run.run_id}|${run.protocol_hash}|${nowIso()}`).slice(0, 12).toUpperCase()}`,
    source_run_id: run.run_id,
    protocol_id: run.protocol_id,
    protocol_version: run.protocol_version,
    protocol_hash: run.protocol_hash,
    env_fingerprint: run.env_fingerprint,
    code_version: run.code_version,
    benchmark_suite_hash: run.benchmark_suite_hash ?? "SUITE-9C3F2A1D7B44",
    actor,
    created_at: nowIso(),
    classification: CLASSIFICATION.INTERNAL_BENCHMARK
  };

  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${artifact.artifact_id}.json`);
  writeJson(outPath, artifact);

  console.log(outPath);
}

main();
