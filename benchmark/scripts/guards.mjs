import fs from "node:fs";
import path from "node:path";

export const CLASSIFICATION = {
  PRIVATE_DEV: "private_dev",
  INTERNAL_BENCHMARK: "internal_benchmark",
  PUBLIC_RELEASE: "public_release",
};

export function normalizePath(p) {
  return path.resolve(p).replace(/\\/g, "/");
}

export function classifyPath(p) {
  const n = normalizePath(p);
  if (n.includes("/private/")) return CLASSIFICATION.PRIVATE_DEV;
  if (n.includes("/lab/")) return CLASSIFICATION.INTERNAL_BENCHMARK;
  if (n.includes("/public/")) return CLASSIFICATION.PUBLIC_RELEASE;
  return null;
}

export function assertNoPublicExportFromPrivate({ inputClassification, outDir }) {
  const outClass = classifyPath(outDir);
  if (inputClassification === CLASSIFICATION.PRIVATE_DEV && outClass === CLASSIFICATION.PUBLIC_RELEASE) {
    throw new Error("Illegal export: private_dev inputs may not write into public/.");
  }
}

export function assertSuiteOnly(inputClassification) {
  if (inputClassification !== CLASSIFICATION.PRIVATE_DEV) {
    throw new Error("Auto-tweak is Suite-only and requires classification=private_dev.");
  }
}

export function assertPromotionAllowed(inputClassification, targetClassification) {
  // Only allowed transition: private_dev -> internal_benchmark
  if (inputClassification === CLASSIFICATION.PRIVATE_DEV && targetClassification === CLASSIFICATION.INTERNAL_BENCHMARK) return;
  throw new Error(`Illegal transition: ${inputClassification} -> ${targetClassification}`);
}

export function assertReleaseAllowed(inputClassification, targetClassification) {
  // Only allowed transition: internal_benchmark -> public_release
  if (inputClassification === CLASSIFICATION.INTERNAL_BENCHMARK && targetClassification === CLASSIFICATION.PUBLIC_RELEASE) return;
  throw new Error(`Illegal transition: ${inputClassification} -> ${targetClassification}`);
}

export function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf-8");
}
