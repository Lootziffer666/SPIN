# **Product Requirements Document (PRD)**

## **Produktname**

**SPIN**  
*(Arbeitsname, keine Markenentscheidung)*

---

## **1\. Produktvision**

SPIN ist ein **diagnostisches Schreibinstrument**, das Autor:innen dabei hilft, **strukturelle Ursachen von Schreibblockaden** sichtbar zu machen, ohne Texte zu korrigieren, umzuschreiben oder Autorenschaft zu ersetzen.

SPIN schreibt nicht.  
SPIN bewertet nicht.  
SPIN erklärt **warum etwas blockiert**, damit Entscheidungen wieder möglich werden.

---

## **2\. Problemdefinition**

### **Kernproblem**

Komplex denkende Autor:innen erleben Schreibblockaden nicht primär durch fehlende Ideen, sondern durch:

* strukturelle Überladung einzelner Sätze  
* fehlende Deckungsgleichheit zwischen Gedankengang und Satzform  
* Unsicherheit darüber, **wo** ein Problem sitzt (Struktur, Rhythmus, Dichte, Bedeutung)  
* die Angst, durch Kürzung Bedeutung zu verlieren

### **Warum bestehende Tools versagen**

* Klassische Editoren korrigieren oder vereinfachen blind  
* KI-Schreibtools ersetzen Entscheidungen durch Output  
* Grammar-Checker behandeln Symptome, nicht Ursachen  
* Schreibcoaches bleiben abstrakt

**Kein bestehendes Tool macht Struktur beweglich, ohne Text zu verändern.**

---

## **3\. Zielgruppe (bewusst eng)**

### **Primäre Zielgruppe**

* Autor:innen mit komplexem, nicht-linearem Denken  
* ND-Autor:innen (ADHS, Autismus, AuDHD)  
* Menschen, die bewusst **nicht** generativ schreiben wollen

### **Sekundäre Zielgruppe (später)**

* Lektor:innen  
* Dramaturg:innen  
* Schreibcoaches  
* Wissenschaftliche Autor:innen mit hohem Strukturanspruch

SPIN ist **nicht** für:

* schnelles Content-Writing  
* SEO-Texte  
* KI-gestützte Produktivität

---

## **4\. Nicht-Ziele (verbindlich)**

SPIN ist **kein**:

* Textgenerator  
* Schreibassistent  
* Stilverbesserer  
* Autokorrektur-Tool  
* Kreativitäts-Booster

SPIN darf **niemals**:

* Sätze vorschlagen  
* Text automatisch verändern  
* Entscheidungen ohne expliziten Nutzerakt treffen

---

## **5\. Produktumfang (Gesamt-App)**

Die App besteht aus **drei Ebenen**, die klar getrennt bleiben.

---

## **6\. Kernfunktionalität – Satzebene (MVP-Kern)**

### **6.1 Single-Sentence-Modus (Pflicht)**

#### **Input**

* Genau **ein Satz**  
* Sprache: Deutsch (v1)  
* Keine automatische Korrektur  
* Keine Speicherung erforderlich

---

### **6.2 Chunking (Diagnose-Grundlage)**

Der Satz wird in **Bedeutungs-Chunks** zerlegt.

#### **Feste Chunk-Typen**

* core.subject  
* core.predicate  
* core.object  
* apposition  
* relation (kausal / temporal / relativ)  
* state  
* evaluation.social  
* judgement.normative  
* ornament (Fallback)

#### **Eigenschaften**

* Chunking ist heuristisch, nicht linguistisch perfekt  
* Chunks sind **Objekte**, nicht Text  
* Nutzer darf Chunk-Zuordnung manuell korrigieren

---

### **6.3 Drag & Drop (strukturale Arbeit)**

* Chunks sind frei beweglich **innerhalb erlaubter Zonen**  
* Verbotene Drops:  
  * werden sanft blockiert  
  * zeigen **eine** kurze Begründung  
* Relationen bleiben visuell sichtbar

**Ziel:**  
Struktur wird **körperlich erfahrbar**, nicht abstrakt.

