Basierend auf den Quellen visualisiert die Phonetikkurve den „Stress-Score“ (oft basierend auf der WCM-Metrik) in deinem Tool **SPIN** auf folgende Weise:  
**1\. Das Ampel-System (Farbe als Signal)**Die primäre Visualisierung erfolgt über eine intuitive Farbcodierung, die den „rhythmischen Widerstand“ anzeigt:

* **Grün:** Signallisiert einen flüssigen Rhythmus mit geringer kognitiver Last (Score \< 12 oder \< 2 im vereinfachten Modell) 1, 2\.  
* **Gelb:** Zeigt erhöhte Komplexität an 1, 2\.  
* **Rot:** Markiert den „roten Bereich“, also eine Überlastung durch zu viele Konsonantencluster, Plosive oder verschachtelte Strukturen („Mittelfeld-Stau“) 1-3.

**2\. Form der Darstellung (Wellenform & Balken)**Die Visualisierung nutzt zwei Formen, um den Text wie eine Audiospur behandelbar zu machen:

* **Integrierte Balken:** Jede „Chunk-Card“ (Textbaustein) verfügt über integrierte Balken oder Indikatoren, die die lokale Dichte (z. B. Konsonanten pro Wort) anzeigen 4, 5\.  
* **Live-Wellenform (Oszilloskop):** Es gibt eine Darstellung ähnlich einer Audio-Wellenform oder Heatmap (oft am linken Rand platziert), die den „Atemstress“ und die Dichte des gesamten Satzes oder Absatzes visualisiert 3, 4, 6\.

**3\. Verhalten beim Drag-and-Drop (Echtzeit-Feedback)**Damit das „Bügeln“ des Satzes funktioniert, ist die Visualisierung dynamisch:

* **Client-seitige Berechnung:** Da die WCM-Berechnung (Silben/Konsonanten zählen) wenig Rechenleistung braucht, erfolgt sie direkt im Browser (Client-Side) und nicht auf dem Server 7, 8\.  
* **Sofortige Reaktion:** Das ermöglicht eine **Live-Aktualisierung** der Wellenform oder der Farben *während* du einen Chunk ziehst 4\. Du siehst also sofort, ob das Verschieben eines Wortes an eine andere Stelle den „roten Bereich“ auflöst oder neue Stress-Cluster erzeugt 4, 9\.

Zusammenfassend macht die Kurve die **„artikulatorische Reibung“** sichtbar: Sie zeigt nicht an, ob ein Satz inhaltlich falsch ist, sondern wie viel „Mundarbeit“ er erfordert und wo der Leser stolpern würde 10, 11\.  
