/**
 * Phonotaktischer Validator für Deutsch
 *
 * Exotischer Analyseansatz: Nutzt die phonotaktischen Constraints der
 * deutschen Sprache als heuristische Fehlererkennungsebene.
 *
 * Theoretische Grundlagen:
 *   - Sonority Sequencing Principle (SSP, Clements 1990)
 *   - Deutsche Phonotaktik (Wiese 1996, Hall 2000)
 *   - Silbengewicht-Orthographie-Korrespondenz
 *   - Feature Geometry (Clements & Hume 1995) für Merkmalsdistanz
 *
 * Drei Analysedimensionen:
 *   1. Illegale Bigramme — Buchstabenkombinationen, die in deutschen
 *      Wörtern nicht vorkommen (wortintern, nicht an Morphemgrenzen).
 *   2. Sonoritätsprofil — Verstöße gegen das Sonoritätssequenzprinzip
 *      signalisieren mögliche Buchstabendreher oder Auslassungen.
 *   3. Silbengewicht-Heuristik — Generalisierung der ss/ß-Regel:
 *      Nach kurzem Vokal → Konsonantenverdoppelung erwartet.
 *
 * Dieses Modul korrigiert NICHT, es flaggt nur.
 * Ergebnis: Analyseobjekt mit Verdachtsstellen und Konfidenz.
 *
 * Prinzip: „Eine Erweiterung, zwei Nutzen."
 */

// ═══════════════════════════════════════════════════════════════════════
// ILLEGALE BIGRAMME
// Buchstabenkombinationen, die in nativen deutschen Wörtern nicht
// vorkommen (wortintern). Fremdwörter werden über eine Ausnahmeliste
// toleriert.
// ═══════════════════════════════════════════════════════════════════════

/**
 * Bigramme, die in deutschen Erbwörtern nie wortintern auftreten.
 * Geordnet nach Kategorie für Nachvollziehbarkeit.
 */
export const ILLEGAL_BIGRAMS_INTERNAL = new Set([
  // Stimmhafter Plosiv + stimmhafter Plosiv (gleiche Artikulationsstelle)
  'db', 'bd', 'gb', 'bg',
  // Stimmloser Plosiv + stimmloser Plosiv (gleiche Artikulationsstelle)
  'tp', 'pt', 'kp', 'pk',
  // Nasal + Nasal (verschiedene Artikulationsstelle, nicht an Morphemgrenzen)
  'mn', 'nm',
  // Doppelkonsonanten, die im Deutschen nicht existieren
  'qq', 'vv', 'yy', 'xx',
  // Sonstige unmögliche Sequenzen (NUR wortintern, NICHT an Morphemgrenzen)
  // Hinweis: dl, tl, dm, dn, bm, bn, gm entfernt — kommen an Morphemgrenzen
  // häufig vor (freundlich, deutlich, widmen, ordnen, Abmessung, Segment).
  'gn',
  'tm',
]);

/**
 * Bigramme, die am Wortanfang in deutschen Erbwörtern nicht vorkommen.
 * (Fremdwörter wie „Psychologie" haben eigene Onset-Cluster.)
 */
export const ILLEGAL_ONSETS = new Set([
  'gm', 'tl', 'dl', 'tm', 'pt', 'pn', 'ng',
  'sr', 'lr', 'nr', 'mr',
  'bk', 'dk', 'gk',
  'fb', 'vb',
]);

/**
 * Bekannte Fremdwort-Ausnahmen, die illegale Bigramme enthalten.
 * Schlüssel: illegales Bigramm, Wert: Set erlaubter Wörter.
 */
const FOREIGN_EXCEPTIONS = new Map([
  ['gn', new Set(['signal', 'design', 'kognition', 'kognitiv', 'diagnosis', 'gnosis', 'gnu', 'gnade'])],
  ['pt', new Set(['option', 'optimal', 'rezept', 'konzept', 'skript', 'krypt'])],
  ['pn', new Set(['pneum'])],  // Pneumonie etc.
  ['mn', new Set(['hymn', 'amnest', 'gymnast'])],
]);

