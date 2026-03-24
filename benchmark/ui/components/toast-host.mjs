export class ToastHost extends HTMLElement {
  connectedCallback(){
    this.innerHTML = `<div class="toastHost" aria-live="polite" aria-relevant="additions"></div>`;
    this._mount = this.querySelector(".toastHost");
    this._onToast = (e) => this._push(e.detail);
    window.addEventListener("scoredock:toast", this._onToast);
  }

  disconnectedCallback(){
    window.removeEventListener("scoredock:toast", this._onToast);
  }

  _push({ type, message, timeoutMs }){
    if (!this._mount) return;

    const el = document.createElement("div");
    el.className = `toast ${type || "info"}`;
    el.setAttribute("role", "status");
    el.innerHTML = `
      <div class="toastMsg"></div>
      <button class="toastX" type="button" aria-label="Dismiss">×</button>
    `;
    el.querySelector(".toastMsg").textContent = message || "";
    el.querySelector(".toastX").addEventListener("click", () => this._remove(el));
    this._mount.appendChild(el);

    window.setTimeout(() => this._remove(el), Number(timeoutMs) || 3200);
  }

  _remove(el){
    if (!el || !el.isConnected) return;
    el.classList.add("out");
    window.setTimeout(() => { try{ el.remove(); }catch{} }, 180);
  }
}