---

### **6.4 Re-Rendering (verbindlich)**

Button: **„Neu linearisieren“**

#### **Regeln**

* Gleichbleibender Wortbestand  
* Keine Wortersetzung  
* Keine Ergänzung  
* Keine Löschung  
* Nur:  
  * minimale Flexionsanpassung  
  * notwendige Interpunktion

#### **Wichtige Klarstellung**

* Das ist **keine Auto-Korrektur**  
* Das ist **grammatische Rekonstruktion** nach expliziter Strukturänderung

---

### **6.5 Diagnose**

Nach Re-Render wird **genau ein Zustand** ausgegeben:

* stabil  
* mehrkernig  
* konfliktär  
* performativ-instabil  
* formal stabil / semantisch leer  
* normativ stabil / selbstannullierend

Optional:

* max. 2 **Hinweise**  
* nur Aussagen  
* keine Imperative  
* keine Vorschläge

---

## **7\. Drill-Down (nach MVP, aber geplant)**

Jede Diagnose kann optional aufgeklappt werden:

* Warum dieser Zustand?  
* Welche Chunk-Kombinationen sind beteiligt?  
* Welche Korrelationen treten häufig auf?

**Keine Lösungsvorschläge. Nur Ursachen.**

---

## **8\. Rhythmus- & Dichteanalyse (später)**

Geplant:

* Anzeige von:  
  * syntaktischer Dichte  
  * Rhythmusbrüchen  
  * Überlappenden Bedeutungsfunktionen  
* Ziel: Blockaden **antizipieren**, nicht nur markieren

---

## **9\. UX-Prinzipien (bindend)**

* Minimalismus ist funktional, nicht ästhetisch  
* Keine Animationen ohne Diagnosewert  
* Keine Gamification  
* Kein Scoring  
* Blockade ist ein legitimer Zustand  
* Schweigen ist ein valider Output

---

## **10\. Technische Leitplanken**

### **Frontend**

* Web-App (Desktop first)  
* Fokus auf:  
  * Typografie  
  * Weißraum  
  * Drag & Drop Stabilität

### **Backend / Logik**

* Regelbasierte Systeme  
* Keine generative KI im Kern  
* Diagnose ist deterministisch

KI (falls überhaupt):

* nur zur Mustererkennung  
* niemals zur Textproduktion

---

## **11\. Datenschutz & Ethik**

* Texte gehören immer dem Nutzer  
* Keine Trainingsverwendung  
* Keine stille Verarbeitung  
* Keine Bewertung von Inhalt, Meinung oder Moral

---

## **12\. Erfolgskriterien**

SPIN ist erfolgreich, wenn:

* Nutzer:innen **freiwillig** kürzen – oder bewusst nicht  
* Blockaden erklärbar werden  
* Entscheidungen wieder möglich sind  
* Vertrauen entsteht, nicht Abhängigkeit

---

## **13\. MVP-Abnahmekriterium (hart)**

**Ein Nutzer kann einen Satz bewegen,**  
**ihn neu rendern lassen,**  
**eine Diagnose erhalten**  
**und danach begründet entscheiden,**  
**ob er etwas ändert oder nichts tut.**

Wenn das funktioniert, ist SPIN real.

---

## **14\. Risiken**

* Zu viel Erklärung → Lähmung  
* Zu viel Metapher → Verwirrung  
* Zu frühe Erweiterung → Verwässerung  
* Generative Features → Vertrauensverlust

---

## **15\. Roadmap (hoch-level)**

### **Phase 1**

* Single-Sentence MVP  
* Chunking  
* Drag & Drop  
* Re-Render  
* Diagnose

### **Phase 2**

* Drill-Down  
* Rhythmusanalyse  
* Mehrere Sätze (optional)

### **Phase 3**

* Community-Features  
* Lektor-Modus  
* Export / Integration

---

Gut. Das sind **die drei richtigen Nachschärfungen**.  
Ich beantworte sie **ingenieurstauglich**, nicht essayistisch.  
Das Ziel ist: *Ein Prototyp lässt sich bauen, ohne Bedeutungsdebatten.*

