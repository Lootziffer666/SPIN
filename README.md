###VERALTET, konsolidiert mit Flow und Smash im Monorepo FLOW-SPIN-SMASH###



# SPIN

Diagnostisches Schreibinstrument für Satzstruktur, Grammatik, Widerstand und evaluierbare Schreibanalyse.

SPIN ist kein generativer Schreibassistent.  
SPIN ist ein Werkzeug, das strukturelle Probleme in Sätzen sichtbar, diagnostizierbar und bearbeitbar machen soll — besonders dort, wo Schreiben nicht an Ideenmangel scheitert, sondern an Formdruck, Mehrkernigkeit, Überladung oder innerem Widerstand.

Der sichtbare Repo-Stand zeigt mehr als nur einen UI-Prototyp:

- Satzdiagnostik
- Grammatik-/Clause-Analyse
- Node-Graph für narrative Verknüpfung
- Benchmark- und Evaluationsschicht
- Daten-, Reports- und Skriptstruktur für Vergleich und Weiterentwicklung

---

## Was SPIN ist

SPIN ist aktuell ein kombiniertes System aus:

1. **Diagnose-Werkzeug für Satzstruktur**  
   SPIN betrachtet Sätze nicht nur als Text, sondern als strukturell belastete Einheiten.

2. **Interaktiver Bearbeitungsansatz**  
   Chunks und Satzteile sind nicht bloß Ausgabe, sondern potenziell manipulierbare Objekte.

3. **Grammatik-/Kontextschicht**  
   Clause Detection, Grammatikregeln und Multi-Token-Kontextregeln erweitern die reine Oberflächenbetrachtung.

4. **Benchmark- und Evaluationssystem**  
   SPIN enthält nicht nur Logik, sondern auch eine eigene Vergleichs-, Bewertungs- und Iterationsstruktur.

5. **Narrativer Graph-Ansatz**  
   Mit Nodes und Links reicht SPIN über die Satzebene hinaus in Richtung Projekt-, Welt- und Storystruktur.

---

## Was SPIN nicht ist

SPIN ist derzeit bewusst **nicht**:

- ein KI-Ghostwriter
- ein „mach meinen Stil besser“-Tool
- ein unsichtbarer Autocomplete-Autokrat
- ein Black-Box-Rewriter
- ein System, das Entscheidungen heimlich für den Nutzer trifft

SPIN soll nicht “smart wirken”.  
SPIN soll strukturell ehrlich sein.

---

## Kernidee

SPIN behandelt Sprache als Strukturproblem, nicht nur als Textproblem.

Das bedeutet:

- Satzfragmente können als **Chunks** betrachtet werden
- Widerstand ist **Information**, kein bloßer Defekt
- Diagnose kommt vor Verschönerung
- Struktur geht vor Stilkosmetik
- Nutzersteuerung geht vor Automatik

SPIN will nicht glätten, sondern lesbar machen, **wo** und **warum** ein Satz kippt.

---

## Repo-Struktur

