export function toast(type, message, opts){
  const t = (typeof type === "string" && message == null) ? "info" : String(type || "info");
  const msg = (message == null) ? String(type || "") : String(message || "");
  const detail = {
    type: (t === "good" || t === "bad" || t === "warn" || t === "info") ? t : "info",
    message: msg,
    timeoutMs: Number(opts?.timeoutMs) || 3200,
  };
  window.dispatchEvent(new CustomEvent("scoredock:toast", { detail }));
}
