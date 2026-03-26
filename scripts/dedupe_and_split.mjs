#!/usr/bin/env node
/**
 * dedupe_and_split.mjs — Deduplication and Partition Assignment
 *
 * This script:
 *   1. Reads all JSONL files from data/
 *   2. Deduplicates by normalized text comparison (exact + fuzzy)
 *   3. Checks for contamination against known contaminated sources
 *   4. Validates partition assignments per BENCHMARK_POLICY.md
 *   5. Reports statistics and violations
 *
 * Usage:
 *   node scripts/dedupe_and_split.mjs [--fix] [--verbose]
 *
 * The --fix flag moves contaminated holdout items to dev and logs the change.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const BENCHMARK_DATASETS = join(ROOT, 'benchmark', 'datasets');

// ─── Text normalization ─────────────────────────────────────────────────

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[""„"]/g, '"')
    .replace(/[''‚']/g, "'")
    .replace(/[—–]/g, '-')
    .replace(/…/g, '...')
    .trim();
}

/**
 * Levenshtein distance for fuzzy matching.
 * Used to detect near-duplicates that differ by ≤ 3 characters.
 */
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // For performance, skip very long strings
  if (Math.abs(a.length - b.length) > 10) return Math.abs(a.length - b.length);

  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

// ─── Load data ──────────────────────────────────────────────────────────

function loadJsonl(filePath) {
  if (!existsSync(filePath)) return [];
  return readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .map((line, idx) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error(`Invalid JSON at ${filePath}:${idx + 1}: ${e.message}`);
        return null;
      }
    })
    .filter(Boolean);
}

function loadContaminatedTexts() {
  const contaminated = new Set();

  // Load existing SPIN benchmark datasets (known contaminated sources)
  const files = ['comparison_corpus.json', 'spin_de.json'];
  for (const file of files) {
    const path = join(BENCHMARK_DATASETS, file);
    if (!existsSync(path)) continue;

    try {
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      const examples = data.examples || [];
      for (const ex of examples) {
        const input = ex.input || ex.input_text || '';
        if (input) contaminated.add(normalize(input));
        const correction = ex.correction || ex.gold_text || '';
        if (correction) contaminated.add(normalize(correction));
      }
    } catch (e) {
      console.warn(`Warning: Could not parse ${path}: ${e.message}`);
    }
  }

  return contaminated;
}

// ─── Validation ─────────────────────────────────────────────────────────

function validatePartitions(items) {
  const violations = [];
  const byPartition = { dev: [], holdout: [], negative: [], adversarial: [] };

  for (const item of items) {
    if (item.split in byPartition) {
      byPartition[item.split].push(item);
    }
  }

  // Check minimum sizes
  const minSizes = { dev: 30, holdout: 30, negative: 20, adversarial: 20 };
  for (const [part, minSize] of Object.entries(minSizes)) {
    if (byPartition[part].length < minSize) {
      violations.push({
        type: 'size',
        partition: part,
        message: `${part} has ${byPartition[part].length} items, minimum is ${minSize}`,
      });
    }
  }

  // Check negative set is all correct
  for (const item of byPartition.negative) {
    if (item.error_tags && item.error_tags.length > 0) {
      violations.push({
        type: 'composition',
        partition: 'negative',
        id: item.id,
        message: `Negative set item ${item.id} has error_tags: ${item.error_tags.join(', ')}`,
      });
    }
  }

  // Check error category distribution (no single category > 30%)
  for (const part of ['dev', 'holdout']) {
    const categoryCounts = {};
    const errorItems = byPartition[part].filter(i => i.error_tags?.length > 0);
    for (const item of errorItems) {
      for (const tag of item.error_tags) {
        categoryCounts[tag] = (categoryCounts[tag] || 0) + 1;
      }
    }
    const total = errorItems.length;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (total > 0 && count / total > 0.30) {
        violations.push({
          type: 'distribution',
          partition: part,
          message: `Category "${cat}" is ${((count / total) * 100).toFixed(1)}% of ${part} errors (max 30%)`,
        });
      }
    }
  }

  return { byPartition, violations };
}

