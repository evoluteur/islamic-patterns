// Islamic Patterns -- the geometry.
//
// Star patterns are drawn with Hankin's "polygons in contact" method (E. H.
// Hankin, 1925; as formalized by Craig S. Kaplan): take a tiling of regular
// polygons, and from the midpoint of every edge send two rays into each tile,
// at the contact angle from the edge. Each ray stops where it meets the ray
// coming from the next edge. The rays of neighboring tiles meet at the
// midpoints and cross there, so the lines run on from tile to tile, and stars
// and rosettes appear around the tiles.
//
// The lines are then joined into strands, every crossing is found, and the
// strands are woven over and under, alternately, for the interlace.

const S3 = Math.sqrt(3);
const D2R = Math.PI / 180;
const IN12 = (2 + S3) / 2; // inradius of a dodecagon with edges of 1
const W8 = 1 + Math.SQRT2; // width of an octagon with edges of 1

// The tilings: two lattice vectors, and the polygons of one cell as
// [center x, center y, sides, angle of the first vertex in degrees]. Edges of 1.
const TILINGS = {
  "4.8.8": {
    name: "Octagons and squares",
    a: [W8, 0],
    b: [0, W8],
    polys: [
      [0, 0, 8, 22.5],
      [W8 / 2, W8 / 2, 4, 0],
    ],
  },
  "4.6.12": (() => {
    const d = 2 * IN12 + 1, q = IN12 + 0.5;
    return {
      name: "Dodecagons, hexagons and squares",
      a: [d, 0],
      b: [d / 2, (d * S3) / 2],
      polys: [
        [0, 0, 12, 15],
        [q, 0, 4, 45],
        [q * Math.cos(60 * D2R), q * Math.sin(60 * D2R), 4, 105],
        [q * Math.cos(120 * D2R), q * Math.sin(120 * D2R), 4, 165],
        [d / 2, d / (2 * S3), 6, 0],
        [d / 2, -d / (2 * S3), 6, 0],
      ],
    };
  })(),
  "3.12.12": {
    name: "Dodecagons and triangles",
    a: [2 * IN12, 0],
    b: [IN12, S3 * IN12],
    polys: [
      [0, 0, 12, 15],
      [IN12, IN12 / S3, 3, 30],
      [IN12, -IN12 / S3, 3, -30],
    ],
  },
  "6.6.6": {
    name: "Hexagons",
    a: [S3, 0],
    b: [S3 / 2, 1.5],
    polys: [[0, 0, 6, 30]],
  },
  "3.4.6.4": (() => {
    const d = S3 + 1, q = S3 / 2 + 0.5;
    return {
      name: "Hexagons, squares and triangles",
      a: [d, 0],
      b: [d / 2, (d * S3) / 2],
      polys: [
        [0, 0, 6, 30],
        [q, 0, 4, 45],
        [q * Math.cos(60 * D2R), q * Math.sin(60 * D2R), 4, 105],
        [q * Math.cos(120 * D2R), q * Math.sin(120 * D2R), 4, 165],
        [d / 2, d / (2 * S3), 3, 90],
        [d / 2, -d / (2 * S3), 3, 30],
      ],
    };
  })(),
  "3.6.3.6": {
    name: "Hexagons and triangles",
    a: [2, 0],
    b: [1, S3],
    polys: [
      [0, 0, 6, 0],
      [1, 1 / S3, 3, 270],
      [0, 2 / S3, 3, 90],
    ],
  },
  "4.4.4.4": {
    name: "Squares",
    a: [1, 0],
    b: [0, 1],
    polys: [[0, 0, 4, 45]],
  },
  "3.3.4.3.4": (() => {
    // snub square: squares turned 15 degrees, with triangles between them
    const s = Math.sqrt(2 + S3); // length of the cell side
    const r = 1 / Math.SQRT2;
    return {
      name: "Snub squares",
      a: [s, 0],
      b: [0, s],
      polys: [
        [0, 0, 4, 60],
        [s / 2, s / 2, 4, 30],
        ...snubTriangles(s, r),
      ],
    };
  })(),
  "3.3.3.4.4": {
    name: "Squares and triangles in rows",
    a: [1, 0],
    b: [0.5, 1 + S3 / 2],
    polys: [
      [0.5, 0.5, 4, 45],
      [0.5, 1 + S3 / 6, 3, 90],
      [1, 1 + S3 / 3, 3, 270],
    ],
  },
  "3.3.3.3.3.3": {
    name: "Triangles",
    a: [1, 0],
    b: [0.5, S3 / 2],
    polys: [
      [0.5, S3 / 6, 3, 90],
      [1, S3 / 3, 3, 270],
    ],
  },
};

