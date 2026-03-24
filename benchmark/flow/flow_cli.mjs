#!/usr/bin/env node
/**
 * Minimal FLOW CLI stub (deterministic)
 *
 * Reads JSON from stdin, writes JSON to stdout.
 * This is a placeholder you can later replace with real FLOW logic.
 *
 * Contract:
 * In:  { protocol_id, protocol_version, protocol_hash, params, example:{id,input,category} }
 * Out: { ok:boolean, output:any|null, diagnostics:any, score:number }
 */
import fs from "node:fs";

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (c) => (data += c));
    process.stdin.on("end", () => resolve(data));
  });
}

function stableHash32(s) {
  // tiny stable hash for determinism
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const raw = await readStdin();
let payload = {};
try {
  payload = raw ? JSON.parse(raw) : {};
} catch {
  process.stdout.write(JSON.stringify({ ok: false, output: null, diagnostics: { error: "invalid_json" }, score: 0 }) + "\n");
  process.exit(0);
}

const ex = payload.example || { id: "unknown", input: "" };
const params = payload.params || {};
const strictness = params.strictness || "medium";

// Deterministic "syntax" check placeholder:
const text = String(ex.input || "");
const looksMalformed = text.includes("<<<") || text.includes(">>>");
const tooShort = text.trim().length < 3;

// Strictness makes it harder to pass
let ok = !looksMalformed && !tooShort;
if (strictness === "high") ok = ok && text.length >= 10;
if (strictness === "low") ok = ok || text.trim().length >= 1;

// Score deterministically from content
const h = stableHash32(`${payload.protocol_hash || ""}|${strictness}|${text}`);
const score = ok ? (0.6 + (h % 4000) / 10000) : (h % 2000) / 10000;

const out = {
  ok: !!ok,
  output: ok ? { normalized: text.trim() } : null,
  diagnostics: ok ? { warnings: [] } : { error: "syntax_invalid" },
  score: Number(score.toFixed(4)),
};

process.stdout.write(JSON.stringify(out) + "\n");
