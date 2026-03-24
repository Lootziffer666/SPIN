# Change Request: SPIN Evaluation Lab — Zero‑Dependency, No‑Build Web UI, Long‑Lived Architecture

**Author:** Code Copilot (Design review)  
**Date:** 2026‑03‑02  
**Scope:** Entire repository (UI + runner + scripts + CI)

## 1. Executive Summary

The project already has a strong, durable backbone on the **backend/scripts** side: deterministic file-based artifacts, strict classification guards, and a dependency-free runner API.

The largest mismatch to a long-lived, minimal, platform-agnostic philosophy is the **frontend toolchain**:
- React + Vite + TypeScript + Tailwind + PostCSS and assorted tooling create a heavy dependency surface, require build steps, and pull in a large node_modules tree.
- The UI is not currently integrated with the runner server; it assumes a Vite dev server and does not run as a static, build-free web app.

This change request proposes a pragmatic refactor that keeps the strong foundation (scripts/runner) and replaces the UI with a **static, no-build, vanilla Web UI** served by the existing runner server — resulting in a monolithic, modular system that runs well on minimal hardware (e.g., Raspberry Pi Zero).

## 2. Design Principles (non-negotiables)

1) **Zero/near-zero dependencies**
- Target: **0 runtime dependencies**.
- Optional: **0–2 dev dependencies** (if kept, must be purely optional and not required for running/tests).

2) **No build step for the UI**
- UI must run by opening `ui/index.html` or by being served statically.
- No bundlers (Vite/Webpack), no transpilers (TypeScript) in the critical path.

3) **Monolith, modular**
- One Node process provides:
  - Static UI
  - JSON API
  - Child-process orchestration for bench/tweak

4) **Performance on minimal hardware**
- Minimal JS, minimal DOM churn, no large frameworks.
- Prefer streaming logs, incremental updates, and file caching.

5) **Durability**
- Document the *why* behind decisions (security boundaries, classification gating, determinism).
- Stable interfaces: JSON contracts, explicit versioning.

## 3. Current State (what exists today)

### Strong points (keep)
- `runner/server.mjs`: dependency-free HTTP API to start jobs and read logs.
- `scripts/*.mjs`: deterministic CLI scripts with strong guards:
  - classification enforcement (private/lab/public)
  - promotion rules (private_dev → internal_benchmark → public_release)
- `protocol/protocol.schema.json` + `scripts/hash_protocol.mjs`: protocol contract + hashing.
- Minimal YAML parsing in `scripts/run_benchmarks.mjs` (no external YAML lib).

### Issues (change)
- UI depends on React/Vite/TS/Tailwind → large dependency surface and build step required.
- UI is not served by the runner server; requires separate tooling.
- CI currently installs many packages; reproducibility/security footprint larger than necessary.
- Repo hygiene gaps for long-lived projects (LICENSE, CONTRIBUTING, .editorconfig).

## 4. Target Architecture (proposed)

### 4.1 File layout
```
/ui
  index.html
  app.mjs
  styles.css
  /components
    mode-switch.mjs
    job-table.mjs
    log-viewer.mjs
    promote-wizard.mjs
  /pages
    suite-page.mjs
    lab-page.mjs
/scripts
  ... (keep)
/runner
  server.mjs (updated to also serve /ui)
/protocol
/policies
/benchmarks
```

### 4.2 Data model (stable JSON)
The repository already implies the following stable entities:

**RunBundle**
- `classification` (private_dev | internal_benchmark | public_release)
- `run_id`
- `status` (uploaded | verifying | verified | failed)
- `protocol_id`, `protocol_version`, `protocol_hash`
- `env_fingerprint`, `code_version`
- `created_at`

**Artifact**
- `classification`
- `artifact_id`, `source_run_id`
- `protocol_id`, `protocol_version`, `protocol_hash`
- `env_fingerprint`, `code_version`
- `benchmark_suite_hash`
- `actor`, `created_at`

**Job**
- `id`, `kind` (bench | tweak)
- `status` (running | complete | failed)
- `startedAt`, `endedAt`, `exitCode`

### 4.3 HTTP API (keep + small upgrades)
Keep existing endpoints:
- `GET /api/health`
- `GET /api/jobs`
- `GET /api/logs/:id`
- `POST /api/bench`
- `POST /api/tweak`