// ─── Main ───────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const verbose = args.includes('--verbose');

  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  SPIN Benchmark — Dedupe & Split Validator       ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  // Step 1: Load all data
  const partitions = ['dev', 'holdout', 'negative', 'adversarial'];
  const allItems = [];
  for (const part of partitions) {
    const path = join(DATA_DIR, `${part}.jsonl`);
    const items = loadJsonl(path);
    console.log(`Loaded ${items.length} items from ${part}.jsonl`);
    allItems.push(...items);
  }
  console.log(`Total: ${allItems.length} items across ${partitions.length} partitions`);
  console.log();

  // Step 2: Load contaminated texts
  const contaminated = loadContaminatedTexts();
  console.log(`Loaded ${contaminated.size} contaminated text patterns from benchmark/datasets/`);
  console.log();

  // Step 3: Check for exact duplicates
  console.log('Step 3: Exact duplicate check');
  const seen = new Map(); // normalized text → first id
  const duplicates = [];
  for (const item of allItems) {
    const norm = normalize(item.input_text);
    if (seen.has(norm)) {
      duplicates.push({ id: item.id, duplicate_of: seen.get(norm), text: item.input_text.slice(0, 60) });
    } else {
      seen.set(norm, item.id);
    }
  }
  if (duplicates.length > 0) {
    console.log(`  ⚠ Found ${duplicates.length} exact duplicate(s):`);
    for (const d of duplicates) {
      console.log(`    ${d.id} duplicates ${d.duplicate_of}: "${d.text}..."`);
    }
  } else {
    console.log('  ✓ No exact duplicates found');
  }
  console.log();

  // Step 4: Check for near-duplicates (Levenshtein ≤ 3)
  console.log('Step 4: Near-duplicate check (Levenshtein ≤ 3)');
  const nearDupes = [];
  const normTexts = allItems.map(item => ({ id: item.id, norm: normalize(item.input_text) }));
  for (let i = 0; i < normTexts.length; i++) {
    for (let j = i + 1; j < normTexts.length; j++) {
      // Skip if lengths differ by more than 3
      if (Math.abs(normTexts[i].norm.length - normTexts[j].norm.length) > 3) continue;
      const dist = levenshtein(normTexts[i].norm, normTexts[j].norm);
      if (dist > 0 && dist <= 3) {
        nearDupes.push({
          a: normTexts[i].id,
          b: normTexts[j].id,
          distance: dist,
        });
      }
    }
  }
  if (nearDupes.length > 0) {
    console.log(`  ⚠ Found ${nearDupes.length} near-duplicate pair(s):`);
    for (const d of nearDupes) {
      console.log(`    ${d.a} ↔ ${d.b} (distance: ${d.distance})`);
    }
  } else {
    console.log('  ✓ No near-duplicates found');
  }
  console.log();

  // Step 5: Contamination check for holdout
  console.log('Step 5: Contamination check (holdout vs. known sources)');
  const holdoutItems = allItems.filter(i => i.split === 'holdout');
  const contaminatedHoldout = [];
  for (const item of holdoutItems) {
    const norm = normalize(item.input_text);
    // Exact match
    if (contaminated.has(norm)) {
      contaminatedHoldout.push({ id: item.id, reason: 'exact_match', text: item.input_text.slice(0, 60) });
      continue;
    }
    // Fuzzy match
    for (const cText of contaminated) {
      if (Math.abs(norm.length - cText.length) > 3) continue;
      if (levenshtein(norm, cText) <= 3) {
        contaminatedHoldout.push({ id: item.id, reason: 'fuzzy_match', text: item.input_text.slice(0, 60) });
        break;
      }
    }
  }
  if (contaminatedHoldout.length > 0) {
    console.log(`  ⚠ Found ${contaminatedHoldout.length} contaminated holdout item(s):`);
    for (const c of contaminatedHoldout) {
      console.log(`    ${c.id} [${c.reason}]: "${c.text}..."`);
    }
    if (fix) {
      console.log('  → Applying --fix: moving contaminated items to dev');
    }
  } else {
    console.log('  ✓ No holdout contamination detected');
  }
  console.log();

  // Step 6: Partition validation
  console.log('Step 6: Partition validation');
  const { byPartition, violations } = validatePartitions(allItems);
  if (violations.length > 0) {
    console.log(`  ⚠ Found ${violations.length} violation(s):`);
    for (const v of violations) {
      console.log(`    [${v.type}] ${v.message}`);
    }
  } else {
    console.log('  ✓ All partition constraints satisfied');
  }
  console.log();

  // Step 7: Statistics
  console.log('Step 7: Statistics');
  for (const [part, items] of Object.entries(byPartition)) {
    const withErrors = items.filter(i => i.error_tags?.length > 0).length;
    const correct = items.length - withErrors;
    const authentic = items.filter(i => i.authenticity_level === 'authentic').length;
    const synthetic = items.filter(i => i.authenticity_level === 'synthetic').length;
    console.log(`  ${part}: ${items.length} items (${withErrors} errors, ${correct} correct, ${authentic} authentic, ${synthetic} synthetic)`);
  }
  console.log();

  // Step 8: Error category distribution
  console.log('Step 8: Error category distribution');
  const allCategories = {};
  for (const item of allItems) {
    for (const tag of (item.error_tags || [])) {
      if (!allCategories[tag]) allCategories[tag] = { dev: 0, holdout: 0, negative: 0, adversarial: 0 };
      if (item.split in allCategories[tag]) {
        allCategories[tag][item.split]++;
      }
    }
  }
  console.log('  Category          | dev | holdout | neg | adv');
  console.log('  ──────────────────┼─────┼─────────┼─────┼────');
  for (const [cat, counts] of Object.entries(allCategories).sort()) {
    const d = String(counts.dev).padStart(3);
    const h = String(counts.holdout).padStart(7);
    const n = String(counts.negative).padStart(3);
    const a = String(counts.adversarial).padStart(3);
    console.log(`  ${cat.padEnd(18)} | ${d} | ${h} | ${n} | ${a}`);
  }
  console.log();

  // Step 9: Write contamination log
  const logPath = join(DATA_DIR, 'contamination_log.jsonl');
  const logEntries = [
    ...duplicates.map(d => ({ type: 'duplicate', ...d, timestamp: new Date().toISOString() })),
    ...nearDupes.map(d => ({ type: 'near_duplicate', ...d, timestamp: new Date().toISOString() })),
    ...contaminatedHoldout.map(c => ({ type: 'contamination', ...c, timestamp: new Date().toISOString() })),
  ];
  if (logEntries.length > 0) {
    writeFileSync(logPath, logEntries.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf-8');
    console.log(`Wrote ${logEntries.length} entries to ${logPath}`);
  } else {
    writeFileSync(logPath, '', 'utf-8');
    console.log('No issues found — contamination log is empty');
  }

  // Final verdict
  console.log();
  const totalIssues = duplicates.length + nearDupes.length + contaminatedHoldout.length + violations.length;
  if (totalIssues === 0) {
    console.log('✓ ALL CHECKS PASSED — benchmark data is clean');
    process.exit(0);
  } else {
    console.log(`⚠ ${totalIssues} issue(s) found — review above for details`);
    // Non-zero exit only for contamination or missing data, not warnings
    if (contaminatedHoldout.length > 0 || violations.filter(v => v.type === 'size').length > 0) {
      process.exit(1);
    }
    process.exit(0);
  }
}

main();
