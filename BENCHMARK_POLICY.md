# BENCHMARK_POLICY.md — Fairness, Leakage, License, and Contamination Policy

> **Version:** 1.0.0
> **Last updated:** 2026-03-25
> **Status:** BINDING — all benchmark operations must comply with this policy.

---

## 1. Purpose

This document defines the rules that govern how the SPIN benchmark is constructed,
maintained, and interpreted. The goal is to prevent bias, data leakage, and
misleading score claims.

---

## 2. Fairness Rules

### 2.1 No self-serving benchmark design

- The benchmark must not be designed to make SPIN look better than it is.
- If SPIN scores worse than a baseline on a fair test, that result stands.
- Error categories must reflect real-world frequency, not SPIN's coverage.

### 2.2 Balanced partition composition

Each partition must meet minimum requirements:

| Partition | Min size | Min negative % | Min adversarial % | Purpose |
|-----------|----------|----------------|-------------------|---------|
| dev | 30 | 30% | 10% | Rule ideation and iteration |
| holdout | 30 | 30% | 10% | Final evaluation only |
| negative | 20 | 100% | 0% | False positive detection |
| adversarial | 20 | 0% | 100% | Boundary case testing |

### 2.3 Authentic vs. synthetic separation

- Every example must be labeled with `authenticity_level`:
  - `authentic` — real text from a real writer, unmodified
  - `lightly_normalized` — real text with minor formatting changes
  - `synthetic` — created for testing purposes
- Synthetic examples must never constitute more than 60% of any partition.
- The holdout set should target ≥50% authentic examples.

### 2.4 Error class coverage

- The benchmark must cover all major SPIN error categories.
- No single error category may constitute more than 30% of any partition.
- Categories not covered by SPIN must also be included (to measure gaps).

---

## 3. Leakage Policy

### 3.1 Definition of leakage

Data leakage occurs when examples used to develop, inspire, or test rules
during development appear in the holdout or evaluation set.

### 3.2 Contamination sources

The following are considered contaminated:

| Source | Reason | Allowed in |
|--------|--------|-----------|
| `benchmark/datasets/comparison_corpus.json` | Created during SPIN development | dev only |
| `benchmark/datasets/spin_de.json` | Created during SPIN development | dev only |
| Examples matching SPIN rule patterns exactly | Derived from rule design | dev only |
| LanguageTool test sentences also used in SPIN tests | Cross-tool contamination | dev only |
| Any example a SPIN developer has seen before | Human memory leakage | dev only |

### 3.3 Contamination detection

- The `scripts/dedupe_and_split.mjs` script must check every holdout candidate
  against all known contaminated sources using normalized text comparison.
- Fuzzy matching (Levenshtein distance ≤ 3) must also be applied.
- Any match must be flagged and moved to dev or excluded entirely.

### 3.4 Contamination field

Every benchmark item must carry a `leakage_risk` field:
- `none` — no known contamination
- `low` — source is public but not used in SPIN development
- `medium` — source category overlaps with SPIN rule design
- `high` — source was used during SPIN development
- `critical` — example was directly used to write or test a rule

---

## 4. License Policy

### 4.1 Allowed licenses

| License | Allowed | Conditions |
|---------|---------|-----------|
| CC-0 / Public Domain | ✅ Yes | None |
| CC-BY (any version) | ✅ Yes | Attribution required |
| CC-BY-SA (any version) | ✅ Yes | Attribution + share-alike |
| MIT / Apache / BSD | ✅ Yes | License notice |
| LGPL | ✅ Yes | For reference/comparison only |
| GPL | ⚠️ Conditional | Not for inclusion in non-GPL outputs |
| Proprietary | ❌ No | Cannot use |
| Unclear / None stated | ❌ No | Cannot use until clarified |

### 4.2 License tracking

Every benchmark item must include:
- `source_license` — the license of the source material
- `source_url` — the URL where the material was found
- `retrieval_date` — when the material was retrieved

### 4.3 Bulk text prohibition

- No bulk copying of copyrighted text, even under permissive licenses.
- For copyrighted sources, store only metadata and extraction instructions.
- Short quotations (< 2 sentences) are acceptable under fair use principles.

---

## 5. Contamination Policy

### 5.1 One-way flow

```
contaminated source → dev set ONLY
                   ↛ holdout set (NEVER)
                   ↛ negative set (ONLY if no rule overlap)
                   ↛ adversarial set (ONLY if testing boundary behavior)
```

### 5.2 Contamination audit

Before any evaluation run:
1. Run `scripts/dedupe_and_split.mjs` to re-check all partitions
2. Verify no holdout items appear in dev or contaminated sources
3. Log all flagged items in `data/contamination_log.jsonl`

### 5.3 Rule-level contamination

If a benchmark example was used to inspire, debug, or validate a SPIN rule:
- That example is permanently contaminated
- It must be tagged with the rule ID in `error_tags`
- It must be excluded from holdout

---

## 6. Evaluation Fairness Rules

### 6.1 Baseline comparison

- All systems must be evaluated on the **same** test set
- Input normalization (whitespace, encoding) must be identical
- Output comparison must account for different correction formats
- No system may receive additional context not available to others

### 6.2 Metric requirements

For each system, compute:
- **Precision** — correctness of flagged errors
- **Recall** — coverage of actual errors
- **F1** — harmonic mean of precision and recall
- **False Positive Rate** — incorrect flags on correct text
- **No-op Accuracy** — correct handling of negative set
- **Boundary Violation Rate** — changes outside error spans
- **Protected-span Violation Rate** — changes to names, code, etc.
- **Per-error-class metrics** — breakdown by error category

### 6.3 Suspicious score detection

If any system shows:
- Precision ≥ 0.98 → investigate for too-easy benchmark
- Recall ≥ 0.95 → investigate for benchmark leakage
- F1 ≥ 0.95 → investigate for overfitting to test set
- FPR = 0.00 → investigate for overconservative firing
- All metrics equal → investigate for degenerate test set

These thresholds trigger a mandatory realism audit (see `reports/realism_audit.md`).

---

## 7. Benchmark Realism Assessment

A benchmark is considered **suspiciously favorable** if any of:
- [ ] Fewer than 50 total examples
- [ ] Fewer than 15 negative examples
- [ ] Fewer than 10 adversarial examples
- [ ] More than 60% synthetic data
- [ ] Any holdout item also appears in dev
- [ ] Any holdout item matches a SPIN rule test case
- [ ] Single error category > 30% of holdout
- [ ] No errors outside SPIN's coverage
- [ ] No mixed-language examples
- [ ] No protected-span examples

---

## 8. Publication Readiness Checklist

Before any benchmark results may be published or cited:

- [ ] All items have verified source licenses
- [ ] Holdout set has ≥50% authentic data
- [ ] Contamination audit passes with zero holdout violations
- [ ] At least one external baseline (LanguageTool) included
- [ ] Realism audit shows no red flags
- [ ] All metrics computed on holdout set (not dev)
- [ ] Negative set FPR reported prominently
- [ ] Adversarial set results reported prominently
- [ ] Benchmark size ≥ 100 examples in holdout
- [ ] Error category distribution documented
- [ ] "Benchmark Realism Assessment" section included in any publication

---

## 9. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-25 | Initial policy document |
