import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("SPIN FLOW CLI returns structured output for clean text", () => {
  const payload = {
    protocol_id: "SPIN-PROTO-1",
    protocol_version: "1.0.0",
    protocol_hash: "PH-X",
    params: {},
    example: { id: "ex-001", input: "Der Hund läuft durch den Park.", category: "grammar" }
  };

  const p = spawnSync(process.execPath, ["flow/flow_cli.mjs"], {
    input: JSON.stringify(payload),
    encoding: "utf-8"
  });

  assert.equal(p.status, 0, `FLOW CLI exited with status ${p.status}: ${p.stderr}`);
  const out = JSON.parse(p.stdout || "{}");
  assert.equal(typeof out.ok, "boolean");
  assert.ok("score" in out);
  assert.ok(out.ok, "Clean German text should pass");
  assert.ok(out.output, "Output object should exist");
  assert.equal(out.output.grammar_findings, 0, "No grammar findings for clean text");
});

test("SPIN FLOW CLI detects grammar error: 'so dass' → 'sodass'", () => {
  const payload = {
    protocol_id: "SPIN-PROTO-1",
    protocol_version: "1.0.0",
    protocol_hash: "PH-X",
    params: {},
    example: { id: "ex-002", input: "Er arbeitete so dass alles funktioniert.", category: "grammar" }
  };

  const p = spawnSync(process.execPath, ["flow/flow_cli.mjs"], {
    input: JSON.stringify(payload),
    encoding: "utf-8"
  });

  assert.equal(p.status, 0);
  const out = JSON.parse(p.stdout || "{}");
  assert.equal(out.ok, false, "Text with grammar error should not pass");
  assert.ok(out.output.grammar_findings > 0, "Should find grammar issues");
  assert.ok(out.output.grammar_rules_matched.includes("de-gr-sodass"), "Should match de-gr-sodass rule");
});

test("SPIN FLOW CLI detects old orthography: 'daß' → 'dass'", () => {
  const payload = {
    protocol_id: "SPIN-PROTO-1",
    protocol_version: "1.0.0",
    protocol_hash: "PH-X",
    params: {},
    example: { id: "ex-003", input: "Er sagte, daß er kommt.", category: "grammar" }
  };

  const p = spawnSync(process.execPath, ["flow/flow_cli.mjs"], {
    input: JSON.stringify(payload),
    encoding: "utf-8"
  });

  assert.equal(p.status, 0);
  const out = JSON.parse(p.stdout || "{}");
  assert.equal(out.ok, false, "Old orthography should be flagged");
  assert.ok(out.output.grammar_rules_matched.some(id => id.includes("dass") || id.includes("alte")), "Should match old orthography rule");
});

test("SPIN FLOW CLI provides clause analysis", () => {
  const payload = {
    protocol_id: "SPIN-PROTO-1",
    protocol_version: "1.0.0",
    protocol_hash: "PH-X",
    params: {},
    example: { id: "ex-004", input: "Der Mann geht nach Hause.", category: "clause" }
  };

  const p = spawnSync(process.execPath, ["flow/flow_cli.mjs"], {
    input: JSON.stringify(payload),
    encoding: "utf-8"
  });

  assert.equal(p.status, 0);
  const out = JSON.parse(p.stdout || "{}");
  assert.ok(out.output.clause_analysis, "Clause analysis should be present");
  assert.ok(out.output.clause_analysis.total_sentences >= 1, "Should detect at least one sentence");
});

test("SPIN FLOW CLI handles invalid JSON gracefully", () => {
  const p = spawnSync(process.execPath, ["flow/flow_cli.mjs"], {
    input: "NOT JSON",
    encoding: "utf-8"
  });

  assert.equal(p.status, 0, "Should not crash on invalid JSON");
  const out = JSON.parse(p.stdout || "{}");
  assert.equal(out.ok, false);
  assert.ok(out.diagnostics.error, "Should report error diagnostic");
});

test("SPIN FLOW CLI handles empty input", () => {
  const payload = {
    protocol_id: "SPIN-PROTO-1",
    protocol_version: "1.0.0",
    protocol_hash: "PH-X",
    params: {},
    example: { id: "ex-005", input: "", category: "edge" }
  };

  const p = spawnSync(process.execPath, ["flow/flow_cli.mjs"], {
    input: JSON.stringify(payload),
    encoding: "utf-8"
  });

  assert.equal(p.status, 0, "Should handle empty input");
  const out = JSON.parse(p.stdout || "{}");
  assert.equal(typeof out.score, "number", "Score should be a number");
});
