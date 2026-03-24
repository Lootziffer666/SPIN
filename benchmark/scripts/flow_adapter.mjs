/**
 * FLOW Adapter
 *
 * This file is the ONLY place you need to touch to wire in real FLOW logic.
 *
 * Two modes:
 * - mockEvaluateExample: deterministic stub for UI/runner development
 * - cliEvaluateExample: calls an external FLOW CLI per example (recommended)
 */
import { spawnSync } from "node:child_process";

export function mockEvaluateExample({ example, params, rand }) {
  // Deterministic stub: uses rand() to simulate pass/fail probability
  const base = rand();
  const hardness = example.category === "edge" ? 0.35 : example.category === "stress" ? 0.55 : 0.75;
  const lengthPenalty = Math.min(0.25, example.input.length / 2000);
  const score = Math.max(0, Math.min(1, base * hardness - lengthPenalty + 0.25));
  const ok = score >= 0.5;

  return {
    ok,
    output: ok ? { normalized: example.input.trim() } : null,
    diagnostics: ok ? { warnings: [] } : { error: "mock: invalid syntax" },
    score
  };
}

export function cliEvaluateExample({ example, protocol, params, flowCmd }) {
  if (!flowCmd) {
    throw new Error("FLOW CLI not configured. Set --flowCmd or env FLOW_CMD.");
  }

  // Basic shell splitting: allow quoted strings is complex; keep it simple.
  // If you need complex quoting, prefer env FLOW_CMD pointing to a wrapper script.
  const parts = String(flowCmd).split(" ").filter(Boolean);
  const cmd = parts[0];
  const cmdArgs = parts.slice(1);

  const payload = {
    protocol_id: protocol.protocol_id,
    protocol_version: protocol.protocol_version,
    protocol_hash: protocol.protocol_hash,
    params: params ?? {},
    example: { id: example.id, input: example.input, category: example.category }
  };

  const proc = spawnSync(cmd, cmdArgs, {
    input: JSON.stringify(payload),
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024
  });

  if (proc.error) throw proc.error;
  if (proc.status !== 0) {
    return {
      ok: false,
      output: null,
      diagnostics: { error: "flow_cli_failed", stderr: proc.stderr?.slice(0, 2000) ?? "" },
      score: 0
    };
  }

  let out;
  try {
    out = JSON.parse(proc.stdout || "{}");
  } catch {
    return {
      ok: false,
      output: null,
      diagnostics: { error: "flow_cli_invalid_json", stdout: (proc.stdout || "").slice(0, 2000) },
      score: 0
    };
  }

  return {
    ok: !!out.ok,
    output: out.output ?? null,
    diagnostics: out.diagnostics ?? {},
    score: typeof out.score === "number" ? out.score : (out.ok ? 1 : 0)
  };
}
