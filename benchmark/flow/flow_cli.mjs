#!/usr/bin/env node
/**
 * SPIN FLOW CLI — Evaluates text using SPIN's actual grammar/analysis modules
 *
 * This replaces the mock stub with real SPIN evaluations.
 *
 * Contract:
 * In:  { protocol_id, protocol_version, protocol_hash, params, example:{id,input,category,subcategory} }
 * Out: { ok:boolean, output:any|null, diagnostics:any, score:number }
 *
 * Evaluation components:
 *   - Grammar rules (GR_RULES) — regex-based German grammar checks
 *   - Context window rules — multi-token context-aware checks
 *   - Clause detection — sentence topology analysis
 *   - Phonotactics — phonotactic constraint validation
 */
import { GR_RULES } from "../../src/grammar/rules.gr.js";
import { contextWindowRules } from "../../src/grammar/contextWindowRules.js";
import { detectClauses, splitSentences } from "../../src/grammar/clauseDetector.js";
import {
  checkPhonotactics,
} from "../../src/grammar/phonotactics.js";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
  });
}

/**
 * Run all GR_RULES against the input text.
 * Returns array of { rule_id, match, index, confidence }.
 */
function evaluateGrammarRules(text) {
  const findings = [];
  for (const rule of GR_RULES) {
    const regex = new RegExp(rule.from.source, rule.from.flags);
    let m;
    while ((m = regex.exec(text)) !== null) {
      findings.push({
        rule_id: rule.id,
        match: m[0],
        index: m.index,
        confidence: rule.confidence ?? 0.9,
      });
      if (m[0].length === 0) break;
    }
  }
  return findings;
}

/**
 * Run context window rules against the input text.
 * Returns array of { rule_id, match, confidence }.
 */
function evaluateContextRules(text) {
  const findings = [];
  for (const rule of contextWindowRules) {
    if (rule.lang !== "de") continue;
    if (rule.disabledByDefault) continue;
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let m;
    while ((m = regex.exec(text)) !== null) {
      findings.push({
        rule_id: rule.id,
        match: m[0],
        index: m.index,
        confidence: rule.confidence ?? 0.9,
      });
      if (m[0].length === 0) break;
    }
  }
  return findings;
}

/**
 * Analyze clause structure of the input text.
 */
function evaluateClauses(text) {
  const sentences = splitSentences(text);
  const results = [];
  for (const s of sentences) {
    const detected = detectClauses(s);
    results.push({
      sentence: s,
      type: detected.type,
      clauseCount: detected.clauses?.length ?? 1,
    });
  }
  return {
    sentences: results,
    total_sentences: sentences.length,
  };
}

/**
 * Run phonotactic analysis on the input text.
 */
function evaluatePhonotactics(text) {
  const words = text
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  const findings = [];
  for (const word of words) {
    const result = checkPhonotactics(word);
    if (result && result.flags && result.flags.length > 0) {
      findings.push({
        word,
        flags: result.flags,
        confidence: result.confidence ?? 0.5,
      });
    }
  }

  return {
    total_words: words.length,
    flagged_words: findings.length,
    findings,
  };
}

/**
 * Compute an overall score from evaluation results.
 */
function computeScore(grammar, context, clauses, phonotactics) {
  let score = 1.0;

  const grammarFindings = grammar.length + context.length;
  if (grammarFindings > 0) {
    const avgConfidence = [...grammar, ...context].reduce(
      (s, f) => s + (f.confidence ?? 0.9), 0
    ) / grammarFindings;
    score -= Math.min(0.5, grammarFindings * 0.08 * avgConfidence);
  }

  if (phonotactics.flagged_words > 0) {
    score -= Math.min(0.2, phonotactics.flagged_words * 0.05);
  }

  if (clauses.total_sentences > 0) {
    const avgClauses = clauses.sentences.reduce(
      (s, c) => s + c.clauseCount, 0
    ) / clauses.total_sentences;
    if (avgClauses > 1 && grammarFindings === 0) {
      score = Math.min(1.0, score + 0.05);
    }
  }

  return Math.max(0, Math.min(1, Number(score.toFixed(4))));
}

// Main
const raw = await readStdin();
let payload = {};
try {
  payload = raw ? JSON.parse(raw) : {};
} catch {
  process.stdout.write(
    JSON.stringify({
      ok: false,
      output: null,
      diagnostics: { error: "invalid_json" },
      score: 0,
    }) + "\n"
  );
  process.exit(0);
}

const ex = payload.example || { id: "unknown", input: "" };
const text = String(ex.input || "");

const grammarFindings = evaluateGrammarRules(text);
const contextFindings = evaluateContextRules(text);
const clauseAnalysis = evaluateClauses(text);
const phonotacticAnalysis = evaluatePhonotactics(text);

const score = computeScore(
  grammarFindings,
  contextFindings,
  clauseAnalysis,
  phonotacticAnalysis
);

const ok = grammarFindings.length === 0 && contextFindings.length === 0;

const out = {
  ok,
  output: {
    grammar_findings: grammarFindings.length,
    context_findings: contextFindings.length,
    grammar_rules_matched: grammarFindings.map((f) => f.rule_id),
    context_rules_matched: contextFindings.map((f) => f.rule_id),
    clause_analysis: {
      total_sentences: clauseAnalysis.total_sentences,
      clause_types: clauseAnalysis.sentences.map((s) => s.type),
    },
    phonotactic_flags: phonotacticAnalysis.flagged_words,
    phonotactic_details: phonotacticAnalysis.findings.map((f) => ({
      word: f.word,
      flags: f.flags,
    })),
  },
  diagnostics: {
    warnings: [
      ...grammarFindings.map(
        (f) => `Grammar: ${f.rule_id} matched "${f.match}" at index ${f.index}`
      ),
      ...contextFindings.map(
        (f) => `Context: ${f.rule_id} matched "${f.match}" at index ${f.index}`
      ),
      ...phonotacticAnalysis.findings.map(
        (f) => `Phonotactics: "${f.word}" flagged: ${f.flags.join(", ")}`
      ),
    ],
  },
  score,
};

process.stdout.write(JSON.stringify(out) + "\n");
