# GRUNDSTRUKTUR — SPIN im Ökosystem

**Status:** Verbindlich  
**Zweck:** Korrekte architektonische Grundlage für alle weiteren Entwicklungsschritte  
**Erstellt nach:** Vollständiger GitHub-Recherche (FLOW, Flow2, SPIN, SMASH, VENT — Stand März 2026)  
**Zuletzt aktualisiert:** SMASH-Analyse nach Veröffentlichung der Rohfassung

---

## 1. Das Ökosystem

Drei Schreibwerkzeuge + ein Begleit-Tool. Alle teilen dieselbe Designsprache. Kein Tool ersetzt ein anderes.

### Die drei Schreibwerkzeuge — Windows only

| Tool | Ebene | Metapher | Zielgruppe |
|------|-------|----------|------------|
| **FLOW** | Orthographie | Fluss, unsichtbarer Strom | LRS/ND-Nutzer mit Tipp-/Schreibproblemen |
| **SPIN** | Satzstruktur | Drehen, Faden spinnen | Autor:innen mit Denkblockaden |
| **LOOM** | Narrativstruktur | Webstuhl, Gewebe | Autor:innen, Lektor:innen, Dramaturg:innen |

**Keine dieser Ebenen darf die andere ersetzen oder übernehmen.**  
FLOW korrigiert Buchstaben. SPIN dreht Bedeutung. LOOM webt Muster.

### SMASH — das Begleit-Tool (nicht Windows-only)

| Tool | Ebene | Metapher | Zielgruppe |
|------|-------|----------|------------|
| **SMASH** | Kognitive Regulation | WarioWare / Micro-Break | ND-Nutzer, die zwischen Arbeitsphasen ein Focus-Reset brauchen |

SMASH ist kein Schreibwerkzeug. Es ist das, was du zwischen Schreibsessions machst.  
Während FLOW/SPIN/LOOM den Schreibprozess stützen, stützt SMASH den **Schreiber selbst** — kurze Handlungsmomente, die Blockaden lösen, ohne Text zu berühren.

Die ursprüngliche Formulierung "alle drei Tools" (aus früheren Sessions) bezog sich auf **FLOW, SPIN, LOOM**. SMASH ist ein viertes, eigenständiges Objekt mit anderem Charakter.

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

## 5. SMASH — aktueller Stand (GitHub-verifiziert)

**Repo:** `Lootziffer666/SMASH`  
**Datei:** `smash_warioware_minimalhud_nocountdown.html` — eine einzelne HTML-Datei (wie spin.html = Prototyp-Ansatz)

### Was SMASH ist

SMASH ist eine **WarioWare-inspirierte Microgame-Sammlung** für kognitive Pausen.

- **23 Mini-Spiele**: 20 Pack-Games (HTML5 iframes, in base64 eingebettet) + 3 Core-Gesten (MASH / SWIPE / PULL)
- **Zwei Modi**: Run (unsichtbarer Zeitdruck, eskaliert mit Streak) / Üben (kein Zeitlimit)
- **Einziges Interface**: ein Kommando-Popup (z.B. `TAP!`, `SWIPE!`, `PULL!`) — kein Countdown, kein Score-Display während des Spiels
- **Metaphernreiche Spieltitel**: Break the Chain / Hold the Thread / Gather / Stabilize the Reflection / Cut Through / Set It Straight / Reveal the Face / Find the Exit — alle kognitiv-regulatorische Metaphern
- **Touch + Pointer + Vibration**: läuft auf Desktop UND Mobil
- **Kein Windows-Only**: browser-based, cross-platform

### Design-Sprache SMASH — Tokens (korrekt)

SMASH verwendet **dieselben Design-Tokens** wie FLOW/SPIN/LOOM:

```
--teal:   #00c0c0    (Akzent, nicht Primärfläche)
--navy:   #000030    (Text, Rahmen, Zeichenelemente)
--red:    #e01020    (Akzent, Erfolg, Gauge-Füllung)
--cream:  #f2f0e8    (Hintergrund — dominante Fläche)
Fonts: Bebas Neue (Überschriften) + Inter (Text)
```

### Design-Konflikt und Kurskorrektur ⚠

**Was der Prototyp hat (und was falsch ist):**

Der aktuelle Prototyp `smash_warioware_minimalhud_nocountdown.html` hat eine **Editorial-Poster-Ästhetik**:
- Vollflächiger Teal-Hintergrund über den ganzen Screen
- Diagonale Rot-Streifen als dekorative Overlay-Elemente
- Wiederholendes Linienraster als Hintergrundtextur
- Hohe visuelle Dichte und "Aufregungsniveau"
- WarioWare-Spielgefühl durch maximalen visuellen Kontrast

**Warum das nicht passt:**

Das widerspricht der Design-Bibel der Tool-Familie auf allen Ebenen:

| Design-Bibel | Editorial Poster (aktueller Prototyp) |
|---|---|
| Cream/Weiß als primäre Fläche | Teal als primäre Fläche |
| Farbe nur als Akzent | Farbe als Struktur und Dekoration |
| Keine dekorativen Elemente | Diagonale Streifen, Gitterlinien |
| Reizminderung | Reizstimulation |
| Stille Oberfläche | Visuelle Energie |

