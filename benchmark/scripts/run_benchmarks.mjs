#!/usr/bin/env node
/**
 * SPIN Evaluation Lab — Benchmark Runner (no deps)
 *
 * Hard guarantees:
 * - Reads artifact classification (or infers from path: private/lab/public)
 * - Refuses to export private_dev outputs into public/
 *
 * Produces:
 * - <out>/<artifact_id>/...
 *
 * Usage:
 *   node scripts/run_benchmarks.mjs --artifact private/_inbox/artifact.json
 *
 * Optional:
 *   --policy policies/eval_policy.yaml
 *   --suite benchmarks/suite.json
 *   --out lab/artifacts
 *   --seed 123
 *   --flowCmd "node path/to/flow_cli.mjs"
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import process from "node:process";
import { CLASSIFICATION, classifyPath, assertNoPublicExportFromPrivate } from "./guards.mjs";
import { mockEvaluateExample, cliEvaluateExample } from "./flow_adapter.mjs";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf-8");
}

function appendLine(p, lineObj) {
  fs.appendFileSync(p, JSON.stringify(lineObj) + "\n", "utf-8");
}

// Minimal YAML parser for our tiny policy file (key: value, arrays with "- ")
function readPolicyYaml(p) {
  const txt = fs.readFileSync(p, "utf-8");
  const lines = txt
    .split(/\r?\n/g)
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== "" && !l.trim().startsWith("#"));

  const out = {};
  let currentKey = null;

  for (const line of lines) {
    const t = line.trim();
    if (t.includes(":")) {
      const [kRaw, ...rest] = t.split(":");
      const k = kRaw.trim();
      const vRaw = rest.join(":").trim();
      if (vRaw === "") {
        out[k] = [];
        currentKey = k;
      } else {
        if (vRaw === "true") out[k] = true;
        else if (vRaw === "false") out[k] = false;
        else out[k] = vRaw;
        currentKey = null;
      }
    } else if (t.startsWith("- ") && currentKey) {
      out[currentKey].push(t.slice(2));
    }
  }
  return out;
}

function defaultSuite() {
  return {
    suite_id: "SUITE-DEFAULT",
    suite_version: "1.0.0",
    components: [
      { id: "syntax", name: "Syntax Benchmark", kind: "quality" },
      { id: "determinism", name: "Determinism Replay", kind: "integrity" },
      { id: "regression", name: "Regression Guard", kind: "integrity" },
      { id: "efficiency", name: "Efficiency Metrics", kind: "efficiency" },
      { id: "slices", name: "Slice Report", kind: "analysis" }
    ]
  };
}

function loadSuite(p) {
  if (!p) return defaultSuite();
  if (!fs.existsSync(p)) return defaultSuite();
  return readJson(p);
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

function nowIso() {
  return new Date().toISOString();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sliceKey(example) {
  const len = example.input.length;
  const lenBucket = len < 50 ? "short" : len < 120 ? "medium" : "long";
  return `${example.category}|${lenBucket}`;
}

function aggregate(values) {
  if (values.length === 0) return { mean: 0, min: 0, max: 0 };
  let sum = 0;
  let mn = values[0];
  let mx = values[0];
  for (const v of values) {
    sum += v;
    if (v < mn) mn = v;
    if (v > mx) mx = v;
  }
  return { mean: sum / values.length, min: mn, max: mx };
}

// Mock dataset for now
function mockDataset() {
  return [
    { id: "ex-001", category: "core", input: "alpha beta gamma", expected: "OK" },
    { id: "ex-002", category: "core", input: "delta epsilon zeta eta theta iota kappa", expected: "OK" },
    { id: "ex-003", category: "edge", input: "<<< MALFORMED >>>", expected: "FAIL" },
    { id: "ex-004", category: "edge", input: "a".repeat(160), expected: "OK" },
    { id: "ex-005", category: "stress", input: "x".repeat(420), expected: "OK" }
  ];
}

// Policy enforcement stub
function enforcePolicy(policy, artifact, suite) {
  const problems = [];

  if (policy.web_access !== false) problems.push("Policy violation: web_access must be false for benchmarks.");
  if (policy.retrieval_access !== false) problems.push("Policy violation: retrieval_access must be false for benchmarks.");

  const forbidden = Array.isArray(policy.forbidden_strings) ? policy.forbidden_strings : [];
  const blob = JSON.stringify({ artifact, suite }).toLowerCase();
  for (const f of forbidden) {
    if (blob.includes(String(f).toLowerCase())) {
      problems.push(`Policy violation: forbidden_strings matched: "${f}"`);
    }
  }

  return problems;
}

async function main() {
  const args = parseArgs(process.argv);

  const artifactPath = args.artifact;
  if (!artifactPath) {
    console.error("Missing --artifact <path-to-artifact.json>");
    process.exit(2);
  }
  if (!fs.existsSync(artifactPath)) {
    console.error(`Artifact not found: ${artifactPath}`);
    process.exit(2);
  }

  const policyPath = args.policy || "policies/eval_policy.yaml";
  const suitePath = args.suite || "benchmarks/suite.json";
  const outRoot = args.out || "lab/artifacts";

  const artifact = readJson(artifactPath);
  const suite = loadSuite(suitePath);
  const policy = fs.existsSync(policyPath) ? readPolicyYaml(policyPath) : { web_access: false, retrieval_access: false };

  const inputClass = artifact.classification ?? classifyPath(artifactPath) ?? null;
  if (!inputClass) {
    console.error("Artifact classification missing. Set artifact.classification or place under private/lab/public.");
    process.exit(2);
  }

  // Refuse illegal public export from private inputs
  try {
    assertNoPublicExportFromPrivate({ inputClassification: inputClass, outDir: outRoot });
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(2);
  }

  // Deterministic seed derived from immutable inputs (artifact anchors)
  const seedBasis =
    `${artifact.artifact_id}|${artifact.protocol_hash}|${artifact.benchmark_suite_hash}|${artifact.env_fingerprint}|${artifact.code_version}|${args.seed ?? ""}`;
  const seed = toIntSeed(seedBasis);
  const rand = mulberry32(seed);

  const outDir = path.join(outRoot, artifact.artifact_id);
  ensureDir(outDir);

  // Snapshot
  writeJson(path.join(outDir, "artifact.json"), { ...artifact, classification: inputClass });

  // Environment snapshot (host-level)
  const envSnapshot = {
    os: { platform: os.platform(), release: os.release(), arch: os.arch() },
    node: process.version,
    cpu: os.cpus()?.[0]?.model ?? "unknown",
    cores: os.cpus()?.length ?? 0,
    timestamp: nowIso()
  };
  const envSnapshotHash = sha256(JSON.stringify(envSnapshot));

  const provenance = {
    actor: artifact.actor ?? "unknown",
    started_at: nowIso(),
    artifact_id: artifact.artifact_id,
    classification: inputClass,
    source_run_id: artifact.source_run_id,
    anchors: {
      protocol_hash: artifact.protocol_hash,
      benchmark_suite_hash: artifact.benchmark_suite_hash,
      env_fingerprint: artifact.env_fingerprint,
      code_version: artifact.code_version
    },
    policy: {
      policy_path: policyPath,
      policy_hash: fs.existsSync(policyPath) ? sha256(fs.readFileSync(policyPath, "utf-8")) : null
    },
    suite: {
      suite_path: fs.existsSync(suitePath) ? suitePath : null,
      suite_hash: sha256(JSON.stringify(suite))
    },
    host_env_snapshot: envSnapshot,
    host_env_snapshot_hash: envSnapshotHash,
    seed,
    protocol_version: artifact.protocol_version ?? null,
    protocol_id: artifact.protocol_id ?? null
  };
  writeJson(path.join(outDir, "run_provenance.json"), provenance);

  // Policy checks
  const policyProblems = enforcePolicy(policy, artifact, suite);
  if (policyProblems.length > 0) {
    writeJson(path.join(outDir, "run_status.json"), {
      status: "invalid",
      reason: "policy_violation",
      problems: policyProblems,
      timestamp: nowIso()
    });
    console.error("Run INVALID due to policy violations:");
    for (const p of policyProblems) console.error(" - " + p);
    process.exit(1);
  }

  // Initialize jobs
  const jobs = suite.components.map((c) => ({
    job_id: `JOB-${sha256(`${artifact.artifact_id}|${c.id}`).slice(0, 10).toUpperCase()}`,
    component_id: c.id,
    name: c.name,
    kind: c.kind,
    status: "Queued",
    started_at: null,
    ended_at: null
  }));
  writeJson(path.join(outDir, "jobs.json"), jobs);

  const auditPath = path.join(outDir, "audit_log.jsonl");
  appendLine(auditPath, {
    actor: provenance.actor,
    timestamp: nowIso(),
    event: "BENCHMARK_RUN_STARTED",
    artifact_id: artifact.artifact_id,
    classification: inputClass,
    source_run_id: artifact.source_run_id,
    protocol_hash: artifact.protocol_hash,
    benchmark_suite_hash: artifact.benchmark_suite_hash
  });

  const dataset = mockDataset();

  const metricsJsonlPath = path.join(outDir, "metrics.jsonl");
  if (fs.existsSync(metricsJsonlPath)) fs.unlinkSync(metricsJsonlPath);

  const t0 = Date.now();
  let simulatedTokens = 0;
  let peakMem = process.memoryUsage().rss;

  for (let i = 0; i < jobs.length; i++) {
    jobs[i].status = "Running";
    jobs[i].started_at = nowIso();
    writeJson(path.join(outDir, "jobs.json"), jobs);

    appendLine(auditPath, {
      actor: provenance.actor,
      timestamp: nowIso(),
      event: "JOB_STARTED",
      artifact_id: artifact.artifact_id,
      job_id: jobs[i].job_id,
      component_id: jobs[i].component_id
    });

    for (const ex of dataset) {
  // Real FLOW integration happens here via scripts/flow_adapter.mjs
  const flowCmd = args.flowCmd || process.env.FLOW_CMD || null;

  let result;
  if (flowCmd) {
    // CLI mode
    result = cliEvaluateExample({
      example: ex,
      protocol: {
        protocol_id: artifact.protocol_id ?? "unknown",
        protocol_version: artifact.protocol_version ?? "unknown",
        protocol_hash: artifact.protocol_hash ?? "unknown"
      },
      params: artifact.suite_params ?? {},
      flowCmd
    });
  } else {
    // Mock mode
    result = mockEvaluateExample({ example: ex, params: artifact.suite_params ?? {}, rand });
  }

  const ok = !!result.ok;

  simulatedTokens += Math.max(8, Math.floor(ex.input.length / 4));
  peakMem = Math.max(peakMem, process.memoryUsage().rss);

  appendLine(metricsJsonlPath, {
    artifact_id: artifact.artifact_id,
    job_id: jobs[i].job_id,
    component_id: jobs[i].component_id,
    example_id: ex.id,
    category: ex.category,
    input_len: ex.input.length,
    score: typeof result.score === "number" ? result.score : (ok ? 1 : 0),
    pass: ok,
    diagnostics: result.diagnostics ?? null
  });
}

    await sleep(150 + Math.floor(rand() * 120));

    jobs[i].status = "Complete";
    jobs[i].ended_at = nowIso();
    writeJson(path.join(outDir, "jobs.json"), jobs);

    appendLine(auditPath, {
      actor: provenance.actor,
      timestamp: nowIso(),
      event: "JOB_COMPLETED",
      artifact_id: artifact.artifact_id,
      job_id: jobs[i].job_id,
      component_id: jobs[i].component_id
    });
  }

  const lines = fs
    .readFileSync(metricsJsonlPath, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));

  const byComponent = new Map();
  for (const m of lines) {
    const key = m.component_id;
    if (!byComponent.has(key)) byComponent.set(key, []);
    byComponent.get(key).push(m);
  }

  const summary = {};
  for (const [comp, arr] of byComponent.entries()) {
    const scores = arr.map((x) => x.score);
    const passRate = arr.filter((x) => x.pass).length / arr.length;
    summary[comp] = {
      n: arr.length,
      score: aggregate(scores),
      pass_rate: passRate
    };
  }
  writeJson(path.join(outDir, "metrics_summary.json"), {
    artifact_id: artifact.artifact_id,
    classification: inputClass,
    generated_at: nowIso(),
    summary
  });

  const slices = {};
  for (const m of lines) {
    const s = sliceKey({ category: m.category, input: "x".repeat(m.input_len) });
    const key = `${m.component_id}::${s}`;
    if (!slices[key]) slices[key] = [];
    slices[key].push(m);
  }

  const sliceReport = Object.entries(slices).map(([k, arr]) => {
    const [component_id, slice_id] = k.split("::");
    const scores = arr.map((x) => x.score);
    const passRate = arr.filter((x) => x.pass).length / arr.length;
    return {
      component_id,
      slice_id,
      n: arr.length,
      score_mean: aggregate(scores).mean,
      pass_rate: passRate
    };
  });

  writeJson(path.join(outDir, "slices.json"), {
    artifact_id: artifact.artifact_id,
    classification: inputClass,
    generated_at: nowIso(),
    slices: sliceReport
  });

  const elapsedMs = Date.now() - t0;
  writeJson(path.join(outDir, "efficiency.json"), {
    artifact_id: artifact.artifact_id,
    classification: inputClass,
    generated_at: nowIso(),
    runtime_ms: elapsedMs,
    simulated_tokens: simulatedTokens,
    peak_rss_bytes: peakMem,
    throughput_examples_per_s: dataset.length / Math.max(1, elapsedMs / 1000)
  });

  appendLine(auditPath, {
    actor: provenance.actor,
    timestamp: nowIso(),
    event: "BENCHMARK_RUN_COMPLETED",
    artifact_id: artifact.artifact_id,
    classification: inputClass,
    metrics_summary_hash: sha256(fs.readFileSync(path.join(outDir, "metrics_summary.json"), "utf-8")),
    slices_hash: sha256(fs.readFileSync(path.join(outDir, "slices.json"), "utf-8")),
    efficiency_hash: sha256(fs.readFileSync(path.join(outDir, "efficiency.json"), "utf-8"))
  });

  writeJson(path.join(outDir, "run_status.json"), {
    status: "complete",
    artifact_id: artifact.artifact_id,
    classification: inputClass,
    ended_at: nowIso()
  });

  console.log(`Benchmarks complete: ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
