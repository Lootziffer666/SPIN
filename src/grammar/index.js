/**
 * SPIN Grammar Module — Einstiegspunkt
 *
 * Bündelt alle Grammatik-Komponenten aus Flow2 für die Verwendung in SPIN.
 * Dieses Modul gehört langfristig in ein eigenes Shared-Package,
 * das von FLOW und SPIN gleichermaßen konsumiert wird.
 * Prinzip: "Eine Erweiterung, zwei Nutzen."
 *
 * Komponenten:
 *   clauseDetector     — Satz- und Teilsatz-Analyse (Satzstruktur-Topologie)
 *   GR_RULES           — Deutsche Grammatik-Normalisierungsregeln
 *   EN_GR_RULES        — Englische Grammatik-Normalisierungsregeln
 *   contextWindowRules — Multi-Token-Kontextregeln
 *   phonotactics       — Phonotaktischer Validator (exotischer Analyseansatz)
 */

export {
  detectClauses,
  splitSentences,
  SUBORDINATING_DE,
  COORDINATING_DE,
  SUBORDINATING_EN,
  COORDINATING_EN,
} from './clauseDetector.js';

export { GR_RULES } from './rules.gr.js';

export { EN_GR_RULES } from './rules.en.gr.js';

export { contextWindowRules } from './contextWindowRules.js';

export {
  checkPhonotactics,
  analyzeTextPhonotactics,
  sonorityProfile,
  findSonorityViolations,
  checkSyllableWeight,
  featureDistance,
  VOICING_PAIRS,
  ILLEGAL_BIGRAMS_INTERNAL,
  ILLEGAL_ONSETS,
} from './phonotactics.js';
