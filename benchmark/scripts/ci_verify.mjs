#!/usr/bin/env node
/**
 * CI Verification (dependency-free)
 * - Ensures UI static assets exist
 * - Runs protocol hash
 * - Runs a private benchmark via FLOW CLI stub
 * - Ensures run_status is complete
 *
 * Usage:
 *   node scripts/ci_verify.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function must(cond, msg) {
  if (!cond) {
    console.error("CI_VERIFY_FAILED:", msg);
    process.exit(1);
  }
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

const root = process.cwd();

// 0) Static UI integrity check (no build)
{
  const mustExist = ["ui/index.html", "ui/app.mjs", "ui/styles.css"];
  for (const rel of mustExist) must(fs.existsSync(path.join(root, rel)), `missing ${rel}`);

  const html = fs.readFileSync(path.join(root, "ui/index.html"), "utf-8");
  must(html.includes("SPIN Evaluation Lab"), "ui/index.html missing title string");
  must(html.includes("type=\"module\""), "ui/index.html missing ESM module script");
}

// 1) Bootstrap folders (idempotent)
{
  const p = spawnSync(process.execPath, ["scripts/bootstrap_folders.mjs", "--force"], { stdio: "inherit" });
  must(p.status === 0, "bootstrap_folders failed");
}

// 2) Hash protocol (ensures script runs)
{
  const p = spawnSync(process.execPath, ["scripts/hash_protocol.mjs", "--in", "protocol/protocol.json", "--out", "protocol/protocol_hash.txt"], { stdio: "inherit" });
  must(p.status === 0, "hash_protocol failed");
  must(fs.existsSync(path.join(root, "protocol/protocol_hash.txt")), "protocol_hash.txt missing");
}

// 3) Run benchmarks using FLOW CLI stub
{
  const env = { ...process.env, FLOW_CMD: `${process.execPath} flow/flow_cli.mjs` };
  const p = spawnSync(process.execPath, ["scripts/run_benchmarks.mjs", "--artifact", "private/_inbox/artifact.json", "--out", "private/runs"], { stdio: "inherit", env });
  must(p.status === 0, "run_benchmarks failed");
}

// 4) Validate outputs
const artifactPath = path.join(root, "private/_inbox/artifact.json");
const art = readJson(artifactPath);
const runFolder = path.join(root, "private/runs", art.artifact_id);
must(fs.existsSync(runFolder), "run folder missing");

const statusPath = path.join(runFolder, "run_status.json");
must(fs.existsSync(statusPath), "run_status.json missing");

const status = readJson(statusPath);
must(status.status === "complete", "run_status not complete");

console.log("CI verification OK");
