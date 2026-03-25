export class JobTable extends HTMLElement {
  constructor({ jobs, selectedId, onSelect, filters, onFilterChange, mode } = {}){
    super();
    this.jobs = jobs || [];
    this.selectedId = selectedId || null;
    this.onSelect = onSelect || (() => {});
    this.filters = filters || { status: "", kind: "", q: "" };
    this.onFilterChange = onFilterChange || (() => {});
    this.mode = mode || "suite";

    this._visibleIds = [];
  }

  connectedCallback(){
    this.render();
  }

  setData({ jobs, selectedId, filters } = {}){
    if (jobs) this.jobs = jobs;
    if (selectedId !== undefined) this.selectedId = selectedId;
    if (filters) this.filters = filters;
    this.render();
  }

  getVisibleJobIds(){
    return this._visibleIds.slice();
  }

  focusRow(id){
    const safe = (window.CSS && CSS.escape) ? CSS.escape(String(id)) : String(id).replaceAll('"', '\\"');
    const tr = this.querySelector(`tr[data-job="${safe}"]`);
    tr?.focus();
  }

  render(){
    const allJobs = this.jobs || [];
    const fStatus = String(this.filters?.status || "").trim();
    const fKind = String(this.filters?.kind || "").trim();
    const q = String(this.filters?.q || "").trim().toLowerCase();

    const statuses = uniq(allJobs.map(j => String(j.status || "").trim()).filter(Boolean)).sort();
    const kinds = uniq(allJobs.map(j => String(j.kind || "").trim()).filter(Boolean)).sort();

    const filtered = allJobs
      .filter(j => {
        const s = String(j.status || "");
        const k = String(j.kind || "");
        const id = String(j.id || "");
        if (fStatus && s !== fStatus) return false;
        if (fKind && k !== fKind) return false;
        if (q){
          const hay = (id + " " + s + " " + k).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .slice()
      .sort((a,b) => String(b.startedAt||"").localeCompare(String(a.startedAt||"")));

    this._visibleIds = filtered.map(j => String(j.id || ""));

    const rows = filtered.map(j => {
      const statusClass = j.status === "complete" ? "good" : (j.status === "failed" ? "bad" : "warn");
      const selected = this.selectedId === j.id;
      return `
        <tr data-job="${escapeAttr(j.id)}" tabindex="0" aria-selected="${selected}">
          <td class="jobid"><code>${escapeHtml(j.id)}</code></td>
          <td><span class="badge ${statusClass}">${escapeHtml(j.status)}</span></td>
          <td class="muted">${escapeHtml(j.kind)}</td>
          <td class="muted">${fmtTime(j.startedAt)}</td>
          <td class="muted">${j.endedAt ? fmtTime(j.endedAt) : "—"}</td>
          <td class="muted">${escapeHtml(j.exitCode ?? "—")}</td>
        </tr>
      `;
    }).join("");

    const empty = this._renderEmpty(allJobs.length, filtered.length, { fStatus, fKind, q });

    this.innerHTML = `
      <div class="tablebar">
        <div class="row gap-8 wrap">
          <div class="field field-inline">
            <div class="label">Status</div>
            <select class="input select" data-filter="status" aria-label="Filter by status">
              <option value="">All</option>
              ${statuses.map(s => `<option value="${escapeAttr(s)}" ${s === fStatus ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
            </select>
          </div>

          <div class="field field-inline">
            <div class="label">Kind</div>
            <select class="input select" data-filter="kind" aria-label="Filter by kind">
              <option value="">All</option>
              ${kinds.map(k => `<option value="${escapeAttr(k)}" ${k === fKind ? "selected" : ""}>${escapeHtml(k)}</option>`).join("")}
            </select>
          </div>

          <div class="field field-inline" style="min-width:220px; flex:1;">
            <div class="label">Search</div>
            <input class="input" data-filter="q" value="${escapeHtml(this.filters?.q || "")}" placeholder="Job id, status, kind…" aria-label="Search jobs" />
          </div>

          <button class="btn" type="button" data-clear ${(!fStatus && !fKind && !q) ? "disabled" : ""}>Clear</button>
        </div>

        <div class="muted" style="font-size:12px; margin-top:6px;">
          Showing <b>${filtered.length}</b> of <b>${allJobs.length}</b>
          <span class="muted">•</span>
          <span class="muted">Shortcuts: <span class="kbd">J</span>/<span class="kbd">K</span> navigate, <span class="kbd">Enter</span>/<span class="kbd">Space</span> select, <span class="kbd">F</span> focus logs</span>
        </div>
      </div>

      <table class="table" role="grid" aria-label="Jobs">
        <thead>
          <tr>
            <th>Job</th>
            <th>Status</th>
            <th>Kind</th>
            <th>Started</th>
            <th>Ended</th>
            <th>Exit</th>
          </tr>
        </thead>
        <tbody>
          ${rows || empty}
        </tbody>
      </table>
    `;

    this._wire();
  }

  _renderEmpty(allCount, visibleCount, { fStatus, fKind, q }){
    if (allCount === 0){
      if (this.mode === "lab"){
        return `
          <tr>
            <td colspan="6">
              <div class="empty">
                <div class="empty-title">No jobs in Lab yet</div>
                <div class="empty-body">
                  Promote a verified run into <code>lab/_inbox</code>, then benchmark it.
                  <div class="empty-steps">
                    <div>1) <code>node scripts/generate_artifact.mjs --run private/runs/&lt;runbundle&gt;.json --out lab/_inbox</code></div>
                    <div>2) <code>node scripts/run_benchmarks.mjs --artifact lab/_inbox/ART-XXXX.json --out lab/artifacts</code></div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        `;
      }

      return `
        <tr>
          <td colspan="6">
            <div class="empty">
              <div class="empty-title">No jobs yet</div>
              <div class="empty-body">
                Start your first run using <b>Start bench</b> (or <b>Start tweak</b>). Then select a row to view logs.
                <div class="empty-steps">
                  <div>1) Confirm your artifact is under <code>private/</code></div>
                  <div>2) Click <b>Start bench</b></div>
                  <div>3) Select the job to follow logs</div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    }

    if (visibleCount === 0){
      return `
        <tr>
          <td colspan="6">
            <div class="empty">
              <div class="empty-title">No matches</div>
              <div class="empty-body">
                No jobs match your filters.
                ${(fStatus || fKind || q) ? `<div class="empty-steps"><div>Tip: click <b>Clear</b> to reset filters.</div></div>` : ``}
              </div>
            </div>
          </td>
        </tr>
      `;
    }

    return `<tr><td colspan="6" class="muted">—</td></tr>`;
  }

  _wire(){
    // Filters
    this.querySelectorAll("[data-filter]").forEach(el => {
      el.addEventListener("input", () => this._emitFilters());
      el.addEventListener("change", () => this._emitFilters());
    });

    this.querySelector("[data-clear]")?.addEventListener("click", () => {
      this.onFilterChange({ status: "", kind: "", q: "" });
    });

    const tbody = this.querySelector("tbody");
    if (!tbody) return;

    // Click / keyboard selection (event delegation)
    tbody.addEventListener("click", (e) => {
      const tr = e.target?.closest?.("tr[data-job]");
      const id = tr?.getAttribute?.("data-job");
      if (id) this.onSelect(id);
    });

    tbody.addEventListener("keydown", (e) => {
      const tr = e.target?.closest?.("tr[data-job]");
      if (!tr) return;
      if (e.key === "Enter" || e.key === " "){
        e.preventDefault();
        const id = tr.getAttribute("data-job");
        if (id) this.onSelect(id);
      }
    });
  }

  _emitFilters(){
    const status = this.querySelector('[data-filter="status"]')?.value || "";
    const kind = this.querySelector('[data-filter="kind"]')?.value || "";
    const q = this.querySelector('[data-filter="q"]')?.value || "";
    this.onFilterChange({ status, kind, q });
  }
}

function uniq(arr){
  return Array.from(new Set(arr));
}

function fmtTime(iso){
  if (!iso) return "—";
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch{
    return iso;
  }
}

function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(s){
  return escapeHtml(s).replaceAll('"', "&quot;");
}