// ═══════════════════════════════════════════════════════════════════════
// SONORITÄTSHIERARCHIE
// Sonority Sequencing Principle: Silbenonset steigt in Sonorität,
// Silbenkoda fällt. Verstöße = möglicher Fehler.
// ═══════════════════════════════════════════════════════════════════════

/**
 * Sonoritätswerte für deutsche Grapheme (vereinfacht).
 * Höherer Wert = höhere Sonorität.
 *
 * Skala: Plosive(1) < Frikative(2) < Nasale(3) < Liquide(4) < Glides(5) < Vokale(6)
 */
const SONORITY = {
  // Plosive
  p: 1, b: 1, t: 1, d: 1, k: 1, g: 1,
  // Frikative
  f: 2, v: 2, s: 2, z: 2, ß: 2, x: 2, j: 2, h: 2,
  // Affrikaten (behandelt als Frikative)
  c: 2, q: 1,
  // Nasale
  m: 3, n: 3,
  // Liquide
  l: 4, r: 4,
  // Glides
  w: 5,
  // Vokale
  a: 6, e: 6, i: 6, o: 6, u: 6,
  ä: 6, ö: 6, ü: 6, y: 6,
};

/**
 * Berechnet das Sonoritätsprofil eines Wortes.
 * @param {string} word
 * @returns {number[]} Array von Sonoritätswerten
 */
export function sonorityProfile(word) {
  return [...word.toLowerCase()].map(ch => SONORITY[ch] ?? 0);
}

/**
 * Erkennt Sonoritätsverstöße in einem Wort.
 * Ein Verstoß liegt vor, wenn innerhalb einer Silbe die Sonorität
 * zum Nukleus hin nicht steigt oder von ihm weg nicht fällt.
 *
 * Vereinfachte Heuristik: Prüft auf plötzliche Sonoritätstäler
 * zwischen zwei Vokalen (= wahrscheinlicher Buchstabendreher).
 *
 * @param {string} word
 * @returns {Array<{position: number, bigram: string, type: string}>}
 */
export function findSonorityViolations(word) {
  const violations = [];
  const lower = word.toLowerCase();
  const profile = sonorityProfile(lower);

  for (let i = 1; i < profile.length - 1; i++) {
    const prev = profile[i - 1];
    const curr = profile[i];
    const next = profile[i + 1];

    // Sonoritätsplateau zwischen zwei Konsonanten gleicher Sonorität,
    // eingebettet zwischen höheren Werten = verdächtig
    if (curr > 0 && curr < 6 && prev === 6 && next === 6) {
      // Einzelner Konsonant zwischen Vokalen — normal
      continue;
    }

    // Zwei benachbarte Konsonanten mit Sonoritätstal (1→1 oder 2→1 nach Vokal)
    if (curr < 3 && prev < 3 && curr <= prev && i >= 2 && profile[i - 2] === 6) {
      violations.push({
        position: i,
        bigram: lower[i - 1] + lower[i],
        type: 'sonority-valley',
      });
    }
  }

  return violations;
}

// ═══════════════════════════════════════════════════════════════════════
// SILBENGEWICHT-HEURISTIK
// Generalisierung der ss/ß-Regel: deutsche Orthographie korreliert
// mit Silbengewicht. Nach kurzem Vokal: Konsonant verdoppelt.
// Nach langem Vokal/Diphthong: Konsonant einfach.
// ═══════════════════════════════════════════════════════════════════════

/** Deutsche Diphthonge und Langvokal-Marker */
const LONG_VOWEL_MARKERS = [
  'ie', 'ei', 'au', 'eu', 'äu',     // Diphthonge
  'ah', 'eh', 'ih', 'oh', 'uh',     // Dehnungs-h
  'äh', 'öh', 'üh',                 // Dehnungs-h mit Umlaut
  'aa', 'ee', 'oo',                 // Doppelvokale
];

/** Konsonanten, die nach kurzem Vokal verdoppelt werden */
const DOUBLING_CONSONANTS = new Set([
  'b', 'd', 'f', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'z',
]);

/**
 * Prüft, ob ein Vokalcluster auf einen langen Vokal hindeutet.
 * @param {string} text - Textstück vor dem Konsonanten
 * @returns {boolean}
 */
