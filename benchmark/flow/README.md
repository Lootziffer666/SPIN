# FLOW Integration Layer

This repository currently contains the **SPIN evaluation spine** (domains, promotion, runner, audit).
Your actual FLOW logic can be integrated via a single adapter interface.

## Required Interface

Runner calls:

- `evaluateExample({ input, protocol, params }) -> { ok, output, diagnostics }`

Where:
- `ok` indicates whether the example is valid / passes the protocol contract
- `output` is the produced FLOW output (if any)
- `diagnostics` includes optional parse errors / warnings

## Integration Options

### A) In-process (library)
If you have FLOW as a JS/TS module, implement the function in:
- `scripts/flow_adapter.mjs` (replace the mock adapter)

### B) Out-of-process (CLI)
If FLOW exists as a CLI (recommended for isolation), the runner can call it per example.

Expected CLI behavior:

- Read JSON from stdin
- Write JSON to stdout
- Exit code 0 on success, non-zero on internal failure

Input JSON example:
```json
{
  "protocol_id": "PROTO-A",
  "protocol_version": "1.2.0",
  "protocol_hash": "PH-...",
  "params": { "strictness": "high" },
  "example": { "id": "ex-001", "input": "..." }
}
```

Output JSON example:
```json
{
  "ok": true,
  "output": { "ast": "...", "normalized": "..." },
  "diagnostics": { "warnings": [] }
}
```

Configure the CLI command via:
- env `FLOW_CMD="node path/to/flow_cli.mjs"` or
- runner arg `--flowCmd "node path/to/flow_cli.mjs"`

## Protocol Contract
Protocol definitions live under `protocol/` and are hashed for immutability.
