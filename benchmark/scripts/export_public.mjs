#!/usr/bin/env node
/**
 * Export to Public Release
 *
 * Hard guarantees:
 * - Only allowed transition: internal_benchmark -> public_release
 * - Refuses private_dev inputs
 *
 * This is where redaction should happen (future).
 *
 * Usage:
 *   node scripts/export_public.mjs --artifact lab/artifacts/ART-XXXX/artifact.json --out public/releases
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { CLASSIFICATION, classifyPath, assertReleaseAllowed, readJson, writeJson } from "./guards.mjs";

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

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function main() {
  const args = parseArgs(process.argv);
  const artifactPath = args.artifact;
  const outRoot = args.out || "public/releases";
  const actor = args.actor || "local-user";

  if (!artifactPath) {
    console.error("Missing --artifact <path>");
    process.exit(2);
  }
  if (!fs.existsSync(artifactPath)) {
    console.error(`Artifact file not found: ${artifactPath}`);
    process.exit(2);
  }

  const artifact = readJson(artifactPath);
  const inputClass = artifact.classification ?? classifyPath(artifactPath) ?? null;

  if (!inputClass) {
    console.error("Artifact classification missing. Set artifact.classification or place under private/lab/public.");
    process.exit(2);
  }

  try {
    assertReleaseAllowed(inputClass, CLASSIFICATION.PUBLIC_RELEASE);
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(2);
  }

  const releaseId = `REL-${sha256(`${artifact.artifact_id}|${nowIso()}`).slice(0, 10).toUpperCase()}`;
  const releaseDir = path.join(outRoot, releaseId);
  fs.mkdirSync(releaseDir, { recursive: true });

  // For now, export only minimal, non-private metadata.
  // Future: redact or omit anything sensitive by policy.
  const publicArtifact = {
    ...artifact,
    classification: CLASSIFICATION.PUBLIC_RELEASE,
    released_at: nowIso(),
    released_by: actor
  };
  writeJson(path.join(releaseDir, "artifact.public.json"), publicArtifact);

  console.log(releaseDir);
}

main();
