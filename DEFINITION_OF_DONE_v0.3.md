# Definition of Done – SPIN v0.3

**Status:** Eingefroren  
**Datum:** 2025-02-07  
**Zweck:** Präzise Beschreibung dessen, was SPIN v0.3 kann und bewusst nicht kann

---

## ✅ Was SPIN v0.3 **kann**

### 1. Satz-Zerlegung

**Input:** Ein einzelner Satz (Deutsch)  
**Output:** Zerlegung in bewegliche Bedeutungs-Chunks

**Konkret:**
- Nutzer gibt einen Satz ein
- System teilt ihn in Wort-basierte Chunks
- Jeder Chunk erhält einen Typ (manuell zuweisbar):
  - `ornament`
  - `core.subject`
  - `core.predicate`
  - `core.object`
  - `apposition`
  - `relation`
  - `state`
  - `judgement.normative`

**Grenzen:**
- Keine automatische Chunk-Zuweisung
- Nur Deutsch
- Nur ein Satz zur Zeit
- Keine Speicherung zwischen Sessions

---

### 2. Struktureller Widerstand

**Funktion:** Blockiert bestimmte Chunk-Bewegungen

**Konkret:**
- Drag & Drop zwischen Chunks möglich
- System verhindert strukturell unmögliche Anordnungen:
  - Prädikat vor Subjekt
  - Objekt vor Subjekt
  - Objekt ohne Prädikat
- Bei Blockade: Kurze Begründung (kein Vorschlag)

**Grenzen:**
- Nur 4 Dogma-Regeln implementiert
- Keine Erklärung warum die Regel existiert
- Keine Ausnahmen/Overrides

---

### 3. Re-Linearisierung

**Funktion:** Rekonstruiert Satz aus neuer Chunk-Anordnung

**Konkret:**
- Button "Neu linearisieren"
- Nur nach struktureller Änderung (Reihenfolge oder Typ)
- Output: Grammatisch rekonstruierter Satz
- Wortbestand bleibt identisch

**Grenzen:**
- Keine morphologische Anpassung (rudimentäre Flexion)
- Interpunktion mechanisch
- Funktioniert nur bei gültigem Prädikat
- Keine Erklärung der Änderungen

---

### 4. Diagnose

**Funktion:** Benennt strukturellen Zustand nach Re-Render

**Konkret:**
- Genau ein Zustand pro Satz
- Implementierte Zustände:
  - `stabil` – Keine Spannungen
  - `mehrkernig` – Mehrere Prädikate
  - `performativ_instabil` – Selbstreferenzielle Unmöglichkeit
- Kurze Begründung (1 Satz)
- Keine Handlungsempfehlung

**Grenzen:**
- Nur 3 von 6 geplanten Zuständen
- Heuristik teilweise grob
- Keine Drill-Down-Funktion
- Keine Erklärung was der Zustand bedeutet

---

## ❌ Was SPIN v0.3 **bewusst nicht kann**

### Niemals implementiert (per Definition)

1. **Textgenerierung**
   - SPIN schlägt keine Sätze vor
   - SPIN vervollständigt nichts
   - SPIN schreibt nicht

2. **Automatische Verbesserung**
   - Keine "Optimieren"-Funktion
   - Keine Scoring-Systeme
   - Keine Bewertung von "gut" vs. "schlecht"

3. **Entscheidungen treffen**
   - SPIN sagt nicht "Du solltest..."
   - SPIN wählt nicht aus
   - SPIN korrigiert nicht

4. **Speicherung ohne Nutzeraktion**
   - Keine stillen Backups
   - Keine History
   - Keine Cloud-Sync

5. **Moralische/Inhaltliche Bewertung**
   - SPIN beurteilt nicht was du sagst
   - SPIN bewertet keine Meinungen
   - SPIN zensiert nicht

---

## ⚠️ Was SPIN v0.3 **noch nicht kann** (aber könnte)

### Technisch möglich, aber nicht prioritär

1. **Drill-Down**
   - Warum dieser Zustand?
   - Welche Chunks sind beteiligt?
   - Welche Muster sind erkennbar?

2. **Weitere Diagnosen**
   - `konfliktär`
   - `formal_stabil_semantisch_leer`
   - `normativ_selbstannullierend`

3. **Rhythmus-Analyse**
   - Syntaktische Dichte
   - Rhythmusbrüche
   - Bedeutungsüberlappungen

4. **Mehrere Sätze**
   - Satz-zu-Satz-Beziehungen
   - Absatz-Ebene

5. **Bessere Linguistik**
   - Morphologische Anpassung (spaCy/Stanza)
   - Automatisches Chunking (Heuristik)
   - Kasus-/Genus-Kongruenz

6. **Export**
   - Satz exportieren
   - Diagnose-Report
   - Chunk-Struktur als Daten

---

## 🎯 Erfolgs-Kriterien v0.3

SPIN v0.3 ist erfolgreich, wenn:

1. **Ein Nutzer einen Satz bewegt**
   - ohne Crash
   - ohne Verwirrung über erlaubte Operationen

2. **Widerstand erkennbar ist**
   - Blockaden sind klar kommuniziert
   - Begründungen sind verständlich

