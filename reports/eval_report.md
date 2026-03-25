# SPIN Benchmark — Evaluation Report

> **Generated:** 2026-03-25T19:43:10.407Z
> **Policy:** See BENCHMARK_POLICY.md for fairness rules
> **Sources:** See BENCHMARK_SOURCES.md for data provenance

## ⚠ Realism Warning

This benchmark currently uses **100% synthetic data** created during
SPIN development. All results should be treated as **development-only**.
See `reports/realism_audit.md` for a detailed assessment.

## System: SPIN

### dev (40 items)

| Metric | Value |
|--------|-------|
| Precision | 1 |
| Recall | 0.44 |
| F1 | 0.611 |
| Accuracy | 0.65 |
| False Positive Rate | 0 |
| Exact Match Rate | 0.6 |
| Boundary Violation Rate | 0.05 |
| Protected-Span Violation Rate | 0 |
| Change Rate | 0.275 |

#### Per-Error-Class Metrics

| Category | Precision | Recall | F1 | Count |
|----------|-----------|--------|----|-------|
| ALS_WIE | 1 | 1 | 1 | 3 |
| ALTE_RECHTSCHREIBUNG | 1 | 0.5 | 0.667 | 2 |
| APOSTROPH | 1 | 1 | 1 | 2 |
| AUSLAUTVERHÄRTUNG | 0 | 0 | 0 | 2 |
| DAS_DASS | 0 | 0 | 0 | 2 |
| GETRENNTSCHREIBUNG | 1 | 1 | 1 | 2 |
| KASUS | 0 | 0 | 0 | 2 |
| KOMMA | 1 | 1 | 1 | 2 |
| KOMMA_RELATIVSATZ | 0 | 0 | 0 | 1 |
| REDUNDANZ | 0 | 0 | 0 | 1 |
| SS_ESZETT | 1 | 1 | 1 | 1 |
| SUPERLATIV_FEHLFORM | 1 | 1 | 1 | 1 |
| VERSCHMELZUNG_ADVERB | 0 | 0 | 0 | 1 |
| WORD_REPEAT | 1 | 0.25 | 0.4 | 4 |
| ZUSAMMENSCHREIBUNG | 0 | 0 | 0 | 1 |

### holdout (40 items)

| Metric | Value |
|--------|-------|
| Precision | 1 |
| Recall | 0.28 |
| F1 | 0.438 |
| Accuracy | 0.55 |
| False Positive Rate | 0 |
| Exact Match Rate | 0.525 |
| Boundary Violation Rate | 0.025 |
| Protected-Span Violation Rate | 0 |
| Change Rate | 0.175 |

#### Per-Error-Class Metrics

| Category | Precision | Recall | F1 | Count |
|----------|-----------|--------|----|-------|
| ALS_WIE | 0 | 0 | 0 | 2 |
| ALTE_RECHTSCHREIBUNG | 1 | 0.5 | 0.667 | 2 |
| APOSTROPH | 1 | 1 | 1 | 2 |
| AUSLAUTVERHÄRTUNG | 0 | 0 | 0 | 1 |
| DAS_DASS | 0 | 0 | 0 | 2 |
| GETRENNTSCHREIBUNG | 1 | 0.333 | 0.5 | 3 |
| KASUS | 0 | 0 | 0 | 4 |
| KOMMA | 1 | 0.5 | 0.667 | 2 |
| KOMMA_RELATIVSATZ | 0 | 0 | 0 | 2 |
| REDUNDANZ | 0 | 0 | 0 | 1 |
| SS_ESZETT | 1 | 1 | 1 | 1 |
| SUPERLATIV_FEHLFORM | 1 | 1 | 1 | 1 |
| VERSCHMELZUNG_ADVERB | 0 | 0 | 0 | 1 |
| WORD_REPEAT | 1 | 0.5 | 0.667 | 2 |
| ZUSAMMENSCHREIBUNG | 0 | 0 | 0 | 1 |

### adversarial (30 items)

