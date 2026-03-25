import { api } from "../shared/api.mjs";
import { JobTable } from "../components/job-table.mjs";
import { LogViewer } from "../components/log-viewer.mjs";

export class LabPage extends HTMLElement {
  constructor(){
    super();
    this.state = { jobs: [], selectedJobId: null, autoRefresh: true, filters: { status: "", kind: "", q: "" }, notice: null };
    this._timer = null;
  }

  connectedCallback(){
    // Force lab theme to dark.
    document.documentElement.classList.remove("mode-suite");
    document.documentElement.classList.add("mode-lab");

    this.render();
    this.refresh();
    this._timer = window.setInterval(() => {
      if (this.state.autoRefresh) this.refresh();
    }, 1200);
  }

  disconnectedCallback(){
    if (this._timer) window.clearInterval(this._timer);
  }

  handleShortcut(key){
    if (key === "r"){ this.refresh(); return true; }
    if (key === "j"){ this._navigate(1); return true; }
    if (key === "k"){ this._navigate(-1); return true; }
    if (key === "f"){
      this.querySelector("#logViewer pre.log")?.focus();
      return true;
    }
    return false;
  }

  _navigate(delta){
    const table = this.querySelector("job-table");
    const ids = (table && typeof table.getVisibleJobIds === "function") ? table.getVisibleJobIds() : [];
    if (!ids.length) return;

    let idx = ids.indexOf(this.state.selectedJobId);
    if (idx < 0) idx = delta > 0 ? -1 : ids.length;
    idx = Math.max(0, Math.min(ids.length - 1, idx + delta));

    const nextId = ids[idx];
    if (!nextId) return;

    this.state.selectedJobId = nextId;
    this.renderJobsOnly();
    window.setTimeout(() => this.querySelector("job-table")?.focusRow?.(nextId), 0);
  }

  setNotice(type, message){
    this.state.notice = message ? { type, message } : null;
    const mount = this.querySelector("#statusArea");
    if (!mount) return;
    if (!this.state.notice){ mount.replaceChildren(); return; }
    mount.innerHTML = `<div class="notice ${type}">${escapeHtml(message)}</div>`;
  }

  async refresh(){
    try{
      const jobs = await api.jobs();
      this.state.jobs = jobs.jobs || [];
      this.renderJobsOnly();
      if (this.state.notice?.type === "bad") this.setNotice(null, "");
    }catch{
      this.setNotice("warn", "Can't reach server right now. Showing last known jobs.");
    }
  }

  render(){
    this.innerHTML = `
      <div class="col gap-12">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <h1 class="h1">Lab</h1>
              <div class="muted">Immutable benchmarking & audit. Inputs/outputs should live in <code>lab/</code>.</div>
            </div>

            <div class="card-actions">
              <label class="row gap-8">
                <input type="checkbox" id="autoRefresh" ${this.state.autoRefresh ? "checked": ""}/>
                <span class="muted" style="font-size:12px;">Auto refresh</span>
              </label>
              <button class="btn" id="refreshBtn">Refresh</button>
            </div>
          </div>

          <div id="statusArea" class="mt-10" role="status" aria-live="polite"></div>
        </div>

        <div class="split">
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <h2 class="h2">Jobs</h2>
                <div class="help">Artifacts are immutable; reruns create new folders. Shortcuts: <span class="kbd">J</span>/<span class="kbd">K</span>, <span class="kbd">F</span> logs.</div>
              </div>
            </div>
            <div id="jobTable" class="mt-10"></div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <h2 class="h2">Logs</h2>
                <div class="help">Select a job to view logs. Follow will pause if you scroll up.</div>
              </div>
            </div>
            <div id="logViewer" class="mt-10"></div>
          </div>
        </div>

        <div class="card">
          <h2 class="h2">Policy</h2>
          <div class="muted mt-8" style="line-height:1.55;">
            <div>• Promotion is the only path into lab.</div>
            <div>• Release is the only path into public.</div>
            <div>• Artifacts are immutable; reruns create new folders. Shortcuts: <span class="kbd">J</span>/<span class="kbd">K</span>, <span class="kbd">F</span> logs.</div>
          </div>
        </div>
      </div>
    `;

    this.querySelector("#autoRefresh")?.addEventListener("change", (e) => {
      this.state.autoRefresh = !!e.target.checked;
    });
    this.querySelector("#refreshBtn")?.addEventListener("click", () => this.refresh());

    this.renderJobsOnly();
  }

  renderJobsOnly(){
    const mount = this.querySelector("#jobTable");
    const logMount = this.querySelector("#logViewer");
    if (!mount || !logMount) return;

    mount.replaceChildren();
    const table = new JobTable({
      jobs: this.state.jobs,
      selectedId: this.state.selectedJobId,
      filters: this.state.filters,
      mode: "lab",
      onFilterChange: (filters) => {
        this.state.filters = filters;
        this.renderJobsOnly();
      },
      onSelect: (id) => {
        this.state.selectedJobId = id;
        this.renderJobsOnly();
        window.setTimeout(() => this.querySelector("job-table")?.focusRow?.(id), 0);
      }
    });
    mount.appendChild(table);

    logMount.replaceChildren();
    logMount.appendChild(new LogViewer({ jobId: this.state.selectedJobId }));
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
