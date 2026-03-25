# Was du als Nächstes tun musst (ohne Rätselraten)

Dieses Repo ist absichtlich in zwei Welten geteilt:

- **private/** = Testlab (niemals public)
- **lab/** = Benchmark (auditierbar, vergleichbar)
- **public/** = Release (nur explizit exportiert)

Du startest immer in **private/**.

---

## 0) Einmalige Installation

### Windows (PowerShell)
```powershell
./scripts/install.ps1
```

### macOS/Linux (bash)
```bash
chmod +x ./scripts/install.sh
./scripts/install.sh
```

---

## 1) UI starten (Suite-Mode)

```bash
node runner/server.mjs
```

UI: http://127.0.0.1:8787/

---

## 2) Ein erstes “privates” Benchmark ausführen (ohne FLOW)

Das nutzt den eingebauten Mock-Adapter und erzeugt Artefakte lokal:

```bash
npm run bench -- --artifact private/_inbox/artifact.json --out private/runs
```

Ergebnis landet unter `private/runs/ART-PRIVATE-EXAMPLE/` (inkl. audit_log, metrics, slices, efficiency).

---

## 3) Auto-Tweak (Suite-only)

```bash
npm run tweak -- --minutes 10 --artifact private/_inbox/artifact.json
```

Ergebnis landet unter `private/tweaks/TWEAK-.../` mit `best_config.json`.

Wichtig: Auto-Tweak ist **immer** private_dev und darf nicht nach public/lab schreiben.

---

## 4) Promotion vorbereiten (private_dev → internal_benchmark)

Promotion erzeugt ein neues Artifact im Lab-Inbox:

```bash
npm run promote -- --run private/runs/example_runbundle.verified.json --out lab/_inbox
```

Das erzeugte Artifact kannst du dann in Lab benchmarken:

```bash
npm run bench -- --artifact lab/_inbox/ART-XXXX.json --out lab/artifacts
```

---

## 5) Public Export (nur wenn du es wirklich willst)

Nur aus `lab/` heraus:

```bash
npm run release -- --artifact lab/artifacts/ART-XXXX/artifact.json --out public/releases
```

Wenn du versuchst, private_dev nach public zu schreiben: Scripts brechen ab.

---

# FLOW-Logik: Was du als nächstes implementierst

Du hast noch keine FLOW-Implementierung. Das ist okay.

Du hast zwei Wege:

## A) FLOW als CLI (empfohlen)
Du baust eine Datei `flow/flow_cli.mjs`, die:
- JSON auf stdin annimmt
- JSON auf stdout zurückgibt
- `{ ok, output, diagnostics, score? }`

Dann:
```bash
FLOW_CMD="node flow/flow_cli.mjs" npm run bench -- --artifact lab/_inbox/ART-XXXX.json --out lab/artifacts
```

## B) FLOW als Library
Du implementierst die Evaluationslogik direkt in `scripts/flow_adapter.mjs`.

---

# Minimaler FLOW-CLI Output Contract

Input (stdin):
```json
{ "protocol_id":"...", "protocol_version":"...", "protocol_hash":"...", "params":{}, "example":{ "id":"ex-001","input":"..." } }
```

Output (stdout):
```json
{ "ok": true, "output": { "normalized":"..." }, "diagnostics": { "warnings":[] }, "score": 0.92 }
```

---

## Die 3 wichtigsten nächsten Meilensteine

1) **FLOW CLI stub** erstellen, der erstmal nur “syntax ok/ok” simuliert (damit Pipeline steht)
2) **Dataset Loader**: mockDataset() ersetzen durch dataset manifests unter `datasets/`
3) **Protocol Contract**: echte FLOW-Metriken/Parserregeln in `protocol/protocol.json` verankern und `hash:protocol` nutzen

---

# Runner Service (damit du alles per GUI starten kannst)

Browser-UI kann keine lokalen Node-Skripte starten. Dafür gibt es den lokalen Runner-Service.

1) Terminal A:
```bash
node runner/server.mjs
```

2) Terminal B:
```bash
npm run dev
```

Im UI findest du oben den Abschnitt **Local Runner** mit Buttons für Benchmarks und Auto-Tweak.

---

# Build-Prozess: FLOW läuft automatisch in CI

Dieses Repo enthält eine GitHub Actions Pipeline (`.github/workflows/ci.yml`), die bei jedem Push/PR:

- Node-Unit-Tests ausführt (`node --test`)
- UI baut (`npm run build`)
- einen FLOW-basierten Bench-Run ausführt (`node scripts/ci_verify.mjs`), standardmäßig über die lokale `flow/flow_cli.mjs` Stub

Damit ist die FLOW-Integration schon im Build-Prozess abgesichert.
