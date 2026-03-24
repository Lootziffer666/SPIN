# SPIN — Diagnostisches Schreibinstrument

**Satz-Problematiken Identifizieren, Nutzergesteuert.**

SPIN ist ein diagnostisches Schreibinstrument für komplexe Denker:innen, die Blockaden durch strukturelle Überlastung erleben — nicht durch Ideenmangel.

## Ökosystem

SPIN ist Teil einer Tool-Familie:

| Tool | Ebene | Status |
|------|-------|--------|
| **FLOW** | Orthographie (Tastatur) | Aktiv ([Flow2](https://github.com/Lootziffer666/Flow2)) |
| **SPIN** | Satzstruktur (Diagnose) | In Entwicklung |
| **LOOM** | Narrativstruktur (Gewebe) | Konzeptionell |
| **SMASH** | Kognitive Regulation | Aktiv ([SMASH](https://github.com/Lootziffer666/SMASH)) |

## Projektstruktur

```
SPIN/
├── src/
│   ├── index.js              # Hauptmodul — alle öffentlichen APIs
│   ├── config.js             # Chunk-Typen, Marker, DOGMA-Regeln
│   ├── diagnosis.js          # Diagnose-Engine (6 Zustände)
│   ├── earcons.js            # Earcon-System (Phase 4, noch nicht aktiv)
│   ├── ui.js                 # UI-Rendering, Workbench, Toast
│   ├── nodes.js              # Node-Graph für multimodale Story-Entwicklung
│   └── grammar/              # Grammatik-Modul (aus Flow2)
│       ├── index.js           # Grammar-Einstiegspunkt
│       ├── clauseDetector.js  # Satz-/Teilsatzanalyse
│       ├── rules.gr.js        # Deutsche Grammatikregeln (86 Regeln)
│       ├── rules.en.gr.js     # Englische Grammatikregeln (83 Regeln)
│       └── contextWindowRules.js  # Multi-Token-Kontextregeln
├── index.html                # Strukturierte App (ES-Module)
├── spin.html                 # Ursprünglicher Prototyp v0.4 (Referenz)
├── package.json
└── docs/                     # Konzept- und Architekturdokumente
```

## Kernkonzept

Chunks (Satzfragmente) sind **ziehbare Objekte**, die durch strukturelle Regeln (DOGMA) eingeschränkt werden. SPIN:

- ✅ Macht Struktur sichtbar und greifbar
- ✅ Diagnostiziert strukturelle Zustände ohne Wertung
- ✅ Generiert, schreibt und entscheidet niemals
- ✅ Arbeitet durch **Widerstand als Information**

## 6 Diagnosezustände

| Priorität | Zustand | Bedeutung |
|-----------|---------|-----------|
| 1 | `performativ_instabil` | Selbstreferenz + Negation (Paradox) |
| 2 | `normativ_selbstannullierend` | Normative Aussage annulliert sich selbst |
| 3 | `konfliktaer` | Unaufgelöste Polarität |
| 4 | `formal_stabil_semantisch_leer` | Platzhalter-Subjekt ohne Referenz |
| 5 | `mehrkernig` | Mehrere Prädikate ohne Subordination |
| 6 | `stabil` | Keine strukturellen Spannungen |

## Grammatik-Modul (aus Flow2)

Das Grammatik-Modul stammt aus dem [Flow2-Repository](https://github.com/Lootziffer666/Flow2) und wird von SPIN für die Satzstrukturanalyse verwendet:

- **clauseDetector** — Erkennt Satz-Topologie (simple / compound / complex / compound-complex)
- **GR_RULES** — Deutsche Grammatikregeln (Komma, Getrenntschreibung, etc.)
- **contextWindowRules** — Multi-Token-Kontextregeln

> **Shared-Module-Prinzip:** Dieses Modul gehört langfristig in ein eigenes Shared-Package, das von FLOW und SPIN gleichermaßen konsumiert wird. „Eine Erweiterung, zwei Nutzen."

## Node Graph — Multimodale Story-Entwicklung

Alles, was zur Entwicklung einer multimodalen Story beiträgt, existiert als **Node** in einem offenen Graphen. Nodes sind nie „voll belegt" — Properties und Links können jederzeit ergänzt werden, auch über Dokument- und Projektgrenzen hinweg.

```
createGraph() → addNode(character|location|event|sensation|...) → link() → „Fäden spinnen"
```

**23 vordefinierte Node-Typen** (offen erweiterbar): `character`, `location`, `event`, `scene`, `object`, `dialogue`, `chapter`, `arc`, `theme`, `motif`, `conflict`, `sensation`, `medium`, `atmosphere`, `rhythm`, `rule`, `lore`, `faction`, `system`, `concept`, `reference`, `annotation`, `question`

**12 Link-Typen**: `relates_to`, `causes`, `follows`, `contains`, `opposes`, `transforms`, `references`, `depends_on`, `resembles`, `belongs_to`, `inspires`, `contradicts`

**Projektübergreifend**: `mergeGraph()` führt Graphen aus verschiedenen Projekten zusammen (SPIN ↔ FLOW ↔ LOOM ↔ SMASH).

> Dieses Modul ist die Grundlage für LOOM — Zoom-out von der Satzebene ins narrative Gewebe.

## Buildplan

```
Phase 1 ✅ — Logik-Engine (Prototyp in spin.html)
Phase 2 🔧 — App-Grundstruktur (Modularisierung, Grammatik-Integration)
Phase 3 → — Tauri-App-Shell (Windows .exe)
Phase 4 → — UX-Verfeinerung
Phase 5 → — Earcons (Sound)
Phase 6 → — SPIN→SMASH Bridge
```

## Entwicklung

```bash
# Lokal starten (kein Build-System nötig)
# index.html direkt im Browser öffnen (via lokalen Server für ES-Module)
npx serve .
```

## Verbindliche Dokumente

- [GRUNDSTRUKTUR.md](GRUNDSTRUKTUR.md) — Architektur und Ökosystem
- [ANTI_FEATURES.md](ANTI_FEATURES.md) — Was SPIN niemals tun wird
- [DEFINITION_OF_DONE_v0.3.md](DEFINITION_OF_DONE_v0.3.md) — Spezifikations-Freeze
