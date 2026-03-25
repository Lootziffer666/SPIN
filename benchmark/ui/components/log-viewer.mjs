import { api } from "../shared/api.mjs";

export class LogViewer extends HTMLElement {
  constructor({ jobId }){
    super();
    this.jobId = jobId || null;
    this._timer = null;

    this.follow = true; // auto-scroll to bottom
    this._lastTxt = "";
  }

  connectedCallback(){
    this.render();
    this._wire();
    this.poll();
    this._timer = window.setInterval(() => this.poll(), 1000);
  }

  disconnectedCallback(){
    if (this._timer) window.clearInterval(this._timer);
  }

  _wire(){
    const pre = this.querySelector("pre");
    const followBtn = this.querySelector("[data-follow]");
    if (followBtn){
      followBtn.addEventListener("click", () => {
        this.follow = !this.follow;
        this._renderFollow();
        if (this.follow && pre) pre.scrollTop = pre.scrollHeight;
      });
    }

    // If user scrolls up, pause follow automatically.
    pre?.addEventListener("scroll", () => {
      const nearBottom = (pre.scrollHeight - pre.scrollTop - pre.clientHeight) < 40;
      const next = nearBottom ? true : false;
      if (this.follow !== next){
        this.follow = next;
        this._renderFollow();
      }
    }, { passive: true });
  }

  _renderFollow(){
    const followBtn = this.querySelector("[data-follow]");
    if (!followBtn) return;
    followBtn.textContent = this.follow ? "Follow: On" : "Follow: Off";
    followBtn.classList.toggle("primary", this.follow);
  }

  async poll(){
    const pre = this.querySelector("pre");
    const statusEl = this.querySelector("[data-status]");
    if (!pre) return;

    if (!this.jobId){
      if (statusEl) statusEl.textContent = "No job selected";
      pre.textContent = "No job selected.";
      this._lastTxt = pre.textContent;
      return;
    }

    const data = await api.logs(this.jobId, { tail: 20000 }).catch(() => null);
    if (!data) return;

    if (statusEl) statusEl.textContent = `${data.status} • ${data.id}`;

    const header = `[${data.status}] ${data.id}\n\n`;
    const txt = header + (data.log || "");

    if (txt !== this._lastTxt){
      pre.textContent = txt;
      this._lastTxt = txt;
      if (this.follow) pre.scrollTop = pre.scrollHeight;
    }
  }

  render(){
    this.innerHTML = `
      <div class="logbar">
        <div class="muted" data-status style="font-size:12px;">Loading…</div>
        <button class="btn" data-follow type="button">Follow: On</button>
      </div>
      <pre class="log" tabindex="0" aria-label="Job logs">Loading…</pre>
    `;
  }
}
