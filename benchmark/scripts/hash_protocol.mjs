#!/usr/bin/env node
/**
 * Hash a protocol definition deterministically.
 *
 * Usage:
 *   node scripts/hash_protocol.mjs --in protocol/protocol.json --out protocol/protocol_hash.txt
 *
 * Hash is SHA256 over canonical JSON (stable key order).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const k = a.slice(2);
    const n = argv[i + 1];
    if (!n || n.startsWith("--")) args[k] = true;
    else { args[k] = n; i++; }
  }
  return args;
}

function stableStringify(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return "[" + obj.map(stableStringify).join(",") + "]";
  const keys = Object.keys(obj).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

const args = parseArgs(process.argv);
const inPath = args.in || "protocol/protocol.json";
const outPath = args.out || "protocol/protocol_hash.txt";

const obj = JSON.parse(fs.readFileSync(inPath, "utf-8"));
const canon = stableStringify(obj);
const h = sha256(canon);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, h + "\n", "utf-8");
console.log(h);