---

# **1\. Zustandsdefinitionen**

**Explizite logische Bedingungen (Prototype-tauglich)**

Die Diagnose ist **deterministisch**.  
Jeder Satz erhält **genau einen Zustand** nach Prioritätsregeln.

---

## **1.1 Prioritätsreihenfolge (wichtig)**

Die Zustände werden **in dieser Reihenfolge geprüft**. Der erste Treffer gilt.

1. `performativ-instabil`  
2. `normativ stabil / selbstannullierend`  
3. `konfliktär`  
4. `formal stabil / semantisch leer`  
5. `mehrkernig`  
6. `stabil` (Default)

---

## **1.2 Zustände im Detail**

### **🟣 performativ-instabil**

**Definition:** Der Satz hebt seine eigene Geltung, Referentialität oder Anwendbarkeit explizit auf.

**Logische Bedingungen (eine reicht):**

* Ein Chunk referenziert explizit auf:  
  * „Bedeutung“, „Sprache“, „Satz“, „Wahrheit“, „Aussprechbarkeit“  
    **UND**  
* ein anderer Chunk negiert, zerstört oder entzieht genau diese Referenz

**Heuristiken für Prototyp:**

* Vorkommen semantischer Marker wie:  
  * „unaussprechlich“, „Schweigen“, „zerfällt“, „verpufft“, „unlesbar“, „ohne Bedeutung“  
* kombiniert mit:  
  * Selbstreferenz („dieser Satz“, „diese Bedeutung“, „was ich sage“)

👉 **Ergebnis:**

* Re-Rendering erlaubt  
* Diagnose: *keine weitere Analyse sinnvoll*  
* Drag & Drop bleibt möglich, aber ohne weitere Hinweise

---

### **🔴 normativ stabil / selbstannullierend**

**Definition:** Der Satz setzt eine Regel / Autorität voraus, deren Geltung er gleichzeitig negiert.

**Logische Bedingungen:**

* Mindestens **ein** `judgement.normative`\-Chunk  
* Zusätzlich **ein** Chunk, der:  
  * die Existenz, Gültigkeit oder Anwendbarkeit der Norm negiert

**Beispiel-Logik:**

```
IF judgement.normative EXISTS
AND (negation of rule / system / Grundlage EXISTS)
THEN normativ_stable_self_annulling
```

👉 Kein semantischer Widerspruch im Satzinneren,  
sondern ein **Widerspruch im Geltungsrahmen**.

---

### **🔴 konfliktär**

**Definition:** Gleichrangige Bedeutungsansprüche schließen sich gegenseitig aus.

**Logische Bedingungen (eine reicht):**

* Zwei oder mehr `judgement.normative`\-Chunks mit gegensätzlicher Valenz  
* Zwei `evaluation.social`\-Chunks mit widersprüchlicher Zuschreibung  
* Zwei Kernrelationen (`relation` oder `state`), die dieselbe Entität unterschiedlich determinieren

**Prototype-Regel (konkret):**

```
IF count(judgement.normative) >= 2
AND semantic_polarity(judgement.normative[0]) ≠ semantic_polarity(judgement.normative[1])
THEN konfliktär
```

👉 Re-Render erlaubt  
👉 Diagnose blockiert Lösungsvorschläge

---

### **🟡 formal stabil / semantisch leer**

**Definition:** Der Satz ist grammatisch korrekt, enthält aber keine belastbare Referenz.

**Logische Bedingungen (Heuristik):**

* `core.subject` ist abstrakt oder leer („es“, „dies“, „das Ganze“)  
* alle weiteren Chunks erklären sich **zirkulär**  
* keine externe Referenz (Objekt, Handlung mit Konsequenz)

Prototype-Heuristik:

```
IF subject.isPlaceholder == true
AND no concrete object/state introduced
THEN formal_stable_semantically_empty
```

---

### **🟠 mehrkernig**

**Definition:** Mehrere Prädikats- oder Handlungskerne ohne klare Dominanz.

