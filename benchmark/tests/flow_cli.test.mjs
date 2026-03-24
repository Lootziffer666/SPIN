import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("FLOW CLI stub returns ok/output/score", () => {
  const payload = {
    protocol_id: "PROTO-A",
    protocol_version: "1.2.0",
    protocol_hash: "PH-X",
    params: { strictness: "medium" },
    example: { id: "ex-001", input: "hello world", category: "core" }
  };

  const p = spawnSync(process.execPath, ["flow/flow_cli.mjs"], {
    input: JSON.stringify(payload),
    encoding: "utf-8"
  });

  assert.equal(p.status, 0);
  const out = JSON.parse(p.stdout || "{}");
  assert.equal(typeof out.ok, "boolean");
  assert.ok("score" in out);
  assert.ok(out.ok);
  assert.ok(out.output && typeof out.output.normalized === "string");
});
