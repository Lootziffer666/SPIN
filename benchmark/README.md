# SPIN Evaluation Lab

SPIN Evaluation Lab is a deterministic benchmarking + promotion system for FLOW protocol runs.

It enforces strict separation between:

- **Suite** (private_dev, light): iterative testing, debugging, candidate selection
- **Lab** (internal_benchmark, dark): immutable benchmarking, audit-tracked promotion
- **Public** (public_release): explicit export only

Theme is controlled exclusively via the `<html>` class:
- `mode-suite`
- `mode-lab`

No build tools are required to run the UI.

---

## Run everything (API + UI)

```bash
node runner/server.mjs
```

Open:

- UI: http://127.0.0.1:8787/
- API health: http://127.0.0.1:8787/api/health

> You can also open `ui/index.html` directly, but API calls require the server.

---

## Scripts (no deps)

Bootstrap folders + example artifact:

```bash
node scripts/bootstrap_folders.mjs
```

Run a private benchmark (mock FLOW adapter by default, or set FLOW_CMD):

```bash
node scripts/run_benchmarks.mjs --artifact private/_inbox/artifact.json --out private/runs
```

Auto-tweak (Suite-only):

```bash
node scripts/auto_tweak.mjs --minutes 10 --artifact private/_inbox/artifact.json
```

Promotion (explicit):

```bash
node scripts/generate_artifact.mjs --run private/runs/example_runbundle.verified.json --out lab/_inbox
```

Release (explicit):

```bash
node scripts/export_public.mjs --artifact lab/artifacts/ART-XXXX/artifact.json --out public/releases
```

---

## Tests

```bash
node --test
```