**Das ist kein ästhetisches Problem — es ist ein Funktionsproblem:**  
SMASH ist für ND-Nutzer gebaut, die kognitive Regulation brauchen. Eine überstimulierte Shell wirkt dem Ziel entgegen, bevor das erste Spiel gestartet ist.

**Die korrekte Richtung:**

```
Shell (Topbar, Navigation, Karten, Home-Screen)
  → Cream-Hintergrund, Navy-Text, minimale Ränder
  → Identisch zu FLOW/SPIN: "Sie fallen auf, weil sie nicht auffallen"
  → Teal und Rot NUR als Aktions-Akzente (Buttons, Statusanzeigen)

Spielarena (was innerhalb des Stage-Containers passiert)
  → Darf mehr visuelle Energie haben — das IST der Spielinhalt
  → Die Spiele selbst sind die Ausnahme, nicht die Regel
  → Analog: SPIN zeigt Diagnosezustände farbig, aber die UI-Chrome ist reduktiv
```

**Was das für den Prototypen bedeutet:**  
Die Shell muss neu aufgebaut werden. Die Spiellogik und der Spielinhalt (die 23 Microgames) bleiben unverändert. Nur der Rahmen drum herum — das, was du siehst, wenn du nicht spielst — muss der Design-Bibel folgen.

### SMASH-Earcon

Der früher genannte Klangname **"zerbröseln"** — `"ein zerbröseln für smash"` — passt perfekt zur SMASH-Mechanik:  
Wenn eine Microgame-Runde mit MISS endet, bricht etwas. Das `MISS`-Stamp ist visuell, das Zerbröseln wäre der akustische Zwilling.

**WICHTIG:** In `spin.html` gibt es ebenfalls einen `zerbroseln()`-Earcon für Regelverletzungen — das ist eine andere Verwendung desselben Klangtypus. SPIN und SMASH können denselben Klang-Charakter teilen, weil sie ihn für dasselbe Konzept verwenden: etwas bricht / passt nicht zusammen.

### Verhältnis zu den drei Schreibwerkzeugen

```
FLOW   → im Hintergrund, während du tippst
SPIN   → wenn du an einem Satz festhängst
LOOM   → wenn du den Überblick über den Text brauchst
SMASH  → wenn du den Überblick über dich selbst brauchst
```

SMASH ist das einzige Tool der Familie, das **kein Text-Interface** hat. Es ist rein kinetisch und temporal.

---

## 6. Design-Prinzipien (alle vier Tools)

```
Sie fallen auf, weil sie nicht auffallen.
```

- Extreme Reduktion — Leeraum als Luxus
- Reizminderung für LRS/ND-Nutzer — **auch in SMASH** (obwohl SMASH ein Spiel ist)
- Keine dekorativen Elemente in der Shell (Streifen, Raster, Overlays gehören nicht zur Chrome)
- Sound als UX, nicht als Dekoration
- Das Settings-Menü ist die sichtbare "Klammer" — daran erkennt man, dass alle vier zusammengehören
- Akzentfarben differenzieren die Tools; Designsprache bleibt dieselbe
- **Ausnahme Spielinhalt**: Was *innerhalb* einer Spielarena passiert, darf visuell energetischer sein — das ist der Spielinhalt, nicht die UI-Chrome

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
| "SMASH ist leer / undefiniert" | SMASH ist eine vollständige WarioWare-Microgame-Sammlung (23 Spiele, HTML5, cross-platform). Rolle klar: kognitives Break-Tool für ND-Nutzer. |
| "Es gibt drei Tools" | Es gibt drei **Schreibwerkzeuge** (FLOW/SPIN/LOOM, alle Windows-only) + SMASH als viertes, eigenständiges Begleit-Tool (browser-based, cross-platform). |
| "Der SMASH-Prototyp folgt der Design-Bibel" | Der aktuelle Prototyp hat eine Editorial-Poster-Ästhetik (vollflächiges Teal, Diagonal-Stripes, Gitterraster) — das ist das Gegenteil der Design-Bibel. Die Shell muss neu gebaut werden. Die Spiellogik bleibt. |

### Was korrekt war und bleibt:
- SPIN ist ein diagnostisches Instrument, kein Editor, kein Assistent
- Anti-Feature-Charta ist verbindlich
- Zielplattform SPIN: Tauri (.exe)
- Shared logic gehört in ein gemeinsames Modul, nicht in SPIN oder FLOW allein
- Design-System: Extreme Reduktion, alle vier Tools teilen dieselbe Designsprache
- "zerbröseln"-Klang ist metaphorisch korrekt für sowohl SMASH (MISS-Event) als auch SPIN (Regelverletzung)

---

## 10. Nächster Schritt

Bevor neuer Code entsteht:

1. **Tauri-Projektstruktur anlegen** — `npm create tauri-app@latest`
2. **spin.html-Logik** als Modul extrahieren (Diagnose-Engine, DOGMA-Regeln)
3. **Settings-Grundstruktur** definieren (was wird gespeichert? JSON-Schema)
4. **LOOM-Interface** skizzieren (welche Daten liefert SPIN an LOOM?)

Sound kommt, wenn die App-Shell steht.