function hasLongVowelBefore(text) {
  const lower = text.toLowerCase();
  return LONG_VOWEL_MARKERS.some(marker => lower.endsWith(marker));
}

/**
 * Analysiert Silbengewicht-Verdachtsstellen.
 * Findet Stellen, an denen die Konsonantenanzahl nicht zur Vokallänge passt.
 *
 * Rückgabe: Array von Verdachtsstellen (keine Korrekturen!).
 *
 * @param {string} word
 * @returns {Array<{position: number, pattern: string, expected: string, type: string}>}
 */
export function checkSyllableWeight(word) {
  const suspects = [];
  const lower = word.toLowerCase();

  for (let i = 0; i < lower.length - 1; i++) {
    const ch = lower[i];
    const next = lower[i + 1];

    if (!DOUBLING_CONSONANTS.has(ch)) continue;

    // Fall 1: Doppelkonsonant nach langem Vokal = verdächtig
    if (ch === next && i >= 2) {
      const before = lower.slice(0, i);
      if (hasLongVowelBefore(before)) {
        suspects.push({
          position: i,
          pattern: ch + next,
          expected: ch,
          type: 'double-after-long',
        });
      }
    }

    // Fall 2: Einzelkonsonant nach kurzem Vokal (VCV-Muster) = verdächtig
    // Nur wenn der Konsonant einzeln zwischen zwei Vokalen steht
    if (ch !== next && i >= 1 && i < lower.length - 1) {
      const prevCh = lower[i - 1];
      const isVowelBefore = 'aeiouyäöü'.includes(prevCh);
      const isVowelAfter = 'aeiouyäöü'.includes(next);

      if (isVowelBefore && isVowelAfter && !hasLongVowelBefore(lower.slice(0, i))) {
        // Einzelkonsonant zwischen kurzen Vokalen — Verdoppelung erwartet?
        // Nur flaggen wenn kein Dehnungs-h oder Diphthong davor
        suspects.push({
          position: i,
          pattern: ch,
          expected: ch + ch,
          type: 'single-after-short',
        });
      }
    }
  }

  return suspects;
}

// ═══════════════════════════════════════════════════════════════════════
// MERKMALSDISTANZ (Feature Distance)
// Phonologische Feature Geometry: Berechnet die Merkmalsdistanz
// zwischen zwei Konsonanten. Dient als Konfidenzmetrik:
// - Distanz 1 (nur [±voice]) = hochwahrscheinliche Verwechslung (LRS)
// - Distanz 2+ = unwahrscheinliche Verwechslung
// ═══════════════════════════════════════════════════════════════════════

/**
 * Phonologische Merkmale deutscher Konsonanten.
 * Features: [voice, place, manner]
 * Place: 0=labial, 1=alveolar, 2=palatal, 3=velar, 4=glottal
 * Manner: 0=plosive, 1=fricative, 2=nasal, 3=liquid, 4=glide
 */
const FEATURES = {
  p: { voice: false, place: 0, manner: 0 },
  b: { voice: true,  place: 0, manner: 0 },
  t: { voice: false, place: 1, manner: 0 },
  d: { voice: true,  place: 1, manner: 0 },
  k: { voice: false, place: 3, manner: 0 },
  g: { voice: true,  place: 3, manner: 0 },
  f: { voice: false, place: 0, manner: 1 },
  v: { voice: true,  place: 0, manner: 1 },
  s: { voice: false, place: 1, manner: 1 },
  z: { voice: true,  place: 1, manner: 1 },
  m: { voice: true,  place: 0, manner: 2 },
  n: { voice: true,  place: 1, manner: 2 },
  l: { voice: true,  place: 1, manner: 3 },
  r: { voice: true,  place: 1, manner: 3 },
  w: { voice: true,  place: 0, manner: 4 },
  j: { voice: true,  place: 2, manner: 4 },
  h: { voice: false, place: 4, manner: 1 },
};

/**
 * Berechnet die Merkmalsdistanz zwischen zwei Konsonanten.
 * @param {string} a - Erster Konsonant
 * @param {string} b - Zweiter Konsonant
 * @returns {number} Distanz (0 = identisch, 1 = eine Feature-Änderung, etc.)
 *                   -1 wenn ein Zeichen nicht in der Feature-Tabelle ist
 */
