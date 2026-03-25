import { api } from "../shared/api.mjs";
import { toast } from "../shared/toast.mjs";
import { JobTable } from "../components/job-table.mjs";
import { LogViewer } from "../components/log-viewer.mjs";
import { PromoteWizard } from "../components/promote-wizard.mjs";

export class SuitePage extends HTMLElement {
  constructor(){
    super();
    this.state = {
      jobs: [],
      selectedJobId: null,
      autoRefresh: true,
      filters: { status: "", kind: "", q: "" },

      artifactPath: "private/_inbox/artifact.json",
      outDir: "private/runs",
      minutes: 10,

      busy: false,
      notice: null, // { type: "good"|"bad"|"warn", message: string }
    };

    this._timer = null;
  }

  connectedCallback(){
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
      // Focus logs panel (pre is tabindex=0)
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

    if (!this.state.notice){
      mount.replaceChildren();
      return;
    }

    mount.innerHTML = `<div class="notice ${type}">${escapeHtml(message)}</div>`;
  }

  setBusy(b){
    this.state.busy = !!b;
    this.querySelector("#benchBtn")?.toggleAttribute("disabled", this.state.busy);
    this.querySelector("#tweakBtn")?.toggleAttribute("disabled", this.state.busy);
    this.querySelector("#refreshBtn")?.toggleAttribute("disabled", this.state.busy);
    this.toggleAttribute("aria-busy", this.state.busy);
  }

  async refresh(){
    try{
      const jobs = await api.jobs();
      this.state.jobs = jobs.jobs || [];
      this.renderJobsOnly();
      // don't overwrite a current notice unless it's an error
      if (this.state.notice?.type === "bad") this.setNotice(null, "");
    }catch(err){
      this.setNotice("warn", `Can't reach server right now. Showing last known jobs.`);
    }
  }

