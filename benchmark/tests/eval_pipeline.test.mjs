import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

test('dedupe_and_split.mjs validates data without errors', () => {
  const p = spawnSync(process.execPath, ['scripts/dedupe_and_split.mjs'], {
    encoding: 'utf-8',
    cwd: ROOT,
  });

  assert.equal(p.status, 0, `dedupe_and_split exited with status ${p.status}: ${p.stderr}`);
  assert.ok(p.stdout.includes('ALL CHECKS PASSED') || p.stdout.includes('issue(s) found'),
    'Must produce a final verdict');
});

test('dedupe_and_split.mjs loads all four partitions', () => {
  const p = spawnSync(process.execPath, ['scripts/dedupe_and_split.mjs'], {
    encoding: 'utf-8',
    cwd: ROOT,
  });

  assert.ok(p.stdout.includes('dev.jsonl'), 'Must load dev.jsonl');
  assert.ok(p.stdout.includes('holdout.jsonl'), 'Must load holdout.jsonl');
  assert.ok(p.stdout.includes('negative.jsonl'), 'Must load negative.jsonl');
  assert.ok(p.stdout.includes('adversarial.jsonl'), 'Must load adversarial.jsonl');
});

test('dedupe_and_split.mjs reports error category distribution', () => {
  const p = spawnSync(process.execPath, ['scripts/dedupe_and_split.mjs'], {
    encoding: 'utf-8',
    cwd: ROOT,
  });

  assert.ok(p.stdout.includes('Error category distribution'), 'Must show category distribution');
  assert.ok(p.stdout.includes('dev'), 'Distribution must include dev column');
  assert.ok(p.stdout.includes('holdout'), 'Distribution must include holdout column');
});

test('run_eval.mjs produces eval_results.json and eval_report.md', () => {
  const p = spawnSync(process.execPath, ['scripts/run_eval.mjs'], {
    encoding: 'utf-8',
    cwd: ROOT,
  });

  assert.equal(p.status, 0, `run_eval exited with status ${p.status}: ${p.stderr}`);

  const resultsPath = path.join(ROOT, 'reports', 'eval_results.json');
  assert.ok(fs.existsSync(resultsPath), 'eval_results.json must exist');

  const reportPath = path.join(ROOT, 'reports', 'eval_report.md');
  assert.ok(fs.existsSync(reportPath), 'eval_report.md must exist');

  // Validate JSON structure
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  assert.ok(results.SPIN, 'Results must contain SPIN system');
  assert.ok(results.SPIN.partitions, 'SPIN must have partitions');
  assert.ok(results.SPIN.partitions.dev, 'Must have dev partition results');
  assert.ok(results.SPIN.partitions.holdout, 'Must have holdout partition results');
});

test('run_eval.mjs computes valid metrics', () => {
  const resultsPath = path.join(ROOT, 'reports', 'eval_results.json');
  // run_eval.mjs was called in the previous test
  if (!fs.existsSync(resultsPath)) {
    spawnSync(process.execPath, ['scripts/run_eval.mjs'], {
      encoding: 'utf-8',
      cwd: ROOT,
    });
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const spin = results.SPIN;

  for (const part of ['dev', 'holdout']) {
    const m = spin.partitions[part];
    assert.ok(m.precision >= 0 && m.precision <= 1, `${part} precision must be 0-1`);
    assert.ok(m.recall >= 0 && m.recall <= 1, `${part} recall must be 0-1`);
    assert.ok(m.f1 >= 0 && m.f1 <= 1, `${part} F1 must be 0-1`);
    assert.ok(m.accuracy >= 0 && m.accuracy <= 1, `${part} accuracy must be 0-1`);
    assert.ok(m.false_positive_rate >= 0 && m.false_positive_rate <= 1, `${part} FPR must be 0-1`);
    assert.ok(m.total_items > 0, `${part} must have items`);

    // Confusion matrix must add up
    const total = m.counts.TP + m.counts.FP + m.counts.FN + m.counts.TN;
    assert.equal(total, m.total_items, `${part} confusion matrix must add up to total`);
  }
});

test('run_eval.mjs evaluates negative set for false positives', () => {
  const resultsPath = path.join(ROOT, 'reports', 'eval_results.json');
  if (!fs.existsSync(resultsPath)) {
    spawnSync(process.execPath, ['scripts/run_eval.mjs'], {
      encoding: 'utf-8',
      cwd: ROOT,
    });
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const neg = results.SPIN.negative;

  assert.ok(neg, 'Negative set results must exist');
  assert.ok(neg.total > 0, 'Must have negative set items');
  assert.ok(neg.no_op_accuracy >= 0 && neg.no_op_accuracy <= 1, 'No-op accuracy must be 0-1');
  assert.equal(neg.no_op_correct + neg.false_positives, neg.total,
    'no_op_correct + false_positives must equal total');
});

test('run_eval.mjs detects suspicious scores', () => {
  const resultsPath = path.join(ROOT, 'reports', 'eval_results.json');
  if (!fs.existsSync(resultsPath)) {
    spawnSync(process.execPath, ['scripts/run_eval.mjs'], {
      encoding: 'utf-8',
      cwd: ROOT,
    });
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  const flags = results.SPIN.suspiciousFlags;

  assert.ok(Array.isArray(flags), 'suspiciousFlags must be an array');
  // SPIN's precision=1.0 should be flagged as suspicious
  const precisionFlag = flags.find(f => f.metric.includes('precision'));
  assert.ok(precisionFlag, 'Precision=1.0 should be flagged as suspicious');
});

test('fetch_sources.mjs runs in dry-run mode without errors', () => {
  const p = spawnSync(process.execPath, ['scripts/fetch_sources.mjs', '--dry-run'], {
    encoding: 'utf-8',
    cwd: ROOT,
    timeout: 30000,
  });

  assert.equal(p.status, 0, `fetch_sources exited with status ${p.status}: ${p.stderr}`);
  assert.ok(p.stdout.includes('Known sources'), 'Must list known sources');
  assert.ok(p.stdout.includes('Dry run'), 'Must indicate dry run');
});

test('all JSONL data files are valid and have required fields', () => {
  const files = ['dev.jsonl', 'holdout.jsonl', 'negative.jsonl', 'adversarial.jsonl'];
  const required = [
    'id', 'source_type', 'source_url', 'source_title', 'source_license',
    'retrieval_date', 'split', 'language', 'domain', 'authenticity_level',
    'input_text', 'gold_text', 'error_tags', 'notes', 'leakage_risk', 'include_reason',
  ];

  for (const file of files) {
    const filePath = path.join(ROOT, 'data', file);
    assert.ok(fs.existsSync(filePath), `${file} must exist`);
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim());

    for (let i = 0; i < lines.length; i++) {
      const obj = JSON.parse(lines[i]);
      for (const field of required) {
        assert.ok(field in obj, `${file}:${i + 1} missing field: ${field}`);
      }
    }
  }
});

test('negative set items have no error_tags', () => {
  const filePath = path.join(ROOT, 'data', 'negative.jsonl');
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim());

  for (const line of lines) {
    const obj = JSON.parse(line);
    assert.ok(Array.isArray(obj.error_tags), `${obj.id} error_tags must be array`);
    assert.equal(obj.error_tags.length, 0, `${obj.id} must have empty error_tags`);
    assert.equal(obj.input_text, obj.gold_text, `${obj.id} input must equal gold for negative items`);
  }
});
