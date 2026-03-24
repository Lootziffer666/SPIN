/**
 * GR – Grammatik-Normalisierung (Deutsch)
 *
 * Ursprung: Flow2 (Lootziffer666/Flow2) — übernommen als geteiltes Modul.
 *
 * LanguageTool-inspirierte Grammatikregeln für die deutsche Sprache.
 * Bildet die fünfte Pipelinestufe nach PG in FLOW.
 * In SPIN: Wird für strukturelle Analyse und Komma-Erkennung verwendet.
 *
 * Prinzip: nur Regeln, die deterministisch und für LRS-Texte hochrelevant sind.
 * Kein stochastisches Parsing, keine Modelle.
 *
 * Abgedeckte Fehlerklassen (vgl. LanguageTool DE-Kategorien):
 *   GETRENNTSCHREIBUNG     – falsch getrennte Komposita (Konnektoren)
 *   KOMMA_NEBENSATZ        – fehlendes Komma vor unterordnender Konjunktion
 *   KOMMA_INFINITIV        – fehlendes Komma vor „um … zu"
 *   APOSTROPH_GENITIV      – englisch-influenzierter Genitiv-Apostroph
 *   APOSTROPH_KONTRAKTION  – unnötiger Apostroph in Verschmelzungen
 *   WORD_REPEAT            – Wortwiederholung bei Funktionswörtern
 *   ALS_WIE / WIE_ALS      – Komparativfehler
 *   SS_ESZETT              – ss/ß-Verwechslung (Schweiz/informell → Standard)
 *   ALTE_RECHTSCHREIBUNG   – veraltete ß-Schreibungen → Neuregelung
 *   REDUNDANZ              – redundante Doppelungen
 *
 * Hinweis: Dieses Modul gehört langfristig in ein eigenes Shared-Package,
 * das von FLOW und SPIN gleichermaßen konsumiert wird.
 * Prinzip: „Eine Erweiterung, zwei Nutzen."
 */