  render(){
    this.innerHTML = `
      <div class="col gap-12">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <h1 class="h1">Suite</h1>
              <div class="muted">Iterate, tweak, pick candidates. Outputs must stay in <code>private/</code>.</div>
            </div>

            <div class="card-actions">
              <label class="row gap-8">
                <input type="checkbox" id="autoRefresh" ${this.state.autoRefresh ? "checked": ""}/>
                <span class="muted" style="font-size:12px;">Auto refresh</span>
              </label>
              <button class="btn" id="refreshBtn">Refresh <span class="kbd">R</span></button>
            </div>
          </div>

          <div id="statusArea" class="mt-10" role="status" aria-live="polite"></div>
        </div>

        <div class="split">
          <div class="col gap-12">
            <div class="card">
              <h2 class="h2">Runner controls</h2>

              <div class="row wrap gap-12 mt-10">
                <div class="field" style="flex:1;">
                  <div class="label">Artifact path</div>
                  <input class="input" id="artifactPath" placeholder="private/_inbox/artifact.json" value="${escapeHtml(this.state.artifactPath)}"/>
                  <div class="help">Input must remain under <code>private/</code> in Suite.</div>
                </div>

                <div class="field" style="flex:1;">
                  <div class="label">Output directory</div>
                  <input class="input" id="outDir" placeholder="private/runs" value="${escapeHtml(this.state.outDir)}"/>
                  <div class="help">Bench writes new runs here.</div>
                </div>
              </div>

              <div class="row wrap gap-12 mt-10">
                <button class="btn primary" id="benchBtn">Start bench</button>

                <div class="row gap-10 wrap">
                  <div class="field" style="min-width:140px;">
                    <div class="label">Tweak minutes</div>
                    <input class="input" id="minutes" type="number" min="1" value="${this.state.minutes}" style="width:140px"/>
                  </div>
                  <button class="btn" id="tweakBtn">Start tweak</button>
                </div>

                <span class="help">Requires server: <code>node runner/server.mjs</code></span>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title">
                  <h2 class="h2">Jobs</h2>
                  <div class="help">Tip: <span class="kbd">J</span>/<span class="kbd">K</span> navigate, <span class="kbd">Enter</span>/<span class="kbd">Space</span> select, <span class="kbd">F</span> focuses logs.</div>
                </div>
              </div>
              <div id="jobTable" class="mt-10"></div>
            </div>

            <div class="card">
              <div class="card-header">
                <div class="card-title">
                  <h2 class="h2">Promotion</h2>
                  <div class="help">Promotion is explicit: private_dev → internal_benchmark (writes into <code>lab/</code>).</div>
                </div>
              </div>
              <div id="promoteWizard" class="mt-10"></div>
            </div>
          </div>

          <div class="col gap-12">
            <div class="card">
              <div class="card-header">
                <div class="card-title">
                  <h2 class="h2">Logs</h2>
                  <div class="help">Select a job to view logs. Follow will pause if you scroll up.</div>
                </div>
              </div>
              <div id="logViewer" class="mt-10"></div>
            </div>

            <div class="card">
              <h2 class="h2">Notes</h2>
              <div class="muted mt-8" style="line-height:1.55;">
                <div>• Suite mode defaults to <b>light</b> theme.</div>
                <div>• Auto-tweak is suite-only.</div>
                <div>• Public exports are blocked from private inputs.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.querySelector("#autoRefresh")?.addEventListener("change", (e) => {
      this.state.autoRefresh = !!e.target.checked;
    });

    this.querySelector("#refreshBtn")?.addEventListener("click", () => this.refresh());

    this.querySelector("#benchBtn")?.addEventListener("click", async () => {
      this.readInputs();
      this.setBusy(true);
      this.setNotice("warn", "Starting bench…");
      toast("warn", "Starting bench…");
      try{
        const r = await api.bench({ artifactPath: this.state.artifactPath, outDir: this.state.outDir });
        if (r.jobId) this.state.selectedJobId = r.jobId;
        this.setNotice("good", `Bench started (${r.jobId}).`);
        toast("good", `Bench started (${r.jobId}).`);
      }catch(err){
        this.setNotice("bad", `Bench failed: ${String(err?.message || err)}`);
        toast("bad", `Bench failed: ${String(err?.message || err)}`);
      }finally{
        this.setBusy(false);
        this.refresh();
        this.renderJobsOnly();
      }
    });

    this.querySelector("#tweakBtn")?.addEventListener("click", async () => {
      this.readInputs();
      this.setBusy(true);
      this.setNotice("warn", "Starting tweak…");
      toast("warn", "Starting tweak…");
      try{
        const r = await api.tweak({ artifactPath: this.state.artifactPath, minutes: Number(this.state.minutes) || 10 });
        if (r.jobId) this.state.selectedJobId = r.jobId;
        this.setNotice("good", `Tweak started (${r.jobId}).`);
        toast("good", `Tweak started (${r.jobId}).`);
      }catch(err){
        this.setNotice("bad", `Tweak failed: ${String(err?.message || err)}`);
        toast("bad", `Tweak failed: ${String(err?.message || err)}`);
      }finally{
        this.setBusy(false);
        this.refresh();
        this.renderJobsOnly();
      }
    });

    // initial sub-components
    this.renderJobsOnly();

    const promote = new PromoteWizard();
    this.querySelector("#promoteWizard")?.appendChild(promote);
  }

  readInputs(){
    this.state.artifactPath = this.querySelector("#artifactPath")?.value?.trim() || this.state.artifactPath;
    this.state.outDir = this.querySelector("#outDir")?.value?.trim() || this.state.outDir;
    this.state.minutes = Number(this.querySelector("#minutes")?.value) || this.state.minutes;
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
      mode: "suite",
      onFilterChange: (filters) => {
        this.state.filters = filters;
        this.renderJobsOnly();
      },
      onSelect: (id) => {
        this.state.selectedJobId = id;
        this.renderJobsOnly();
        // keep selection feeling snappy for keyboard users
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
