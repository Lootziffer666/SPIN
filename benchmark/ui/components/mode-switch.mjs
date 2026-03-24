export class ModeSwitch extends HTMLElement {
  connectedCallback(){
    this.render();
  }

  render(){
    const mode = document.documentElement.classList.contains("mode-lab") ? "lab" : "suite";
    this.innerHTML = `
      <div class="row gap-8" role="group" aria-label="Mode switch">
        <span class="muted" style="font-size:12px;">Mode</span>
        <button class="btn ${mode === "suite" ? "primary" : ""}" data-mode="suite" aria-pressed="${mode === "suite"}" title="Suite mode (light)">Suite</button>
        <button class="btn ${mode === "lab" ? "primary" : ""}" data-mode="lab" aria-pressed="${mode === "lab"}" title="Lab mode (dark)">Lab</button>
      </div>
    `;

    this.querySelectorAll("button[data-mode]").forEach(btn => {
      btn.addEventListener("click", () => {
        const m = btn.getAttribute("data-mode");
        document.documentElement.classList.toggle("mode-suite", m === "suite");
        document.documentElement.classList.toggle("mode-lab", m === "lab");
        this.render();
      });
    });
  }
}
