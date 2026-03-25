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

## Phase 2 — Protocol System


- [ ] protocol.schema.json definition
- [ ] protocol hashing script
- [ ] protocol registry folder
- [ ] protocol version locking

---

## Phase 3 — Dataset Governance

- [ ] dataset_card.json schema
- [ ] dataset hashing tool
- [ ] dataset manifest generation
- [ ] dataset integrity verification

---

## Phase 4 — Environment Reproducibility

- [ ] env_manifest.json generator
- [ ] env fingerprint hashing
- [ ] container support
- [ ] deterministic flags enforcement

---

## Phase 5 — Benchmark Runner

- [ ] benchmark runner script
- [ ] benchmark suite definition
- [ ] metrics generation
- [ ] slice analysis

---

## Phase 6 — Audit and Provenance

- [ ] provenance.json generation
- [ ] artifact hash chain
- [ ] audit verification script

---

## Phase 7 — CI Integration

- [ ] GitHub Actions workflow
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

- [ ] Run install script and start UI (`npm run dev`)
- [ ] Run one private benchmark to generate artifacts (`npm run bench -- --artifact private/_inbox/artifact.json --out private/runs`)
- [ ] Run a short auto-tweak (`npm run tweak -- --minutes 10 --artifact private/_inbox/artifact.json`)
- [ ] Implement a minimal FLOW CLI stub (`flow/flow_cli.mjs`) and run with `FLOW_CMD`
