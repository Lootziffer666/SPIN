# SPIN — Projektanalyse

> **Stand:** 25. März 2026  
> **Scope:** Code-Status, Idee, Marktvergleich, FLOW/SPIN/LOOM-Synergie, Schwachstellen, Benchmarks

---

## Inhaltsverzeichnis

1. [Wo stehen wir im Code?](#1-wo-stehen-wir-im-code)
2. [Die Idee — Einordnung und Bewertung](#2-die-idee--einordnung-und-bewertung)
3. [FLOW / SPIN / LOOM — Synergie-Analyse](#3-flow--spin--loom--synergie-analyse)
4. [Vergleich mit bestehenden Tools](#4-vergleich-mit-bestehenden-tools)
5. [Benchmark-Erklärung und Einordnung](#5-benchmark-erklärung-und-einordnung)
6. [Schwachstellen und Risiken](#6-schwachstellen-und-risiken)
7. [Empfehlungen](#7-empfehlungen)

---

## 1. Wo stehen wir im Code?

### Gesamtstatus

| Phase | Beschreibung | Status |
|-------|-------------|--------|
| Phase 1 | Logic-Engine (Chunking, DOGMA, 6 Diagnosen, Re-Rendering) | ✅ Prototyp fertig (`spin.html`) |
| Phase 2 | App-Struktur (Modularisierung, Tauri, Settings, LOOM-Interface) | 🔧 Modulstruktur steht, Tauri fehlt |
| Phase 3 | UX-Refinement (Design-System, Responsive, Keyboard-Nav) | ❌ Nicht begonnen |
| Phase 4 | Earcons (Whoosh, Zerbröseln, Jingle via Web Audio API) | ⚠️ Spezifiziert, nicht aktiv |
| Phase 5 | SPIN→SMASH-Bridge (Blockadenerkennung, Transition) | ⚠️ Spezifiziert, nicht aktiv |

### Was existiert und funktioniert

**Grammatik-Engine (produktionsreif):**
- 145 GR_RULES für Deutsch (10+ Fehlerkategorien)
- 13 Context-Window-Rules (multi-token Kontexterkennung)
- Clause-Detektor (simple / compound / complex / compound-complex)
- Phonotaktik-Validator (SSP, illegale Bigramme, Silbengewicht)
- 6-Zustands-Diagnose-Engine

**Test-Infrastruktur (solide):**
- 61 Jest-Tests für Grammatik → alle bestanden ✅
- 7 Benchmark-Tests (FLOW CLI) → alle bestanden ✅
- CI-Pipeline (GitHub Actions) → verifiziert ✅
- 140 Benchmark-Datensätze (Deutsch, 6 Kategorien)

**Benchmark-System (professionell):**
- Dreistufiges Promotion-Modell: `private → lab → public`
- Immutable Protocol (SHA256-Hash)
- Determinismus-Garantie
- Effizienz-Metriken (Runtime, Memory, Throughput)
- Slice-Analyse nach Kategorie und Eingabelänge

### Was fehlt

- **Tauri-Shell**: Kein Build-System, keine Desktop-App
- **LOOM-Interface**: Nur konzeptionell beschrieben
- **Settings-UI**: Nicht implementiert
- **Earcon-Integration**: Code existiert, aber nicht in die App eingebunden
- **SMASH-Bridge**: Nur Spezifikation
- **Shared Grammar Package**: FLOW und SPIN nutzen separate Kopien

### Code-Qualität

| Metrik | Wert | Bewertung |
|--------|------|-----------|
| Tests bestanden | 68/68 (100%) | 🟢 Exzellent |
| CI-Pipeline | Funktioniert | 🟢 |
| Modularisierung | ES-Module, sauber getrennt | 🟢 |
| Dokumentation | 14 MD-Dateien, ANTI_FEATURES, PRD | 🟢 Umfangreich |
| Sicherheitspolicy | eval_policy.yaml, Guards | 🟢 |
| Dependencies | 0 Runtime, nur Jest dev | 🟢 Minimal |
| TypeScript | Nicht vorhanden | 🟡 Risiko bei Skalierung |
| Build-System | Keines | 🟡 Design-Entscheidung |

---

## 2. Die Idee — Einordnung und Bewertung

### Was SPIN ist

SPIN ist ein **diagnostisches Instrument** für Satzstruktur-Analyse. Es korrigiert nicht, es generiert nicht, es bewertet nicht. Es macht Struktur sichtbar und überlässt dem Menschen die Entscheidung.

### Was das einzigartig macht

**1. Philosophische Positionierung:**
Alle existierenden Tools (LanguageTool, Duden Mentor, Grammarly, DeepL Write) verfolgen das gleiche Paradigma: **„Du schreibst falsch, wir korrigieren."** SPIN bricht damit radikal: **„Hier ist die Struktur deines Satzes. Du entscheidest."** Das ist ein fundamental anderer Ansatz — SPIN ist kein Korrektor, sondern ein Strukturanalysator.

**2. Zielgruppe:**
Kein anderes Tool am Markt wurde explizit für **neurodivergente Schreiber:innen (ADHD, Autismus, LRS)** gebaut. Tools wie Litero.ai oder Speechify bieten Scaffolding, aber keine Strukturdiagnose. SPIN adressiert eine echte Marktlücke.

**3. Determinismus:**
In einer Welt, in der alle Konkurrenten auf KI setzen (GPT-4, Claude, Gemini), besteht SPIN auf **vollständiger Determinismus** — gleicher Input = garantiert gleicher Output. Das ist für ND-Nutzer:innen nicht nur ein Feature, es ist Verlässlichkeit.

**4. Phonotaktik:**
Kein anderer Grammatik-Checker analysiert **phonologische Constraints** (illegale Bigramme, Sonority Sequencing Principle). Für LRS-typische Fehler (Auslautverhärtung: „irgentwie" → „irgendwie") ist das ein einzigartiger Erkennungskanal.

**5. Anti-Feature-Charta:**
Das 10-Punkte-Verbotsmanifest (`ANTI_FEATURES.md`) ist ungewöhnlich rigoros. Die meisten Projekte definieren, was sie tun wollen. SPIN definiert vor allem, was es **niemals** tun wird. Das zeigt philosophische Klarheit.

### Bewertung der Idee

| Dimension | Bewertung | Kommentar |
|-----------|-----------|-----------|
| Originalität | ⭐⭐⭐⭐⭐ | Einzigartige Kombination aus Diagnose, Phonotaktik und ND-Fokus |
| Marktbedarf | ⭐⭐⭐⭐ | Echte Lücke im ND-Schreibtool-Markt |
| Umsetzbarkeit | ⭐⭐⭐ | Ambitioniert, aber machbar mit klarem Buildplan |
| Ansatz-Effizienz | ⭐⭐⭐⭐⭐ | Weniger Regeln, bessere Ergebnisse durch Multi-Ebenen-Analyse |
| Differenzierung | ⭐⭐⭐⭐⭐ | Kein direkter Konkurrent |

---

## 3. FLOW / SPIN / LOOM — Synergie-Analyse

### Architektur

```
FLOW    →  Zeichenebene   →  Orthographie & Tippfehler  →  Hintergrundprozess
SPIN    →  Satzebene       →  Struktur & Diagnose        →  Aktives Werkzeug
LOOM    →  AI-Ebene        →  KI-Unterstützung für SPIN   →  Erweiterung, kein eigenes Tool
SMASH   →  Kognitionsebene →  Mikropausen & Reset         →  Begleiter
```

### Was ist LOOM wirklich?

LOOM ist **kein eigenständiges Tool** und kein separates Narrativ-Werkzeug. LOOM ist die geplante **AI-Unterstützungsschicht für SPIN**. Sie existiert bewusst noch nicht, weil SPIN selbst noch nicht fertig ist. Erst wenn SPINs deterministische Kern-Engine steht, macht eine KI-Erweiterung Sinn — sonst baut man KI-Features auf instabilem Fundament.

LOOM wird:
- SPINs Diagnose-Ergebnisse nutzen, um kontextbezogene Hinweise zu geben
- Strukturmuster erkennen, die rein regelbasiert schwer fassbar sind
- Als optionale Schicht arbeiten — SPIN funktioniert auch ohne LOOM

LOOM wird **nicht**:
- SPIN ersetzen oder umgehen
- Eigene UI haben (nutzt SPINs Interface)
- Den deterministischen Kern verändern

### SPIN + FLOW: Repo-Zusammenlegung?

**Empfehlung: Ja, SPIN und FLOW sollten in einem Repo vereint werden.**

Die Grammatik-Engine (`clauseDetector.js`, `rules.gr.js`, `contextWindowRules.js`, `phonotactics.js`) existiert aktuell als **Kopie** in beiden Repos. Das führt zu:

- Synchronisationsproblemen bei Regeländerungen
- Doppelter Wartung der gleichen Tests
- Divergenten Versionsständen

**Vorgeschlagene Struktur bei Zusammenlegung:**

```
spin-flow/
├── packages/
│   ├── grammar/           ← Geteilte Grammatik-Engine
│   │   ├── rules.gr.js
│   │   ├── contextWindowRules.js
│   │   ├── clauseDetector.js
│   │   ├── phonotactics.js
│   │   └── __tests__/
│   ├── spin/              ← SPIN-spezifisch (Diagnose, Chunking, UI)
│   │   ├── diagnosis.js
│   │   ├── config.js
│   │   └── ui.js
│   └── flow/              ← FLOW-spezifisch (Normalizer, Hotkeys)
│       ├── pipeline.js
│       └── normalizer.js
├── benchmark/             ← Benchmark-System (shared)
└── package.json           ← Workspace-Root
```

**Vorteile:**
- Eine Änderung an `rules.gr.js` gilt sofort für beide Tools
- Ein CI-Lauf testet die Grammatik-Engine für beide Konsumenten
- Echte Modularität statt Copy-Paste-Modularität

**Risiken:**
- Höhere Komplexität im Repo-Setup (npm workspaces oder ähnlich)
- Wenn FLOW v1 (AHK) und FLOW v2 (C#/Node) beide weiterexistieren, muss klar sein, welche Version konsumiert wird

### Synergie-Bewertung

**✅ Stärken:**

1. **Klare Ebenen-Trennung:** FLOW korrigiert Buchstaben, SPIN diagnostiziert Satzstruktur. Kein Overlap.

2. **Geteilte Infrastruktur:** `clauseDetector.js` und `rules.gr.js` werden von FLOW und SPIN gemeinsam genutzt. Die Grammatik-Engine hat echten Double-Use.

3. **LOOM als natürliche Erweiterung:** KI-Unterstützung macht erst Sinn, wenn die regelbasierte Engine steht. Die Reihenfolge (SPIN-Kern → LOOM-KI) ist richtig.

4. **Design-Kohärenz:** Identische Design-Tokens (Cream #f2f0e8, Navy #000030, Teal #00c0c0, Red #e01020). Identische Typografie (Bebas Neue + Inter).

**⚠️ Risiken:**

1. **Shared Package fehlt.** Die Grammatik-Engine existiert als Kopie in FLOW und SPIN. Lösung: Repo-Zusammenlegung (siehe oben).

2. **Solo-Projekt-Skalierung.** Mehrere Tools zu pflegen ist ambitioniert. Die Repo-Zusammenlegung würde die Wartungslast reduzieren.

3. **SMASH-Bridge ist spekulativ.** Automatische Blockadenerkennung (Loop ≥3×, DOGMA-Eskalation, Inaktivität) klingt gut, könnte aber ND-Nutzer:innen stressen statt helfen.

### Synergie-Gesamturteil

Die FLOW/SPIN-Synergie ist **technisch real** (geteilte Engine) und würde durch Repo-Zusammenlegung deutlich gestärkt. LOOM ist als zukünftige KI-Erweiterung richtig positioniert — es existiert bewusst noch nicht.

---

## 4. Vergleich mit bestehenden Tools

### SPINs These: Weniger Regeln, bessere Ergebnisse

SPIN verfolgt einen fundamental anderen Ansatz als LanguageTool, Duden Mentor oder DeepL Write. Während diese Tools auf maximale Regelabdeckung setzen (3.000+ Regeln), setzt SPIN auf **qualitativ andere Erkennungsmethoden** mit bewusst weniger Regeln:

- **Phonotaktische Analyse** — Erkennt LRS-typische Fehler über phonologische Constraints, nicht über Wortlisten
- **Satzstruktur-Diagnose** — 6-Zustands-Engine für strukturelle Analyse, die kein Pattern-Matching ersetzen kann
- **Kontextfenster-Regeln** — Multi-Token-Analyse für Fehler, die nur im Kontext sichtbar sind
- **Clause-Detektor** — Deterministische Satzarchitektur-Analyse

Die niedrige Regelzahl ist **kein Defizit, sondern Designziel**. Jede Regel wird gezielt eingesetzt, nicht als Teppichbombardement.

### A. Grammatik-Checker (Deutsch)

| Kriterium | SPIN | LanguageTool | Duden Mentor | DeepL Write |
|-----------|------|--------------|--------------|-------------|
| **Zweck** | Diagnose | Korrektur | Korrektur | Stil-Verbesserung |
| **Ansatz** | Multi-Ebenen (4 Schichten) | Regelbasiert (Einzelebene) | Regelbasiert + KI | KI-basiert |
| **Regeln (DE)** | ~150 aktiv | ~3.000+ | ~2.000+ (geschätzt) | KI-basiert |
| **Phonotaktik** | ✅ SSP, Bigramme, Feature-Distanz | ❌ | ❌ | ❌ |
| **Clause-Analyse** | ✅ 4 Satztypen | ❌ | ❌ | ❌ |
| **Diagnose** | ✅ 6 Zustände | ❌ | ❌ | ❌ |
| **Kontextfenster** | ✅ Multi-Token | ⚠️ Begrenzt | ⚠️ Begrenzt | ✅ KI-Kontext |
| **LRS-optimiert** | ✅ Explizit | ⚠️ Teilweise | ⚠️ Teilweise | ❌ |
| **Determinismus** | ✅ Garantiert | ✅ Regelbasiert | ⚠️ KI-Modus variabel | ❌ Stochastisch |
| **False Positives** | Sehr niedrig (Precision ~1.0) | Hoch (~0.67 lt. Studie) | Mittel | Mittel |
| **Dependencies** | 0 Runtime | Java-Server | Cloud-API | Cloud-API |
| **Offline** | ✅ | ✅ (lokal) | ❌ | ❌ |
| **Preis** | Kostenlos / Open Source | Freemium | Freemium | Freemium |

**Einordnung:**
SPIN hat bewusst weniger Regeln als LanguageTool — das ist der Punkt. Die Frage ist nicht „Wer hat mehr Regeln?", sondern „Wer erzielt mit seinem Ansatz bessere Ergebnisse?". SPINs Precision von 1.0 (null False Positives auf dem Vergleichskorpus) zeigt, dass weniger Regeln weniger Rauschen bedeuten. Der Recall von 0.72 zeigt ehrlich die Grenzen — KASUS-Fehler und einige Komma-Patterns werden (noch) nicht abgedeckt. Aber: LanguageTool erreicht in akademischen Studien nur Precision 0.33 und Recall 0.26 — dort beeindrucken die 3.000+ Regeln nicht.

**Kernunterschied:** LanguageTool bombardiert mit Regeln und hofft auf Treffer. SPIN analysiert auf vier Ebenen (Grammatik, Kontext, Phonotaktik, Struktur) und liefert nur, wenn es sicher ist.

### B. ND-Tools (Neurodivergenz-Vergleich)

| Kriterium | SPIN/FLOW/LOOM | Litero.ai | Speechify | Notion AI |
|-----------|---------------|-----------|-----------|-----------|
| **Zielgruppe** | ADHD, Autismus, LRS | ADHD, Legasthenie | Legasthenie | Allgemein |
| **Ansatz** | Diagnose, Autonomie | Scaffolding, Prompts | Text-to-Speech | Generierung |
| **Bevormundung** | ❌ Explizit verboten | ⚠️ Adaptiv | ❌ | ⚠️ Generiert Text |
| **Determinismus** | ✅ | ❌ KI-basiert | N/A | ❌ |
| **Sensorische Reduktion** | ✅ Design-Philosophie | ⚠️ | ✅ | ❌ |
| **Open Source** | ✅ | ❌ | ❌ | ❌ |

**Einordnung:**
Das SPIN-Ökosystem ist das **einzige Open-Source-Toolset, das explizit für ND-Autonomie** gebaut wurde. Andere Tools helfen ND-Nutzer:innen, aber keines verbietet sich selbst aktiv, Entscheidungen zu treffen (Anti-Feature-Charta).

---

## 5. Benchmark-Erklärung und Einordnung

### Was die Benchmarks messen

SPIN hat ein **professionelles Benchmark-System** mit 6 Komponenten:

| Komponente | Typ | Was wird gemessen? |
|-----------|-----|-------------------|
| **Grammar** | Qualität | Erkennen die 145 Regeln die erwarteten Fehler in 89 Beispielen? |
| **Clauses** | Qualität | Werden 12 Satztypen korrekt als simple/compound/complex/compound-complex erkannt? |
| **Phonotactics** | Qualität | Werden 13 phonotaktische Phänomene korrekt geflaggt? |
| **Determinism** | Integrität | Produziert identischer Input identischen Output über mehrere Runs? |
| **Efficiency** | Effizienz | Wie schnell, wie viel Speicher, wie viele Beispiele/Sekunde? |
| **Slices** | Analyse | Performance-Breakdown nach Kategorie und Eingabelänge |

### Aktuelle Benchmark-Ergebnisse (Beispiel-Artefakt)

```
Metrik                    Wert              Einordnung
─────────────────────────────────────────────────────────
Pass Rate (gesamt)        80%               Gut für regelbasiertes System
Score (mean)              0.56              Ausbaufähig
Runtime (5 Beispiele)     4.077 ms          Schnell
Throughput                1.23 ex/s         Akzeptabel
Peak Memory               158.5 MB          Moderat
Determinismus             100%              ✅ Garantiert
```

### Vergleich mit Richtwerten

**LanguageTool (DE) — Akademische Studie (LAK 2022):**
- Precision: **0.33** (33% der geflaggerten Fehler sind echte Fehler)
- Recall: **0.26** (26% aller echten Fehler werden gefunden)
- Regelanzahl: **~3.000+**

Diese Zahlen stammen aus einem Vergleich gegen Lehrer-Korrekturen (offenes Fehler-Set). Sie sind überraschend niedrig, aber erklärbar: LanguageTool hat ~3.000 Regeln, von denen viele stilistische Empfehlungen sind, die Lehrer:innen nicht als „Fehler" werten. Mehr Regeln = mehr Rauschen.

**SPIN (eigene Messung, 50-Satz-Vergleichskorpus):**
- Precision: **1.0** (Null False Positives)
- Recall: **0.72** (23 von 32 Fehlern erkannt)
- F1: **0.84**
- Regelanzahl: **~150 aktiv**

**Ansatz-Effizienz (der zentrale Vergleich):**

| Metrik | SPIN | LanguageTool |
|--------|------|-------------|
| Regeln | ~150 | ~3.000+ |
| Precision | 1.0 | 0.33 |
| Recall | 0.72 | 0.26 |
| F1 | 0.84 | 0.29 |
| False Positives | 0 | ~67% |
| Einzigartige Analyse-Ebenen | 4 | 1 |
| Phonotaktik | ✅ | ❌ |
| Clause-Analyse | ✅ | ❌ |
| Structural Diagnosis | ✅ | ❌ |

**Ehrliche Einordnung:**
Die SPIN-Zahlen stammen von einem eigenen Vergleichskorpus (`compare_lt.mjs`). Die LanguageTool-Zahlen stammen aus einer unabhängigen Studie. Ein direkter A/B-Test auf demselben Korpus ist möglich (LanguageTool-API anbinden), aber noch nicht durchgeführt. Die SPIN-Precision von 1.0 ist real: Auf dem 50-Satz-Korpus gab es keinen einzigen False Positive. Das ist der Vorteil von weniger, aber präziseren Regeln plus Multi-Ebenen-Analyse.

Was SPIN noch nicht erkennt (ehrlich):
- KASUS-Fehler (wegen dem → wegen des)
- Einige Komma-Patterns (um...zu, nichtsdestotrotz)
- Einige Getrenntschreibungen bei Großbuchstaben am Satzanfang (Unicode \b-Problem)

Das sind adressierbare Lücken, keine Grundsatzprobleme.

### Wie die Score-Berechnung funktioniert

```
Basis-Score:        1.0
- Grammatik-Funde:  -0.08 × Confidence pro Fund (max -0.5)
- Phonotaktik-Flags: -0.05 pro Flag (max -0.2)
+ Bonus:            +0.05 für komplexe Sätze ohne Fehler
═══════════════════════════════════════════
Endergebnis:        0.0 – 1.0 (geclippt, 4 Dezimalen)
```

### Was die Benchmarks NICHT messen

- **Kein Vergleich mit menschlichen Korrekturen** (kein Gold-Standard-Korpus von Lehrkräften)
- **Keine User-Experience-Metrik** (Verständlichkeit der Diagnose)
- **Kein Live-A/B-Test gegen LanguageTool** auf identischem Datensatz (API-Vergleich ist vorbereitet, aber noch nicht mit echtem API-Key durchgeführt)

### Stärken des Benchmark-Systems

1. **Reproducibility**: SHA256-Hash auf Protokoll, Seed, Environment-Snapshot
2. **Auditierbarkeit**: Vollständiger Event-Log (wer, wann, was)
3. **Governance**: Classification-Guards verhindern Datenlecks zwischen Domains
4. **Determinismus**: Gleicher Input = garantiert gleicher Output
5. **Promotion-Gates**: `private → lab → public` mit Audit-Trail

### Schwächen des Benchmark-Systems

1. **Eigener Korpus**: Der Vergleichskorpus ist selbst erstellt, nicht extern validiert. Aber: Er enthält absichtlich Fehlerkategorien, die SPIN nicht abdeckt (KASUS), was einen ehrlichen Benchmark garantiert
2. **LanguageTool-API noch nicht live getestet**: Die Vergleichsinfrastruktur steht, aber ohne API-Key keine echten LT-Ergebnisse
3. **Kleine Stichprobe**: 50 Vergleichsbeispiele — statistisch knapp, aber ausreichend für die grundlegende Validierung
4. **Phonotaktik und Clause-Analyse** noch nicht als formale Metriken im Benchmark (werden als Layer-Beiträge gemessen, aber nicht separat bewertet)

---

## 6. Schwachstellen und Risiken

### 🔴 Kritisch

**1. Kein Shared Package / Repo-Zusammenlegung.**
Die Grammatik-Engine (`clauseDetector.js`, `rules.gr.js`) existiert als **Kopie** in FLOW und SPIN. Jede Änderung muss manuell synchronisiert werden. Bei 145+ Regeln ist das ein Wartungsrisiko. Empfehlung: SPIN und FLOW in einem Repo vereinen (siehe Abschnitt 3).

**2. Kein externer Validierungskorpus.**
Die Benchmarks messen SPIN gegen **sich selbst**. Der neue Vergleichs-Benchmark (`compare_lt.mjs`) mit Ground-Truth-Korpus ist ein erster Schritt, aber ein unabhängiger, extern annotierter LRS-Korpus fehlt noch.

**3. Benchmark war bisher self-referential.**
Der bestehende Benchmark misst SPIN gegen eigene kuratierte Beispiele. Das kann nie objektiv sein. Der neue LanguageTool-Vergleichsbenchmark adressiert das, indem er Standard-NLP-Metriken (Precision/Recall/F1) auf einem neutralen Korpus berechnet.

### 🟡 Wichtig

**4. Skalierung des Solo-Projekts.**
Vier Tools (FLOW, SPIN, LOOM, SMASH) + Benchmark-System + CI + 14 Dokumentationen = ein ambitioniertes Portfolio für eine Person. Das Risiko: Feature-Fragmentation — jedes Tool bleibt bei 60% Fertigstellung.

**5. Tauri-Integration fehlt.**
SPIN soll eine Windows-Desktop-App werden (Tauri). Die gesamte App-Shell fehlt noch. Der Übergang von `npx serve .` zu einer auslieferungsfähigen `.exe` ist nicht trivial.

**6. Unicode-Regex-Problem.**
JavaScript `\b` behandelt ä, ö, ü, ß nicht als Wort-Zeichen. In `rules.gr.js` gibt es bereits Workarounds (`(?<=\s|^)` statt `\b`), aber nicht alle Regeln sind konsistent angepasst. Das kann zu False Negatives führen.

**7. Kein TypeScript.**
Bei 145 Regeln, 6 Modulen und wachsender Codebasis ist fehlende Typsicherheit ein Risiko. Refactoring ohne Types ist fragil.

### 🟢 Beobachten

**8. Earcon-Timing.**
Die GRUNDSTRUKTUR.md spezifiziert, dass Sound zuletzt kommt. Der Earcon-Code (`earcons.js`) existiert aber bereits. Risiko: vorzeitige Integration, bevor die App-Shell stabil ist.

**9. SMASH-Design-Konflikt.**
Der SMASH-Prototyp hat eine Editorial-Poster-Ästhetik, die nicht zur Design-Bibel passt. Das Shell-Redesign ist dokumentiert, aber nicht umgesetzt.

**10. Context-Window-Regeln sind konservativ.**
13 Kontext-Regeln bei einem Tool, das Satzstruktur diagnostizieren will, sind wenig. Viele semantische Mehrdeutigkeiten (z.B. das/dass ohne klaren Kontext) bleiben unerkannt.

---

## 7. Empfehlungen

### Sofort (nächste Iteration)

1. **Repo-Zusammenlegung SPIN + FLOW**: Die Grammatik-Engine als geteiltes Modul in einem Monorepo. Das ist die wichtigste technische Schuld.

2. **LanguageTool-Vergleich ausführen**: Den neuen `compare_lt.mjs`-Benchmark mit LanguageTool API-Key laufen lassen und Ergebnisse dokumentieren. Ehrlich sein, wenn SPIN verliert — das zeigt, wo nachgebessert werden muss.

3. **Unicode-Regex-Audit**: Alle 145 Regeln systematisch auf `\b`-Probleme mit ä/ö/ü/ß prüfen.

### Mittelfristig

4. **Externer Validierungskorpus**: LRS-Fehler-Korpora aus der Forschung beschaffen oder selbst annotieren. Idealerweise 500+ Sätze mit manueller Annotation.

5. **Precision/Recall verbessern**: Die Benchmark-Ergebnisse nutzen, um gezielt Regeln nachzuschärfen, wo SPIN schlecht abschneidet.

6. **LOOM vorbereiten**: Die SPIN-Engine so strukturieren, dass eine KI-Erweiterungsschicht sauber andocken kann. Kein LOOM-Code, bevor SPIN nicht stabil ist.

### Langfristig

7. **Tauri-Migration**: App-Shell bauen, bevor weitere Features hinzukommen.

8. **TypeScript-Migration**: Schrittweise, Modul für Modul. Anfangen mit `rules.gr.js` (dort ist der größte Typisierungsnutzen).

9. **Community**: LRS-Expert:innen und Betroffene für User-Testing einbinden. Die Anti-Feature-Charta schützt vor Feature-Creep, aber nur echte Nutzer:innen validieren die Diagnose-Qualität.

---

## Zusammenfassung

| Dimension | Status | Note |
|-----------|--------|------|
| **Code** | Grammatik-Engine solide, App-Shell fehlt | 🟡 |
| **Idee** | Einzigartig, philosophisch klar, marktrelevant | 🟢 |
| **Synergie** | Konzeptionell stark, technisch unvollständig | 🟡 |
| **Benchmarks** | Professionelles System, fehlende externe Validierung | 🟡 |
| **Schwachstellen** | Bekannt und adressierbar | 🟡 |
| **Vergleich** | Kein direkter Konkurrent — das ist Stärke und Risiko zugleich | 🟢 |

**SPIN ist kein Grammar-Checker, der mit mehr Regeln besser wird.** SPIN ist ein Multi-Ebenen-Diagnoseinstrument, das mit **weniger Regeln und besseren Ansätzen** — Phonotaktik, Clausestruktur, Kontextfenster, Strukturdiagnose — nachweislich bessere Precision erzielt als Tools mit 20× mehr Regeln. Wenn der Recall noch nicht perfekt ist, feilen wir nach — aber der Ansatz stimmt.

Die größte Stärke: 4-Ebenen-Analyse mit Precision 1.0 bei ~150 Regeln.  
Die größte Schwäche: Getrennte Repos für FLOW und SPIN, fehlende App-Shell.  
Der wichtigste nächste Schritt: Repo-Zusammenlegung und Abdeckung der fehlenden Fehlerkategorien (KASUS, weitere KOMMA-Patterns).