// the four triangles of the snub square cell, found from the two squares:
// each triangle fills a gap between the squares' vertices
function snubTriangles(s, r) {
  const sq = (cx, cy, a0) => [0, 1, 2, 3].map((k) => [cx + r * Math.cos((a0 + 90 * k) * D2R), cy + r * Math.sin((a0 + 90 * k) * D2R)]);
  const verts = [];
  for (const [cx, cy, a0] of [
    [0, 0, 60],
    [s / 2, s / 2, 30],
  ]) {
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) verts.push(...sq(cx + i * s, cy + j * s, a0));
  }
  // centroids of unit triangles made of three vertices 1 apart, inside the cell
  const tris = [];
  const near = (p, q) => Math.abs(Math.hypot(p[0] - q[0], p[1] - q[1]) - 1) < 1e-6;
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) {
      if (!near(verts[i], verts[j])) continue;
      for (let k = j + 1; k < verts.length; k++) {
        if (!near(verts[i], verts[k]) || !near(verts[j], verts[k])) continue;
        const c = [(verts[i][0] + verts[j][0] + verts[k][0]) / 3, (verts[i][1] + verts[j][1] + verts[k][1]) / 3];
        // keep one copy per cell, and only real tiles: three vertices of two
        // squares can also make a triangle that lies inside a square
        if (c[0] < -1e-6 || c[1] < -1e-6 || c[0] >= s - 1e-6 || c[1] >= s - 1e-6) continue;
        let inSquare = false;
        for (const [qx, qy] of [
          [0, 0],
          [s / 2, s / 2],
        ])
          for (let i2 = -1; i2 <= 2; i2++)
            for (let j2 = -1; j2 <= 2; j2++) if (Math.hypot(c[0] - qx - i2 * s, c[1] - qy - j2 * s) < 0.6) inSquare = true;
        if (inSquare) continue;
        if (tris.some((t) => Math.hypot(t[0] - c[0], t[1] - c[1]) < 1e-6)) continue;
        const a0 = Math.atan2(verts[i][1] - c[1], verts[i][0] - c[0]) / D2R;
        tris.push([c[0], c[1], 3, a0]);
      }
    }
  return tris;
}

// ---------------------------------------------------------------- the tiles

