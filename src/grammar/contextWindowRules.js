/**
 * FLOW Context Window Rules – Multi-Token-Regeln
 *
 * Ursprung: Flow2 (Lootziffer666/Flow2) — übernommen als geteiltes Modul.
 *
 * Diese Regeln betrachten 2–5 Wörter gleichzeitig.
 * Sie sind bewusst konservativ und nur dann aktiv, wenn die Sicherheit hoch ist.
 *
 * Hinweis: Dieses Modul gehört langfristig in ein eigenes Shared-Package,
 * das von FLOW und SPIN gleichermaßen konsumiert wird.
 */

export const contextWindowRules = [
  // ==================== DEUTSCH ====================
  {
    id: 'de-weil-dass',
    lang: 'de',
    description: 'Nach "weil" oder "ob" immer "dass" statt "das"',
    pattern: /\b(weil|ob)\s+das\b/gi,
    replacement: '$1 dass',
    confidence: 0.97,
    scope: 'context',
    disabledByDefault: true,
  },
  {
    id: 'de-seit-seid',
    lang: 'de',
    description: 'Seit vs. seid nur im Kontext von Zeit vs. Imperativ',
    pattern: /\bseit\b(?!\s+[\d])/gi,
    replacement: 'seid',
    confidence: 0.85,
    scope: 'context',
    disabledByDefault: true,
  },

  // ==================== ENGLISCH ====================
  {
    id: 'en-standalone-i',
    lang: 'en',
    description: 'Standalone lowercase i → I',
    pattern: /\bi\b/g,
    replacement: 'I',
    confidence: 0.98,
    scope: 'surface',
  },
  {
    id: 'en-then-than',
    lang: 'en',
    description: 'then vs. than im Vergleichskontext',
    pattern: /\bthen\s+than\b/gi,
    replacement: 'than',
    confidence: 0.88,
    scope: 'context',
  },
  {
    id: 'en-its-its',
    lang: 'en',
    description: "its vs. it's – nur bei klarem Besitz-Kontext",
    pattern: /\bits\b(?!\s+is)/gi,
    replacement: "it's",
    confidence: 0.65,
    scope: 'context',
    disabledByDefault: true,
  },

  // ==================== BEIDE SPRACHEN ====================
  {
    id: 'universal-space-before-punct',
    lang: 'both',
    description: 'Leerzeichen vor Satzzeichen entfernen',
    pattern: /\s+([,.;:!?])/g,
    replacement: '$1',
    confidence: 0.99,
    scope: 'surface',
  },
  {
    id: 'universal-multiple-spaces',
    lang: 'both',
    description: 'Mehrere Leerzeichen auf eines reduzieren',
    pattern: /[ \t]{2,}/g,
    replacement: ' ',
    confidence: 0.99,
    scope: 'surface',
  },

  // ==================== EXOTISCHE KONTEXTREGELN (DE) ====================
  // Basierend auf Recherche: Constraint Grammar (Karlsson 1990),
  // Optimality Theory, Feature Geometry.
  {
    id: 'de-wider-wieder',
    lang: 'de',
    description: 'wider (= gegen) vs. wieder (= erneut): Nach "immer" und "schon" → "wieder"',
    pattern: /\b(immer|schon)\s+wider\b/gi,
    replacement: '$1 wieder',
    confidence: 0.92,
    scope: 'context',
  },
  {
    id: 'de-wieder-wider-spiegeln',
    lang: 'de',
    description: 'widerspiegeln schreibt sich mit "wider" (= gegen), nicht "wieder"',
    pattern: /\bwiederspiegeln\b/gi,
    replacement: 'widerspiegeln',
    confidence: 0.97,
    scope: 'context',
  },
  {
    id: 'de-wieder-wider-spruch',
    lang: 'de',
    description: 'Widerspruch schreibt sich mit "wider" (= gegen), nicht "wieder"',
    pattern: /\bwiederspruch\b/gi,
    replacement: 'Widerspruch',
    confidence: 0.97,
    scope: 'context',
  },
  {
    id: 'de-wieder-wider-stand',
    lang: 'de',
    description: 'Widerstand schreibt sich mit "wider" (= gegen), nicht "wieder"',
    pattern: /\bwiederstand\b/gi,
    replacement: 'Widerstand',
    confidence: 0.96,
    scope: 'context',
  },
  {
    id: 'de-tod-tot',
    lang: 'de',
    description: 'todmüde/todlangweilig — Vorsilbe „tod" (nicht „tot") bei Verstärkung',
    pattern: /\btot(müde|langweilig|sicher|ernst|unglücklich|traurig|still|schick|schlag)\b/gi,
    replacement: 'tod$1',
    confidence: 0.94,
    scope: 'context',
  },
  {
    id: 'de-standard-standart',
    lang: 'de',
    description: '„Standart" → „Standard" (häufigster LRS-Fehler, phonetisch motiviert)',
    pattern: /\bStandart\b/g,
    replacement: 'Standard',
    confidence: 0.99,
    scope: 'context',
  },
  {
    id: 'de-standard-standart-lower',
    lang: 'de',
    description: '„standart" → „standard" in Komposita',
    pattern: /\bstandart/gi,
    replacement: 'standard',
    confidence: 0.97,
    scope: 'context',
  },
  {
    id: 'de-seid-seit-zeit',
    lang: 'de',
    description: 'Vor Zeitangaben (Jahren, Monaten, Wochen, Tagen, Stunden, gestern, langem) → „seit" (temporal)',
    pattern: /\bseid\s+(Jahren|Monaten|Wochen|Tagen|Stunden|Minuten|gestern|heute|morgen|langem|kurzem|jeher|dem|damals|einiger)\b/gi,
    replacement: 'seit $1',
    confidence: 0.96,
    scope: 'context',
  },
];