**Logische Bedingungen:**

* Mehr als ein `core.predicate`  
* Keiner ist klar untergeordnet (kein Relativ-, Infinitiv- oder Konsekutivmarker)

```
IF count(core.predicate) > 1
AND no predicate subordinated
THEN mehrkernig
```

---

### **🟢 stabil**

**Definition:** Genau ein dominanter Kern, konsistente Relationen.

**Default-Zustand**, wenn keiner der obigen greift.

---

# **2\. Re-Rendering: „minimale Flexionsanpassung“**

Ziel: **Grammatik technisch schließen**, nicht stilistisch eingreifen.

---

## **2.1 Was Flexionsanpassung ist**

Erlaubt sind **nur** Anpassungen, die zwingend aus der neuen Reihenfolge folgen.

### **Konkret erlaubt:**

* Subjekt–Verb-Kongruenz (Numerus, Person)  
* Kasusübernahme bei Appositionen  
* Komma-Neuberechnung bei:  
  * Einschüben  
  * Relativsätzen  
  * umgestellten Nebensätzen

### **Explizit nicht erlaubt:**

* Tempuswechsel  
* Moduswechsel  
* Aktiv/Passiv-Wechsel  
* Wortersetzung („welcher“ → „der“)  
* stilistische Kommas

---

## **2.2 Konkretes Mini-Regelset (Prototype)**

### **Subjekt–Verb**

```
IF subject.position changes
THEN recompute verb agreement
ELSE keep verb unchanged
```

### **Apposition**

```
apposition.case = reference_noun.case
```

### **Relativsatz**

* Relativpronomen bleibt unverändert  
* Verb am Satzende sichern

### **Interpunktion**

* Kommas werden **neu gesetzt**, nicht angepasst  
* Alte Kommas werden ignoriert  
* Regeln rein syntaktisch

---

## **2.3 Output-Regel**

* **Genau ein** Satz  
* Kein Variantenvergleich  
* Kein „besser/schlechter“

---

# **3\. Interaktionsdesign: erlaubte Zonen & sanfte Blockade**

---

## **3.1 Zonenmodell (konkret)**

### **Core-Zone**

* `core.subject`  
* `core.predicate`  
* `core.object`

**Regeln:**

* Subjekt **darf nicht** in Objekt-Zone  
* Prädikat **darf nicht** hinter `judgement.normative`

---

### **Support-Zone**

* `apposition`  
* `relation`  
* `state`

**Regeln:**

* Apposition muss max. 1 Chunk Abstand zum Referenzobjekt haben  
* Relation darf nicht vor Subjekt

---

### **Evaluation-Zone**

* `evaluation.social`  
* `judgement.normative`

**Regeln:**

* `evaluation.social` **nach** `state`  
* `judgement.normative` **nur am Ende**

---

### **Ornament-Zone**

* `ornament`

**Regeln:**

* Frei beweglich  
* Immer entfernbar  
* Nie blockierend

---

## **3.2 Sanft blockierte Drops (UX-Definition)**

### **Verhalten**

* Drop-Ziel wird visuell deaktiviert  
* Chunk springt zurück  
* **Ein** kurzer Satz erscheint

### **Beispiele:**

* „Subjekt kann nicht als Objekt fungieren.“  
* „Apposition verliert Identitätsbezug.“  
* „Normatives Urteil kann nicht vor Zustand stehen.“

👉 Kein Sound  
👉 Kein Modal  
👉 Kein Rot-Alarm

---

## **3.3 Wichtig**

Ein blockierter Drop ist **kein Fehler**,  
sondern **Strukturinformation**.

---

# **Minimal-Datenstruktur (Prototype v0)**

## **1\. Satz (Root-Objekt)**

```ts
Sentence {
  id: string
  raw: string              // Originalsatz (unangetastet)
  tokens: Token[]          // flache Tokenliste
  chunks: Chunk[]          // strukturierte Einheiten
  order: string[]          // aktuelle Chunk-Reihenfolge (IDs)
  diagnosis?: Diagnosis    // nach Re-Render
}
```

