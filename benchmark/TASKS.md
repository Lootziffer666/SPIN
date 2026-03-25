# SPIN Evaluation Lab Tasks

This file defines implementation roadmap.

---

## Phase 1 — UI Foundation (Complete)

- [x] Mode separation
- [x] Suite Runs page
- [x] Candidate selection
- [x] Promote Wizard
- [x] Lab Console
- [x] Artifact creation simulation
- [x] Benchmark job simulation
- [x] Audit log display

---

## Phase 1.5 — Privacy & Domain Separation (Complete)

- [x] Domain folders: private/ lab/ public/
- [x] Classification model: private_dev / internal_benchmark / public_release
- [x] Script-level export guards
- [x] Suite-only auto-tweak enforcement
- [x] Explicit promotion and explicit public export gates

---

## Phase 2 — Protocol System (Complete)

- [x] protocol.schema.json definition
- [x] protocol hashing script
- [x] protocol registry folder
- [x] protocol version locking

---

## Phase 3 — Dataset Governance

- [ ] dataset_card.json schema
- [ ] dataset hashing tool
- [ ] dataset manifest generation
- [ ] dataset integrity verification

---

## Phase 4 — Environment Reproducibility

- [ ] env_manifest.json generator
- [x] env fingerprint hashing
- [ ] container support
- [x] deterministic flags enforcement

---

## Phase 5 — Benchmark Runner (Complete)

- [x] benchmark runner script
- [x] benchmark suite definition
- [x] metrics generation
- [x] slice analysis

---

## Phase 6 — Audit and Provenance (Complete)

- [x] provenance.json generation
- [x] artifact hash chain
- [x] audit verification script

---

## Phase 7 — CI Integration

- [x] GitHub Actions workflow
- [ ] automated dataset validation
- [ ] automated protocol validation
- [ ] artifact generation pipeline

---

## Phase 8 — Scientific Publication Readiness

- [ ] exportable benchmark reports
- [ ] reproducibility scripts
- [ ] artifact archiving

---

## Next Actions (You can do now)

- [x] Implement FLOW CLI (`flow/flow_cli.mjs`) with real SPIN module integration
- [x] Run one private benchmark to generate artifacts (`npm run bench:spin`)
- [ ] Run a short auto-tweak (`npm run bench:tweak -- --minutes 10 --artifact private/_inbox/artifact.json`)
- [ ] Create dataset_card.json schema for dataset governance