3. **Re-Render funktioniert**
   - Satz ist grammatisch
   - Wortbestand ist identisch
   - Output ist lesbar

4. **Diagnose erscheint**
   - Zustand ist benannt
   - Begründung ist vorhanden
   - Keine Handlungsanweisung enthalten

5. **Nutzer entscheidet selbst**
   - Änderung ist möglich
   - Nicht-Änderung ist möglich
   - SPIN drängt nicht

---

## 🔒 Verhaltens-Invarianten

**Diese Regeln gelten für alle Versionen:**

1. **Schweigen ist valide**
   - Wenn SPIN nichts zu sagen hat, sagt es nichts
   - Keine Füll-Texte
   - Keine generischen Hinweise

2. **Widerstand = Diagnose**
   - Blockaden sind keine Fehler
   - Blockaden sind Informationen
   - Blockaden sind keine Strafen

3. **Nutzer ist Autor**
   - SPIN hat keine Autorenschaft
   - SPIN trifft keine inhaltlichen Entscheidungen
   - SPIN bewertet keine Bedeutungen

4. **Struktur ≠ Inhalt**
   - SPIN arbeitet an Syntax
   - SPIN ignoriert Semantik (außer für Diagnose)
   - SPIN bewertet keine Aussagen

5. **Deterministisch**
   - Gleicher Input → Gleicher Output
   - Keine Zufälligkeit
   - Keine Lernkurve der Software

---

## 📊 Bekannte Limitationen v0.3

### 1. Technisch

- **Performance:** Nicht getestet über 15 Chunks
- **Browser:** Nur moderne Browser (ES6)
- **Responsiveness:** Desktop-first, Mobile nicht optimiert
- **Speicher:** Bei Page-Reload alles weg

### 2. Linguistisch

- **Flexion:** Nur Prototyp-Heuristik (Großschreibung, Punkt)
- **Interpunktion:** Mechanisch, nicht kontextuell
- **Kasus:** Wird nicht angepasst
- **Genus:** Wird nicht geprüft

### 3. Diagnose

- **Heuristiken:** Keyword-basiert (Meta-Marker, Null-Marker)
- **Kontext:** Keine Berücksichtigung von Textumfeld
- **Mehrdeutigkeit:** Nicht erkannt
- **Tonalität:** Nicht analysiert

### 4. UX

- **Onboarding:** Nicht vorhanden
- **Hilfe:** Keine Dokumentation im UI
- **Feedback:** Keine Bestätigungen
- **Undo:** Nicht implementiert

---

## 🧪 Test-Status v0.3

**Was getestet wurde (manuell):**
- ✅ Satz-Input funktioniert
- ✅ Chunk-Erstellung funktioniert
- ✅ Drag & Drop funktioniert
- ✅ Dogma-Regeln blockieren korrekt
- ✅ Re-Render erzeugt Satz
- ✅ Diagnose erscheint

**Was nicht getestet wurde:**
- ❌ Edge Cases (sehr lange Sätze, Sonderzeichen)
- ❌ Performance (viele Chunks, schnelle Interaktion)
- ❌ Browser-Kompatibilität (Safari, Firefox)
- ❌ Nutzer-Verhalten (real-world usage)
- ❌ Diagnose-Genauigkeit (false positives/negatives)

---

## 🔄 Versionshistorie v0.3.x

### v0.3.2 (aktuell, eingefroren)
- Dogma-Regeln mit Toast-Feedback
- Performativ-Instabil-Diagnose implementiert
- Mehrkernig-Diagnose implementiert
- Meta-Marker & Null-Marker Heuristik
- Original-Token-Order-Check

### v0.3.1
- Re-Render mit Token-Integrität
- Diagnose-Grundgerüst

### v0.3.0
- Single-Sentence Input
- Chunk-System mit Typen
- Drag & Drop
- Dogma-Regeln (3 Stück)

---

## 📐 Code-Metriken v0.3.2

- **Lines of Code:** ~400 (single file)
- **Dependencies:** 2 (Tailwind CDN, SortableJS CDN)
- **File Size:** ~15 KB (unminified)
- **Load Time:** < 1s (on fast connection)

---

## ⚖️ Was v0.3 **nicht** ist

- Kein Editor
- Kein Schreibassistent
- Kein Grammatik-Checker
- Kein Stil-Verbesserer
- Kein Produktivitäts-Tool
- Keine KI-Integration
- Kein Kollaborations-Tool
- Keine Publishing-Platform

---

## 🎯 Phase-0-Abschluss-Kriterium

> Du kannst v0.3 in einem Satz erklären, ohne "eigentlich", "bald", "später" oder "könnte" zu benutzen.

**Versuch:**

> "SPIN zerlegt einen Satz in bewegliche Teile, blockiert strukturell unmögliche Anordnungen und benennt den strukturellen Zustand nach Umstellung – ohne Vorschläge zu machen."

**Test bestanden:** ✅

---

## 📋 Nächste Phase

Nach Einfrieren von v0.3:

→ **PHASE 1: Instrument testen (nicht verbessern)**

Kein Code-Änderung.  
Nur Nutzung mit echten Sätzen.  
Nur Beobachtung.

---

**Ende Definition of Done v0.3**
