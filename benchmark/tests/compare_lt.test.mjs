import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

test("compare_lt.mjs produces valid JSON report with SPIN metrics", () => {
  const root = process.cwd();
  const p = spawnSync(process.execPath, ["scripts/compare_lt.mjs", "--json"], {
    encoding: "utf-8",
    cwd: root,
  });

  assert.equal(p.status, 0, `compare_lt exited with status ${p.status}: ${p.stderr}`);

  const report = JSON.parse(p.stdout);

  // Structure checks
  assert.ok(report.timestamp, "Report must have timestamp");
  assert.ok(report.corpus, "Report must have corpus id");
  assert.equal(report.total_examples, 50, "Corpus has 50 examples");
  assert.ok(report.positive_examples > 0, "Must have positive examples");
  assert.ok(report.negative_examples > 0, "Must have negative examples");

  // SPIN metrics must be present
  assert.ok(report.spin, "SPIN results must exist");
  assert.equal(typeof report.spin.precision, "number");
  assert.equal(typeof report.spin.recall, "number");
  assert.equal(typeof report.spin.f1, "number");
  assert.equal(typeof report.spin.accuracy, "number");
  assert.equal(typeof report.spin.tp, "number");
  assert.equal(typeof report.spin.fp, "number");
  assert.equal(typeof report.spin.fn, "number");
  assert.equal(typeof report.spin.tn, "number");

  // Metrics must be in valid range
  assert.ok(report.spin.precision >= 0 && report.spin.precision <= 1, "Precision in [0,1]");
  assert.ok(report.spin.recall >= 0 && report.spin.recall <= 1, "Recall in [0,1]");
  assert.ok(report.spin.f1 >= 0 && report.spin.f1 <= 1, "F1 in [0,1]");
  assert.ok(report.spin.accuracy >= 0 && report.spin.accuracy <= 1, "Accuracy in [0,1]");

  // Confusion matrix must add up
  assert.equal(
    report.spin.tp + report.spin.fp + report.spin.fn + report.spin.tn,
    report.total_examples,
    "Confusion matrix must cover all examples"
  );

  // LanguageTool should be null when not configured
  assert.equal(report.languagetool, null, "LT should be null without API URL");

  // Details should exist for SPIN
  assert.ok(Array.isArray(report.spin_details), "SPIN details must be an array");
  assert.equal(report.spin_details.length, 50, "One detail per example");
});

test("compare_lt.mjs SPIN recall is realistic (not inflated)", () => {
  const root = process.cwd();
  const p = spawnSync(process.execPath, ["scripts/compare_lt.mjs", "--json"], {
    encoding: "utf-8",
    cwd: root,
  });

  assert.equal(p.status, 0);
  const report = JSON.parse(p.stdout);

  // SPIN has 145 rules but the corpus includes categories SPIN does NOT cover
  // (e.g., KASUS). So recall should NOT be 1.0 — that would mean we rigged the corpus.
  assert.ok(report.spin.recall < 1.0,
    `Recall ${report.spin.recall} should be < 1.0 (corpus includes errors SPIN cannot detect)`);

  // But SPIN should detect SOME errors — recall should not be 0
  assert.ok(report.spin.recall > 0,
    `Recall ${report.spin.recall} should be > 0 (SPIN should detect some errors)`);

  // Check that FN exists (SPIN misses some errors)
  assert.ok(report.spin.fn > 0,
    `FN=${report.spin.fn} should be > 0 (honest benchmark shows what SPIN misses)`);
});
