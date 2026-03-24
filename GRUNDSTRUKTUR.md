# GRUNDSTRUKTUR — SPIN im Ökosystem

**Status:** Verbindlich  
**Zweck:** Korrekte architektonische Grundlage für alle weiteren Entwicklungsschritte  
**Erstellt nach:** Vollständiger GitHub-Recherche (FLOW, Flow2, SPIN, SMASH, VENT — Stand März 2026)

---

## 1. Das Ökosystem

Drei Tools. Alle **Windows only**. Kein Tool ersetzt ein anderes. Alle sprechen dieselbe Designsprache — auf unterschiedlichen Ebenen.

| Tool | Ebene | Metapher | Zielgruppe |
|------|-------|----------|------------|
| **FLOW** | Orthographie | Fluss, unsichtbarer Strom | LRS/ND-Nutzer mit Tipp-/Schreibproblemen |
| **SPIN** | Satzstruktur | Drehen, Faden spinnen | Autor:innen mit Denkblockaden |
| **LOOM** | Narrativstruktur | Webstuhl, Gewebe | Autor:innen, Lektor:innen, Dramaturg:innen |

**Keine dieser Ebenen darf die andere ersetzen oder übernehmen.**  
FLOW korrigiert Buchstaben. SPIN dreht Bedeutung. LOOM webt Muster.

---

## 2. FLOW — aktueller Stand (GitHub-verifiziert)

