/**
 * GR – Grammatik-Normalisierung
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
 *   KOMMA_NEBENSATZ    – fehlendes Komma vor unterordnender Konjunktion
 *   APOSTROPH_GENITIV  – englisch-influenzierter Genitiv-Apostroph
 *   WORD_REPEAT        – Wortwiederholung bei Funktionswörtern
 *   GETRENNTSCHREIBUNG – falsch getrennte Komposita (Konnektoren)
 *   ALS_WIE            – redundantes „als wie" in Komparativen
 *
 * Hinweis: Dieses Modul gehört langfristig in ein eigenes Shared-Package,
 * das von FLOW und SPIN gleichermaßen konsumiert wird.
 */

export const GR_RULES = [
  // GETRENNTSCHREIBUNG
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

  // KOMMA_NEBENSATZ
  {
    id: 'de-gr-komma-nebensatz',
    from: /([^\s,;:!?.()\[\]{}])(\s+)(dass|weil|obwohl|ob|wenn|falls|nachdem|bevor|sobald|solange)\b/gi,
    to: '$1,$2$3',
    confidence: 0.88,
  },
  {
    id: 'de-gr-komma-nach-koordinator-undo',
    from: /\b(und|oder|aber|sondern|denn|weder|entweder),(\s+)(dass|weil|obwohl|ob|wenn|falls|nachdem|bevor|sobald|solange)\b/gi,
    to: '$1$2$3',
    confidence: 0.99,
  },

  // APOSTROPH_GENITIV
  {
    id: 'de-gr-apostroph-genitiv',
    from: /\b([A-ZÄÖÜ][a-zäöü]*[^szxßSZX\s])'s\b/g,
    to: '$1s',
    confidence: 0.92,
  },

  // WORD_REPEAT
  {
    id: 'de-gr-word-repeat',
    from: /\b(der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines|und|oder|aber|ich|du|er|sie|es|wir|ihr|sie|auf|in|mit|von|zu|an|für|bei|nach|über|unter|vor|hinter|neben|zwischen)\s+\1\b/gi,
    to: '$1',
    confidence: 0.96,
  },

  // ALS_WIE
  {
    id: 'de-gr-als-wie',
    from: /\bals\s+wie\b/gi,
    to: 'als',
    confidence: 0.91,
  },
];
