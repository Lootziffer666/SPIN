#!/usr/bin/env node
/**
 * run_eval.mjs — Evaluation Runner for SPIN Benchmark
 *
 * Runs SPIN (and optionally LanguageTool) against all benchmark partitions,
 * computes per-system metrics, and produces a structured evaluation report.
 *
 * Usage:
 *   node scripts/run_eval.mjs [--partitions dev,holdout,negative,adversarial]
 *                              [--systems spin,languagetool]
 *                              [--output reports/eval_results.json]
 *
 * Metrics computed per system:
 *   - Precision, Recall, F1
 *   - False Positive Rate
 *   - No-op Accuracy (on negative set)
 *   - Boundary Violation Rate
 *   - Protected-span Violation Rate
 *   - Per-error-class metrics
 *   - Coverage / Change Rate
 *
 * Outputs:
 *   - reports/eval_results.json — structured results
 *   - reports/eval_report.md   — human-readable report (updated)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const REPORTS_DIR = join(ROOT, 'reports');

// ─── SPIN Grammar Engine Import ─────────────────────────────────────────

// Import SPIN's grammar module for evaluation
import { GR_RULES } from '../src/grammar/rules.gr.js';
import { contextWindowRules } from '../src/grammar/contextWindowRules.js';
import { detectClauses, splitSentences } from '../src/grammar/clauseDetector.js';
import { checkPhonotactics, analyzeTextPhonotactics } from '../src/grammar/phonotactics.js';

// ─── Helpers ────────────────────────────────────────────────────────────

function loadJsonl(filePath) {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .map((line, idx) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error(`Invalid JSON at ${filePath}:${idx + 1}`);
        return null;
      }
    })
    .filter(Boolean);
}

// ─── SPIN Analysis Engine ───────────────────────────────────────────────

/**
 * Run SPIN's multi-layer analysis on a single input text.
 * Returns: { corrections: [...], findings: number, layers: {...} }
 */
function spinAnalyze(inputText) {
  const corrections = [];
  const layerFindings = { grammar: 0, context: 0, phonotactics: 0, clause: 0 };

  // Layer 1: Grammar rules (GR_RULES)
  const deRules = GR_RULES.filter(r => r.id?.startsWith('de-'));
  for (const rule of deRules) {
    const regex = new RegExp(rule.from.source, rule.from.flags);
    const matches = inputText.matchAll(regex);
    for (const match of matches) {
      corrections.push({
        rule_id: rule.id,
        layer: 'grammar',
        from: match[0],
        to: typeof rule.to === 'string' ? match[0].replace(regex, rule.to) : rule.to,
        index: match.index,
        confidence: rule.confidence || 0.9,
      });
      layerFindings.grammar++;
    }
  }

  // Layer 2: Context window rules
  const deCtx = contextWindowRules.filter(r => r.lang === 'de' && !r.disabledByDefault);
  for (const rule of deCtx) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    const matches = inputText.matchAll(regex);
    for (const match of matches) {
      corrections.push({
        rule_id: rule.id,
        layer: 'context',
        from: match[0],
        to: match[0].replace(regex, rule.replacement),
        index: match.index,
        confidence: rule.confidence || 0.85,
      });
      layerFindings.context++;
    }
  }

  // Layer 3: Phonotactics
  try {
    const phonoResult = analyzeTextPhonotactics(inputText);
    if (phonoResult && phonoResult.words) {
      for (const word of phonoResult.words) {
        if (word.issues && word.issues.length > 0) {
          layerFindings.phonotactics += word.issues.length;
        }
      }
    }
  } catch {
    // Phonotactics may not fire on all inputs
  }

  // Layer 4: Clause detection
  try {
    const sentences = splitSentences(inputText);
    for (const sentence of sentences) {
      const clause = detectClauses(sentence);
      if (clause && clause.type !== 'simple') {
        layerFindings.clause++;
      }
    }
  } catch {
    // Clause detection may not fire on all inputs
  }

  const totalFindings = corrections.length;
  return { corrections, findings: totalFindings, layers: layerFindings };
}

