export const api = {
  async health(){
    return getJson("/api/health");
  },
  async jobs(){
    return getJson("/api/jobs");
  },
  async job(id){
    return getJson(`/api/jobs/${encodeURIComponent(id)}`);
  },
  async logs(id, { tail } = {}){
    const qs = tail ? `?tail=${encodeURIComponent(String(tail))}` : "";
    return getJson(`/api/logs/${encodeURIComponent(id)}${qs}`);
  },
  async bench({ artifactPath, outDir, policyPath, suitePath, seed, flowCmd }){
    return postJson("/api/bench", { artifactPath, outDir, policyPath, suitePath, seed, flowCmd });
  },
  async tweak({ artifactPath, minutes, objective, outDir, seed }){
    return postJson("/api/tweak", { artifactPath, minutes, objective, outDir, seed });
  },
};

async function getJson(url){
  const r = await fetch(url, { headers: { "Accept": "application/json" } });
  const t = await r.text();
  const data = t ? JSON.parse(t) : {};
  if (!r.ok) throw new Error(data?.message || data?.error || `HTTP ${r.status}`);
  return data;
}

async function postJson(url, body){
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body || {})
  });
  const t = await r.text();
  const data = t ? JSON.parse(t) : {};
  if (!r.ok) throw new Error(data?.message || data?.error || `HTTP ${r.status}`);
  return data;
}
