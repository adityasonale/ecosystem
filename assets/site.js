// The one place pages are registered: sidebar nav and prev/next links are
// generated from PAGES. To add a page, create the .html file and add it here.
const PAGES = [
  { group: "Ecosystem" },
  { href: "index.html", title: "Overview" },
  { href: "flows.html", title: "Request flows" },
  { href: "interfaces.html", title: "Interfaces & contracts" },
  { href: "decisions.html", title: "Design decisions" },
  { group: "Karen", color: "var(--karen)" },
  { href: "karen.html", title: "Packages & components" },
  { href: "karen-graph.html", title: "The LangGraph" },
  { href: "karen-agents.html", title: "Agents" },
  { href: "karen-memory.html", title: "Memory & retrieval" },
  { group: "Services" },
  { href: "llm-server.html", title: "llm-server", color: "var(--llm)" },
  { href: "veronica.html", title: "Veronica", color: "var(--veronica)" },
];

(function buildNav() {
  const here = location.pathname.split("/").pop() || "index.html";
  const nav = document.getElementById("nav");
  if (!nav) return;

  let html = '<div class="brand">Ecosystem</div><div class="brand-sub">Karen · llm-server · Veronica</div>';
  let groupColor = null;
  for (const p of PAGES) {
    if (p.group) {
      groupColor = p.color || null;
      html += `<div class="group">${p.group}</div>`;
      continue;
    }
    const color = p.color || groupColor;
    const dot = color ? `<span class="dot" style="background:${color}"></span>` : "";
    html += `<a href="${p.href}" class="${p.href === here ? "active" : ""}">${dot}${p.title}</a>`;
  }
  nav.innerHTML = html;

  // prev / next
  const links = PAGES.filter(p => p.href);
  const i = links.findIndex(p => p.href === here);
  const pager = document.getElementById("pager");
  if (pager && i >= 0) {
    const prev = links[i - 1], next = links[i + 1];
    pager.innerHTML =
      `<span>${prev ? `← <a href="${prev.href}">${prev.title}</a>` : ""}</span>` +
      `<span>${next ? `<a href="${next.href}">${next.title}</a> →` : ""}</span>`;
  }
})();

// Diagrams are Mermaid text inside <pre class="mermaid"> — edit them as text.
// Needs internet for the Mermaid CDN script; offline, the diagram source shows instead.
if (window.mermaid) {
  const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  mermaid.initialize({
    startOnLoad: true,
    theme: dark ? "dark" : "default",
    securityLevel: "loose",
    flowchart: { curve: "basis", htmlLabels: true },
    themeVariables: { fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", fontSize: "14px" },
  });
}
