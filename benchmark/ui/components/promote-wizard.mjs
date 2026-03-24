export class PromoteWizard extends HTMLElement {
  connectedCallback(){
    this.render();
  }

  render(){
    // Minimal UX: show command users should run (promotion is a script guard, not a web action).
    this.innerHTML = `
      <div class="row" style="gap:10px; align-items:flex-start;">
        <div class="col" style="gap:6px; flex:1;">
          <div class="muted" style="font-size:12px;">Promotion is done via CLI to preserve explicit authorization.</div>
          <pre class="log" style="max-height:220px;">node scripts/generate_artifact.mjs --run private/runs/example_runbundle.verified.json --out lab/_inbox</pre>
          <div class="muted" style="font-size:12px;">
            Then benchmark in Lab:<br/>
            <code>node scripts/run_benchmarks.mjs --artifact lab/_inbox/ART-XXXX.json --out lab/artifacts</code>
          </div>
        </div>
      </div>
    `;
  }
}
