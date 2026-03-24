/**
 * SPIN — Hauptmodul
 *
 * Exportiert alle öffentlichen APIs des SPIN-Systems.
 * Einstiegspunkt für programmatische Nutzung und LOOM-Anbindung.
 */

export { CHUNK_TYPES, DOGMA_RULES, META_MARKERS, NULL_MARKERS } from './config.js';
export { runDiagnosis, getChunkText } from './diagnosis.js';
export { earcon } from './earcons.js';
export { initSpin, parseSentence } from './ui.js';

export {
  detectClauses,
  splitSentences,
  GR_RULES,
  contextWindowRules,
} from './grammar/index.js';