export function featureDistance(a, b) {
  const fa = FEATURES[a.toLowerCase()];
  const fb = FEATURES[b.toLowerCase()];
  if (!fa || !fb) return -1;

  let dist = 0;
  if (fa.voice !== fb.voice) dist++;
  if (fa.place !== fb.place) dist++;
  if (fa.manner !== fb.manner) dist++;
  return dist;
}

/**
 * Minimale Paare durch Auslautverhärtung (Feature-Distanz = 1, nur [±voice]).
 * Diese Paare sind die häufigsten LRS-Verwechslungen bei Wortendungen.
 */
export const VOICING_PAIRS = [
  ['b', 'p'],
  ['d', 't'],
  ['g', 'k'],
  ['v', 'f'],
  ['z', 's'],
];

// ═══════════════════════════════════════════════════════════════════════
// HAUPTFUNKTION: Phonotaktische Analyse
// ═══════════════════════════════════════════════════════════════════════

/**
 * Führt eine vollständige phonotaktische Analyse eines Wortes durch.
 *
 * @param {string} word - Einzelnes Wort
 * @returns {{
 *   word: string,
 *   illegalBigrams: Array<{position: number, bigram: string}>,
 *   sonorityViolations: Array<{position: number, bigram: string, type: string}>,
 *   syllableWeightSuspects: Array<{position: number, pattern: string, expected: string, type: string}>,
 *   hasSuspects: boolean,
 *   suspectCount: number,
 * }}
 */
export function checkPhonotactics(word) {
  const lower = word.toLowerCase();

  // 1. Illegale Bigramme (wortintern)
  const illegalBigrams = [];
  for (let i = 0; i < lower.length - 1; i++) {
    const bigram = lower[i] + lower[i + 1];

    if (ILLEGAL_BIGRAMS_INTERNAL.has(bigram)) {
      // Prüfe Fremdwort-Ausnahmen
      const exceptions = FOREIGN_EXCEPTIONS.get(bigram);
      if (exceptions && [...exceptions].some(exc => lower.includes(exc))) {
        continue;
      }
      illegalBigrams.push({ position: i, bigram });
    }
  }

  // Wortanfang prüfen
  if (lower.length >= 2) {
    const onset = lower[0] + lower[1];
    if (ILLEGAL_ONSETS.has(onset)) {
      const exceptions = FOREIGN_EXCEPTIONS.get(onset);
      if (!(exceptions && [...exceptions].some(exc => lower.includes(exc)))) {
        illegalBigrams.push({ position: 0, bigram: onset });
      }
    }
  }

  // 2. Sonoritätsverstöße
  const sonorityViolations = findSonorityViolations(word);

  // 3. Silbengewicht
  const syllableWeightSuspects = checkSyllableWeight(word);

  const suspectCount =
    illegalBigrams.length +
    sonorityViolations.length +
    syllableWeightSuspects.length;

  return {
    word,
    illegalBigrams,
    sonorityViolations,
    syllableWeightSuspects,
    hasSuspects: suspectCount > 0,
    suspectCount,
  };
}

/**
 * Analysiert einen ganzen Text phonotaktisch.
 * Teilt in Wörter und prüft jedes einzeln.
 *
 * @param {string} text
 * @returns {Array<{word: string, illegalBigrams: Array, sonorityViolations: Array, syllableWeightSuspects: Array, hasSuspects: boolean, suspectCount: number}>}
 *   Nur Wörter MIT Verdachtsstellen werden zurückgegeben.
 */
export function analyzeTextPhonotactics(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const results = [];

  for (const word of words) {
    // Satzzeichen am Ende entfernen
    const clean = word.replace(/[,.;:!?"""„"()[\]{}]+$/g, '').replace(/^[,.;:!?"""„"()[\]{}]+/g, '');
    if (clean.length < 2) continue;

    const analysis = checkPhonotactics(clean);
    if (analysis.hasSuspects) {
      results.push(analysis);
    }
  }

  return results;
}
