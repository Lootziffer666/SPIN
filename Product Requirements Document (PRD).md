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

## **Abschluss**

SPIN ist kein Tool für alle.  
Aber für die richtigen Menschen ist es **kein Tool**, sondern **Infrastruktur**.