| Metric | Value |
|--------|-------|
| Precision | 0.8 |
| Recall | 0.5 |
| F1 | 0.615 |
| Accuracy | 0.833 |
| False Positive Rate | 0.045 |
| Exact Match Rate | 0.767 |
| Boundary Violation Rate | 0.1 |
| Protected-Span Violation Rate | 0 |
| Change Rate | 0.167 |

#### Per-Error-Class Metrics

| Category | Precision | Recall | F1 | Count |
|----------|-----------|--------|----|-------|
| ALS_WIE | 1 | 1 | 1 | 1 |
| ALTE_RECHTSCHREIBUNG | 1 | 1 | 1 | 1 |
| APOSTROPH | 1 | 0.667 | 0.8 | 3 |
| DAS_DASS | 1 | 0.5 | 0.667 | 2 |
| WORD_REPEAT | 0 | 0 | 0 | 1 |
| ZUSAMMENSCHREIBUNG | 0 | 0 | 0 | 1 |

### negative (30 items)

| Metric | Value |
|--------|-------|
| Precision | 0 |
| Recall | 0 |
| F1 | 0 |
| Accuracy | 0.967 |
| False Positive Rate | 0.033 |
| Exact Match Rate | 0.967 |
| Boundary Violation Rate | 0.033 |
| Protected-Span Violation Rate | 0 |
| Change Rate | 0.033 |

### Negative Set (False Positive Detection)

| Metric | Value |
|--------|-------|
| Total correct sentences | 30 |
| No-op correct | 29 |
| False positives | 1 |
| No-op accuracy | 0.967 |

#### False Positive Details

- **neg-020**: "Er weiß, dass das das richtige Ergebnis ist...."
  - de-gr-word-repeat: "das das" → "das"

### Top Disagreements (most informative)