**Repo:** `Lootziffer666/FLOW` (AHK v1) + `Lootziffer666/Flow2` (C# + Node.js)

### FLOW v1 (FLOW Repo)
- AutoHotkey v2 Skript (`FLOW.ahk`)
- Hotkey `Ctrl+Alt+P` markiert Absatz, schreibt `input.txt`, ruft Node.js auf, ersetzt Text
- Portable Node.js in `ahk/node/`
- Pipeline-Logik in separaten JS-Dateien

### FLOW v2 / Flow2 (Flow2 Repo)
- C# WinForms Systemtray-App (`FLOW_Normalizer.cs`)
- Hooks in Windows-Tastaturchor, korrigiert Text in Echtzeit
- Node.js Backend: Pipeline `SN → SL → MO → PG` (Syntaktisch → Silbisch → Morphologisch → Phonem-Graphem)
- Deterministische Regelengine, kein LLM
- `clauseDetector.js` — explizit designt um SPIN-Chunks zu beliefern

### Was FLOW NICHT hat:
- Keine echte UI (Tray-Icon + Tooltip = die gesamte UX)
- Kein persistentes Fenster
- Kein Dashboard

---

## 3. SPIN — aktueller Stand

**Repo:** `Lootziffer666/SPIN` (dieser Repo)

### Was existiert:
- `spin.html` — Browser-Prototyp v0.4 der Diagnose-Engine  
  Implementiert: Chunking, Drag & Drop mit DOGMA-Regeln, 6 Diagnosezustände, Re-Linearisierung
- `spin_ui_stage12_prototype.py` — Python UI-Prototyp (frühere Iteration)
- Umfangreiche Konzept-Dokumente (PRD, Anti-Features, Testmatrix, etc.)

### Was spin.html IST:
Ein **funktionierender Beweis der Diagnose-Logik** im Browser.  
Es ist kein fertiges Produkt. Es ist ein Proof of Concept für:
- Die Chunk-Objekt-Struktur
- Die DOGMA-Regeln (struktureller Widerstand)
- Die 6 Diagnosezustände und ihre Prioritätsreihenfolge
- Das Re-Rendering-Prinzip (Wortbestand-Invarianz)

### Was spin.html NICHT IST:
- Kein fertige App
- Kein Windows-nativer Build
- Kein Teil eines echten Produktreleases

### Was SPIN werden soll:
- Windows Desktop App (Zielplattform: **Tauri** — HTML/JS-Frontend, Rust-Backend)
- Standalone `.exe`
- Kein Browser, kein Server nötig

---

## 4. LOOM — aktueller Stand

**Kein eigenes Repo** (Stand März 2026 nicht als aktiver Build vorhanden)

### Was LOOM ist (konzeptionell):
- LOOM = "Language Orchestration & Outline Matrix"
- Narrativstruktur-Tool auf Absatz-/Plot-Ebene
- Visualisiert, wie ein geglätteter Satz im Gesamtgefüge sitzt (Zoom-out von SPIN)
- **Verwendet SPIN-Komponenten für die Darstellung** — hat keine eigene Display-Schicht
- Node-Graph-artige Darstellung von Handlungssträngen, Akt-Struktur, dramatischer Spannung

### Was LOOM NICHT hat:
- Keine eigene UI (nutzt SPIN)
- Höchstens: Settings und Analyse-Ansichten

### Verhältnis SPIN ↔ LOOM:
```
SPIN-View  = Satz als bewegliches Objekt (Mikro)
LOOM-View  = Satz im Gewebe des Textes   (Makro)
```
Man zoomt herein → SPIN. Man zoomt heraus → LOOM.

---

## 5. SMASH — Status

**Repo:** `Lootziffer666/SMASH` — **leer** (Stand März 2026)  
Rolle im Ökosystem noch nicht definiert. Nicht blockierend für SPIN.

---

## 6. Design-Prinzipien (alle drei Tools)

```
Sie fallen auf, weil sie nicht auffallen.
```

- Extreme Reduktion — Leeraum als Luxus
- Reizminderung für LRS/ND-Nutzer
- Keine unnötigen UI-Elemente
- Sound als UX, nicht als Dekoration
- Das Settings-Menü ist die sichtbare "Klammer" — daran erkennt man, dass alle drei zusammengehören
- Akzentfarben differenzieren die Tools; Designsprache bleibt dieselbe

---

## 7. Buildplan — korrekte Reihenfolge

Die wichtigste Erkenntnis dieser Session:

**Reihenfolge ist alles. Sound kommt zuletzt.**

```
Phase 1 — Logik-Engine (in spin.html vorhanden als Prototyp)
  ✓ Chunking
  ✓ DOGMA-Regeln
  ✓ 6 Diagnosezustände
  ✓ Re-Rendering / Wortbestand-Invarianz

Phase 2 — App-Struktur (noch nicht begonnen)
  → Windows Desktop App (Tauri)
  → Settings-Persistenz (JSON/LocalStorage)
  → Satzhistorie (optional)
  → LOOM-Anbindung (Daten-Interface)

Phase 3 — UX-Verfeinerung (noch nicht begonnen)
  → Design-System (SPIN-spezifische Akzentfarben)
  → Responsive Layout für Desktop-Fenstergrößen
  → Keyboard-Navigation

Phase 4 — Sound / Earcons (SPEC: dokumentiert, noch nicht aktiv)
  → Startup-Jingle (einmalig, beim ersten Start)
  → whoosh() — Drehungsgeräusch bei erfolgreicher Analyse
  → zerbroseln() — Struktur zerfällt bei Regelverletzung / nicht_renderbar
  (Implementierungsstand: in spin.html als Web Audio API Code vorhanden,
   aber als PREMATURE markiert — gehört in die finale App-Shell, nicht in den Prototyp)
```

---

## 8. Earcon-Spezifikation (SPEC — nicht aktiv)

Earcons sind Teil des UX-Konzepts, aber **noch nicht produktionsreif**.  
Der Code in `spin.html` ist ein synthetischer Proof of Concept und wurde **vor Fertigstellung der App-Grundstruktur** implementiert. Er wird für die spätere App-Phase aufbewahrt.

### Spezifikation (verbindlich für Phase 4):

| Earcon | Klangtextur | Trigger | Dauer |
|--------|-------------|---------|-------|
| **Jingle** | Beschleunigender Bandpass-Rauschen-Sweep (120→4800 Hz) | Einmaliger Start / App-Öffnung | ~550ms |
| **whoosh** | Bandpass-Noise-Sweep 180→3200 Hz | Erfolgreiche Analyse / Re-Render | ~420ms |
| **zerbröseln** | 6 abklingende Highpass-Rauschstöße | Regelverletzung + nicht_renderbar | ~300ms |

**Syntheseprinzip:** Alle Earcons sind synthetisch (Web Audio API / Rust Audio).  
Keine externen Audiodateien. Keine Musik. Keine Stimme. Keine persistenten Sounds.

**Metapher:** Whoosh = Drehen (SPIN dreht Bedeutung). Zerbröseln = Struktur zerfällt.

---

## 9. Was diese Session korrigiert

### Fehleinschätzungen aus früheren Sessions (dokumentiert, nicht gelöscht):

| Annahme | Korrektur |
|---------|-----------|
| "FLOW ist C# WinForms" | FLOW v1 ist AutoHotKey. Flow2 ist C# WinForms. Zwei Repos. |
| "spin.html ist die App" | spin.html ist ein Diagnose-Engine-Prototyp. Die App wird mit Tauri gebaut. |
| "Earcon-Code in spin.html ist ein Feature" | Der Earcon-Code ist ein voreilig implementierter Proof of Concept. Er gehört in Phase 4, nicht in den Prototyp. |
| "Sound ist erstes UI-Element" | Sound kommt nach Logik-Engine, App-Struktur und UX-Verfeinerung. |
| "LOOM hat eigenes Repo" | Kein LOOM-Repo vorhanden (Stand März 2026). LOOM nutzt SPIN-Komponenten. |

### Was korrekt war und bleibt:
- SPIN ist ein diagnostisches Instrument, kein Editor, kein Assistent
- Anti-Feature-Charta ist verbindlich
- Zielplattform: Tauri (.exe)
- Shared logic gehört in ein gemeinsames Modul, nicht in SPIN oder FLOW allein
- Design-System: Extreme Reduktion, alle drei Tools teilen dieselbe Sprache

---

## 10. Nächster Schritt

Bevor neuer Code entsteht:

1. **Tauri-Projektstruktur anlegen** — `npm create tauri-app@latest`
2. **spin.html-Logik** als Modul extrahieren (Diagnose-Engine, DOGMA-Regeln)
3. **Settings-Grundstruktur** definieren (was wird gespeichert? JSON-Schema)
4. **LOOM-Interface** skizzieren (welche Daten liefert SPIN an LOOM?)

Sound kommt, wenn die App-Shell steht.
