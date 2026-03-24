export class DensitySwitch extends HTMLElement {
  connectedCallback(){
    this.render();
  }

  _get(){
    const v = (localStorage.getItem("ui:density") || "comfortable").toLowerCase();
    return (v === "compact") ? "compact" : "comfortable";
  }

  _apply(mode){
    const m = (mode === "compact") ? "compact" : "comfortable";
    document.documentElement.classList.toggle("density-compact", m === "compact");
    localStorage.setItem("ui:density", m);
  }

  render(){
    const mode = this._get();
    this._apply(mode);

    this.innerHTML = `
      <div class="row gap-8" role="group" aria-label="Density switch">
        <span class="muted" style="font-size:12px;">Density</span>
        <button class="btn ${mode === "comfortable" ? "primary" : ""}" data-density="comfortable" aria-pressed="${mode === "comfortable"}" title="Comfortable spacing">Comfort</button>
        <button class="btn ${mode === "compact" ? "primary" : ""}" data-density="compact" aria-pressed="${mode === "compact"}" title="Compact spacing">Compact</button>
      </div>
    `;

    this.querySelectorAll("button[data-density]").forEach(btn => {
      btn.addEventListener("click", () => {
        const m = btn.getAttribute("data-density") || "comfortable";
        this._apply(m);
        this.render();
      });
    });
  }
}
