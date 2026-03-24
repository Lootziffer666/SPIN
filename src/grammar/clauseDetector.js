/**
 * clauseDetector – Satz- und Teilsatz-Analyse
 *
 * Eigenständiges Modul für die Erkennung von Satzstrukturen.
 * Ursprung: Flow2 (Lootziffer666/Flow2) — übernommen als geteiltes Modul.
 *
 * Entwickelt mit Blick auf Nutzung durch SPIN:
 *   SPIN zerlegt Sätze in Chunks (Subjekt, Prädikat, Objekt, …) und stellt
 *   Struktur visuell dar. Das clauseDetector-Modul liefert die rohe
 *   Satz-Topologie, die SPIN als Eingabe für das Chunking verwenden kann.
 *
 * Vorbild: Constraint Grammar (Karlsson 1990) – deterministisch, regelbasiert,
 * keine stochastischen Modelle. Jeder Ausgabewert ist auf eine explizite
 * Regel zurückführbar.
 *
 * Hinweis: Dieses Modul gehört langfristig in ein eigenes Shared-Package,
 * das von FLOW und SPIN gleichermaßen konsumiert wird.
 * Prinzip: "Eine Erweiterung, zwei Nutzen."
 */

// ---------------------------------------------------------------------------
// Konjunktionslisten (DE)
// ---------------------------------------------------------------------------

/** Unterordnende Konjunktionen (DE) – leiten Nebensätze ein */
export const SUBORDINATING_DE = new Set([
  'dass', 'weil', 'obwohl', 'obgleich', 'obschon',
  'wenn', 'falls', 'sofern', 'soweit',
  'ob',
  'während', 'nachdem', 'bevor', 'ehe', 'bis', 'seit', 'seitdem', 'sobald', 'solange',
  'damit', 'sodass', 'so dass',
  'indem', 'dadurch dass',
  'da', 'zumal',
  'als',
  'wie',
  'wenngleich', 'wennschon',
]);

/** Beiordnende Konjunktionen (DE) – verbinden gleichrangige Teilsätze */
export const COORDINATING_DE = new Set([
  'und', 'oder', 'aber', 'sondern', 'denn',
  'doch', 'jedoch', 'allerdings',
  'trotzdem', 'dennoch',
  'außerdem', 'zudem', 'überdies',
  'deshalb', 'daher', 'darum', 'deswegen',
  'nämlich', 'also',
  'entweder', 'weder', 'sowohl',
]);

// ---------------------------------------------------------------------------
// Konjunktionslisten (EN)
// ---------------------------------------------------------------------------

/** Subordinating conjunctions (EN) */
export const SUBORDINATING_EN = new Set([
  'that', 'because', 'since', 'as',
  'although', 'though', 'even though', 'whereas',
  'if', 'unless', 'provided', 'in case',
  'when', 'while', 'after', 'before', 'until', 'once', 'as soon as',
  'so that', 'in order that',
  'whether',
]);

/** Coordinating conjunctions (EN) */
export const COORDINATING_EN = new Set([
  'and', 'or', 'but', 'nor', 'for', 'yet', 'so',
  'however', 'therefore', 'thus', 'nevertheless', 'nonetheless',
  'furthermore', 'moreover', 'besides',
]);

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

/**
 * Zerlegt Text in einzelne Sätze (einfache Heuristik).
 * Teilt an `.`, `!`, `?` gefolgt von Leerzeichen und Großbuchstaben.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function splitSentences(text) {
  const src = String(text || '').trim();
  if (!src) return [];
  const parts = src.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ])/u);
  return parts.map((s) => s.trim()).filter(Boolean);
}

/**
 * Findet alle unterordnenden Konjunktionen in einem Satz.
 *
 * @param {string} sentence
 * @param {Set<string>} conjunctionSet
 * @returns {Array<{ conjunction: string, charOffset: number }>}
 */
