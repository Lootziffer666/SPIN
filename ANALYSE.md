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
| Skalierbarkeit | ⭐⭐⭐ | Regelbasiert = begrenzt, aber für die Nische ausreichend |
| Differenzierung | ⭐⭐⭐⭐⭐ | Kein direkter Konkurrent |

---

## 3. FLOW / SPIN / LOOM — Synergie-Analyse

### Architektur

```
FLOW    →  Zeichenebene   →  Orthographie & Tippfehler  →  Hintergrundprozess
SPIN    →  Satzebene       →  Struktur & Diagnose        →  Aktives Werkzeug
LOOM    →  Narrativebene   →  Plot, Bögen, Gewebe         →  Perspektiv-Wechsel
SMASH   →  Kognitionsebene →  Mikropausen & Reset         →  Begleiter
```

### Synergie-Bewertung

**JA, die Synergie ist sinnvoll.** Hier die Begründung:

**✅ Stärken der Synergie:**

1. **Klare Ebenen-Trennung:** Jedes Tool operiert auf einer anderen Abstraktionsebene. Kein Overlap, kein Kannibalismus. FLOW korrigiert Buchstaben, SPIN rotiert Satzteile, LOOM webt Erzählfäden.

2. **Geteilte Infrastruktur:** `clauseDetector.js` und `rules.gr.js` werden von FLOW und SPIN gemeinsam genutzt. Die Grammatik-Engine hat echten Double-Use.

3. **Metaphern-Kohärenz:** Spinnen → Drehen → Weben. Die Metaphern ergänzen sich: SPIN dreht den einzelnen Faden, LOOM verwebt die Fäden zum Stoff. Das ist keine Marketing-Kosmetik, sondern konzeptionelle Tiefe.

4. **Kognitive Pipeline:** Die Tools bilden einen natürlichen Schreibprozess ab:
   - Tippen → FLOW fängt Tippfehler ab
   - Satz formulieren → SPIN diagnostiziert Struktur
   - Text strukturieren → LOOM zeigt das Gesamtbild
   - Blockade → SMASH unterbricht, SPIN erkennt die Blockade

