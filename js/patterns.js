// Islamic Patterns -- the page: the controls, the picture, and the exports.

const $p = (id) => document.getElementById(id);
const SIZE = 720; // the picture, in px (the SVG scales to fit the page)

const DEFAULTS = {
  tiling: "4.6.12",
  angle: 62,
  gap: 0,
  size: 46,
  width: 6,
  style: "interlace",
  palette: "zellige",
  fill: true,
  showTiles: false,
  ox: 0,
  oy: 0,
};

// a few classic designs to start from
const CLASSICS = [
  { name: "Twelve-point rosettes", tiling: "4.6.12", angle: 62, gap: 0, palette: "zellige", style: "interlace", size: 46, width: 6 },
  { name: "Eight-point stars", tiling: "4.8.8", angle: 67.5, gap: 0, palette: "night", style: "interlace", size: 58, width: 7 },
  { name: "Six-point stars", tiling: "6.6.6", angle: 60, gap: 0, palette: "terracotta", style: "interlace", size: 58, width: 7 },
  { name: "Dodecagon chain", tiling: "3.12.12", angle: 30, gap: 0, palette: "night", style: "interlace", size: 40, width: 6 },
  { name: "Damascus", tiling: "3.4.6.4", angle: 50, gap: 0, palette: "isfahan", style: "interlace", size: 56, width: 6 },
  { name: "Woven squares", tiling: "3.3.4.3.4", angle: 60, gap: 0, palette: "ink", style: "interlace", size: 60, width: 6 },
];

const STYLES = { interlace: "Interlaced", bands: "Bands", lines: "Lines" };

let o = { ...DEFAULTS };
let svgText = "";

// ---------------------------------------------------------------- drawing

let pending = false;
function draw() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => {
    pending = false;
    svgText = patternSvg({ ...o, w: SIZE, h: SIZE });
    $p("picture").innerHTML = svgText.replace("<svg ", '<svg class="plain" role="img" aria-label="Islamic star pattern" ');
    saveState();
  });
}

// ---------------------------------------------------------------- controls

function setVal(id, text) {
  $p(id + "-val").textContent = text;
}

function syncControls() {
  $p("tiling").value = o.tiling;
  $p("angle").value = o.angle;
  setVal("angle", o.angle.toFixed(o.angle % 1 ? 1 : 0) + "°");
  $p("gap").value = Math.round(o.gap * 100);
  setVal("gap", o.gap ? Math.round(o.gap * 100) + "%" : "none");
  $p("size").value = o.size;
  setVal("size", o.size + " px");
  $p("width").value = o.width;
  setVal("width", o.width + " px");
  $p("fill").checked = o.fill;
  $p("show-tiles").checked = o.showTiles;
  document.querySelectorAll("#style-chips button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.v === o.style));
  document.querySelectorAll("#palette-chips button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.v === o.palette));
  $p("fill").disabled = !PALETTES[o.palette].fill;
  $p("tiling-note").textContent = tilingNote(o.tiling);
}

function tilingNote(id) {
  const T = TILINGS[id];
  const sides = [...new Set(T.polys.map((p) => p[2]))].sort((a, b) => b - a);
  const names = { 3: "triangles", 4: "squares", 6: "hexagons", 8: "octagons", 12: "dodecagons" };
  return `Vertex type ${id}: ${sides.map((n) => names[n]).join(", ")}.`;
}

function bind(id, key, parse) {
  $p(id).addEventListener("input", (e) => {
    o[key] = parse(e.target.value);
    stopAnimation();
    syncControls();
    draw();
  });
}

function chips(id, entries, key) {
  const el = $p(id);
  el.innerHTML = entries.map(([v, label, extra = ""]) => `<button type="button" data-v="${v}" aria-pressed="false">${extra}${label}</button>`).join("");
  el.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    o[key] = b.dataset.v;
    syncControls();
    draw();
  });
}

function applyClassic(c) {
  stopAnimation();
  o = { ...o, ...c, ox: 0, oy: 0 };
  delete o.name;
  syncControls();
  draw();
}

function surprise() {
  const ids = Object.keys(TILINGS);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const tiling = pick(ids);
  const big = TILINGS[tiling].polys.some((p) => p[2] >= 8);
  applyClassic({
    tiling,
    angle: Math.round(25 + Math.random() * 45),
    gap: Math.random() < 0.3 ? Math.round(10 + Math.random() * 25) / 100 : 0,
    palette: pick(Object.keys(PALETTES)),
    style: pick(["interlace", "interlace", "bands", "lines"]),
    size: big ? 40 + Math.round(Math.random() * 25) : 50 + Math.round(Math.random() * 30),
    width: 4 + Math.round(Math.random() * 4),
  });
}

// ---------------------------------------------------------------- animation

