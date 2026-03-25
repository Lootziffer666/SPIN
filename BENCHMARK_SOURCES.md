# BENCHMARK_SOURCES.md — Candidate Sources for SPIN Evaluation

> **Last updated:** 2026-03-25
> **Status:** Living document — updated as new sources are discovered or rejected.

## Purpose

This document lists all candidate sources considered for building a fair, reproducible
benchmark for SPIN (a German rule-based grammar/spelling correction tool).
Each source is evaluated for licensing, quality, relevance, and reusability.

---

## Source Evaluation Criteria

| Criterion | Requirement |
|-----------|-------------|
| License | Must be clearly stated; CC-BY, CC-0, MIT, Apache, or public domain preferred |
| Language | German (primary), mixed German/English (for adversarial set) |
| Authenticity | Prefer authentic learner errors over synthetic generation |
| Provenance | Must be traceable to a specific URL, paper, or repository |
| Overlap Risk | Must not overlap with examples used to develop SPIN rules |
| Quality | Must contain realistic errors, not random character mutations |

---

## A. GitHub Sources — German Spelling/Grammar Correction

### A1. LanguageTool (languagetool-org/languagetool)

- **URL:** https://github.com/languagetool-org/languagetool
- **License:** LGPL-2.1
- **Relevance:** Primary baseline comparison tool; contains German grammar rules
  and test sentences in `languagetool-language-modules/de/src/test/`
- **Status:** ✅ ACCEPTED as baseline comparison system
- **Reuse:** Test sentences from their test files are LGPL-licensed and can be
  referenced for comparison, but direct copying of large blocks should be avoided.
  Metadata and extraction instructions are stored instead.
- **Leakage risk:** HIGH — SPIN rules were inspired by LanguageTool categories.
  Any LanguageTool test sentence that matches a SPIN rule pattern must be flagged
  as contaminated and excluded from holdout.

### A2. Wikipedia Deutsch (Wikimedia Foundation)

- **URL:** https://de.wikipedia.org/
- **License:** CC-BY-SA 3.0
- **Relevance:** Large source of correct German sentences for negative set
- **Status:** ✅ ACCEPTED for negative set (correct sentences only)
- **Reuse:** Short quotations under fair use / CC-BY-SA with attribution.
  Only metadata and short excerpts stored, not bulk text.
- **Leakage risk:** LOW — Wikipedia text is generally correct and was not used
  for SPIN rule development.

### A3. Merlin Corpus (learner corpus)

- **URL:** https://merlin-platform.eu/
- **License:** CC-BY-SA (varies by subcorpus)
- **Relevance:** Authentic learner errors in German (L2 learners)
- **Status:** ⚠️ CONDITIONAL — requires verification of exact license terms
  for each subcorpus. Academic use likely permitted.
- **Reuse:** Only if license is confirmed. Store extraction instructions, not raw text.
- **Leakage risk:** LOW — SPIN rules were not developed using Merlin data.

### A4. Falko Corpus (Freie Universität Berlin)

- **URL:** https://www.linguistik.hu-berlin.de/de/institut/professuren/korpuslinguistik/forschung/falko
- **License:** Academic use; license terms must be verified per subcorpus
- **Status:** ⚠️ CONDITIONAL — license verification required
- **Relevance:** German learner essays with annotated errors
- **Leakage risk:** LOW

### A5. GECko+ (German Error Correction dataset)

- **URL:** Research publications on German GEC
- **License:** Varies; must check per publication
- **Status:** ⚠️ CONDITIONAL — academic datasets may have restrictions
- **Relevance:** Directly relevant to German grammar error correction
- **Leakage risk:** LOW

---

## B. Web Sources — German Sentence Material

### B1. Duden Online (duden.de)

- **URL:** https://www.duden.de/
- **License:** Proprietary — NOT safe to copy
- **Status:** ❌ REJECTED for direct text extraction
- **Use:** Reference only. May cite Duden rules for documentation, but no
  text passages should be extracted or used as benchmark sentences.

### B2. canoonet / canoo.net (German grammar reference)

- **URL:** https://www.canoo.net/ (historical)
- **License:** Unclear / defunct
- **Status:** ❌ REJECTED — unclear licensing, site defunct

### B3. Tatoeba (tatoeba.org)

