#!/usr/bin/env node
/**
 * Bootstrap folders + example artifact for local dev and CI.
 *
 * Idempotent by default:
 * - creates required directories if missing
 * - writes private/_inbox/artifact.json only if it does not exist (unless --force)
 *
 * Usage:
 *   node scripts/bootstrap_folders.mjs [--force]
 *   npm run bootstrap
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

function hasFlag(name) {
  return process.argv.includes(name);
}

async function ensureDir(relPath) {
  await fs.mkdir(path.join(ROOT, relPath), { recursive: true });
}

async function fileExists(relPath) {
  try {
    await fs.stat(path.join(ROOT, relPath));
    return true;
  } catch {
    return false;
  }
}

async function writeJson(relPath, obj) {
  const abs = path.join(ROOT, relPath);
  const json = JSON.stringify(obj, null, 2) + "\n";
  await fs.writeFile(abs, json, "utf-8");
}

async function main() {
  const force = hasFlag("--force");

  const dirs = [
    "private/_inbox",
    "private/runs",
    "private/tweaks",
    "lab/_inbox",
    "lab/artifacts",
    "public/releases"
  ];

  for (const d of dirs) await ensureDir(d);

  const artifactRel = "private/_inbox/artifact.json";
  const exists = await fileExists(artifactRel);

  if (!exists || force) {
    const isCi = String(process.env.CI || "").toLowerCase() === "true";
    const nowIso = new Date().toISOString();
    await writeJson(artifactRel, {
      artifact_id: "ART-PRIVATE-EXAMPLE",
      source_run_id: "RUN-1044",
      protocol_id: "PROTO-A",
      protocol_version: "1.2.0",
      protocol_hash: "PH-7F2B8E1C9A11",
      env_fingerprint: "ENV-0A91C3D8",
      code_version: isCi ? "commit:ci" : "commit:local",
      benchmark_suite_hash: "SUITE-9C3F2A1D7B44",
      actor: isCi ? "ci" : "local-user",
      created_at: nowIso,
      classification: "private_dev"
    });
  }
}

main().catch((err) => {
  console.error("[bootstrap] failed:", err?.stack || err);
  process.exitCode = 1;
});