Recommended upgrades (still no deps):
- `GET /api/jobs/:id` (single job)
- `GET /api/logs/:id?tail=4096` (log tailing)
- `GET /api/events` (Server-Sent Events stream: job updates + incremental logs)

### 4.4 UI runtime model
- UI is pure ESM modules (`<script type="module">`) and Web Components.
- Communication via `fetch()` to the API.
- UI theme switching via `<html class="mode-suite|mode-lab">` with CSS variables.

## 5. Detailed Change List

### P0 — Remove build chain & runtime dependencies (core)
1) **Replace React/Vite UI with vanilla UI**
   - Delete `/src`, `vite.config.ts`, `tsconfig*`, `tailwind.config.ts`, `postcss.config.cjs`.
   - Add `/ui` directory as described above.
   - Implement core pages:
     - Suite: list runs (initially can read from `private/runs` or mock JSON until wired)
     - Lab: show artifact details, jobs list, log viewer

2) **Serve UI from runner server**
   - Update `runner/server.mjs`:
     - serve static files under `/` from `/ui`
     - correct `Content-Type` for `.html/.css/.js/.mjs/.json/.svg`
     - SPA fallback: unknown routes → `ui/index.html` (optional)
   - Single command: `node runner/server.mjs` opens both API and UI.

3) **Remove npm runtime dependencies**
   - `package.json` should have **no `dependencies`**.
   - Keep `type: "module"` and scripts to run Node entrypoints.
   - `npm install` must become optional; the system should run without node_modules.

### P1 — CI and tests become dependency-free
4) **CI: eliminate `npm install`**
   - CI should run:
     - `node scripts/bootstrap_folders.mjs --force`
     - `node --test`
     - `node scripts/ci_verify.mjs`
   - Remove UI build step entirely; add a tiny static integrity check:
     - assert `/ui/index.html`, `/ui/app.mjs`, `/ui/styles.css` exist and contain expected strings.

5) **Tests should not depend on repo-private fixtures**
   - Replace reliance on `private/_inbox/artifact.json` with a temp fixture created inside the test, or in `fixtures/`.
   - Keep `scripts/bootstrap_folders.mjs` for convenience, but tests must be hermetic.

### P2 — Repo hygiene for decades-long maintenance
6) Add:
   - `LICENSE` (choose MIT/Apache-2.0/BSL; decision required)
   - `CONTRIBUTING.md` (how to run, how to propose changes)
   - `.editorconfig` (unified whitespace rules)
   - `SECURITY.md` (how to report issues; optional but recommended)

7) Documentation update
   - Root README:
     - “Run everything” section: `node runner/server.mjs`
     - No mention of build steps.
     - Explain classification boundaries and why they exist.

### P3 — Optional: keep 0–2 dev tools (only if truly worth it)
8) If you must keep tooling:
   - Prefer **one** formatter (Prettier) OR none.
   - Avoid lint stacks with many plugins.
   - Tooling must be optional (not required to run tests/CI in the minimal path).

## 6. Migration Plan (low-risk)

**Phase A (Introduce new UI in parallel)**
- Add `/ui` and update runner to serve it.
- Keep existing React UI temporarily for reference.

**Phase B (Cutover)**
- Delete React/Vite/TS/Tailwind files.
- Simplify `package.json` to zero deps.

**Phase C (CI hardening)**
- Remove npm install from CI.
- Add static UI checks.

**Phase D (Polish)**
- SSE endpoint for logs to reduce polling.
- Document long-term invariants.

## 7. Acceptance Criteria

1) **Zero-dependency runtime**
- `node runner/server.mjs` works on a fresh clone with no `npm install`.

2) **UI no-build**
- UI loads via server and also by opening `ui/index.html` (with a note that API calls require server).

3) **All scripts still work**
- `node scripts/run_benchmarks.mjs ...` unchanged behavior.

4) **CI green without npm install**
- CI uses Node only.

5) **Performance sanity**
- On low-end hardware, UI remains responsive while logs stream.

## 8. Risks & Tradeoffs

- Losing React productivity: mitigated by Web Components + small modules.
- Browsers need ESM support: acceptable for modern environments; can provide a “no-module” fallback only if required.
- Removing ESLint/Prettier reduces automated consistency: mitigate with `.editorconfig` and a small “style rules” section.

## 9. Open Decisions (need owner input)

- License choice (MIT vs Apache-2.0 etc.).
- Whether the UI must support older browsers without ESM.
- Whether to persist job state across restarts (file-based job registry).