/**
 * Apply SPIN corrections to produce output text.
 * Applies corrections in reverse order (right-to-left) to preserve indices.
 */
function spinCorrect(inputText, corrections) {
  let result = inputText;
  // Sort by index descending to apply from end to start
  const sorted = [...corrections].sort((a, b) => (b.index || 0) - (a.index || 0));
  for (const c of sorted) {
    const regex = new RegExp(c.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    // Only replace first occurrence at the expected position
    const before = result;
    result = result.replace(regex, c.to);
    if (result === before && c.index !== undefined) {
      // If regex didn't work, try positional replacement
      const prefix = result.slice(0, c.index);
      const suffix = result.slice(c.index + c.from.length);
      result = prefix + c.to + suffix;
    }
  }
  return result;
}

// ─── Metrics ────────────────────────────────────────────────────────────

/**
 * Compare system output against gold standard.
 * Returns per-item classification: TP, FP, FN, TN
 */
function classifyItem(item, systemResult) {
  const hasRealError = item.error_tags && item.error_tags.length > 0;
  const systemFoundError = systemResult.findings > 0;
  const inputChanged = systemResult.output !== item.input_text;

  if (hasRealError && systemFoundError) return 'TP';
  if (!hasRealError && systemFoundError) return 'FP';
  if (hasRealError && !systemFoundError) return 'FN';
  return 'TN';
}

/**
 * Check if system output matches gold text exactly.
 */
function isExactMatch(item, systemOutput) {
  return systemOutput === item.gold_text;
}

/**
 * Check if system modified a protected span.
 * Protected spans include: quoted text, code fragments, proper nouns with
 * special characters (McDonald's, etc.)
 */
function checkProtectedSpanViolation(item, systemOutput) {
  // Simple heuristic: check if backtick-enclosed or quoted text was modified
  const protectedPatterns = [
    /`[^`]+`/g,         // backtick code
    /"[^"]+"/g,         // double-quoted text
  ];

  for (const pattern of protectedPatterns) {
    const inputMatches = [...item.input_text.matchAll(pattern)];
    for (const match of inputMatches) {
      const span = match[0];
      if (!systemOutput.includes(span)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Compute aggregate metrics from per-item classifications.
 */
function computeMetrics(items, results) {
  const counts = { TP: 0, FP: 0, FN: 0, TN: 0 };
  const perClass = {};
  let exactMatches = 0;
  let protectedViolations = 0;
  let boundaryViolations = 0;
  const itemResults = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const result = results[i];
    const classification = classifyItem(item, result);
    counts[classification]++;

    if (isExactMatch(item, result.output)) {
      exactMatches++;
    }

    if (checkProtectedSpanViolation(item, result.output)) {
      protectedViolations++;
    }

    // Check boundary violations: system changed text outside the error span
    if (item.input_text !== result.output && item.gold_text !== result.output) {
      boundaryViolations++;
    }

    // Per-class metrics
    for (const tag of (item.error_tags || ['CORRECT'])) {
      if (!perClass[tag]) perClass[tag] = { TP: 0, FP: 0, FN: 0, TN: 0 };
      perClass[tag][classification]++;
    }

    itemResults.push({
      id: item.id,
      split: item.split,
      classification,
      input: item.input_text.slice(0, 80),
      expected: item.gold_text.slice(0, 80),
      got: result.output.slice(0, 80),
      exact_match: isExactMatch(item, result.output),
      findings: result.findings,
    });
  }

  const total = items.length;
  const precision = counts.TP + counts.FP > 0 ? counts.TP / (counts.TP + counts.FP) : 0;
  const recall = counts.TP + counts.FN > 0 ? counts.TP / (counts.TP + counts.FN) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const accuracy = total > 0 ? (counts.TP + counts.TN) / total : 0;
  const fpr = counts.FP + counts.TN > 0 ? counts.FP / (counts.FP + counts.TN) : 0;
  const changeRate = total > 0 ? (total - items.filter((it, i) => it.input_text === results[i].output).length) / total : 0;

  // Per-class F1
  const perClassMetrics = {};
  for (const [cls, c] of Object.entries(perClass)) {
    const p = c.TP + c.FP > 0 ? c.TP / (c.TP + c.FP) : 0;
    const r = c.TP + c.FN > 0 ? c.TP / (c.TP + c.FN) : 0;
    perClassMetrics[cls] = {
      precision: Math.round(p * 1000) / 1000,
      recall: Math.round(r * 1000) / 1000,
      f1: p + r > 0 ? Math.round(((2 * p * r) / (p + r)) * 1000) / 1000 : 0,
      count: c.TP + c.FP + c.FN + c.TN,
    };
  }

  return {
    counts,
    precision: Math.round(precision * 1000) / 1000,
    recall: Math.round(recall * 1000) / 1000,
    f1: Math.round(f1 * 1000) / 1000,
    accuracy: Math.round(accuracy * 1000) / 1000,
    false_positive_rate: Math.round(fpr * 1000) / 1000,
    exact_match_rate: Math.round((exactMatches / total) * 1000) / 1000,
    boundary_violation_rate: Math.round((boundaryViolations / total) * 1000) / 1000,
    protected_span_violation_rate: Math.round((protectedViolations / total) * 1000) / 1000,
    change_rate: Math.round(changeRate * 1000) / 1000,
    per_class: perClassMetrics,
    item_results: itemResults,
    total_items: total,
  };
}

// ─── Negative Set Evaluation ────────────────────────────────────────────

function evaluateNegativeSet(items, results) {
  let noOpCorrect = 0;
  let falsePositives = 0;
  const fpDetails = [];

  for (let i = 0; i < items.length; i++) {
    if (results[i].findings === 0) {
      noOpCorrect++;
    } else {
      falsePositives++;
      fpDetails.push({
        id: items[i].id,
        input: items[i].input_text.slice(0, 80),
        findings: results[i].findings,
        corrections: results[i].corrections.map(c => `${c.rule_id}: "${c.from}" → "${c.to}"`),
      });
    }
  }

  return {
    total: items.length,
    no_op_correct: noOpCorrect,
    false_positives: falsePositives,
    no_op_accuracy: items.length > 0 ? Math.round((noOpCorrect / items.length) * 1000) / 1000 : 0,
    fp_details: fpDetails,
  };
}

// ─── Report Generation ──────────────────────────────────────────────────

function generateMarkdownReport(allResults) {
  const lines = [];
  lines.push('# SPIN Benchmark — Evaluation Report');
  lines.push('');
  lines.push(`> **Generated:** ${new Date().toISOString()}`);
  lines.push('> **Policy:** See BENCHMARK_POLICY.md for fairness rules');
  lines.push('> **Sources:** See BENCHMARK_SOURCES.md for data provenance');
  lines.push('');
  lines.push('## ⚠ Realism Warning');
  lines.push('');
  lines.push('This benchmark currently uses **100% synthetic data** created during');
  lines.push('SPIN development. All results should be treated as **development-only**.');
  lines.push('See `reports/realism_audit.md` for a detailed assessment.');
  lines.push('');

  for (const [systemName, systemData] of Object.entries(allResults)) {
    lines.push(`## System: ${systemName}`);
    lines.push('');

    for (const [partition, metrics] of Object.entries(systemData.partitions)) {
      lines.push(`### ${partition} (${metrics.total_items} items)`);
      lines.push('');
      lines.push('| Metric | Value |');
      lines.push('|--------|-------|');
      lines.push(`| Precision | ${metrics.precision} |`);
      lines.push(`| Recall | ${metrics.recall} |`);
      lines.push(`| F1 | ${metrics.f1} |`);
      lines.push(`| Accuracy | ${metrics.accuracy} |`);
      lines.push(`| False Positive Rate | ${metrics.false_positive_rate} |`);
      lines.push(`| Exact Match Rate | ${metrics.exact_match_rate} |`);
      lines.push(`| Boundary Violation Rate | ${metrics.boundary_violation_rate} |`);
      lines.push(`| Protected-Span Violation Rate | ${metrics.protected_span_violation_rate} |`);
      lines.push(`| Change Rate | ${metrics.change_rate} |`);
      lines.push('');

      // Per-class breakdown
      if (Object.keys(metrics.per_class).length > 0) {
        lines.push('#### Per-Error-Class Metrics');
        lines.push('');
        lines.push('| Category | Precision | Recall | F1 | Count |');
        lines.push('|----------|-----------|--------|----|-------|');
        for (const [cls, cm] of Object.entries(metrics.per_class).sort()) {
          lines.push(`| ${cls} | ${cm.precision} | ${cm.recall} | ${cm.f1} | ${cm.count} |`);
        }
        lines.push('');
      }
    }

    // Negative set results
    if (systemData.negative) {
      lines.push('### Negative Set (False Positive Detection)');
      lines.push('');
      lines.push(`| Metric | Value |`);
      lines.push(`|--------|-------|`);
      lines.push(`| Total correct sentences | ${systemData.negative.total} |`);
      lines.push(`| No-op correct | ${systemData.negative.no_op_correct} |`);
      lines.push(`| False positives | ${systemData.negative.false_positives} |`);
      lines.push(`| No-op accuracy | ${systemData.negative.no_op_accuracy} |`);
      lines.push('');

      if (systemData.negative.fp_details.length > 0) {
        lines.push('#### False Positive Details');
        lines.push('');
        for (const fp of systemData.negative.fp_details) {
          lines.push(`- **${fp.id}**: "${fp.input}..."`);
          for (const c of fp.corrections) {
            lines.push(`  - ${c}`);
          }
        }
        lines.push('');
      }
    }

    // Most informative disagreements
    if (systemData.disagreements) {
      lines.push('### Top Disagreements (most informative)');
      lines.push('');
      lines.push('| ID | Split | Class | Input (truncated) | Expected | Got |');
      lines.push('|----|-------|-------|-------------------|----------|-----|');
      for (const d of systemData.disagreements.slice(0, 50)) {
        lines.push(`| ${d.id} | ${d.split} | ${d.classification} | ${d.input.slice(0, 40)} | ${d.expected.slice(0, 30)} | ${d.got.slice(0, 30)} |`);
      }
      lines.push('');
    }
  }

  // Suspicious score detection
  lines.push('## Suspicious Score Analysis');
  lines.push('');
  for (const [systemName, systemData] of Object.entries(allResults)) {
    lines.push(`### ${systemName}`);
    const flags = systemData.suspiciousFlags || [];
    if (flags.length === 0) {
      lines.push('No suspicious scores detected.');
    } else {
      for (const flag of flags) {
        lines.push(`- ⚠ **${flag.metric}** = ${flag.value}: ${flag.reason}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Main ───────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const partIdx = args.indexOf('--partitions');
  const requestedPartitions = partIdx >= 0
    ? args[partIdx + 1].split(',')
    : ['dev', 'holdout', 'negative', 'adversarial'];

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  SPIN Benchmark — Evaluation Runner              ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  // Load data
  const data = {};
  for (const part of requestedPartitions) {
    const path = join(DATA_DIR, `${part}.jsonl`);
    data[part] = loadJsonl(path);
    console.log(`Loaded ${data[part].length} items from ${part}.jsonl`);
  }
  console.log();

  // Run SPIN evaluation
  console.log('Running SPIN evaluation...');
  const spinResults = {};
  const allItemResults = [];

  // Count active rules
  const activeGrRules = GR_RULES.filter(r => r.id?.startsWith('de-')).length;
  const activeCtxRules = contextWindowRules.filter(r => r.lang === 'de' && !r.disabledByDefault).length;
  const totalActiveRules = activeGrRules + activeCtxRules;

  spinResults.system_info = {
    name: 'SPIN',
    version: '0.5.0',
    active_gr_rules: activeGrRules,
    active_ctx_rules: activeCtxRules,
    total_active_rules: totalActiveRules,
    layers: ['grammar', 'context', 'phonotactics', 'clause'],
  };

  spinResults.partitions = {};

  for (const part of requestedPartitions) {
    if (part === 'negative') continue; // handled separately
    const items = data[part];
    if (!items || items.length === 0) continue;

    console.log(`  Evaluating ${part} (${items.length} items)...`);

    const results = items.map(item => {
      const analysis = spinAnalyze(item.input_text);
      const output = spinCorrect(item.input_text, analysis.corrections);
      return { ...analysis, output };
    });

    spinResults.partitions[part] = computeMetrics(items, results);
    allItemResults.push(...spinResults.partitions[part].item_results);
  }

  // Negative set evaluation
  if (data.negative && data.negative.length > 0) {
    console.log(`  Evaluating negative (${data.negative.length} items)...`);
    const negResults = data.negative.map(item => {
      const analysis = spinAnalyze(item.input_text);
      const output = spinCorrect(item.input_text, analysis.corrections);
      return { ...analysis, output };
    });
    spinResults.negative = evaluateNegativeSet(data.negative, negResults);

    // Also compute standard metrics for negative set
    spinResults.partitions.negative = computeMetrics(data.negative, negResults);
    allItemResults.push(...spinResults.partitions.negative.item_results);
  }

  // Collect most informative disagreements (FP and FN)
  const disagreements = allItemResults
    .filter(r => r.classification === 'FP' || r.classification === 'FN')
    .sort((a, b) => {
      // Prioritize FP (false positives are more harmful)
      if (a.classification === 'FP' && b.classification !== 'FP') return -1;
      if (a.classification !== 'FP' && b.classification === 'FP') return 1;
      return 0;
    });
  spinResults.disagreements = disagreements;

  // Suspicious score detection
  const flags = [];
  for (const [part, metrics] of Object.entries(spinResults.partitions)) {
    if (metrics.precision >= 0.98) {
      flags.push({ metric: `${part}.precision`, value: metrics.precision, reason: 'Suspiciously high — check for too-easy benchmark or overconservative firing' });
    }
    if (metrics.recall >= 0.95) {
      flags.push({ metric: `${part}.recall`, value: metrics.recall, reason: 'Suspiciously high — check for benchmark leakage or overfitting' });
    }
    if (metrics.f1 >= 0.95) {
      flags.push({ metric: `${part}.f1`, value: metrics.f1, reason: 'Suspiciously high — check for benchmark design bias' });
    }
    if (metrics.false_positive_rate === 0 && metrics.total_items > 10) {
      flags.push({ metric: `${part}.fpr`, value: 0, reason: 'Zero FPR — possible overconservative or insufficient negative examples' });
    }
  }
  if (spinResults.negative && spinResults.negative.no_op_accuracy >= 0.98) {
    flags.push({ metric: 'negative.no_op_accuracy', value: spinResults.negative.no_op_accuracy, reason: 'Very high no-op accuracy — check if negative set is too easy' });
  }
  spinResults.suspiciousFlags = flags;

  // Write results
  const allResults = { SPIN: spinResults };

  const jsonPath = join(REPORTS_DIR, 'eval_results.json');
  writeFileSync(jsonPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`\nWrote structured results to ${jsonPath}`);

  const mdPath = join(REPORTS_DIR, 'eval_report.md');
  writeFileSync(mdPath, generateMarkdownReport(allResults), 'utf-8');
  console.log(`Wrote human-readable report to ${mdPath}`);

  // Print summary
  console.log('\n════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('════════════════════════════════════════════════════');
  for (const [part, metrics] of Object.entries(spinResults.partitions)) {
    console.log(`  ${part}: P=${metrics.precision} R=${metrics.recall} F1=${metrics.f1} FPR=${metrics.false_positive_rate} (${metrics.total_items} items)`);
  }
  if (spinResults.negative) {
    console.log(`  negative: no-op accuracy=${spinResults.negative.no_op_accuracy} FP=${spinResults.negative.false_positives}/${spinResults.negative.total}`);
  }
  if (flags.length > 0) {
    console.log(`\n  ⚠ ${flags.length} suspicious score(s) detected — see reports/realism_audit.md`);
  }
  console.log();
}

main();
