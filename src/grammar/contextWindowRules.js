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
];