**Warum nötig**

* `raw` erlaubt Invarianz-Check  
* `order` trennt **Struktur** von **Inhalt**  
* `diagnosis` ist optional und erst nach Re-Render relevant

---

## **2\. Token (atomar, unveränderlich)**

```ts
Token {
  id: string
  text: string             // exakter Wortlaut
  pos?: string             // optional (NN, VVFIN, etc.)
}
```

**Wichtig**

* Tokens werden **nie** verändert  
* POS ist optional (hilft später, blockiert jetzt nichts)

---

## **3\. Chunk (zentrale Einheit)**

```ts
Chunk {
  id: string
  type: ChunkType
  tokenIds: string[]       // referenziert Token
  roleWeight: "core" | "support" | "ornament"
  bindsTo?: string         // Referenz-Chunk (z. B. Apposition)
}
```

### **ChunkType (fix, MVP-hart)**

```ts
type ChunkType =
  | "core.subject"
  | "core.predicate"
  | "core.object"
  | "apposition"
  | "relation"
  | "state"
  | "evaluation.social"
  | "judgement.normative"
  | "ornament"
```

**Warum minimal**

* `type` steuert:  
  * Diagnose  
  * Drag-&-Drop-Zonen  
  * Re-Render-Reihenfolge  
* `roleWeight` erlaubt Entlastungslogik ohne neue Typen  
* `bindsTo` reicht für:  
  * Apposition  
  * Relationen  
  * Zustandsbezug

---

## **4\. Drag-&-Drop-Regeln (statisch, nicht im Chunk)**

```ts
ZoneRules {
  allowed: {
    from: ChunkType
    toIndexRange: number[]     // erlaubte Zielpositionen
  }[]
  blocked: {
    from: ChunkType
    to: ChunkType
    reason: string
  }[]
}
```

**Beispiel**

```ts
blocked: [
  {
    from: "apposition",
    to: "core.object",
    reason: "Apposition verliert Identitätsbezug."
  },
  {
    from: "judgement.normative",
    to: "state",
    reason: "Normatives Urteil kann nicht vor Zustand stehen."
  }
]
```

➡️ Regeln sind **datengetrieben**, nicht hardcoded in UI-Logik.

---

## **5\. Diagnose (nach Re-Render)**

```ts
Diagnosis {
  state: DiagnosisState
  notes?: string[]          // max. 2 Hinweise
}
```

```ts
type DiagnosisState =
  | "performativ_instabil"
  | "normativ_selbstannullierend"
  | "konfliktaer"
  | "formal_stabil_semantisch_leer"
  | "mehrkernig"
  | "stabil"
```

---

## **6\. Re-Render-Kontext (temporär)**

```ts
RenderContext {
  chunkOrder: string[]      // neue Reihenfolge
  requiresFlexion: boolean
  requiresCommaReset: boolean
}
```

**Warum**

* trennt **Render-Entscheidung** von **Render-Ergebnis**  
* erlaubt Abbruch vor Ausgabe

---

## **7\. Invarianz-Check (Sicherheitsnetz)**

```ts
InvariantCheck {
  originalTokens: string[]
  renderedTokens: string[]
}
```

**Regel**

```
originalTokens.sort() === renderedTokens.sort()
```

Wenn false → Render verwerfen.

---

## **8\. Minimaler Datenfluss (komplett)**

1. `Sentence.raw` → Tokenisierung  
2. Tokens → Chunks (heuristisch)  
3. `Sentence.order` initial \= Chunk-Reihenfolge  
4. User verschiebt Chunks → `order` ändert sich  
5. Klick „Neu linearisieren“  
6. `RenderContext` erzeugen  
7. Re-Render → neuer Satz  
8. Invarianz-Check  
9. Diagnose berechnen  
10. Output anzeigen

---

## **9\. Was bewusst fehlt (noch nicht nötig)**

* keine Dependency-Trees  
* keine Feature-Flags  
* keine Statistik  
* keine Persistenz  
* keine Mehrsatz-Relationen