function findSubordinatingConjunctions(sentence, conjunctionSet) {
  const results = [];
  const lower = sentence.toLowerCase();

  for (const conj of conjunctionSet) {
    let searchFrom = 0;
    while (true) {
      const idx = lower.indexOf(conj, searchFrom);
      if (idx === -1) break;

      const before = idx === 0 ? ' ' : lower[idx - 1];
      const after = idx + conj.length >= lower.length ? ' ' : lower[idx + conj.length];
      const isBoundaryBefore = /\W/.test(before);
      const isBoundaryAfter = /\W/.test(after);

      if (isBoundaryBefore && isBoundaryAfter) {
        results.push({ conjunction: conj, charOffset: idx });
      }
      searchFrom = idx + 1;
    }
  }

  results.sort((a, b) => a.charOffset - b.charOffset);
  return results;
}

/**
 * Findet alle beiordnenden Konjunktionen in einem Satz.
 *
 * @param {string} sentence
 * @param {Set<string>} conjunctionSet
 * @returns {string[]}
 */
function findCoordinatingJunctions(sentence, conjunctionSet) {
  const found = [];
  const lower = sentence.toLowerCase();

  for (const conj of conjunctionSet) {
    const idx = lower.indexOf(conj);
    if (idx === -1) continue;

    const before = idx === 0 ? ' ' : lower[idx - 1];
    const after = idx + conj.length >= lower.length ? ' ' : lower[idx + conj.length];
    if (/\W/.test(before) && /\W/.test(after)) {
      found.push(conj);
    }
  }

  return [...new Set(found)];
}

/**
 * Klassifiziert die Satzkomplexität basierend auf gefundenen Konjunktionen.
 *
 * @param {Array} subordinateClauses
 * @param {string[]} coordinatingJunctions
 * @returns {'simple'|'compound'|'complex'|'compound-complex'}
 */
function classifyComplexity(subordinateClauses, coordinatingJunctions) {
  const hasSub = subordinateClauses.length > 0;
  const hasCoord = coordinatingJunctions.length > 0;

  if (hasSub && hasCoord) return 'compound-complex';
  if (hasSub) return 'complex';
  if (hasCoord) return 'compound';
  return 'simple';
}

// ---------------------------------------------------------------------------
// Hauptfunktion
// ---------------------------------------------------------------------------

/**
 * Analysiert die Satz- und Teilsatzstruktur eines Textes.
 *
 * @param {string} text    - Eingabetext (normalisiert oder roh)
 * @param {string} [lang]  - 'de' (Standard) oder 'en'
 * @returns {{
 *   sentences: Array<{
 *     text: string,
 *     complexity: string,
 *     subordinateClauses: Array<{conjunction: string, charOffset: number}>,
 *     coordinatingJunctions: string[]
 *   }>,
 *   stats: {
 *     totalSentences: number,
 *     complexSentences: number,
 *     avgClausesPerSentence: number,
 *     allSubordinatingConjunctions: string[]
 *   }
 * }}
 */
export function detectClauses(text, lang = 'de') {
  const langValue = String(lang || 'de').toLowerCase() === 'en' ? 'en' : 'de';
  const subConjSet = langValue === 'en' ? SUBORDINATING_EN : SUBORDINATING_DE;
  const coordConjSet = langValue === 'en' ? COORDINATING_EN : COORDINATING_DE;

  const sentences = splitSentences(String(text || ''));

  const analyzedSentences = sentences.map((sentText) => {
    const subordinateClauses = findSubordinatingConjunctions(sentText, subConjSet);
    const coordinatingJunctions = findCoordinatingJunctions(sentText, coordConjSet);
    const complexity = classifyComplexity(subordinateClauses, coordinatingJunctions);

    return {
      text: sentText,
      complexity,
      subordinateClauses,
      coordinatingJunctions,
    };
  });

  const complexSentences = analyzedSentences.filter(
    (s) => s.complexity === 'complex' || s.complexity === 'compound-complex'
  ).length;

  const totalClauseSegments = analyzedSentences.reduce(
    (sum, s) => sum + 1 + s.subordinateClauses.length,
    0
  );

  const allSubordinatingConjunctions = [
    ...new Set(
      analyzedSentences.flatMap((s) => s.subordinateClauses.map((c) => c.conjunction))
    ),
  ];

  return {
    sentences: analyzedSentences,
    stats: {
      totalSentences: analyzedSentences.length,
      complexSentences,
      avgClausesPerSentence:
        analyzedSentences.length > 0 ? totalClauseSegments / analyzedSentences.length : 0,
      allSubordinatingConjunctions,
    },
  };
}
