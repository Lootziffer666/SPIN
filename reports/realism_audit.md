# Benchmark Realism Audit

> **Generated:** 2026-03-25
> **Auditor:** Automated pipeline (scripts/run_eval.mjs)
> **Policy reference:** BENCHMARK_POLICY.md §6–7

---

## Executive Summary

**Verdict: This benchmark is currently NOT suitable for publication or external claims.**

The benchmark produces honest, unglamorous numbers — SPIN does not claim unrealistic
performance. However, the benchmark has structural weaknesses that must be addressed
before any results can be cited externally.

---

## 1. Suspicious Score Analysis

### 1.1 Precision = 1.0 on dev and holdout

**Flag:** SPIN achieves perfect precision (1.0) on both dev and holdout sets.

**Investigation:**
- This is NOT caused by benchmark leakage or overfitting.
- Root cause: SPIN is **overconservative** — it only fires rules on patterns it
  is extremely confident about (regex-based matching with high confidence thresholds).
- When SPIN does flag something, it is almost always correct.
- However, this comes at the cost of low recall (0.44 dev, 0.28 holdout).

**Assessment:** The precision=1.0 is **real but misleading in isolation**.
SPIN's conservative approach means it misses many errors (low recall) but rarely
makes false corrections. Reporting precision alone without recall would be deceptive.

### 1.2 FPR = 0 on dev and holdout

**Flag:** Zero false positive rate on structured evaluation sets.

**Investigation:**
- SPIN only fires on exact regex pattern matches.
- The dev/holdout sets contain sentences where errors don't match SPIN's patterns.
- The negative set reveals a non-zero FPR (1/30 = 0.033) — the word repeat rule
  incorrectly flags "das das" in "dass das das richtige Ergebnis ist."

**Assessment:** FPR=0 on dev/holdout is an artifact of the test set composition,
not evidence of zero false positives in practice. The negative set correctly
identifies a real false positive.

### 1.3 Negative set no-op accuracy = 0.967

**Flag:** One false positive detected in the negative set.

**Investigation:**
- Item `neg-020`: "Er weiß, dass das das richtige Ergebnis ist."
- SPIN's `de-gr-word-repeat` rule incorrectly flags "das das" as a word repeat.
- This is a legitimate German construction (demonstrative article + relative pronoun).
- This is a real bug in SPIN's word repeat rule — it lacks context awareness.

**Assessment:** This is a **genuine finding** — SPIN has a confirmed false positive
pattern. The negative set is working as designed.

---

## 2. Benchmark Composition Assessment

### 2.1 Data authenticity

| Question | Answer | Status |
|----------|--------|--------|
| Contains authentic learner data? | No | ❌ |
| Contains authentic text from corpora? | No | ❌ |
| 100% synthetic? | Yes | ⚠️ |
| Synthetic data labeled? | Yes | ✅ |
| Provenance tracked? | Yes | ✅ |

**Verdict:** The benchmark is entirely synthetic. No authentic learner errors
are included. This is the single biggest weakness.

### 2.2 Size assessment

| Partition | Size | Min required | Status |
|-----------|------|-------------|--------|
| dev | 40 | 30 | ✅ |
| holdout | 40 | 30 | ✅ |
| negative | 30 | 20 | ✅ |
| adversarial | 30 | 20 | ✅ |
| **Total** | **140** | **100** | ✅ |

**Verdict:** Size meets minimum requirements, but 140 total items is small.
A credible benchmark should have 200+ items in the holdout set alone.

### 2.3 Error category coverage

SPIN covers these categories in the benchmark:
- GETRENNTSCHREIBUNG ✅
- KOMMA ✅
- DAS_DASS ✅
- ALS_WIE ✅
- APOSTROPH ✅
- SS_ESZETT ✅
- ALTE_RECHTSCHREIBUNG ✅
- REDUNDANZ ✅
- WORD_REPEAT ✅
- AUSLAUTVERHÄRTUNG ✅
- SUPERLATIV_FEHLFORM ✅
- ZUSAMMENSCHREIBUNG ✅
- KOMMA_RELATIVSATZ ✅
- VERSCHMELZUNG_ADVERB ✅
- KASUS ✅