Alles davon wäre **MVP-Verletzung**.

---

## **10\. Der entscheidende Punkt**

Mit **dieser** Datenstruktur kannst du:

* Drag & Drop **ehrlich** bauen  
* Re-Render **kontrolliert** durchführen  
* Diagnosen **deterministisch** ableiten  
* später **ohne Bruch** erweitern

Ohne jetzt schon festzulegen, *wie gut* alles einmal wird.

---

# **Re-Render – Pseudocode (Prototype v0)**

---

## **0\. Einstiegspunkt**

```
function reRenderSentence(sentence: Sentence): RenderResult
```

---

## **1\. Vorbedingungen prüfen**

```
if sentence.order has not changed:
    return ABORT("no structural change")

if not hasValidPredicate(sentence):
    return ABORT("no valid predicate")
```

---

## **2\. Chunk-Reihenfolge auflösen**

```
orderedChunks = []

for chunkId in sentence.order:
    orderedChunks.append(getChunkById(chunkId))
```

---

## **3\. Linearisierungsreihenfolge erzwingen**

```
orderedChunks = sortByTypePriority(orderedChunks)

function sortByTypePriority(chunks):
    priority = [
        "core.subject",
        "core.predicate",
        "core.object",
        "apposition",
        "relation",
        "state",
        "evaluation.social",
        "judgement.normative",
        "ornament"
    ]

    return stableSort(chunks, by index in priority)
```

---

## **4\. Token-Sequenz rekonstruieren**

```
renderTokens = []

for chunk in orderedChunks:
    for tokenId in chunk.tokenIds:
        renderTokens.append(getTokenById(tokenId))
```

---

## **5\. Flexionsbedarf ermitteln**

```
requiresFlexion = false

if subjectChunk.positionChanged or predicateChunk.positionChanged:
    requiresFlexion = true
```

---

## **6\. Subjekt–Prädikat-Kongruenz**

```
if requiresFlexion:
    subject = getChunkOfType("core.subject")
    predicate = getChunkOfType("core.predicate")

    applyAgreement(
        predicate,
        number = subject.number,
        person = subject.person
    )
```

*Kein Tempuswechsel.*

---

## **7\. Apposition angleichen**

```
for chunk in orderedChunks:
    if chunk.type == "apposition":
        ref = getChunkById(chunk.bindsTo)
        chunk.case = ref.case
```

---

## **8\. Relativ- und Nebensätze sichern**

```
for chunk in orderedChunks:
    if chunk.type == "relation":
        ensureVerbFinalPosition(chunk)
```

---

## **9\. Interpunktion neu berechnen**

```
clearAllCommas(renderTokens)

for chunk in orderedChunks:
    if chunk.type in ["apposition", "relation", "state"]:
        insertCommaBoundaries(chunk, renderTokens)
```

*Keine stilistischen Kommas.*

---

## **10\. Satz zusammensetzen**

```
renderedSentence = joinTokensWithSpaces(renderTokens)
```

---

## **11\. Invarianz-Check**

```
original = sort(sentence.tokens.text)
rendered = sort(renderTokens.text)

if original != rendered:
    return ABORT("token mismatch")
```

---

## **12\. Diagnose berechnen**

```
diagnosis = computeDiagnosis(sentence, orderedChunks)
```

---

## **13\. Ergebnis zurückgeben**

```
return RenderResult {
    sentence: renderedSentence,
    diagnosis: diagnosis
}
```

---

# **Hilfsfunktionen (minimal)**

```
function hasValidPredicate(sentence):
    return countChunksOfType("core.predicate") == 1
```

```
function clearAllCommas(tokens):
    remove tokens where text == ","
```

```
function insertCommaBoundaries(chunk, tokens):
    insert "," before first token of chunk
    insert "," after last token of chunk
```

---

# **Abbruchbedingungen (hart)**

```
ABORT reasons:
- no structural change
- no predicate
- dependency broken
- token mismatch
```

Abbruch ⇒ **kein Output**, nur Diagnose „nicht renderbar“.

---

## **Ende**