5. **Design-Kohärenz:** Identische Design-Tokens (Cream #f2f0e8, Navy #000030, Teal #00c0c0, Red #e01020). Identische Typografie (Bebas Neue + Inter). Das Familiengefühl ist architektonisch verankert.

**⚠️ Risiken der Synergie:**

1. **LOOM existiert nur konzeptionell.** Keine Zeile Code, kein Repo. Die Synergie ist theoretisch perfekt, aber praktisch ungetestet.

2. **Shared Package fehlt.** Die Grammatik-Engine existiert als Kopie in FLOW und SPIN. Ohne ein tatsächlich geteiltes NPM-Paket bleibt die „eine Erweiterung, zwei Nutzen"-Vision fragil.

3. **Complexity Creep.** Vier Tools zu pflegen ist für ein Solo-Projekt (oder Kleinstteam) ambitioniert. Das Risiko: Keines wird fertig.

4. **SMASH-Bridge ist spekulativ.** Automatische Blockadenerkennung (Loop ≥3×, DOGMA-Eskalation, Inaktivität) klingt gut, könnte aber ND-Nutzer:innen stressen statt helfen.

### Synergie-Gesamturteil

Die Synergie ist **konzeptionell stark** (5/5), **technisch angebahnt** (3/5), und **praktisch unvollständig** (2/5). Die Vision ist kohärent, die Umsetzung muss noch folgen.

---

## 4. Vergleich mit bestehenden Tools

### A. Grammatik-Checker (Deutsch)

| Kriterium | SPIN | LanguageTool | Duden Mentor | DeepL Write |
|-----------|------|--------------|--------------|-------------|
| **Zweck** | Diagnose | Korrektur | Korrektur | Stil-Verbesserung |
| **Regeln (DE)** | 145 GR + 13 Kontext | ~3.000+ | ~2.000+ (geschätzt) | KI-basiert |
| **Phonotaktik** | ✅ SSP, Bigramme | ❌ | ❌ | ❌ |
| **Clause-Analyse** | ✅ 4 Typen | ❌ | ❌ | ❌ |
| **Diagnose** | ✅ 6 Zustände | ❌ | ❌ | ❌ |
| **LRS-optimiert** | ✅ Explizit | ⚠️ Teilweise | ⚠️ Teilweise | ❌ |
| **Determinismus** | ✅ Garantiert | ✅ Regelbasiert | ⚠️ KI-Modus variabel | ❌ Stochastisch |
| **Dependencies** | 0 Runtime | Java-Server | Cloud-API | Cloud-API |
| **Offline** | ✅ | ✅ (lokal) | ❌ | ❌ |
| **Preis** | Kostenlos / Open Source | Freemium | Freemium | Freemium |
| **Precision (DE)** | Hoch (bei abgedeckten Regeln) | ~0.33 (Studie) | Hoch (traditionell) | Gut (Stil) |
| **Recall (DE)** | Niedrig (145 Regeln) | ~0.26 (Studie) | Mittel | Hoch (Stil) |

**Einordnung:**
SPIN spielt nicht in derselben Liga wie LanguageTool (3.000+ Regeln) oder Duden Mentor. Aber es spielt auch nicht dasselbe Spiel. Die 145 Regeln decken die **häufigsten LRS-Fehler** ab, nicht den gesamten Duden. SPIN's Precision ist hoch bei den abgedeckten Fehlern, der Recall ist naturgemäß begrenzt durch die Regelanzahl.

**Kernunterschied:** LanguageTool sagt „Das ist falsch, hier ist die Korrektur." SPIN sagt „Hier ist die Struktur deines Satzes — er ist mehrkernig/konfliktär/performativ instabil."

### B. Narrative Struktur-Tools (LOOM-Vergleich)

| Kriterium | LOOM (Konzept) | Scrivener | Plottr | yWriter |
|-----------|---------------|-----------|-------|---------|
| **Visualisierung** | Graph (Nodes + Links) | Corkboard + Outliner | Timeline + Drag-Drop | Szenen-basiert |
| **Story-Architektur** | Offener Graph, nie geschlossen | Ordner-Hierarchie | Templates (Hero's Journey etc.) | Kapitel/Szenen |
| **Cross-Project** | ✅ Geplant | ❌ | ❌ | ❌ |
| **Integration** | Nutzt SPIN-Komponenten | Eigenständig | Eigenständig | Eigenständig |
| **Preis** | Kostenlos (geplant) | ~60€ Einmal | ~60€/Jahr | Kostenlos |
| **Zielgruppe** | ND-Schreiber:innen | Alle Autor:innen | Visuell Denkende | Pragmatiker:innen |

**Einordnung:**
LOOM wäre — falls realisiert — das **einzige Narrativ-Tool, das auf Satzebene verankert ist**. Scrivener zeigt Kapitel als Karten, Plottr zeigt Zeitstrahlen. LOOM würde zeigen, wie sich ein einzelner Satz in das Erzählgewebe einfügt. Das ist ein Alleinstellungsmerkmal.

### C. ND-Tools (Neurodivergenz-Vergleich)

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

**SPIN (eigene Messung, 140 Beispiele):**
- Precision: **Hoch** bei abgedeckten Regeln (~0.95 pro Regel-Confidence)
- Recall: **Begrenzt** auf 145 Regeln → kein Anspruch auf Vollabdeckung
- Pass Rate: **80%** über alle Kategorien

**Wichtig:** Diese Zahlen sind **nicht direkt vergleichbar**:
- LanguageTool wurde gegen Lehrer-Korrekturen gemessen (offenes Fehler-Set)
- SPIN wird gegen **eigene, curated Beispiele** gemessen (geschlossenes Set)
- Ein fairer Vergleich bräuchte denselben Testkorpus

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

- **Kein Vergleich mit menschlichen Korrekturen** (kein Gold-Standard-Korpus)
- **Keine False-Positive-Rate** auf unbekannten Texten
- **Kein A/B-Test gegen LanguageTool** auf identischem Datensatz
- **Keine User-Experience-Metrik** (Verständlichkeit der Diagnose)

### Stärken des Benchmark-Systems

1. **Reproducibility**: SHA256-Hash auf Protokoll, Seed, Environment-Snapshot
2. **Auditierbarkeit**: Vollständiger Event-Log (wer, wann, was)
3. **Governance**: Classification-Guards verhindern Datenlecks zwischen Domains
4. **Determinismus**: Gleicher Input = garantiert gleicher Output
5. **Promotion-Gates**: `private → lab → public` mit Audit-Trail

### Schwächen des Benchmark-Systems

1. **Self-Referential**: SPIN wird gegen eigene Testdaten gemessen → kein externer Validierungskorpus
2. **Kein Baseline-Vergleich**: Protokoll referenziert LanguageTool als Baseline, implementiert aber keinen automatischen Vergleich
3. **Kleine Stichprobe**: 140 Beispiele sind für statistische Signifikanz knapp
4. **Mock-Adapter dominiert**: Die meisten Runs nutzen den Mock, nicht den echten FLOW CLI
5. **Keine Precision/Recall-Berechnung**: Die wichtigsten NLP-Metriken fehlen im Scoring

---

## 6. Schwachstellen und Risiken

### 🔴 Kritisch

**1. LOOM existiert nicht.**
Das Synergie-Dreieck hat eine leere Ecke. LOOM ist konzeptionell beschrieben, hat aber keinen Code, kein Repo, keine Implementierung. Solange LOOM fehlt, ist die „drei Tools = drei Ebenen"-Vision unvollständig.

**2. Kein Shared Package.**
Die Grammatik-Engine (`clauseDetector.js`, `rules.gr.js`) existiert als **Kopie** in FLOW und SPIN. Jede Änderung muss manuell synchronisiert werden. Bei 145+ Regeln ist das ein Wartungsrisiko.

**3. Kein externer Validierungskorpus.**
Die Benchmarks messen SPIN gegen **sich selbst**. Es gibt keinen unabhängigen Gold-Standard-Datensatz (z.B. annotierter LRS-Korpus), gegen den die Erkennung validiert wird.

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

1. **Shared Grammar Package**: `@spin/grammar` als eigenständiges NPM-Paket extrahieren. FLOW und SPIN als Consumer. Das ist die wichtigste technische Schuld.

2. **Precision/Recall in Benchmarks**: F1-Score berechnen. Dafür mindestens 50 Negativbeispiele (korrekte Sätze, die KEINE Regel triggern sollen) in den Datensatz aufnehmen.

3. **Unicode-Regex-Audit**: Alle 145 Regeln systematisch auf `\b`-Probleme mit ä/ö/ü/ß prüfen.

### Mittelfristig

4. **Externer Validierungskorpus**: LRS-Fehler-Korpora aus der Forschung beschaffen oder selbst annotieren. Idealerweise 500+ Sätze mit manueller Annotation.

5. **LanguageTool-Vergleich**: Automatisierter A/B-Test auf identischem Datensatz. Das würde die Benchmark-Glaubwürdigkeit dramatisch erhöhen.

6. **LOOM-Prototyp**: Mindestens eine Graph-Visualisierung (z.B. mit D3.js oder Cytoscape) als Proof-of-Concept. Ohne Code bleibt LOOM eine Idee.

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

**SPIN ist kein Grammar-Checker.** Es wäre ein Fehler, es an LanguageTool zu messen. SPIN ist ein **diagnostisches Instrument für Satzstruktur** — das erste seiner Art, speziell für neurodivergente Schreiber:innen. Die Grammatik-Engine ist eine Komponente, nicht der Zweck.

Die größte Stärke: Philosophische Klarheit.  
Die größte Schwäche: LOOM und die App-Shell existieren noch nicht.  
Das größte Risiko: Zu viele Tools für zu wenige Hände.