**Missing categories** (errors that exist in German but SPIN doesn't cover):
- Genus errors (der/die/das confusion with nouns)
- Verb conjugation errors
- Subjunctive (Konjunktiv) errors
- Word order errors
- Agreement errors (subject-verb, adjective-noun)
- Compound noun errors (Fugen-s)
- Preposition case government

**Verdict:** The benchmark only tests error types SPIN claims to handle.
A fair benchmark should also include errors SPIN cannot handle, to measure
coverage gaps honestly.

### 2.4 Contamination status

| Check | Result |
|-------|--------|
| Holdout items in dev? | No ✅ |
| Holdout items in contaminated sources? | No ✅ |
| Near-duplicates across partitions? | No ✅ |
| Contamination log clean? | Yes ✅ |

**Verdict:** No cross-partition contamination detected. However, since all
data is synthetic and created by the same developer, implicit bias is
likely present even without exact text overlap.

---

## 3. Baseline Comparison Status

### 3.1 Current baselines

| System | Status | Notes |
|--------|--------|-------|
| SPIN | ✅ Evaluated | Multi-layer: grammar + context + phonotactics + clause |
| LanguageTool | ❌ Not yet | Requires LanguageTool API or local server |
| Other | ❌ Not yet | No additional baseline configured |

**Verdict:** Without at least one external baseline (LanguageTool), the benchmark
cannot claim to demonstrate SPIN's competitive position. The compare_lt.mjs script
exists in the benchmark/ directory but is not yet integrated with this pipeline.

### 3.2 Recommended next steps for baselines

1. Integrate LanguageTool evaluation via their HTTP API
2. Run LanguageTool on the same holdout set
3. Compare per-category performance
4. Report areas where SPIN outperforms and where it underperforms

---

## 4. Score Claims Assessment

### 4.1 Claims that would be VALID

- "SPIN achieves high precision on German grammar errors it targets"
- "SPIN has a low false positive rate on correct German text"
- "SPIN's word repeat rule has a known false positive with 'das das' constructions"
- "SPIN currently covers ~15 error categories with ~140 deterministic rules"

### 4.2 Claims that would be MISLEADING

- ~~"SPIN achieves Precision 1.0"~~ — True on synthetic test data, but untested on real text
- ~~"SPIN has zero false positives"~~ — Disproven by the negative set (1 FP found)
- ~~"SPIN outperforms LanguageTool"~~ — No LanguageTool comparison in this pipeline yet
- ~~"SPIN F1 = 0.61"~~ — Only measured on synthetic, developer-created test data
- ~~"SPIN handles all German grammar errors"~~ — Only covers ~15 of 20+ error classes

### 4.3 Claims that CANNOT be made yet

- Any claim about real-world performance (no authentic data)
- Any claim about learner error correction (no learner data)
- Any comparative claim (no baseline evaluated)
- Any claim about production readiness (benchmark too small)

---

## 5. Benchmark Realism Checklist

| Criterion | Met? | Notes |
|-----------|------|-------|
| ≥50 holdout items | No (40) | Need 50+ for minimal statistical significance |
| ≥50% authentic data in holdout | No (0%) | All synthetic |
| ≥1 external baseline | No | LanguageTool not yet integrated |
| Error types SPIN can't handle included | No | Only SPIN-covered categories |
| Mixed-domain test data | Partial | Some variety but all from one author |
| Contamination audit clean | Yes | No cross-partition leakage |
| Provenance fully tracked | Yes | All items have source metadata |
| License compliance | Yes | All synthetic/CC0 |
| Negative set catches real FP | Yes | Found word-repeat FP |
| Adversarial set tests boundaries | Yes | Protected spans, mixed lang, dialect |

**Overall realism score: 5/10** — The pipeline is well-designed but the data
is insufficient for credible external claims.

---

## 6. Recommendations

### Immediate (before any results are shared)

1. **Add authentic data** — Integrate Merlin Corpus or Falko Corpus learner errors
2. **Add LanguageTool baseline** — Run compare_lt.mjs on the same holdout set
3. **Expand holdout set** — Target 200+ items with ≥50% authentic data
4. **Add uncovered error types** — Include Genus, verb conjugation, word order errors
5. **Fix the word-repeat FP** — SPIN should not flag "das das" in valid contexts

### Before publication

6. **Independent review** — Have someone not involved in SPIN review the benchmark
7. **Cross-validation** — Test on multiple random splits to verify stability
8. **Confidence intervals** — Report 95% CIs for all metrics
9. **Effect size** — Report practical significance, not just statistical

---

## 7. Blunt Verdict

**What is fair:**
- The pipeline design is sound: 4 partitions, contamination tracking, provenance
- The negative set works — it found a real false positive
- The adversarial set tests real boundary cases
- Metrics are computed honestly, including unflattering recall numbers
- Suspicious scores are detected and flagged automatically

**What is contaminated:**
- All data is synthetic and created by the SPIN developer
- Implicit bias is unavoidable even with careful partition separation
- The dev set was designed to showcase SPIN's strengths

**What is still weak:**
- Zero authentic learner data
- No external baseline comparison in this pipeline
- Benchmark is too small (140 items total)
- Only tests SPIN-covered error categories
- Holdout set needs 5× more items

**What score claims would currently be misleading:**
- Any precision/F1 claim based on this data alone
- Any "SPIN vs. LanguageTool" comparison (not yet measured here)
- Any "production-ready" or "real-world performance" claim
- The P=1.0 precision is real but an artifact of SPIN's conservatism, not proof of quality
