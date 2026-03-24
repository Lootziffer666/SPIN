#!/usr/bin/env node
/**
 * Local Runner Service (no deps)
 * - Runs on 127.0.0.1:8787
 * - Serves the zero-build UI from /ui at /
 * - Starts benchmark/tweak scripts as child processes
 * - Provides job status + logs
 *
 * Start:
 *   node runner/server.mjs
 */
import http from "node:http";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import crypto from "node:crypto";

const HOST = "127.0.0.1";
const PORT = 8787;

const ROOT = process.cwd();
const UI_DIR = path.join(ROOT, "ui");

const jobs = new Map(); // jobId -> { id, kind, status, startedAt, endedAt, cmd, args, log, exitCode }
const sseClients = new Set(); // res objects for /api/events

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function json(res, status, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function text(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": contentType, "Cache-Control": "no-store" });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

function broadcastSse(event, payload) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(msg);
    } catch {
      sseClients.delete(res);
    }
  }
}

function startJob({ kind, args, env }) {
  const id = `JOB-${sha256(`${kind}|${nowIso()}|${Math.random()}`).slice(0, 10).toUpperCase()}`;
  const job = {
    id,
    kind,
    status: "running",
    startedAt: nowIso(),
    endedAt: null,
    cmd: process.execPath,
    args,
    log: "",
    exitCode: null,
  };
  jobs.set(id, job);
  broadcastSse("job", { type: "created", job: publicJob(job) });

  const child = spawn(process.execPath, args, {
    env: { ...process.env, ...(env || {}) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const onChunk = (d) => {
    const chunk = d.toString("utf-8");
    job.log += chunk;
    if (job.log.length > 2_000_000) job.log = job.log.slice(-2_000_000);
    broadcastSse("log", { jobId: job.id, chunk });
  };

  child.stdout.on("data", onChunk);
  child.stderr.on("data", onChunk);

  child.on("close", (code) => {
    job.status = code === 0 ? "complete" : "failed";
    job.exitCode = code;
    job.endedAt = nowIso();
    broadcastSse("job", { type: "updated", job: publicJob(job) });
  });

  return job;
}

function publicJob(j) {
  return {
    id: j.id,
    kind: j.kind,
    status: j.status,
    startedAt: j.startedAt,
    endedAt: j.endedAt,
    exitCode: j.exitCode,
  };
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function safeJoin(baseDir, reqPath) {
  const cleaned = reqPath.replace(/\0/g, "");
  const joined = path.join(baseDir, cleaned);
  const normalized = path.normalize(joined);
  if (!normalized.startsWith(baseDir)) return null;
  return normalized;
}

function serveStatic(reqPath, res) {
  // Map "/" to "/index.html"
  const rel = reqPath === "/" ? "/index.html" : reqPath;
  const abs = safeJoin(UI_DIR, rel);
  if (!abs) return false;

  if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) return false;

  const ct = contentTypeFor(abs);
  res.writeHead(200, { "Content-Type": ct, "Cache-Control": "no-store" });
  fs.createReadStream(abs).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  const u = url.parse(req.url || "", true);
  const method = req.method || "GET";

  // ---- API ----
  if (method === "GET" && u.pathname === "/api/health") {
    return json(res, 200, { ok: true, service: "spin-runner", time: nowIso() });
  }

  if (method === "GET" && u.pathname === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    });
    res.write(`event: hello\ndata: ${JSON.stringify({ ok: true, time: nowIso() })}\n\n`);
    sseClients.add(res);

    req.on("close", () => {
      sseClients.delete(res);
    });
    return;
  }

  if (method === "GET" && u.pathname === "/api/jobs") {
    const arr = Array.from(jobs.values()).map(publicJob);
    return json(res, 200, { jobs: arr });
  }

  if (method === "GET" && u.pathname?.startsWith("/api/jobs/")) {
    const id = u.pathname.split("/").pop();
    const job = jobs.get(id);
    if (!job) return json(res, 404, { error: "job_not_found" });
    return json(res, 200, { job: publicJob(job) });
  }

  if (method === "GET" && u.pathname?.startsWith("/api/logs/")) {
    const id = u.pathname.split("/").pop();
    const job = jobs.get(id);
    if (!job) return json(res, 404, { error: "job_not_found" });

    const tail = u.query?.tail ? Number(u.query.tail) : null;
    const log = Number.isFinite(tail) && tail > 0 ? job.log.slice(-tail) : job.log;
    return json(res, 200, { id: job.id, status: job.status, log });
  }

  if (method === "POST" && u.pathname === "/api/bench") {
    try {
      const body = await readBody(req);
      const artifactPath = body.artifactPath;
      const outDir = body.outDir;
      const flowCmd = body.flowCmd || null;
      if (!artifactPath || !outDir) return json(res, 400, { error: "artifactPath_and_outDir_required" });

      const args = ["scripts/run_benchmarks.mjs", "--artifact", artifactPath, "--out", outDir];
      if (body.policyPath) args.push("--policy", body.policyPath);
      if (body.suitePath) args.push("--suite", body.suitePath);
      if (body.seed) args.push("--seed", String(body.seed));
      if (flowCmd) args.push("--flowCmd", flowCmd);

      const job = startJob({ kind: "bench", args, env: {} });
      return json(res, 202, { jobId: job.id });
    } catch (e) {
      return json(res, 400, { error: "invalid_request", message: String(e.message || e) });
    }
  }

  if (method === "POST" && u.pathname === "/api/tweak") {
    try {
      const body = await readBody(req);
      const artifactPath = body.artifactPath;
      const minutes = body.minutes ?? 10;
      if (!artifactPath) return json(res, 400, { error: "artifactPath_required" });

      const args = ["scripts/auto_tweak.mjs", "--minutes", String(minutes), "--artifact", artifactPath];
      if (body.objective) args.push("--objective", body.objective);
      if (body.outDir) args.push("--out", body.outDir);
      if (body.seed) args.push("--seed", String(body.seed));

      const job = startJob({ kind: "tweak", args, env: {} });
      return json(res, 202, { jobId: job.id });
    } catch (e) {
      return json(res, 400, { error: "invalid_request", message: String(e.message || e) });
    }
  }

  // ---- UI static ----
  if (method === "GET" || method === "HEAD") {
    const served = serveStatic(u.pathname || "/", res);
    if (served) return;

    // Optional SPA fallback: routes like /suite or /lab -> index.html
    if ((u.pathname || "").startsWith("/suite") || (u.pathname || "").startsWith("/lab")) {
      if (serveStatic("/index.html", res)) return;
    }
  }

  return json(res, 404, { error: "not_found" });
});

server.listen(PORT, HOST, () => {
  console.log(`SPIN Runner Service listening on http://${HOST}:${PORT}`);
  console.log(`UI served from ${path.relative(ROOT, UI_DIR)}/`);
});