```text
SPIN/
├── .github/workflows/          CI / Workflow-Automation
├── benchmark/                  Benchmark-Runner, Vergleich, Export, Hashing
├── data/                       Datensätze / Testmaterial
├── reports/                    Reports / Ergebnisartefakte
├── scripts/                    Eval-, Dedupe- und Source-Skripte
├── src/
│   ├── index.js                Hauptmodul / öffentliche API
│   ├── config.js               Chunk-Typen, Marker, Regeln
│   ├── diagnosis.js            Diagnose-Engine
│   ├── earcons.js              Earcon-System
│   ├── ui.js                   UI / Workbench / Toast
│   ├── nodes.js                Node-Graph für Story-/Projektverknüpfung
│   └── grammar/
│       ├── index.js            Einstiegspunkt Grammatik
│       ├── clauseDetector.js   Satz-/Teilsatzanalyse
│       ├── rules.gr.js         Deutsche Grammatikregeln
│       ├── rules.en.gr.js      Englische Grammatikregeln
│       └── contextWindowRules.js
├── ANALYSE.md
├── ANTI_FEATURES.md
├── BENCHMARK_POLICY.md
├── BENCHMARK_SOURCES.md
├── DEFINITION_OF_DONE_v0.3.md
├── GRUNDSTRUKTUR.md
├── TESTMATRIX_PHASE1.md
├── index.html
├── spin.html
└── package.json
````

---

## Die vier realen Schichten von SPIN

### 1. Satzdiagnose

SPIN analysiert strukturelle Spannungen in Sätzen statt nur Tippfehler zu markieren.

Die aktuelle README nennt sechs Diagnosezustände:

* `performativ_instabil`
* `normativ_selbstannullierend`
* `konfliktaer`
* `formal_stabil_semantisch_leer`
* `mehrkernig`
* `stabil`

Diese Diagnoseebene ist kein Schönschreibsystem, sondern eine Spannungs- und Belastungslesung.

---

### 2. Grammatik- und Kontextanalyse

SPIN enthält inzwischen eine klar sichtbare Grammatikschicht.

Dazu gehören unter anderem:

* `clauseDetector.js`
* `rules.gr.js`
* `rules.en.gr.js`
* `contextWindowRules.js`

Diese Schicht erweitert SPIN von reinem Struktur-/Chunk-Denken zu einer tieferen Satzanalyse mit Grammatik- und Kontextbezug.

Das ist wichtig, weil SPIN damit nicht mehr nur auf „ziehbare Satzteile“ reduziert werden kann.
Das Repo zeigt bereits eine Verbindung aus:

* Strukturdiagnose
* grammatischer Analyse
* kontextabhängiger Regelanwendung

---

### 3. Benchmark und Evaluation

Das Benchmark-System ist inzwischen ein echter Pfeiler des Repos, nicht bloß Beifang.

Die sichtbare Struktur enthält:

* `benchmark/`
* `data/`
* `reports/`
* `BENCHMARK_POLICY.md`
* `BENCHMARK_SOURCES.md`
* `TESTMATRIX_PHASE1.md`

Außerdem zeigt `package.json` dedizierte Skripte für:

* `bench`
* `bench:spin`
* `bench:bootstrap`
* `bench:tweak`
* `bench:promote`
* `bench:release`
* `bench:hash`
* `bench:test`
* `bench:compare`
* `bench:runner`
* `eval`
* `eval:dedupe`
* `eval:sources`

Das bedeutet:
SPIN ist nicht nur ein Konzept oder Prototyp, sondern bereits als **messbares Entwicklungssystem** angelegt.

Nicht nur „fühlt sich besser an“ zählt, sondern auch:

* Vergleichbarkeit
* Reproduzierbarkeit
* Iterierbarkeit
* Quellenarbeit
* Report-Erzeugung
* kontrollierte Weiterentwicklung

---

### 4. Node-Graph / Story-Ebene

SPIN enthält mit `nodes.js` außerdem eine Richtung, die über den Satz hinausgeht.

Diese Ebene ist wichtig, weil sie SPIN nicht nur als Diagnosewerkzeug für einzelne Sätze positioniert, sondern als Brücke zwischen:

* Satzstruktur
* Projektwissen
* narrativen Fäden
* konzeptuellen Knoten
* späterer LOOM-Anbindung

SPIN ist damit nicht nur „Text zerlegen“, sondern potenziell auch „Fäden sichtbar machen“.

---

## Ökosystem

SPIN steht nicht allein.

| Tool  | Ebene                                | Rolle                          |
| ----- | ------------------------------------ | ------------------------------ |
| FLOW  | Reparatur / Normalisierung           | bounded text repair            |
| SPIN  | Satzstruktur / Diagnose / Evaluation | aktives Arbeitsfeld            |
| LOOM  | narrative Gewebestruktur             | größere Verknüpfungsebene      |
| SMASH | Blockadelösung / Regulation          | Zustandswechsel und Entstörung |

SPIN sitzt zwischen lokaler Textbearbeitung und größerer Strukturdenke.

---

## Warum SPIN existiert

Viele Schreibwerkzeuge versagen an genau der Stelle, die für komplexe Denker entscheidend ist:

Sie behandeln Text entweder als:

* bloßen Tippfehlerträger
* Stilproblem
* Grammatikproblem
* oder als Anlass, KI einfach alles umformulieren zu lassen

SPIN setzt an einer anderen Stelle an:

> Nicht nur *was* im Satz falsch ist, sondern *warum der Satz unter Druck steht*.

Das ist der Unterschied zwischen Korrektur und Diagnose.

---

## Entwicklung lokal

### Installation

```bash
npm install
```

### Einfacher lokaler Start

```bash
npx serve .
```

Dann `index.html` über einen lokalen Server öffnen.

---

## Wichtige Skripte

### Tests

```bash
npm test
```

### Benchmarking

```bash
npm run bench
npm run bench:spin
npm run bench:test
npm run bench:compare
npm run bench:runner
```

### Evaluation / Datensätze

```bash
npm run eval
npm run eval:dedupe
npm run eval:sources
```

### Benchmark-Artefakte / Promotion

```bash
npm run bench:bootstrap
npm run bench:tweak
npm run bench:promote
npm run bench:release
npm run bench:hash
```

---

## Status

SPIN ist aktuell am ehrlichsten beschrieben als:

* **aktives Diagnose-Repo**
* **mit realer Grammatikschicht**
* **mit echter Benchmark-/Eval-Infrastruktur**
* **mit UI-/Interaktionsansatz**
* **mit narrativer Erweiterungsrichtung**

Es ist damit weder nur Konzeptpapier noch schon sauber fertig polierte Endanwendung.

Die Stärke des Repos liegt derzeit in der Kombination aus:

* klarer Produktidentität
* harter Anti-Feature-Haltung
* grammatischer Erweiterung
* evaluierbarer Entwicklung
* struktureller statt bloß stilistischer Denke

---

## Leitprinzipien

* Diagnose vor Generierung
* Struktur vor Kosmetik
* Widerstand als Signal
* Messbarkeit vor Show
* Nutzersteuerung vor Black Box
* kein falsches Smart-Sein

---

## Verbindliche Dokumente

Besonders wichtig für den Projektcharakter sind:

* `GRUNDSTRUKTUR.md`
* `ANTI_FEATURES.md`
* `DEFINITION_OF_DONE_v0.3.md`
* `BENCHMARK_POLICY.md`
* `BENCHMARK_SOURCES.md`
* `TESTMATRIX_PHASE1.md`

Diese Dateien sind nicht Beiwerk.
Sie definieren mit, was SPIN sein soll und was nicht.

---

## Lizenz

`UNLICENSED`
ziffer666/SPIN · GitHub"