| ID | Split | Class | Input (truncated) | Expected | Got |
|----|-------|-------|-------------------|----------|-----|
| adv-028 | adversarial | FP | Goethe schrieb: „Ich weiß, daß ich nicht | Goethe schrieb: „Ich weiß, daß | Goethe schrieb: „Ich weiß, das |
| neg-020 | negative | FP | Er weiß, dass das das richtige Ergebnis  | Er weiß, dass das das richtige | Er weiß, dass das richtige Erg |
| dev-002 | dev | FN | Ich weiß, das er kommt. | Ich weiß, dass er kommt. | Ich weiß, das er kommt. |
| dev-007 | dev | FN | Er hat das nochmals erneut wiederholt. | Er hat das erneut wiederholt. | Er hat das nochmals erneut wie |
| dev-009 | dev | FN | Der Hunt bellt laut. | Der Hund bellt laut. | Der Hunt bellt laut. |
| dev-011 | dev | FN | Das Programm kann viel leicht helfen. | Das Programm kann vielleicht h | Das Programm kann viel leicht  |
| dev-012 | dev | FN | Das Buch das auf dem Tisch liegt gehört  | Das Buch, das auf dem Tisch li | Das Buch das auf dem Tisch lie |
| dev-013 | dev | FN | Er geht dort hin. | Er geht dorthin. | Er geht dort hin. |
| dev-014 | dev | FN | Trotz dem schlechten Wetter ging er raus | Trotz des schlechten Wetters g | Trotz dem schlechten Wetter gi |
| dev-015 | dev | FN | Sie fragte, das er komme. | Sie fragte, dass er komme. | Sie fragte, das er komme. |
| dev-019 | dev | FN | Daß der Vertrag gültig ist, steht außer  | Dass der Vertrag gültig ist, s | Daß der Vertrag gültig ist, st |
| dev-020 | dev | FN | Man muss das Sytem System neu starten. | Man muss das System neu starte | Man muss das Sytem System neu  |
| dev-021 | dev | FN | Während dem Spiel regnete es. | Während des Spiels regnete es. | Während dem Spiel regnete es. |
| dev-022 | dev | FN | Sie hat ihr Auto selber selber gewaschen | Sie hat ihr Auto selber gewasc | Sie hat ihr Auto selber selber |
| dev-023 | dev | FN | Der Rat flog über das Felt. | Der Rat flog über das Feld. | Der Rat flog über das Felt. |
| dev-025 | dev | FN | Das Ergebnis war mehr oder weniger wenig | Das Ergebnis war mehr oder wen | Das Ergebnis war mehr oder wen |
| hold-001 | holdout | FN | Die Lehrerin erklärte, das alle bestande | Die Lehrerin erklärte, dass al | Die Lehrerin erklärte, das all |
| hold-002 | holdout | FN | Berlin ist weiter weg wie München. | Berlin ist weiter weg als Münc | Berlin ist weiter weg wie Münc |
| hold-005 | holdout | FN | Der Server ist herunter gefahren. | Der Server ist heruntergefahre | Der Server ist herunter gefahr |
| hold-006 | holdout | FN | Der Präsident begrüßte die Gäste so das  | Der Präsident begrüßte die Gäs | Der Präsident begrüßte die Gäs |
| hold-007 | holdout | FN | Die Forscherin wiederholte das Experimen | Die Forscherin wiederholte das | Die Forscherin wiederholte das |
| hold-008 | holdout | FN | Der Wald Wald war dunkel und still. | Der Wald war dunkel und still. | Der Wald Wald war dunkel und s |
| hold-009 | holdout | FN | Er legte den Korb auf dem Tisch. | Er legte den Korb auf den Tisc | Er legte den Korb auf dem Tisc |
| hold-010 | holdout | FN | Wegen dem Streik fuhr kein Zug. | Wegen des Streiks fuhr kein Zu | Wegen dem Streik fuhr kein Zug |
| hold-011 | holdout | FN | Das Mädchen, das Klavier spielte war seh | Das Mädchen, das Klavier spiel | Das Mädchen, das Klavier spiel |
| hold-012 | holdout | FN | Es ist offensichtlich, das die Methode f | Es ist offensichtlich, dass di | Es ist offensichtlich, das die |
| hold-013 | holdout | FN | Die Datei wurde dort hin kopiert. | Die Datei wurde dorthin kopier | Die Datei wurde dort hin kopie |
| hold-014 | holdout | FN | Das Kint spielte im Garten. | Das Kind spielte im Garten. | Das Kint spielte im Garten. |
| hold-018 | holdout | FN | Anstatt dem Richter zu antworten, schwie | Anstatt des Richters zu antwor | Anstatt dem Richter zu antwort |
| hold-019 | holdout | FN | Dieses Ergebnis ist befriedigender wie d | Dieses Ergebnis ist befriedige | Dieses Ergebnis ist befriedige |
| hold-022 | holdout | FN | Gieß die Blumen, so das sie nicht eingeh | Gieß die Blumen, sodass sie ni | Gieß die Blumen, so das sie ni |
| hold-023 | holdout | FN | Innerhalb dem Gebäude gilt Maskenpflicht | Innerhalb des Gebäudes gilt Ma | Innerhalb dem Gebäude gilt Mas |
| hold-024 | holdout | FN | Der Jogurt schmeckt gut. | Der Joghurt schmeckt gut. | Der Jogurt schmeckt gut. |
| hold-025 | holdout | FN | Die Professorin, die den Vortrag hielt w | Die Professorin, die den Vortr | Die Professorin, die den Vortr |
| adv-004 | adversarial | FN | Der CEO's Plan war erfolgreich. | Der Plan des CEO war erfolgrei | Der CEO's Plan war erfolgreich |
| adv-009 | adversarial | FN | Die Schiff fahrt dauerte drei Stunden. | Die Schifffahrt dauerte drei S | Die Schiff fahrt dauerte drei  |
| adv-012 | adversarial | FN | Er ging  in den Park. | Er ging in den Park. | Er ging  in den Park. |
| adv-030 | adversarial | FN | Die Frage, ob das, was er sagte, das war | Die Frage, ob das, was er sagt | Die Frage, ob das, was er sagt |

## Suspicious Score Analysis

### SPIN
- ⚠ **dev.precision** = 1: Suspiciously high — check for too-easy benchmark or overconservative firing
- ⚠ **dev.fpr** = 0: Zero FPR — possible overconservative or insufficient negative examples
- ⚠ **holdout.precision** = 1: Suspiciously high — check for too-easy benchmark or overconservative firing
- ⚠ **holdout.fpr** = 0: Zero FPR — possible overconservative or insufficient negative examples