- **URL:** https://tatoeba.org/
- **License:** CC-BY 2.0 FR (individual sentence contributions)
- **Relevance:** Large collection of German sentences with translations
- **Status:** ✅ ACCEPTED for negative set — sentences are generally correct
- **Reuse:** Individual sentences can be used with CC-BY attribution.
  German subset is substantial.
- **Leakage risk:** LOW — Tatoeba sentences are not used in SPIN development.

### B4. OpenSubtitles (opus.nlpl.eu)

- **URL:** https://opus.nlpl.eu/OpenSubtitles.php
- **License:** Varies per subtitle file; many are CC-compatible
- **Status:** ⚠️ CONDITIONAL — license varies per entry
- **Relevance:** Colloquial German with natural error patterns
- **Leakage risk:** LOW

---

## C. Synthetic Sources

### C1. SPIN-internal synthetic examples

- **Source:** Manually crafted by SPIN developers
- **License:** Same as SPIN repository (UNLICENSED/private)
- **Status:** ✅ ACCEPTED for dev set ONLY
- **Leakage risk:** CRITICAL — these examples were created during or for rule
  development. They must NEVER appear in the holdout set.
- **Contamination:** All examples from `benchmark/datasets/comparison_corpus.json`
  and `benchmark/datasets/spin_de.json` are classified as contaminated.
  They may only appear in the dev set.

### C2. Rule-derived synthetic examples

- **Source:** Generated by systematically applying each SPIN rule pattern
- **License:** N/A (synthetic)
- **Status:** ✅ ACCEPTED for dev set ONLY
- **Leakage risk:** CRITICAL — derived directly from SPIN rules
- **Contamination:** Always contaminated; dev set only.

---

## D. Rejected Sources

| Source | Reason for Rejection |
|--------|---------------------|
| Random GitHub gists | No license, no quality control |
| StackOverflow German posts | CC-BY-SA but scraping complexity; not sentence-level |
| News sites (Spiegel, FAZ, etc.) | Proprietary; no reuse rights |
| Social media (Twitter/X, Reddit) | TOS prohibit scraping; unclear licensing |
| Google Translate output | Google TOS prohibit use as training/test data |
| ChatGPT/LLM-generated text | License unclear; not authentic learner data |

---

## E. Source Status Summary

| Source | License | Status | Partition | Leakage Risk |
|--------|---------|--------|-----------|-------------|
| LanguageTool tests | LGPL-2.1 | ✅ Baseline | dev (contaminated) | HIGH |
| Wikipedia DE | CC-BY-SA | ✅ Accepted | negative | LOW |
| Tatoeba DE | CC-BY 2.0 | ✅ Accepted | negative/holdout | LOW |
| Merlin Corpus | CC-BY-SA (verify) | ⚠️ Conditional | holdout | LOW |
| Falko Corpus | Academic (verify) | ⚠️ Conditional | holdout | LOW |
| GECko+ | Academic (verify) | ⚠️ Conditional | holdout | LOW |
| SPIN internal | UNLICENSED | ✅ Dev only | dev | CRITICAL |
| Synthetic (rule-derived) | N/A | ✅ Dev only | dev | CRITICAL |
| Duden | Proprietary | ❌ Rejected | — | — |
| canoonet | Unclear | ❌ Rejected | — | — |

---

## F. Action Items

1. **Verify Merlin Corpus license** — contact maintainers if needed
2. **Verify Falko Corpus license** — check FU Berlin terms
3. **Search for GECko+ availability** — check ACL Anthology
4. **Extract Tatoeba German subset** — via official API, with attribution
5. **Build negative set from Wikipedia** — via MediaWiki API, short sentences only
6. **Flag all existing SPIN examples as contaminated** — enforce in dedupe_and_split

---

## G. Blunt Assessment

The current benchmark relies **entirely on SPIN-internal synthetic examples**.
This means:

- **All current test data is contaminated** — it was created during rule development.
- **No authentic learner data** is currently included.
- **No external validation** has been performed.
- **The holdout set is currently empty** pending external source integration.
- **Any score claims based on current data alone would be misleading.**

To build a credible benchmark, external sources (Merlin, Falko, Tatoeba) must be
integrated with verified licenses. Until then, all evaluation results should be
labeled as "development-only, not for publication."
