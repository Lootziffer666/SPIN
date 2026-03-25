# SPIN Evaluation Lab

Deterministisches Benchmarking-System für SPINs regelbasierte Sprachanalyse.

Beweist evidenzbasiert, dass SPINs Ansatz — deterministische, regex-basierte
Grammatikanalyse ohne externe NLP-Modelle — valide und unter Umständen
visionär ist. Schafft einen Standard zur Vergleichung von Sprachanalyse-
und Bestimmungsverfahren.

## Architektur

Drei strikte Domänen mit Einweg-Promotion:

```
private/ (Suite)  →  lab/ (Benchmark)  →  public/ (Release)
   ↑ iterativ        ↑ auditierbar         ↑ nur explizit
```

- **Suite** (`private_dev`): Iteratives Testen, Debugging, Parameter-Tuning
- **Lab** (`internal_benchmark`): Unveränderliche Benchmarks, Audit-Trail
- **Public** (`public_release`): Nur explizit exportiert

## Was wird getestet?

| Komponente | Beschreibung | Einzigartig? |
|-----------|-------------|-------------|
| **Grammatik-Regeln** | 140+ GR_RULES (Komma, Getrenntschreibung, ss/ß, das/dass, ...) | Deterministisch, keine Modelle |
| **Clause Detection** | Satz-Topologie (einfach/verbunden/komplex/compound-complex) | Constraint Grammar (Karlsson 1990) |
| **Phonotaktik** | SSP-basierte Analyse (Clements 1990), illegale Bigramme, Silbengewicht | Weltweit einzigartig als Fehlerdetektor |
| **Diagnose-Engine** | 6 Zustände (performativ_instabil, stabil, mehrkernig, ...) | Strukturelle Satzdiagnose |
| **Determinismus** | Identische Ausgaben bei identischen Eingaben | By Design, nicht by Hope |
| **Effizienz** | Durchsatz, Speicher, Verarbeitungszeit | Zero-Dependency |

## Schnellstart

```bash
# Aus dem SPIN-Hauptverzeichnis:
cd benchmark

# Ordner bootstrappen
node scripts/bootstrap_folders.mjs

# Benchmark mit SPIN-Modulen ausführen
FLOW_CMD="node flow/flow_cli.mjs" node scripts/run_benchmarks.mjs \
  --artifact private/_inbox/artifact.json \
  --out private/runs

# Auto-Tweak (Suite-only, Parameter-Optimierung)
node scripts/auto_tweak.mjs --minutes 10 --artifact private/_inbox/artifact.json

# Promotion: private → lab
node scripts/generate_artifact.mjs \
  --run private/runs/example_runbundle.verified.json \
  --out lab/_inbox

# UI starten (API + Dashboard)
node runner/server.mjs
# → http://127.0.0.1:8787/
```

## Testdatensatz

`datasets/spin_de.json` — 140 realistische deutsche Beispiele:

- **89 Grammatik-Beispiele**: Alle Regelkategorien (Getrenntschreibung, Komma, Apostroph, als/wie, ss/ß, alte Rechtschreibung, Redundanz, DAS_DASS, Zusammenschreibung, Auslautverhärtung, Superlativ-Fehlformen) + Negativbeispiele
- **12 Clause-Beispiele**: einfach, verbunden, komplex, compound-complex
- **13 Phonotaktik-Beispiele**: Illegale Bigramme, Fremdwort-Ausnahmen, Silbengewicht, saubere Wörter
- **13 Diagnose-Beispiele**: Alle 6 Zustände
- **7 Edge Cases**: Leerstrings, Sonderzeichen, Unicode, gemischte Sprachen
- **6 Stress-Tests**: Sehr lange Sätze, viele Fehler gleichzeitig, verschachtelte Nebensätze

## Vergleichs-Standard

Das Protokoll (`protocol/protocol.json`) definiert einen reproduzierbaren
Evaluationsstandard. Jedes Tool, das denselben Datensatz gegen dasselbe
Protokoll evaluiert, ist direkt vergleichbar:

1. **Determinismus-Garantie**: SHA256-Hash über Protokoll + Datensatz + Umgebung
2. **Audit-Trail**: Jeder Benchmark-Lauf ist vollständig nachvollziehbar
3. **Slice-Analyse**: Performance-Breakdown nach Fehlertyp, Inputlänge, Schwierigkeit
4. **Effizienz-Metriken**: Throughput, Speicherverbrauch, Verarbeitungszeit

## Tests

```bash
node --test tests/
```