export const GR_RULES = [

  // ═══════════════════════════════════════════════════════════════════════
  // GETRENNTSCHREIBUNG – falsch getrennte Komposita und Konnektoren
  // Nach der Rechtschreibreform (1996/2006) sind folgende Formen normiert.
  // WICHTIG: Vor KOMMA_NEBENSATZ anwenden, damit „so dass" → „sodass"
  // erkannt wird, bevor die Komma-Regel ein Komma vor „dass" einfügt.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'de-gr-sodass',
    from: /\bso\s+dass\b/gi,
    to: 'sodass',
    confidence: 0.95,
  },
  {
    id: 'de-gr-anstatt',
    from: /\ban\s+statt\b/gi,
    to: 'anstatt',
    confidence: 0.97,
  },
  {
    id: 'de-gr-aufgrund',
    from: /\bauf\s+[Gg]rund\b/g,
    to: 'aufgrund',
    confidence: 0.94,
  },
  {
    id: 'de-gr-mithilfe',
    from: /\bmit\s+[Hh]ilfe\b/g,
    to: 'mithilfe',
    confidence: 0.94,
  },
  {
    id: 'de-gr-zugunsten',
    from: /\bzu\s+[Gg]unsten\b/g,
    to: 'zugunsten',
    confidence: 0.94,
  },
  {
    id: 'de-gr-imstande',
    from: /\bim\s+[Ss]tande\b/g,
    to: 'imstande',
    confidence: 0.93,
  },
  {
    id: 'de-gr-instand',
    from: /\bin\s+[Ss]tand\b/g,
    to: 'instand',
    confidence: 0.92,
  },
  {
    id: 'de-gr-inzwischen',
    from: /\bin\s+zwischen\b/gi,
    to: 'inzwischen',
    confidence: 0.96,
  },
  {
    id: 'de-gr-insofern',
    from: /\bin\s+sofern\b/gi,
    to: 'insofern',
    confidence: 0.95,
  },
  {
    id: 'de-gr-infolge',
    from: /\bin\s+[Ff]olge\b/g,
    to: 'infolge',
    confidence: 0.90,
  },
  {
    id: 'de-gr-infrage',
    from: /\bin\s+[Ff]rage\b/g,
    to: 'infrage',
    confidence: 0.89,
  },
  {
    id: 'de-gr-inwiefern',
    from: /\bin\s+wiefern\b/gi,
    to: 'inwiefern',
    confidence: 0.96,
  },
  {
    id: 'de-gr-sowieso',
    from: /\bso\s+wie\s+so\b/gi,
    to: 'sowieso',
    confidence: 0.97,
  },
  {
    id: 'de-gr-ueberhaupt',
    from: /(?<=\s|^)über\s+haupt\b/gi,
    to: 'überhaupt',
    confidence: 0.96,
  },
  {
    id: 'de-gr-zustande',
    from: /\bzu\s+[Ss]tande\b/g,
    to: 'zustande',
    confidence: 0.93,
  },
  {
    id: 'de-gr-zulasten',
    from: /\bzu\s+[Ll]asten\b/g,
    to: 'zulasten',
    confidence: 0.92,
  },
  {
    id: 'de-gr-vonseiten',
    from: /\bvon\s+[Ss]eiten\b/g,
    to: 'vonseiten',
    confidence: 0.91,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // KOMMA_NEBENSATZ
  // Fügt Komma vor unterordnender Konjunktion ein, wenn keines vorhanden.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'de-gr-komma-nebensatz',
    from: /([^\s,;:!?.()\[\]{}])(\s+)(dass|weil|obwohl|ob|wenn|falls|nachdem|bevor|sobald|solange)\b/gi,
    to: '$1,$2$3',
    confidence: 0.88,
  },
  // Überkorrektur entfernen: beiordnende Konjunktion + Komma + unterordnende
  {
    id: 'de-gr-komma-nach-koordinator-undo',
    from: /\b(und|oder|aber|sondern|denn|weder|entweder),(\s+)(dass|weil|obwohl|ob|wenn|falls|nachdem|bevor|sobald|solange)\b/gi,
    to: '$1$2$3',
    confidence: 0.99,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // KOMMA_INFINITIV
  // Komma vor „um … zu" + Infinitiv (§75 Rechtschreibreform).
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'de-gr-komma-um-zu',
    from: /([^\s,;:!?.()\[\]{}])\s+(um\s+zu\s+\w+)/gi,
    to: '$1, $2',
    confidence: 0.90,
  },
  {
    id: 'de-gr-komma-ohne-zu',
    from: /([^\s,;:!?.()\[\]{}])\s+(ohne\s+zu\s+\w+)/gi,
    to: '$1, $2',
    confidence: 0.89,
  },
  {
    id: 'de-gr-komma-anstatt-zu',
    from: /([^\s,;:!?.()\[\]{}])\s+(anstatt\s+zu\s+\w+)/gi,
    to: '$1, $2',
    confidence: 0.89,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // APOSTROPH_GENITIV
  // Deutsch nutzt keinen Apostroph im Genitiv: „Karls Buch" (korrekt),
  // „Karl's Buch" (falsch; englischer Einfluss).
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'de-gr-apostroph-genitiv',
    from: /\b([A-ZÄÖÜ][a-zäöü]*[^szxßSZX\s])'s\b/g,
    to: '$1s',
    confidence: 0.92,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // APOSTROPH_KONTRAKTION
  // Unnötige Apostrophe in Präposition+Artikel-Verschmelzungen.
  // „für's" → „fürs", „auf's" → „aufs" etc.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'de-gr-fuers',
    from: /\bfür's\b/g,
    to: 'fürs',
    confidence: 0.95,
  },
  {
    id: 'de-gr-aufs',
    from: /\bauf's\b/g,
    to: 'aufs',
    confidence: 0.95,
  },
  {
    id: 'de-gr-ins',
    from: /\bin's\b/g,
    to: 'ins',
    confidence: 0.95,
  },
  {
    id: 'de-gr-ums',
    from: /\bum's\b/g,
    to: 'ums',
    confidence: 0.95,
  },
  {
    id: 'de-gr-ans',
    from: /\ban's\b/g,
    to: 'ans',
    confidence: 0.95,
  },
  {
    id: 'de-gr-durchs',
    from: /\bdurch's\b/g,
    to: 'durchs',
    confidence: 0.95,
  },
  {
    id: 'de-gr-ubers',
    from: /(?<=\s|^)über's\b/g,
    to: 'übers',
    confidence: 0.95,
  },
  {
    id: 'de-gr-unters',
    from: /\bunter's\b/g,
    to: 'unters',
    confidence: 0.95,
  },
  {
    id: 'de-gr-vors',
    from: /\bvor's\b/g,
    to: 'vors',
    confidence: 0.95,
  },
  {
    id: 'de-gr-hinters',
    from: /\bhinter's\b/g,
    to: 'hinters',
    confidence: 0.95,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // WORD_REPEAT
  // Wiederholung desselben Funktionsworts entfernen.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'de-gr-word-repeat',
    from: /\b(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|und|oder|aber|ich|du|er|sie|es|wir|ihr|sie|auf|in|mit|von|zu|an|für|bei|nach|über|unter|vor|hinter|neben|zwischen)\s+\1\b/gi,
    to: '$1',
    confidence: 0.96,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ALS_WIE / WIE_ALS
  // Komparativfehler: „größer wie" → „größer als"
  // „als wie" (redundant) → „als"
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'de-gr-als-wie',
    from: /\bals\s+wie\b/gi,
    to: 'als',
    confidence: 0.91,
  },
  // Komparativ + „wie" → Komparativ + „als" (häufigster Fehler)
  {
    id: 'de-gr-wie-als-komparativ',
    from: /\b(größer|kleiner|besser|schlechter|schneller|langsamer|höher|tiefer|länger|kürzer|älter|jünger|stärker|schwächer|leichter|schwerer|mehr|weniger|lieber|eher|schöner|wichtiger|einfacher|teurer|billiger|wärmer|kälter|näher|weiter|früher|später|dicker|dünner|breiter|schmaler|lauter|leiser|heller|dunkler|klüger|härter|weicher)\s+wie\b/gi,
    to: '$1 als',
    confidence: 0.93,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SS_ESZETT – Schweizer/informelle ss-Schreibung → Standard-ß
  // Betrifft Wörter mit langem Vokal oder Diphthong, bei denen ss
  // fälschlicherweise statt ß geschrieben wird.
  // Ergänzt die PG-Stufe, die phonetische Fehler behandelt.
  // ═══════════════════════════════════════════════════════════════════════

  // Diphthong ei + ss → ß
  {
    id: 'de-gr-heissen',
    from: /\bheissen\b/gi,
    to: 'heißen',
    confidence: 0.96,
  },
  {
    id: 'de-gr-heisst',
    from: /\bheisst\b/gi,
    to: 'heißt',
    confidence: 0.96,
  },
  {
    id: 'de-gr-weiss',
    from: /\bweiss\b/gi,
    to: 'weiß',
    confidence: 0.95,
  },
  {
    id: 'de-gr-heiss',
    from: /\bheiss\b/gi,
    to: 'heiß',
    confidence: 0.96,
  },
  {
    id: 'de-gr-fleissig',
    from: /\bfleissig\b/gi,
    to: 'fleißig',
    confidence: 0.96,
  },
  // Diphthong au + ss → ß
  {
    id: 'de-gr-draussen',
    from: /\bdraussen\b/gi,
    to: 'draußen',
    confidence: 0.96,
  },
  {
    id: 'de-gr-ausser',
    from: /\bausser\b/gi,
    to: 'außer',
    confidence: 0.95,
  },
  {
    id: 'de-gr-ausserdem',
    from: /\bausserdem\b/gi,
    to: 'außerdem',
    confidence: 0.96,
  },
  {
    id: 'de-gr-aeusserst',
    from: /(?<=\s|^)äusserst\b/gi,
    to: 'äußerst',
    confidence: 0.96,
  },
  {
    id: 'de-gr-aeussern',
    from: /(?<=\s|^)äussern\b/gi,
    to: 'äußern',
    confidence: 0.95,
  },
  // Langer Vokal ie + ss → ß
  {
    id: 'de-gr-schliessen',
    from: /\bschliessen\b/gi,
    to: 'schließen',
    confidence: 0.96,
  },
  {
    id: 'de-gr-schliesslich',
    from: /\bschliesslich\b/gi,
    to: 'schließlich',
    confidence: 0.97,
  },
  {
    id: 'de-gr-fliessen',
    from: /\bfliessen\b/gi,
    to: 'fließen',
    confidence: 0.96,
  },
  {
    id: 'de-gr-giessen',
    from: /\bgiessen\b/gi,
    to: 'gießen',
    confidence: 0.96,
  },
  {
    id: 'de-gr-schiessen',
    from: /\bschiessen\b/gi,
    to: 'schießen',
    confidence: 0.96,
  },
  {
    id: 'de-gr-geniessen',
    from: /\bgeniessen\b/gi,
    to: 'genießen',
    confidence: 0.96,
  },
  // Langer Vokal o + ss → ß
  {
    id: 'de-gr-gross',
    from: /\bgross\b/gi,
    to: 'groß',
    confidence: 0.95,
  },
  {
    id: 'de-gr-groesse',
    from: /\bGrösse\b/g,
    to: 'Größe',
    confidence: 0.96,
  },
  {
    id: 'de-gr-stossen',
    from: /\bstossen\b/gi,
    to: 'stoßen',
    confidence: 0.95,
  },
  {
    id: 'de-gr-bloss',
    from: /\bbloss\b/gi,
    to: 'bloß',
    confidence: 0.95,
  },
  // Langer Vokal a + ss → ß
  {
    id: 'de-gr-strasse',
    from: /\bStrasse\b/g,
    to: 'Straße',
    confidence: 0.97,
  },
  {
    id: 'de-gr-strassen',
    from: /\bStrassen\b/g,
    to: 'Straßen',
    confidence: 0.97,
  },
  {
    id: 'de-gr-spass',
    from: /\bSpass\b/g,
    to: 'Spaß',
    confidence: 0.97,
  },
  // Langer Vokal u + ss → ß
  {
    id: 'de-gr-gruss',
    from: /\bGruss\b/g,
    to: 'Gruß',
    confidence: 0.97,
  },
  {
    id: 'de-gr-gruesse',
    from: /\bGrüsse\b/g,
    to: 'Grüße',
    confidence: 0.97,
  },
  {
    id: 'de-gr-fuss',
    from: /\bFuss\b/g,
    to: 'Fuß',
    confidence: 0.97,
  },
  {
    id: 'de-gr-fuesse',
    from: /\bFüsse\b/g,
    to: 'Füße',
    confidence: 0.97,
  },
  // Langer Vokal ä + ss → ß
  {
    id: 'de-gr-gemaess',
    from: /\bgemäss\b/gi,
    to: 'gemäß',
    confidence: 0.96,
  },
  {
    id: 'de-gr-regelmaessig',
    from: /\bregelmässig\b/gi,
    to: 'regelmäßig',
    confidence: 0.96,
  },
  {
    id: 'de-gr-maessig',
    from: /\bmässig\b/gi,
    to: 'mäßig',
    confidence: 0.95,
  },
  {
    id: 'de-gr-gewissermassen',
    from: /\bgewissermassen\b/gi,
    to: 'gewissermaßen',
    confidence: 0.96,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // ALTE_RECHTSCHREIBUNG – veraltete ß-Schreibungen (vor Reform 1996)
  // Nach kurzem Vokal: ß → ss (Neuregelung)
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'de-gr-dass-alt',
    from: /\bdaß/g,
    to: 'dass',
    confidence: 0.98,
  },
  {
    id: 'de-gr-muss-alt',
    from: /\bmuß/g,
    to: 'muss',
    confidence: 0.98,
  },
  {
    id: 'de-gr-muesste-alt',
    from: /\bmüßte\b/g,
    to: 'müsste',
    confidence: 0.98,
  },
  {
    id: 'de-gr-lass-alt',
    from: /\blaß/g,
    to: 'lass',
    confidence: 0.97,
  },
  {
    id: 'de-gr-fluss-alt',
    from: /\bFluß/g,
    to: 'Fluss',
    confidence: 0.98,
  },
  {
    id: 'de-gr-schluss-alt',
    from: /\bSchluß/g,
    to: 'Schluss',
    confidence: 0.98,
  },
  {
    id: 'de-gr-abschluss-alt',
    from: /\bAbschluß/g,
    to: 'Abschluss',
    confidence: 0.98,
  },
  {
    id: 'de-gr-anschluss-alt',
    from: /\bAnschluß/g,
    to: 'Anschluss',
    confidence: 0.98,
  },
  {
    id: 'de-gr-einfluss-alt',
    from: /\bEinfluß/g,
    to: 'Einfluss',
    confidence: 0.98,
  },
  {
    id: 'de-gr-genuss-alt',
    from: /\bGenuß/g,
    to: 'Genuss',
    confidence: 0.98,
  },
  {
    id: 'de-gr-kuss-alt',
    from: /\bKuß/g,
    to: 'Kuss',
    confidence: 0.98,
  },
  {
    id: 'de-gr-riss-alt',
    from: /\bRiß/g,
    to: 'Riss',
    confidence: 0.98,
  },
  {
    id: 'de-gr-biss-alt',
    from: /\bBiß/g,
    to: 'Biss',
    confidence: 0.98,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // REDUNDANZ – redundante Doppelungen (Pleonasmen)
  // Nur bei eindeutiger Redundanz; stilistisch bewusste Wiederholung
  // wird nicht korrigiert.
  // ═══════════════════════════════════════════════════════════════════════
  {
    id: 'de-gr-bereits-schon',
    from: /\bbereits\s+schon\b/gi,
    to: 'bereits',
    confidence: 0.93,
  },
  {
    id: 'de-gr-nochmals-wieder',
    from: /\bnochmals\s+wieder\b/gi,
    to: 'nochmals',
    confidence: 0.91,
  },
  {
    id: 'de-gr-aber-jedoch',
    from: /\baber\s+jedoch\b/gi,
    to: 'jedoch',
    confidence: 0.90,
  },
  {
    id: 'de-gr-aber-trotzdem',
    from: /\baber\s+trotzdem\b/gi,
    to: 'trotzdem',
    confidence: 0.88,
  },
  // „einzigste" ist kein Superlativ — „einzig" hat keine Steigerung
  {
    id: 'de-gr-einzigste',
    from: /\beinzigst(e[rsnm]?)\b/gi,
    to: 'einzig$1',
    confidence: 0.94,
  },
  // „optimalste" — „optimal" ist bereits Superlativ
  {
    id: 'de-gr-optimalste',
    from: /\boptimalst(e[rsnm]?)\b/gi,
    to: 'optimal$1',
    confidence: 0.91,
  },
];
