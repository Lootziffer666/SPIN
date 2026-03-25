#!/usr/bin/env node
/**
 * SPIN vs LanguageTool — Realistic Comparison Benchmark
 *
 * Measures SPIN and (optionally) LanguageTool against the same ground-truth
 * corpus using standard NLP metrics: Precision, Recall, F1.
 *
 * Design principles:
 * - Honest: If SPIN is worse, the benchmark shows it
 * - Neutral corpus: Not designed to favor either tool
 * - Standard metrics: Precision, Recall, F1 — industry standard
 * - Reproducible: Deterministic, no randomness
 *
 * Usage:
 *   # SPIN only (always works)
 *   node scripts/compare_lt.mjs
 *
 *   # SPIN + LanguageTool (requires API)
 *   LT_API_URL=https://api.languagetoolplus.com/v2/check node scripts/compare_lt.mjs
 *
 *   # With custom corpus
 *   node scripts/compare_lt.mjs --corpus datasets/my_corpus.json
 *
 *   # JSON output for CI
 *   node scripts/compare_lt.mjs --json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// --- Argument parsing ---
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

// --- SPIN evaluation ---
import { GR_RULES } from "../../src/grammar/rules.gr.js";
import { contextWindowRules } from "../../src/grammar/contextWindowRules.js";

function spinFindErrors(text) {
  const findings = [];

  for (const rule of GR_RULES) {
    if (rule.disabledByDefault) continue;
    const regex = new RegExp(rule.from.source, rule.from.flags);
    let m;
    while ((m = regex.exec(text)) !== null) {
      findings.push({
        rule_id: rule.id,
        match: m[0],
        index: m.index,
        confidence: rule.confidence ?? 0.9,
        category: rule.category ?? "UNKNOWN",
      });
      if (m[0].length === 0) break;
    }
  }

  for (const rule of contextWindowRules) {
    if (rule.lang !== "de") continue;
    if (rule.disabledByDefault) continue;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let m;
    while ((m = regex.exec(text)) !== null) {
      findings.push({
        rule_id: rule.id,
        match: m[0],
        index: m.index,
        confidence: rule.confidence ?? 0.9,
        category: rule.category ?? "CONTEXT",
      });
      if (m[0].length === 0) break;
    }
  }

  return findings;
}

// --- LanguageTool evaluation (optional, requires API) ---
async function ltFindErrors(text, apiUrl) {
  const body = new URLSearchParams({
    text,
    language: "de-DE",
    enabledOnly: "false",
  });

  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    throw new Error(`LanguageTool API error: ${resp.status} ${resp.statusText}`);
  }

  const data = await resp.json();
  return (data.matches || []).map((m) => ({
    rule_id: m.rule?.id ?? "unknown",
    match: text.substring(m.offset, m.offset + m.length),
    index: m.offset,
    category: m.rule?.category?.id ?? "UNKNOWN",
    message: m.message,
  }));
}

// --- Metrics calculation ---
function calculateMetrics(results) {
  let tp = 0; // True Positive: error exists AND tool found it
  let fp = 0; // False Positive: no error but tool flagged something
  let fn = 0; // False Negative: error exists but tool missed it
  let tn = 0; // True Negative: no error and tool was silent

  const details = [];

  for (const r of results) {
    const hasError = r.expected_has_error;
    const toolFound = r.tool_found_something;

    if (hasError && toolFound) {
      tp++;
      details.push({ id: r.id, verdict: "TP", note: "Fehler erkannt ✓" });
    } else if (!hasError && toolFound) {
      fp++;
      details.push({ id: r.id, verdict: "FP", note: `False Alarm: ${r.tool_matches.map(m => m.rule_id).join(", ")}` });
    } else if (hasError && !toolFound) {
      fn++;
      details.push({ id: r.id, verdict: "FN", note: `Fehler übersehen: ${r.error_category}` });
    } else {
      tn++;
      details.push({ id: r.id, verdict: "TN", note: "Korrekt als fehlerfrei erkannt ✓" });
    }
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const accuracy = results.length > 0 ? (tp + tn) / results.length : 0;

  return {
    tp, fp, fn, tn,
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1: Number(f1.toFixed(4)),
    accuracy: Number(accuracy.toFixed(4)),
    total: results.length,
    details,
  };
}

// --- Main ---
async function main() {
  const args = parseArgs(process.argv);
  const corpusPath = args.corpus || path.join(ROOT, "datasets", "comparison_corpus.json");
  const jsonOutput = !!args.json;
  const ltApiUrl = args["lt-api"] || process.env.LT_API_URL || null;

  if (!fs.existsSync(corpusPath)) {
    console.error(`Corpus not found: ${corpusPath}`);
    process.exit(2);
  }

  const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf-8"));
  const examples = corpus.examples || [];

  if (examples.length === 0) {
    console.error("Corpus has no examples.");
    process.exit(2);
  }

  // --- Evaluate SPIN ---
  const spinResults = [];
  for (const ex of examples) {
    const matches = spinFindErrors(ex.input);
    spinResults.push({
      id: ex.id,
      input: ex.input,
      expected_has_error: ex.has_error,
      error_category: ex.error_category,
      tool_found_something: matches.length > 0,
      tool_matches: matches,
    });
  }
  const spinMetrics = calculateMetrics(spinResults);

  // --- Evaluate LanguageTool (optional) ---
  let ltMetrics = null;
  if (ltApiUrl) {
    const ltResults = [];
    for (const ex of examples) {
      try {
        const matches = await ltFindErrors(ex.input, ltApiUrl);
        ltResults.push({
          id: ex.id,
          input: ex.input,
          expected_has_error: ex.has_error,
          error_category: ex.error_category,
          tool_found_something: matches.length > 0,
          tool_matches: matches,
        });
      } catch (err) {
        console.error(`LanguageTool error for ${ex.id}: ${err.message}`);
        ltResults.push({
          id: ex.id,
          input: ex.input,
          expected_has_error: ex.has_error,
          error_category: ex.error_category,
          tool_found_something: false,
          tool_matches: [],
        });
      }
    }
    ltMetrics = calculateMetrics(ltResults);
  }

  // --- Output ---
  const report = {
    timestamp: new Date().toISOString(),
    corpus: corpus.corpus_id,
    corpus_version: corpus.version,
    total_examples: examples.length,
    positive_examples: examples.filter(e => e.has_error).length,
    negative_examples: examples.filter(e => !e.has_error).length,
    spin: {
      precision: spinMetrics.precision,
      recall: spinMetrics.recall,
      f1: spinMetrics.f1,
      accuracy: spinMetrics.accuracy,
      tp: spinMetrics.tp,
      fp: spinMetrics.fp,
      fn: spinMetrics.fn,
      tn: spinMetrics.tn,
    },
    languagetool: ltMetrics ? {
      precision: ltMetrics.precision,
      recall: ltMetrics.recall,
      f1: ltMetrics.f1,
      accuracy: ltMetrics.accuracy,
      tp: ltMetrics.tp,
      fp: ltMetrics.fp,
      fn: ltMetrics.fn,
      tn: ltMetrics.tn,
    } : null,
    spin_details: spinMetrics.details,
    lt_details: ltMetrics ? ltMetrics.details : null,
  };

  if (jsonOutput) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    return;
  }

  // Human-readable output
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  SPIN vs LanguageTool — Realistic Comparison Benchmark");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Corpus:    ${corpus.corpus_id} v${corpus.version}`);
  console.log(`  Examples:  ${examples.length} (${report.positive_examples} with errors, ${report.negative_examples} correct)`);
  console.log("───────────────────────────────────────────────────────────────");

  console.log("\n  SPIN Results:");
  console.log(`    Precision:  ${spinMetrics.precision}  (${spinMetrics.tp} TP / ${spinMetrics.tp + spinMetrics.fp} flagged)`);
  console.log(`    Recall:     ${spinMetrics.recall}  (${spinMetrics.tp} TP / ${spinMetrics.tp + spinMetrics.fn} actual errors)`);
  console.log(`    F1:         ${spinMetrics.f1}`);
  console.log(`    Accuracy:   ${spinMetrics.accuracy}`);
  console.log(`    TP=${spinMetrics.tp}  FP=${spinMetrics.fp}  FN=${spinMetrics.fn}  TN=${spinMetrics.tn}`);

  if (ltMetrics) {
    console.log("\n  LanguageTool Results:");
    console.log(`    Precision:  ${ltMetrics.precision}  (${ltMetrics.tp} TP / ${ltMetrics.tp + ltMetrics.fp} flagged)`);
    console.log(`    Recall:     ${ltMetrics.recall}  (${ltMetrics.tp} TP / ${ltMetrics.tp + ltMetrics.fn} actual errors)`);
    console.log(`    F1:         ${ltMetrics.f1}`);
    console.log(`    Accuracy:   ${ltMetrics.accuracy}`);
    console.log(`    TP=${ltMetrics.tp}  FP=${ltMetrics.fp}  FN=${ltMetrics.fn}  TN=${ltMetrics.tn}`);

    console.log("\n  ─── Comparison ───");
    const pDiff = (spinMetrics.precision - ltMetrics.precision).toFixed(4);
    const rDiff = (spinMetrics.recall - ltMetrics.recall).toFixed(4);
    const fDiff = (spinMetrics.f1 - ltMetrics.f1).toFixed(4);
    console.log(`    Precision diff:  ${pDiff > 0 ? "+" : ""}${pDiff} (${pDiff > 0 ? "SPIN ahead" : pDiff < 0 ? "LT ahead" : "tie"})`);
    console.log(`    Recall diff:     ${rDiff > 0 ? "+" : ""}${rDiff} (${rDiff > 0 ? "SPIN ahead" : rDiff < 0 ? "LT ahead" : "tie"})`);
    console.log(`    F1 diff:         ${fDiff > 0 ? "+" : ""}${fDiff} (${fDiff > 0 ? "SPIN ahead" : fDiff < 0 ? "LT ahead" : "tie"})`);
  } else {
    console.log("\n  LanguageTool: not configured");
    console.log("  → Set LT_API_URL=https://api.languagetoolplus.com/v2/check to enable");
  }

  // Show FN details (what SPIN missed)
  const missed = spinMetrics.details.filter(d => d.verdict === "FN");
  if (missed.length > 0) {
    console.log("\n  ─── SPIN Missed Errors (FN) ───");
    for (const m of missed) {
      const ex = examples.find(e => e.id === m.id);
      console.log(`    ${m.id}: "${ex?.input?.substring(0, 60)}..." → ${ex?.error_category}`);
    }
  }

  // Show FP details (false alarms from SPIN)
  const falseAlarms = spinMetrics.details.filter(d => d.verdict === "FP");
  if (falseAlarms.length > 0) {
    console.log("\n  ─── SPIN False Alarms (FP) ───");
    for (const m of falseAlarms) {
      const ex = examples.find(e => e.id === m.id);
      console.log(`    ${m.id}: "${ex?.input?.substring(0, 60)}..." → ${m.note}`);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════════");

  // Write report to file
  const outPath = path.join(ROOT, "private", "comparison_report.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");
  console.log(`  Report saved: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
