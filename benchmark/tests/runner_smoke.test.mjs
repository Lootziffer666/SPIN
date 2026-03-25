import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

test("run_benchmarks produces complete status with SPIN FLOW CLI (private)", () => {
  const root = process.cwd();

  // Create a temp workspace inside private/ so classification guards still apply.
  const tmpBase = path.join(root, "private", "_test_tmp");
  fs.mkdirSync(tmpBase, { recursive: true });

  const tmpDir = fs.mkdtempSync(path.join(tmpBase, "case-"));
  const inboxDir = path.join(tmpDir, "_inbox");
  const runsDir = path.join(tmpDir, "runs");
  fs.mkdirSync(inboxDir, { recursive: true });
  fs.mkdirSync(runsDir, { recursive: true });

  const artifact = {
    artifact_id: "ART-TEST-EXAMPLE",
    source_run_id: "RUN-TEST",
    protocol_id: "SPIN-PROTO-1",
    protocol_version: "1.0.0",
    protocol_hash: "PH-TEST",
    env_fingerprint: "ENV-TEST",
    code_version: "commit:test",
    benchmark_suite_hash: "SUITE-TEST",
    actor: "test",
    created_at: new Date().toISOString(),
    classification: "private_dev"
  };

  const artifactPath = path.join(inboxDir, "artifact.json");
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2) + "\n", "utf-8");

  const env = { ...process.env, FLOW_CMD: `${process.execPath} flow/flow_cli.mjs` };
  const p = spawnSync(
    process.execPath,
    ["scripts/run_benchmarks.mjs", "--artifact", path.relative(root, artifactPath), "--out", path.relative(root, runsDir)],
    { encoding: "utf-8", env, stdio: "inherit" }
  );
  assert.equal(p.status, 0);

  const statusPath = path.join(runsDir, artifact.artifact_id, "run_status.json");
  assert.ok(fs.existsSync(statusPath), "run_status.json should exist");
  const status = JSON.parse(fs.readFileSync(statusPath, "utf-8"));
  assert.equal(status.status, "complete");

  // Verify metrics summary exists and has expected components
  const summaryPath = path.join(runsDir, artifact.artifact_id, "metrics_summary.json");
  assert.ok(fs.existsSync(summaryPath), "metrics_summary.json should exist");
  const summary = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));
  assert.ok(summary.summary, "summary object should exist");

  // Verify slices exist
  const slicesPath = path.join(runsDir, artifact.artifact_id, "slices.json");
  assert.ok(fs.existsSync(slicesPath), "slices.json should exist");

  // Verify efficiency data exists
  const effPath = path.join(runsDir, artifact.artifact_id, "efficiency.json");
  assert.ok(fs.existsSync(effPath), "efficiency.json should exist");
  const eff = JSON.parse(fs.readFileSync(effPath, "utf-8"));
  assert.ok(eff.runtime_ms > 0, "runtime should be positive");
});