// sweep the contact angle back and forth, to watch the stars open and close
let anim = null;
function toggleAnimation() {
  if (anim) return stopAnimation();
  let dir = 1, last = 0;
  const btn = $p("btn-animate");
  btn.textContent = "Stop";
  btn.setAttribute("aria-pressed", "true");
  const step = (t) => {
    if (!anim) return;
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    o.angle += dir * dt * 8; // degrees a second
    if (o.angle >= 80) (o.angle = 80), (dir = -1);
    if (o.angle <= 15) (o.angle = 15), (dir = 1);
    o.angle = Math.round(o.angle * 10) / 10;
    syncControls();
    draw();
    anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}
function stopAnimation() {
  if (!anim) return;
  cancelAnimationFrame(anim);
  anim = null;
  const btn = $p("btn-animate");
  btn.textContent = "Animate";
  btn.setAttribute("aria-pressed", "false");
}

// ---------------------------------------------------------------- pan

function bindPan() {
  const wrap = $p("picture");
  let start = null;
  wrap.addEventListener("pointerdown", (e) => {
    wrap.setPointerCapture(e.pointerId);
    start = { x: e.clientX, y: e.clientY, ox: o.ox, oy: o.oy, k: SIZE / wrap.getBoundingClientRect().width };
    wrap.classList.add("panning");
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!start) return;
    o.ox = Math.round(start.ox + (e.clientX - start.x) * start.k);
    o.oy = Math.round(start.oy + (e.clientY - start.y) * start.k);
    draw();
  });
  const end = () => {
    start = null;
    wrap.classList.remove("panning");
  };
  wrap.addEventListener("pointerup", end);
  wrap.addEventListener("pointercancel", end);
  wrap.addEventListener("dblclick", () => {
    o.ox = o.oy = 0;
    draw();
  });
}

// ---------------------------------------------------------------- saving

function fileName(ext) {
  return `islamic-pattern-${o.tiling.replace(/\./g, "-")}-${Math.round(o.angle)}.${ext}`;
}

function download(href, name) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function saveSvg() {
  const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + svgText], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  download(url, fileName("svg"));
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function savePng() {
  const px = 2048;
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = c.height = px;
    c.getContext("2d").drawImage(img, 0, 0, px, px);
    URL.revokeObjectURL(url);
    c.toBlob((b) => {
      const u = URL.createObjectURL(b);
      download(u, fileName("png"));
      setTimeout(() => URL.revokeObjectURL(u), 2000);
    }, "image/png");
  };
  img.src = url;
}

// ---------------------------------------------------------------- state

// the settings live in the address, so a pattern can be shared by its link
const PARAMS = { tiling: "t", angle: "a", gap: "g", size: "s", width: "w", style: "st", palette: "c", fill: "f", showTiles: "grid", ox: "x", oy: "y" };

function saveState() {
  const q = new URLSearchParams();
  for (const [k, p] of Object.entries(PARAMS)) {
    if (o[k] === DEFAULTS[k]) continue;
    q.set(p, typeof o[k] === "boolean" ? (o[k] ? 1 : 0) : o[k]);
  }
  const s = q.toString();
  history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
}

function loadState() {
  const q = new URLSearchParams(location.search);
  for (const [k, p] of Object.entries(PARAMS)) {
    if (!q.has(p)) continue;
    const v = q.get(p), d = DEFAULTS[k];
    if (typeof d === "number") {
      const n = parseFloat(v);
      if (isFinite(n)) o[k] = n;
    } else if (typeof d === "boolean") o[k] = v === "1";
    else o[k] = v;
  }
  if (!TILINGS[o.tiling]) o.tiling = DEFAULTS.tiling;
  if (!PALETTES[o.palette]) o.palette = DEFAULTS.palette;
  if (!STYLES[o.style]) o.style = DEFAULTS.style;
  o.angle = Math.min(80, Math.max(10, o.angle));
  o.gap = Math.min(0.4, Math.max(0, o.gap));
  o.size = Math.min(120, Math.max(24, o.size));
  o.width = Math.min(16, Math.max(1, o.width));
}

// ---------------------------------------------------------------- setup

function initPatterns() {
  $p("tiling").innerHTML = Object.entries(TILINGS)
    .map(([id, t]) => `<option value="${id}">${t.name}</option>`)
    .join("");
  chips("style-chips", Object.entries(STYLES), "style");
  chips(
    "palette-chips",
    Object.entries(PALETTES).map(([id, p]) => [id, p.name, `<span class="dot" style="background:${p.bg};border-color:${p.edge}"><span style="background:${p.band}"></span></span>`]),
    "palette",
  );
  $p("classics").innerHTML = CLASSICS.map((c, i) => `<button type="button" class="ghost" data-i="${i}">${c.name}</button>`).join("");
  $p("classics").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) applyClassic(CLASSICS[+b.dataset.i]);
  });
  $p("tiling").addEventListener("change", (e) => {
    o.tiling = e.target.value;
    o.ox = o.oy = 0;
    syncControls();
    draw();
  });
  bind("angle", "angle", parseFloat);
  bind("gap", "gap", (v) => parseInt(v, 10) / 100);
  bind("size", "size", (v) => parseInt(v, 10));
  bind("width", "width", (v) => parseInt(v, 10));
  $p("fill").addEventListener("change", (e) => ((o.fill = e.target.checked), draw()));
  $p("show-tiles").addEventListener("change", (e) => ((o.showTiles = e.target.checked), draw()));
  $p("btn-animate").addEventListener("click", toggleAnimation);
  $p("btn-surprise").addEventListener("click", surprise);
  $p("btn-svg").addEventListener("click", saveSvg);
  $p("btn-png").addEventListener("click", savePng);
  bindPan();
  loadState();
  syncControls();
  draw();
}