// all the polygons of a tiling that touch the rectangle [x0, x1] x [y0, y1]
function tilesIn(tiling, x0, y0, x1, y1) {
  const T = TILINGS[tiling];
  const [ax, ay] = T.a, [bx, by] = T.b;
  const det = ax * by - ay * bx;
  // lattice coordinates of the corners give the range of cells to visit
  const cell = (x, y) => [(x * by - y * bx) / det, (ax * y - ay * x) / det];
  const cs = [cell(x0, y0), cell(x1, y0), cell(x0, y1), cell(x1, y1)];
  const i0 = Math.floor(Math.min(...cs.map((c) => c[0]))) - 2, i1 = Math.ceil(Math.max(...cs.map((c) => c[0]))) + 2;
  const j0 = Math.floor(Math.min(...cs.map((c) => c[1]))) - 2, j1 = Math.ceil(Math.max(...cs.map((c) => c[1]))) + 2;
  const out = [];
  for (let i = i0; i <= i1; i++) {
    for (let j = j0; j <= j1; j++) {
      for (const [cx0, cy0, n, a0] of T.polys) {
        const cx = cx0 + i * ax + j * bx, cy = cy0 + i * ay + j * by;
        const R = 1 / (2 * Math.sin(Math.PI / n));
        if (cx + R < x0 || cx - R > x1 || cy + R < y0 || cy - R > y1) continue;
        const v = [];
        for (let k = 0; k < n; k++) {
          const a = (a0 + (360 * k) / n) * D2R;
          v.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
        }
        out.push({ n, c: [cx, cy], v });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------- Hankin's rays

const cross2 = (ax, ay, bx, by) => ax * by - ay * bx;

// where the lines p + t u and q + s w meet
function meet(p, u, q, w) {
  const d = cross2(u[0], u[1], w[0], w[1]);
  if (Math.abs(d) < 1e-12) return null;
  const t = cross2(q[0] - p[0], q[1] - p[1], w[0], w[1]) / d;
  return [p[0] + t * u[0], p[1] + t * u[1]];
}

// the motif of one tile: its line segments, and the outline of its star
//   angle: contact angle in degrees, from the edge
//   gap: distance between the two contact points of an edge, in edge lengths
function motif(tile, angle, gap) {
  const { v, c, n } = tile;
  const th = angle * D2R, ct = Math.cos(th), st = Math.sin(th);
  const edges = [];
  for (let k = 0; k < n; k++) {
    const a = v[k], b = v[(k + 1) % n];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const e = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    let nr = [-e[1], e[0]];
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if ((c[0] - m[0]) * nr[0] + (c[1] - m[1]) * nr[1] < 0) nr = [-nr[0], -nr[1]]; // inward
    const h = (gap * len) / 2;
    // with a gap, the two rays cross just inside the edge: the ray that leans
    // toward the end b starts from the point nearer a, and the other way round
    const toB = { p: [m[0] - e[0] * h, m[1] - e[1] * h], d: [e[0] * ct + nr[0] * st, e[1] * ct + nr[1] * st] };
    const toA = { p: [m[0] + e[0] * h, m[1] + e[1] * h], d: [-e[0] * ct + nr[0] * st, -e[1] * ct + nr[1] * st] };
    // where the two rays of the edge cross (the midpoint itself without a gap)
    const x = h > 0 ? meet(toB.p, toB.d, toA.p, toA.d) || m : m;
    edges.push({ toA, toB, x });
  }
  const segs = [], star = [];
  for (let k = 0; k < n; k++) {
    const r1 = edges[k].toB, r2 = edges[(k + 1) % n].toA;
    // the two rays meet on the bisector of the corner between their edges
    // (found that way, rather than ray with ray, it never runs parallel)
    const w = v[(k + 1) % n];
    const P = meet(r1.p, r1.d, w, [c[0] - w[0], c[1] - w[1]]) || c;
    segs.push([r1.p, P], [P, r2.p]);
    star.push(edges[k].x, P);
  }
  return { segs, star };
}

// ---------------------------------------------------------------- strands

const KEY = 1e5;
const key = (p) => Math.round(p[0] * KEY) + "," + Math.round(p[1] * KEY);

// join the segments into strands (polylines) and find where they cross
function weave(segs) {
  // the segments, without the duplicates two tiles can make
  const seen = new Set();
  const S = [];
  for (const s of segs) {
    if (Math.hypot(s[0][0] - s[1][0], s[0][1] - s[1][1]) < 1e-9) continue;
    const k1 = key(s[0]), k2 = key(s[1]);
    const id = k1 < k2 ? k1 + "|" + k2 : k2 + "|" + k1;
    if (seen.has(id)) continue;
    seen.add(id);
    S.push({ a: s[0], b: s[1], ka: k1, kb: k2 });
  }
  // the ends that meet at each node
  const nodes = new Map();
  S.forEach((s, i) => {
    for (const end of [0, 1]) {
      const k = end ? s.kb : s.ka;
      if (!nodes.has(k)) nodes.set(k, []);
      nodes.get(k).push({ i, end });
    }
  });
  // at each node, pair the ends that go on from one another: two ends turn a
  // corner, four ends are two lines crossing straight
  const link = new Map(); // "i:end" -> {i, end}
  const nodeX = []; // crossings at nodes: [segment of one line, segment of the other, point]
  const dir = (s, end) => {
    const [p, q] = end ? [s.b, s.a] : [s.a, s.b];
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    return [(q[0] - p[0]) / L, (q[1] - p[1]) / L];
  };
  for (const ends of nodes.values()) {
    if (ends.length === 2) {
      link.set(ends[0].i + ":" + ends[0].end, ends[1]);
      link.set(ends[1].i + ":" + ends[1].end, ends[0]);
    } else if (ends.length === 4) {
      const d = ends.map((x) => dir(S[x.i], x.end));
      // the end most opposite the first one is its straight continuation
      let best = 1, bd = 2;
      for (let j = 1; j < 4; j++) {
        const dd = d[0][0] * d[j][0] + d[0][1] * d[j][1];
        if (dd < bd) (bd = dd), (best = j);
      }
      const rest = [1, 2, 3].filter((j) => j !== best);
      for (const [x, y] of [
        [0, best],
        [rest[0], rest[1]],
      ]) {
        link.set(ends[x].i + ":" + ends[x].end, ends[y]);
        link.set(ends[y].i + ":" + ends[y].end, ends[x]);
      }
      const e = ends[0];
      nodeX.push([ends[0].i, ends[rest[0]].i, e.end ? S[e.i].b : S[e.i].a]);
    }
  }
  // follow the links into strands
  const strandOf = new Array(S.length).fill(-1);
  const strands = [];
  for (let i0 = 0; i0 < S.length; i0++) {
    if (strandOf[i0] >= 0) continue;
    const id = strands.length;
    // walk back to the start of an open strand, or once around a closed one
    let i = i0, end = 0;
    for (let guard = 0; guard < S.length; guard++) {
      const nx = link.get(i + ":" + end);
      if (!nx || nx.i === i0) break;
      i = nx.i;
      end = 1 - nx.end;
    }
    // now walk forward from there, leaving by the other end of each segment
    const pts = [end ? S[i].b : S[i].a];
    const segIdx = [];
    let closed = false;
    for (let guard = 0; guard <= S.length; guard++) {
      strandOf[i] = id;
      segIdx.push(i);
      pts.push(end ? S[i].a : S[i].b);
      const nx = link.get(i + ":" + (1 - end));
      if (!nx) break;
      if (strandOf[nx.i] === id) {
        closed = true;
        break;
      }
      i = nx.i;
      end = nx.end;
    }
    strands.push({ pts, segIdx, closed });
  }
  // arc length of each segment's start along its strand, to place crossings
  const at = new Array(S.length);
  for (const st of strands) {
    let s = 0;
    st.segIdx.forEach((i, j) => {
      const p = st.pts[j], q = st.pts[j + 1];
      at[i] = { s0: s, p, q };
      s += Math.hypot(q[0] - p[0], q[1] - p[1]);
    });
    st.length = s;
  }
  const where = (i, pt) => {
    const a = at[i];
    return a.s0 + Math.hypot(pt[0] - a.p[0], pt[1] - a.p[1]);
  };
  // the crossings: at nodes, and wherever two segments cross inside a tile
  const crossings = nodeX.map(([i, j, p]) => ({ p, sin: sinBetween(S[i], S[j]), u: { st: strandOf[i], s: where(i, p) }, v: { st: strandOf[j], s: where(j, p) } }));
  // a grid of cells about the size of a segment, to test only nearby pairs
  let tot = 0;
  for (const sg of S) tot += Math.hypot(sg.b[0] - sg.a[0], sg.b[1] - sg.a[1]);
  const G = Math.max(1e-6, (tot / Math.max(1, S.length)) * 1.5), grid = new Map();
  S.forEach((s, i) => {
    const gx0 = Math.floor(Math.min(s.a[0], s.b[0]) / G), gx1 = Math.floor(Math.max(s.a[0], s.b[0]) / G);
    const gy0 = Math.floor(Math.min(s.a[1], s.b[1]) / G), gy1 = Math.floor(Math.max(s.a[1], s.b[1]) / G);
    for (let gx = gx0; gx <= gx1; gx++)
      for (let gy = gy0; gy <= gy1; gy++) {
        const k = gx + "," + gy;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(i);
      }
  });
  const tested = new Set();
  for (const list of grid.values()) {
    for (let x = 0; x < list.length; x++)
      for (let y = x + 1; y < list.length; y++) {
        const i = list[x], j = list[y];
        const id = i < j ? i * S.length + j : j * S.length + i;
        if (tested.has(id)) continue;
        tested.add(id);
        if (S[i].ka === S[j].ka || S[i].ka === S[j].kb || S[i].kb === S[j].ka || S[i].kb === S[j].kb) continue;
        const p = properCross(S[i], S[j]);
        if (p) crossings.push({ p, sin: sinBetween(S[i], S[j]), u: { st: strandOf[i], s: where(i, p) }, v: { st: strandOf[j], s: where(j, p) } });
      }
  }
  overUnder(strands, crossings);
  return { strands, crossings };
}

// sine of the angle between two segments
function sinBetween(s, t) {
  const r = [s.b[0] - s.a[0], s.b[1] - s.a[1]], q = [t.b[0] - t.a[0], t.b[1] - t.a[1]];
  return Math.abs(cross2(r[0], r[1], q[0], q[1])) / (Math.hypot(r[0], r[1]) * Math.hypot(q[0], q[1]));
}

// where two segments cross, if they cross away from their ends
function properCross(s, t) {
  const r = [s.b[0] - s.a[0], s.b[1] - s.a[1]], q = [t.b[0] - t.a[0], t.b[1] - t.a[1]];
  const d = cross2(r[0], r[1], q[0], q[1]);
  if (Math.abs(d) < 1e-12) return null;
  const wx = t.a[0] - s.a[0], wy = t.a[1] - s.a[1];
  const u = cross2(wx, wy, q[0], q[1]) / d, v = cross2(wx, wy, r[0], r[1]) / d;
  const e = 1e-6;
  if (u <= e || u >= 1 - e || v <= e || v >= 1 - e) return null;
  return [s.a[0] + u * r[0], s.a[1] + u * r[1]];
}

// over, under, over, under along every strand: set one crossing, and spread
// the rule to the next crossings along both strands
function overUnder(strands, crossings) {
  const along = strands.map(() => []);
  crossings.forEach((c, ci) => {
    along[c.u.st].push({ s: c.u.s, ci, side: "u" });
    along[c.v.st].push({ s: c.v.s, ci, side: "v" });
  });
  for (const a of along) a.sort((x, y) => x.s - y.s);
  const pos = new Map(); // "ci:side" -> index in its strand's list
  along.forEach((a, st) => a.forEach((x, k) => pos.set(x.ci + ":" + x.side, [st, k])));
  const overOf = (c, side) => (c.over === side ? 1 : 0); // 1 if that side passes over
  for (let c0 = 0; c0 < crossings.length; c0++) {
    if (crossings[c0].over) continue;
    crossings[c0].over = "u";
    const queue = [c0];
    while (queue.length) {
      const ci = queue.pop();
      const c = crossings[ci];
      for (const side of ["u", "v"]) {
        const [st, k] = pos.get(ci + ":" + side);
        const up = overOf(c, side);
        for (const kk of [k - 1, k + 1]) {
          const n = along[st][kk];
          if (!n) continue;
          const nc = crossings[n.ci];
          if (nc.over) continue;
          // the strand passes the other way at its next crossing
          nc.over = up ? (n.side === "u" ? "v" : "u") : n.side;
          queue.push(n.ci);
        }
      }
    }
  }
  for (const c of crossings) c.overStrand = c.over === "u" ? c.u : c.v;
}

// a piece of a strand, from arc length s0 to s1
function piece(st, s0, s1) {
  const pts = st.pts;
  if (!st.cum) {
    st.cum = [0];
    for (let i = 1; i < pts.length; i++) st.cum.push(st.cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const cum = st.cum;
  // the first segment that ends after s0
  let lo = 0, hi = pts.length - 2;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid + 1] <= s0) lo = mid + 1;
    else hi = mid;
  }
  const out = [];
  for (let i = lo; i < pts.length - 1 && cum[i] < s1; i++) {
    const p = pts[i], q = pts[i + 1], s = cum[i], L = cum[i + 1] - s;
    if (L <= 0) continue;
    const a = Math.max(s0, s), b = Math.min(s1, s + L);
    if (b <= a) continue;
    const f = (x) => [p[0] + ((x - s) / L) * (q[0] - p[0]), p[1] + ((x - s) / L) * (q[1] - p[1])];
    if (!out.length) out.push(f(a));
    out.push(f(b));
  }
  return out;
}

// ---------------------------------------------------------------- the picture

const PALETTES = {
  zellige: {
    name: "Zellige",
    bg: "#efe4cc",
    band: "#fbf6ea",
    edge: "#2f261c",
    line: "#2f261c",
    fill: { 3: "#d29b3e", 4: "#b5452f", 6: "#2b7a5f", 8: "#1d5a85", 12: "#1d5a85" },
    tile: "rgba(47,38,28,0.25)",
  },
  night: {
    name: "Gold on night",
    bg: "#0f1b2d",
    band: "#d9b54a",
    edge: "#070d18",
    line: "#d9b54a",
    fill: { 3: "#1b3352", 4: "#22436b", 6: "#173a5e", 8: "#1d4c7a", 12: "#1d4c7a" },
    tile: "rgba(217,181,74,0.3)",
  },
  isfahan: {
    name: "Isfahan",
    bg: "#156a83",
    band: "#f4ead2",
    edge: "#0b3442",
    line: "#f4ead2",
    fill: { 3: "#e1b54c", 4: "#e1b54c", 6: "#0e4f63", 8: "#0d4357", 12: "#0d4357" },
    tile: "rgba(244,234,210,0.3)",
  },
  terracotta: {
    name: "Terracotta",
    bg: "#c56a3e",
    band: "#f6e7cf",
    edge: "#4a2414",
    line: "#f6e7cf",
    fill: { 3: "#2f5d50", 4: "#8f3b1f", 6: "#e0a25a", 8: "#7c321a", 12: "#7c321a" },
    tile: "rgba(246,231,207,0.3)",
  },
  ink: {
    name: "Ink on paper",
    bg: "#f7f3ea",
    band: "#ffffff",
    edge: "#1d1d1d",
    line: "#1d1d1d",
    fill: null,
    tile: "rgba(29,29,29,0.2)",
  },
  chalk: {
    name: "Chalk on slate",
    bg: "#2c3238",
    band: "#3a4148",
    edge: "#e9e6df",
    line: "#e9e6df",
    fill: null,
    tile: "rgba(233,230,223,0.25)",
  },
};

const f2 = (x) => Math.round(x * 10) / 10;
const pathOf = (pts, close) => "M" + pts.map((p) => f2(p[0]) + " " + f2(p[1])).join("L") + (close ? "Z" : "");

// the pattern as an SVG document
//   o: { tiling, angle, gap, size (px per edge), width (line width in px),
//        style: "lines" | "bands" | "interlace", palette, fill, showTiles, w, h }
function patternSvg(o) {
  const P = PALETTES[o.palette] || PALETTES.zellige;
  const W = o.w, H = o.h, k = o.size;
  // pattern units, with the first polygon of a cell at the center of the
  // picture, moved by the pan offset (in px)
  const cx = W / 2 + (o.ox || 0), cy = H / 2 + (o.oy || 0);
  const tiles = tilesIn(o.tiling, -cx / k - 1, -cy / k - 1, (W - cx) / k + 1, (H - cy) / k + 1);
  const tx = (p) => [cx + p[0] * k, cy + p[1] * k];
  const segs = [];
  const stars = [];
  for (const t of tiles) {
    const m = motif(t, o.angle, o.gap);
    for (const s of m.segs) segs.push([tx(s[0]), tx(s[1])]);
    stars.push({ n: t.n, pts: m.star.map(tx) });
  }
  let body = `<rect width="${W}" height="${H}" fill="${P.bg}"/>`;
  if (o.fill && P.fill) {
    const byColor = {};
    for (const s of stars) {
      const col = P.fill[s.n] || P.fill[12];
      (byColor[col] = byColor[col] || []).push(pathOf(s.pts, true));
    }
    for (const [col, ds] of Object.entries(byColor)) body += `<path fill="${col}" d="${ds.join("")}"/>`;
  }
  if (o.showTiles) {
    body += `<path fill="none" stroke="${P.tile}" stroke-width="1" d="${tiles.map((t) => pathOf(t.v.map(tx), true)).join("")}"/>`;
  }
  const lw = o.width;
  if (o.style === "lines") {
    const { strands } = weave(segs);
    body += `<path fill="none" stroke="${P.line}" stroke-width="${lw}" stroke-linejoin="round" stroke-linecap="round" d="${strands.map((s) => pathOf(s.pts, s.closed)).join("")}"/>`;
  } else {
    const { strands, crossings } = weave(segs);
    const all = strands.map((s) => pathOf(s.pts, s.closed)).join("");
    const outer = lw + Math.max(2, lw * 0.35) * 2;
    body += `<path fill="none" stroke="${P.edge}" stroke-width="${f2(outer)}" stroke-linejoin="miter" stroke-miterlimit="6" d="${all}"/>`;
    body += `<path fill="none" stroke="${P.band}" stroke-width="${lw}" stroke-linejoin="miter" stroke-miterlimit="6" d="${all}"/>`;
    if (o.style === "interlace") {
      // the strand that passes over is drawn again, across the other one
      // far enough along the over strand to clear the other band at that angle
      const reachOf = (c) => outer / 2 / Math.max(0.25, c.sin || 1) + outer * 0.15;
      const ds = [], ds2 = [];
      for (const c of crossings) {
        const os = c.overStrand, st = strands[os.st], r = reachOf(c);
        const a = piece(st, os.s - r, os.s + r);
        if (a.length > 1) ds.push(pathOf(a, false));
        // the band again, a hair longer, so the outline only shows along its sides
        const b = piece(st, os.s - r - 1.5, os.s + r + 1.5);
        if (b.length > 1) ds2.push(pathOf(b, false));
      }
      body += `<path fill="none" stroke="${P.edge}" stroke-width="${f2(outer)}" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="6" d="${ds.join("")}"/>`;
      body += `<path fill="none" stroke="${P.band}" stroke-width="${lw}" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="6" d="${ds2.join("")}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${body}</svg>`;
}

if (typeof module !== "undefined") module.exports = { TILINGS, PALETTES, tilesIn, motif, weave, patternSvg };
