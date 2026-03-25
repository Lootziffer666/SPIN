import { ModeSwitch } from "./components/mode-switch.mjs";
import { DensitySwitch } from "./components/density-switch.mjs";
import { ToastHost } from "./components/toast-host.mjs";

import { JobTable } from "./components/job-table.mjs";
import { LogViewer } from "./components/log-viewer.mjs";
import { PromoteWizard } from "./components/promote-wizard.mjs";

import { SuitePage } from "./pages/suite-page.mjs";
import { LabPage } from "./pages/lab-page.mjs";

function def(name, ctor){
  if (!customElements.get(name)) customElements.define(name, ctor);
}

def("mode-switch", ModeSwitch);
def("density-switch", DensitySwitch);
def("toast-host", ToastHost);

def("job-table", JobTable);
def("log-viewer", LogViewer);
def("promote-wizard", PromoteWizard);

def("suite-page", SuitePage);
def("lab-page", LabPage);

const routes = {
  "/suite": "suite-page",
  "/lab": "lab-page",
};

function setActiveNav(routeKey){
  document.querySelectorAll(".navlink").forEach(a => {
    const r = a.getAttribute("href")?.replace("#","") || "";
    const active = r === routeKey;
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function getRoute(){
  const h = window.location.hash || "#/suite";
  const routeKey = h.replace("#","").split("?")[0];
  return routeKey in routes ? routeKey : "/suite";
}

let currentPage = null;

function applyDensity(){
  const d = (localStorage.getItem("ui:density") || "comfortable").toLowerCase();
  document.documentElement.classList.toggle("density-compact", d === "compact");
}

function render(){
  const app = document.getElementById("app");
  if (!app) return;

  const routeKey = getRoute();
  setActiveNav(routeKey);

  app.replaceChildren();
  const tag = routes[routeKey];
  currentPage = document.createElement(tag);
  currentPage.dataset.route = routeKey;
  app.appendChild(currentPage);

  applyDensity();
}

// Global shortcuts (route delegates to page)
function isTypingTarget(target){
  const el = target;
  if (!el) return false;
  if (el.closest?.("[contenteditable='true']")) return true;
  const tag = (el.tagName || "").toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}

window.addEventListener("keydown", (e) => {
  if (e.defaultPrevented) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (isTypingTarget(e.target)) return;

  const key = String(e.key || "").toLowerCase();
  if (!key) return;

  const handler = currentPage?.handleShortcut;
  if (typeof handler !== "function") return;

  const handled = handler.call(currentPage, key, e);
  if (handled) e.preventDefault();
}, { passive: false });

window.addEventListener("hashchange", render);
render();
