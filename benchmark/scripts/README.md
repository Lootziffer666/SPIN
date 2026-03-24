# Scripts

This folder contains the runnable spine of SPIN Evaluation Lab.

## Safety Domains

- `private/`  -> `private_dev` (testlab; must never become public)
- `lab/`      -> `internal_benchmark`
- `public/`   -> `public_release`

Allowed transitions:

- `private_dev` -> `internal_benchmark` (promotion only)
- `internal_benchmark` -> `public_release` (explicit export only)

Scripts enforce these transitions.

## Runner

Run deterministic benchmarks:

```bash
node scripts/run_benchmarks.mjs --artifact lab/_inbox/ART-XXXX.json --out lab/artifacts
```

## Scheduled Auto-Tweak (Suite only)

```bash
node scripts/auto_tweak.mjs --minutes 20 --artifact private/_inbox/artifact.json --out private/tweaks
```

## Promotion (private_dev -> internal_benchmark)

```bash
node scripts/generate_artifact.mjs --run private/runs/example_runbundle.verified.json --out lab/_inbox
```

## Public Export (internal_benchmark -> public_release)

```bash
node scripts/export_public.mjs --artifact lab/artifacts/ART-XXXX/artifact.json --out public/releases
```

## FLOW Integration

By default the runner uses a deterministic mock adapter.

To run real FLOW, provide a CLI command:

- Env: `FLOW_CMD="node path/to/flow_cli.mjs"`
- Or arg: `--flowCmd "node path/to/flow_cli.mjs"`

Runner calls the command once per example with JSON via stdin and expects JSON via stdout.
See `flow/README.md` and `scripts/flow_adapter.mjs`.
