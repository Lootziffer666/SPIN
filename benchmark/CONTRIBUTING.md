# Contributing

This repository optimizes for longevity and minimal dependencies.

## Development rules

- No runtime dependencies (Node stdlib only).
- UI must be no-build (plain ESM modules under `ui/`).
- Classification boundaries are enforced by scripts; do not weaken them.

## Running locally

```bash
node scripts/bootstrap_folders.mjs
node runner/server.mjs
```

## Tests

```bash
node --test
```

## Proposing changes

Open a PR with:
- motivation / design notes
- acceptance criteria
- any security implications (especially around private/lab/public)
