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
  { href: "karen-agents.html", title: "Tools & agents" },
  { href: "karen-memory.html", title: "Memory & retrieval" },
  { group: "Services" },
  { href: "gateway.html", title: "Gateway", color: "var(--gateway)" },
  { href: "llm-server.html", title: "llm-server", color: "var(--llm)" },
  { href: "veronica.html", title: "Veronica", color: "var(--veronica)" },
];

(function buildNav() {
  const here = location.pathname.split("/").pop() || "index.html";
  const nav = document.getElementById("nav");
  if (!nav) return;

  let html = '<div class="brand">Ecosystem</div><div class="brand-sub">Karen · gateway · llm-server · Veronica</div>';
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
    startOnLoad: false,  // rendered below via mermaid.run(), then zoom controls are added
    theme: dark ? "dark" : "default",
    securityLevel: "loose",
    // useMaxWidth: false → draw at natural size and let .diagram scroll sideways,
    // instead of shrinking wide diagrams (some are ~3000px) to unreadable text.
    flowchart: { curve: "basis", htmlLabels: true, useMaxWidth: false },
    sequence: { useMaxWidth: false },
    class: { useMaxWidth: false },
    state: { useMaxWidth: false },
    er: { useMaxWidth: false },
    themeVariables: { fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif", fontSize: "14px" },
  });

  mermaid.run({ querySelector: "pre.mermaid" }).finally(addZoomControls);
}

// Zoom in / out / fit / reset for every rendered diagram. Zoom resizes the SVG
// itself (crisp at any level); the .diagram box scrolls when it gets wider.
function addZoomControls() {
  const STEP = 1.25, MIN = 0.2, MAX = 4;
  document.querySelectorAll(".diagram").forEach(box => {
    const svg = box.querySelector('svg[id^="mermaid-"]');
    if (!svg || box.parentElement.classList.contains("diagram-wrap")) return;
    const vb = svg.viewBox.baseVal;
    const w = vb && vb.width ? vb.width : svg.getBoundingClientRect().width;
    const h = vb && vb.height ? vb.height : svg.getBoundingClientRect().height;
    if (!w || !h) return;

    const wrap = document.createElement("div");
    wrap.className = "diagram-wrap";
    box.parentNode.insertBefore(wrap, box);
    wrap.appendChild(box);

    const bar = document.createElement("div");
    bar.className = "zoom-bar";
    bar.innerHTML =
      '<button type="button" data-z="out" title="Zoom out" aria-label="Zoom out">−</button>' +
      '<span class="zoom-level" aria-live="polite">100%</span>' +
      '<button type="button" data-z="in" title="Zoom in" aria-label="Zoom in">+</button>' +
      '<button type="button" data-z="fit" title="Fit to width">Fit</button>' +
      '<button type="button" data-z="reset" title="Actual size">1:1</button>';
    wrap.appendChild(bar);
    const label = bar.querySelector(".zoom-level");

    let z = 1;
    const apply = (next, anchorFrac) => {
      const old = z;
      z = Math.min(MAX, Math.max(MIN, next));
      // keep the visible centre in place while zooming
      const cx = (box.scrollLeft + box.clientWidth * anchorFrac) / old;
      svg.style.maxWidth = "none";
      svg.setAttribute("width", w * z);
      svg.setAttribute("height", h * z);
      box.scrollLeft = cx * z - box.clientWidth * anchorFrac;
      label.textContent = Math.round(z * 100) + "%";
    };
    const fitZ = () => (box.clientWidth - 40) / w;  // 40 = .diagram padding

    bar.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b) return;
      const a = b.dataset.z;
      if (a === "in") apply(z * STEP, 0.5);
      else if (a === "out") apply(z / STEP, 0.5);
      else if (a === "fit") apply(fitZ(), 0);
      else apply(1, 0);
    });
    // Ctrl/⌘ + scroll wheel (and trackpad pinch) zooms the diagram under the cursor
    box.addEventListener("wheel", e => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const r = box.getBoundingClientRect();
      apply(z * (e.deltaY < 0 ? 1.1 : 1 / 1.1), (e.clientX - r.left) / r.width);
    }, { passive: false });

    apply(1, 0);
  });
}
