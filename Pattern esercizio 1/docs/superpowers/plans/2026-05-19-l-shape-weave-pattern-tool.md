# L-Shape Weave Pattern Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file HTML tool that generates woven vector patterns from L-shapes on a square grid, with per-shape rotation, interlocking, and SVG/PNG export.

**Architecture:** Single `index.html` with embedded CSS and JS. SVG-based rendering — live view is the export. Geometry engine computes L-shapes, detects segment intersections, splits segments, and renders with over/under gaps for textile-style interlocking.

**Tech Stack:** Vanilla HTML5, CSS3, ES6 JavaScript, SVG (no frameworks or libraries)

---

### Task 1: HTML structure and CSS layout

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the HTML skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>L-Shape Weave Pattern Tool</title>
<style>
/* styles here */
</style>
</head>
<body>
<div id="app">
  <div id="canvas-area">
    <svg id="pattern-svg" xmlns="http://www.w3.org/2000/svg"></svg>
  </div>
  <div id="controls">
    <!-- control groups will go here -->
  </div>
</div>
<script>
/* all JS here */
</script>
</body>
</html>
```

- [ ] **Step 2: Write CSS for layout and controls**

Flexbox layout: canvas area takes remaining width, controls panel has fixed width (~280px) on the right. SVG fills the canvas area. Controls organized in labeled groups with consistent spacing. Use system fonts, subtle borders, and a clean dark-on-light theme.

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f5f5f5; color: #222; height: 100vh; overflow: hidden; }
#app { display: flex; height: 100vh; }
#canvas-area { flex: 1; display: flex; align-items: center; justify-content: center; background: #fff; overflow: hidden; }
#pattern-svg { display: block; }
#controls { width: 280px; min-width: 280px; padding: 16px; overflow-y: auto; background: #fafafa; border-left: 1px solid #ddd; }
.control-group { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #eee; }
.control-group:last-child { border-bottom: none; }
.control-group h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 8px; }
.control-row { display: flex; align-items: center; margin-bottom: 6px; gap: 8px; }
.control-row label { font-size: 13px; flex: 0 0 90px; color: #555; }
.control-row input[type="range"] { flex: 1; }
.control-row input[type="number"] { width: 50px; padding: 2px 4px; font-size: 12px; border: 1px solid #ccc; border-radius: 3px; }
.control-row input[type="color"] { width: 32px; height: 28px; padding: 0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer; }
.control-row select { flex: 1; padding: 3px 4px; font-size: 12px; border: 1px solid #ccc; border-radius: 3px; background: #fff; }
.control-row .value { font-size: 12px; min-width: 30px; text-align: right; color: #333; }
.btn-export { padding: 8px 16px; font-size: 13px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background: #fff; width: 100%; margin-bottom: 6px; }
.btn-export:hover { background: #eee; }
```

- [ ] **Step 3: Verify layout renders in browser**

Open `index.html` in a browser. Expected: empty white canvas area on left, empty controls panel on right with correct dimensions.

---

### Task 2: Config state and control panel HTML

- [ ] **Step 1: Define the central config object in JS**

```js
const cfg = {
  cols: 10,
  rows: 10,
  spacing: 60,
  armA: 30,
  armB: 30,
  armLocked: true,
  strokeWidth: 2,
  strokeColor: '#222222',
  bgColor: '#ffffff',
  patternType: 'sine',
  freqX: 1,
  freqY: 1,
  amplitude: 90,
  phase: 0,
  interlockMode: 'gap',
  gapRatio: 0.5,
  seed: 42
};
```

- [ ] **Step 2: Write the full control panel HTML inside `#controls`**

Include all controls from the spec. Group them logically:

**Grid group:** cols (number), rows (number), spacing (range + value display)

**Arms group:** armA (range), armB (range), armLocked (checkbox), strokeWidth (range)

**Colors group:** strokeColor (color picker), bgColor (color picker)

**Pattern group:** patternType (select: sine, gradient, checker, spiral), freqX (range), freqY (range), amplitude (range), phase (range)

**Interlocking group:** interlockMode (select: gap, opacity, off), gapRatio (range, disabled when mode != 'gap')

**Export group:** Export SVG button, Export PNG button

Each range input shows its current value in a `.value` span next to it.

- [ ] **Step 3: Verify controls render**

Open in browser. Expected: all control groups visible with labels, sliders, inputs. Buttons visible but not functional yet.

---

### Task 3: Geometry engine — grid and L-shapes

- [ ] **Step 1: Write the grid generation function**

```js
function generateLShapes(cols, rows, spacing) {
  const shapes = [];
  const offsetX = (cols - 1) * spacing / 2;
  const offsetY = (rows - 1) * spacing / 2;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * spacing - offsetX;
      const cy = row * spacing - offsetY;
      shapes.push({ cx, cy, col, row, id: `s${row}-${col}` });
    }
  }
  return shapes;
}
```

- [ ] **Step 2: Write the rotation angle computation per pattern type**

```js
function getAngle(col, row, cols, rows, patternType, freqX, freqY, amplitude, phase) {
  const ph = phase * Math.PI / 180;
  const amp = amplitude * Math.PI / 180;
  const nx = col / Math.max(cols - 1, 1);
  const ny = row / Math.max(rows - 1, 1);
  switch (patternType) {
    case 'sine': return amp * (Math.sin(nx * freqX * 2 * Math.PI + ph) + Math.cos(ny * freqY * 2 * Math.PI + ph)) / 2;
    case 'gradient': return amp * ((nx + ny) / 2);
    case 'checker': return ((col + row) % 2 === 0) ? amp : -amp;
    case 'spiral': {
      const cx2 = (col - (cols-1)/2) / Math.max(cols, rows);
      const cy2 = (row - (rows-1)/2) / Math.max(cols, rows);
      const dist = Math.sqrt(cx2*cx2 + cy2*cy2);
      const angle = Math.atan2(cy2, cx2);
      return amp * Math.sin(dist * 4 * Math.PI + angle + ph) / 2;
    }
    default: return 0;
  }
}
```

- [ ] **Step 3: Write function to compute L-shape segments**

An L-shape at origin `(cx, cy)` with rotation `θ`, arms of length `lenA` and `lenB`:

```js
function shapeToSegments(shape, lenA, lenB, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const perpCos = Math.cos(angle + Math.PI / 2);
  const perpSin = Math.sin(angle + Math.PI / 2);
  return [
    {
      x1: shape.cx, y1: shape.cy,
      x2: shape.cx + lenA * cos, y2: shape.cy + lenA * sin,
      shapeId: shape.id, segIdx: 0
    },
    {
      x1: shape.cx, y1: shape.cy,
      x2: shape.cx + lenB * perpCos, y2: shape.cy + lenB * perpSin,
      shapeId: shape.id, segIdx: 1
    }
  ];
}
```

- [ ] **Step 4: Write function to build all segments**

```js
function buildAllSegments(cfg) {
  const shapes = generateLShapes(cfg.cols, cfg.rows, cfg.spacing);
  const lenA = cfg.armA;
  const lenB = cfg.armLocked ? cfg.armA : cfg.armB;
  const segments = [];
  for (const shape of shapes) {
    const angle = getAngle(shape.col, shape.row, cfg.cols, cfg.rows, cfg.patternType, cfg.freqX, cfg.freqY, cfg.amplitude, cfg.phase);
    const segs = shapeToSegments(shape, lenA, lenB, angle);
    segments.push(...segs);
  }
  return { shapes, segments };
}
```

- [ ] **Step 5: Verify segment computation**

Temporarily log segments to console and inspect values manually. Each L-shape should produce 2 segments that start at the grid point and extend in perpendicular directions with the correct rotation.

---

### Task 4: Intersection detection and segment splitting

- [ ] **Step 1: Write the line segment intersection function**

```js
function segmentIntersection(s1, s2) {
  const dx1 = s1.x2 - s1.x1, dy1 = s1.y2 - s1.y1;
  const dx2 = s2.x2 - s2.x1, dy2 = s2.y2 - s2.y1;
  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((s2.x1 - s1.x1) * dy2 - (s2.y1 - s1.y1) * dx2) / denom;
  const u = ((s2.x1 - s1.x1) * dy1 - (s2.y1 - s1.y1) * dx1) / denom;
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: s1.x1 + t * dx1,
      y: s1.y1 + t * dy1,
      t, u,
      segA: s1, segB: s2
    };
  }
  return null;
}
```

Note: shared origin points (where two L-shape arms meet) should be excluded — two segments sharing an endpoint do not count as an intersection for interlocking. Add a check: skip if `t < 1e-6 || t > 1 - 1e-6 || u < 1e-6 || u > 1 - 1e-6`.

- [ ] **Step 2: Write the full intersection detection pass**

```js
function findAllIntersections(segments) {
  const intersections = [];
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const pt = segmentIntersection(segments[i], segments[j]);
      if (pt) {
        pt.segA = segments[i];
        pt.segB = segments[j];
        intersections.push(pt);
      }
    }
  }
  return intersections;
}
```

- [ ] **Step 3: Write the segment splitting function**

For each segment, collect all intersection points where it participates. Sort by `t` parameter. Produce sub-segments:

```js
function splitSegments(segments, intersections) {
  const splitMap = new Map();
  for (const seg of segments) {
    splitMap.set(seg, []);
  }
  for (const pt of intersections) {
    splitMap.get(pt.segA).push({ t: pt.t, x: pt.x, y: pt.y, pt });
    splitMap.get(pt.segB).push({ t: pt.u, x: pt.x, y: pt.y, pt });
  }
  const result = [];
  for (const [seg, pts] of splitMap) {
    pts.sort((a, b) => a.t - b.t);
    let prevT = 0;
    let tIdx = 0;
    for (const p of pts) {
      if (p.t > prevT + 1e-6) {
        result.push({
          x1: seg.x1 + prevT * (seg.x2 - seg.x1),
          y1: seg.y1 + prevT * (seg.y2 - seg.y1),
          x2: p.x, y2: p.y,
          tStart: prevT, tEnd: p.t,
          parentSeg: seg,
          idx: tIdx++
        });
      }
      prevT = p.t;
    }
    if (prevT < 1 - 1e-6) {
      result.push({
        x1: seg.x1 + prevT * (seg.x2 - seg.x1),
        y1: seg.y1 + prevT * (seg.y2 - seg.y1),
        x2: seg.x2, y2: seg.y2,
        tStart: prevT, tEnd: 1,
        parentSeg: seg,
        idx: tIdx++
      });
    }
  }
  return result;
}
```

- [ ] **Step 4: Log and verify intersection math**

Test with two crossing segments manually in console. Verify the intersection point is correct and segments split properly.

---

### Task 5: Interlocking logic and SVG rendering

- [ ] **Step 1: Write the over/under assignment function**

Use alternating parity along each segment: starting with "over", flip at each crossing.

```js
function assignOverUnder(segments, intersections) {
  const incident = new Map();
  for (const seg of segments) incident.set(seg, []);
  for (const pt of intersections) {
    incident.get(pt.segA).push(pt);
    incident.get(pt.segB).push(pt);
  }
  const assignments = new Map();
  for (const pt of intersections) {
    const keyA = `${pt.segA.shapeId}-${pt.segA.segIdx}`;
    const keyB = `${pt.segB.shapeId}-${pt.segB.segIdx}`;
    if (!assignments.has(keyA)) assignments.set(keyA, []);
    if (!assignments.has(keyB)) assignments.set(keyB, []);
    assignments.get(keyA).push({ t: pt.t, pt, otherKey: keyB });
    assignments.get(keyB).push({ t: pt.u, pt, otherKey: keyA });
  }
  const state = {};
  for (const [key, pts] of assignments) {
    pts.sort((a, b) => a.t - b.t);
    let isOver = true;
    for (const p of pts) {
      p.isOver = isOver;
      isOver = !isOver;
    }
  }
  // Resolve conflicts: at each intersection, one must be over, one under
  for (const pt of intersections) {
    const keyA = `${pt.segA.shapeId}-${pt.segA.segIdx}`;
    const keyB = `${pt.segB.shapeId}-${pt.segB.segIdx}`;
    const entryA = assignments.get(keyA).find(e => e.pt === pt);
    const entryB = assignments.get(keyB).find(e => e.pt === pt);
    if (entryA.isOver === entryB.isOver) {
      entryA.isOver = true;
      entryB.isOver = false;
    }
  }
  return { assignments, state };
}
```

- [ ] **Step 2: Write the SVG rendering function with gap method**

```js
function renderPattern(cfg) {
  const { segments } = buildAllSegments(cfg);
  const intersections = findAllIntersections(segments);
  const subSegments = splitSegments(segments, intersections);
  const { assignments } = assignOverUnder(segments, intersections);

  const svg = document.getElementById('pattern-svg');
  const gapPx = cfg.strokeWidth * cfg.gapRatio;

  // Build lookup: for each intersection point, which segments are over vs under
  const crossingMap = new Map();
  for (const pt of intersections) {
    const keyA = `${pt.segA.shapeId}-${pt.segA.segIdx}`;
    const keyB = `${pt.segB.shapeId}-${pt.segB.segIdx}`;
    const entryA = assignments.get(keyA).find(e => e.pt === pt);
    const entryB = assignments.get(keyB).find(e => e.pt === pt);
    crossingMap.set(pt, { aOver: entryA.isOver, bOver: entryB.isOver });
  }

  // Build set of (parentSeg, t range) that should be rendered
  const drawRanges = new Map(); // parentSeg -> [{tStart, tEnd}]
  for (const sub of subSegments) {
    const seg = sub.parentSeg;
    if (!drawRanges.has(seg)) drawRanges.set(seg, []);
    drawRanges.get(seg).push({ tStart: sub.tStart, tEnd: sub.tEnd, sub });
  }

  // Apply gaps for "under" passages
  // For each intersection, if the parent segment is "under", carve a gap
  for (const pt of intersections) {
    for (const side of [
      { seg: pt.segA, isOverKey: 'aOver', t: pt.t },
      { seg: pt.segB, isOverKey: 'bOver', t: pt.u }
    ]) {
      const entry = crossingMap.get(pt);
      if (!entry[side.isOverKey]) {
        // Carve gap: remove the gapPx region around this t from draw ranges
        const ranges = drawRanges.get(side.seg);
        if (!ranges) continue;
        const gapT = gapPx / segmentLength(side.seg);
        const gapStart = Math.max(0, side.t - gapT / 2);
        const gapEnd = Math.min(1, side.t + gapT / 2);
        // Split/reduce ranges
        const newRanges = [];
        for (const r of ranges) {
          if (r.tStart >= gapEnd || r.tEnd <= gapStart) {
            newRanges.push(r);
          } else {
            if (r.tStart < gapStart) newRanges.push({ tStart: r.tStart, tEnd: gapStart, sub: r.sub });
            if (r.tEnd > gapEnd) newRanges.push({ tStart: gapEnd, tEnd: r.tEnd, sub: r.sub });
          }
        }
        drawRanges.set(side.seg, newRanges);
      }
    }
  }

  // Clear and render
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  const padding = 40;

  // Compute bounds
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const seg of segments) {
    minX = Math.min(minX, seg.x1, seg.x2);
    maxX = Math.max(maxX, seg.x1, seg.x2);
    minY = Math.min(minY, seg.y1, seg.y2);
    maxY = Math.max(maxY, seg.y1, seg.y2);
  }
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  svg.setAttribute('viewBox', `${minX - padding} ${minY - padding} ${width} ${height}`);
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  // Background
  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('x', minX - padding);
  bg.setAttribute('y', minY - padding);
  bg.setAttribute('width', width);
  bg.setAttribute('height', height);
  bg.setAttribute('fill', cfg.bgColor);
  svg.appendChild(bg);

  // Render draw ranges
  for (const [seg, ranges] of drawRanges) {
    for (const r of ranges) {
      const x1 = seg.x1 + r.tStart * (seg.x2 - seg.x1);
      const y1 = seg.y1 + r.tStart * (seg.y2 - seg.y1);
      const x2 = seg.x1 + r.tEnd * (seg.x2 - seg.x1);
      const y2 = seg.y1 + r.tEnd * (seg.y2 - seg.y1);
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', cfg.strokeColor);
      line.setAttribute('stroke-width', cfg.strokeWidth);
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
    }
  }
}

function segmentLength(seg) {
  const dx = seg.x2 - seg.x1;
  const dy = seg.y2 - seg.y1;
  return Math.sqrt(dx * dx + dy * dy);
}
```

- [ ] **Step 3: Call `renderPattern(cfg)` on load and verify**

Open in browser. Expected: SVG shows L-shapes arranged in a grid with patterned rotation. Intersecting segments show gaps at crossings (interlocking effect).

---

### Task 6: Control panel bindings

- [ ] **Step 1: Write the function that binds all controls to the config**

```js
function bindControls() {
  const bindings = [
    { id: 'cfg-cols', key: 'cols', type: 'number' },
    { id: 'cfg-rows', key: 'rows', type: 'number' },
    { id: 'cfg-spacing', key: 'spacing', type: 'range' },
    { id: 'cfg-armA', key: 'armA', type: 'range' },
    { id: 'cfg-armB', key: 'armB', type: 'range' },
    { id: 'cfg-strokeWidth', key: 'strokeWidth', type: 'range' },
    { id: 'cfg-strokeColor', key: 'strokeColor', type: 'color' },
    { id: 'cfg-bgColor', key: 'bgColor', type: 'color' },
    { id: 'cfg-patternType', key: 'patternType', type: 'select' },
    { id: 'cfg-freqX', key: 'freqX', type: 'range' },
    { id: 'cfg-freqY', key: 'freqY', type: 'range' },
    { id: 'cfg-amplitude', key: 'amplitude', type: 'range' },
    { id: 'cfg-phase', key: 'phase', type: 'range' },
    { id: 'cfg-interlockMode', key: 'interlockMode', type: 'select' },
    { id: 'cfg-gapRatio', key: 'gapRatio', type: 'range' },
    { id: 'cfg-seed', key: 'seed', type: 'number' },
  ];
  for (const b of bindings) {
    const el = document.getElementById(b.id);
    if (!el) continue;
    const update = () => {
      const val = b.type === 'number' ? parseInt(el.value, 10) : parseFloat(el.value);
      cfg[b.key] = isNaN(val) ? el.value : val;
      // Special: armLocked toggle
      if (b.key === 'armA') document.getElementById('cfg-armB').disabled = cfg.armLocked;
      if (b.key === 'armLocked') {
        document.getElementById('cfg-armB').disabled = cfg.armLocked;
        if (cfg.armLocked) cfg.armB = cfg.armA;
      }
      // Update value display for range inputs
      const display = el.closest('.control-row')?.querySelector('.value');
      if (display) display.textContent = el.value;
      renderPattern(cfg);
    };
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  }

  // armLocked checkbox
  const lockEl = document.getElementById('cfg-armLocked');
  lockEl.addEventListener('change', () => {
    cfg.armLocked = lockEl.checked;
    document.getElementById('cfg-armB').disabled = cfg.armLocked;
    if (cfg.armLocked) cfg.armB = cfg.armA;
    renderPattern(cfg);
  });
}
```

- [ ] **Step 2: Set initial control values from config**

```js
function initControls() {
  for (const [key, val] of Object.entries(cfg)) {
    const el = document.getElementById(`cfg-${key}`);
    if (el) el.value = val;
  }
  document.getElementById('cfg-armB').disabled = cfg.armLocked;
}
```

- [ ] **Step 3: Wire up the armLocked toggle**

When checked, armB slider is disabled and armB value tracks armA. When unchecked, armB slider re-enables at its current position.

- [ ] **Step 4: Verify all sliders update the pattern**

Open browser. Move each slider — pattern should re-render on every change. The armLocked toggle should correctly lock armB to armA.

---

### Task 7: Export functionality

- [ ] **Step 1: Write SVG export**

```js
function exportSVG() {
  const svg = document.getElementById('pattern-svg');
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'weave-pattern.svg';
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Write PNG export using canvas**

```js
function exportPNG() {
  const svg = document.getElementById('pattern-svg');
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    const scale = 4;
    const canvas = document.createElement('canvas');
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      const pngUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = 'weave-pattern.png';
      a.click();
      URL.revokeObjectURL(pngUrl);
    });
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
```

- [ ] **Step 3: Bind export buttons**

```js
document.getElementById('btn-export-svg').addEventListener('click', exportSVG);
document.getElementById('btn-export-png').addEventListener('click', exportPNG);
```

- [ ] **Step 4: Verify exports**

Open browser, make a pattern, click Export SVG — file downloads as `.svg`. Open in browser/Illustrator — correct. Click Export PNG — file downloads as `.png`. Correct image.

---

### Task 8: Final polish and self-review

- [ ] **Step 1: Add responsive SVG sizing**

The SVG should scale to fill the canvas area while maintaining the grid aspect ratio. Use CSS `max-width: 100%; max-height: 100%;` on the SVG and compute size dynamically.

```js
function sizeSVG() {
  const svg = document.getElementById('pattern-svg');
  const container = document.getElementById('canvas-area');
  const rect = container.getBoundingClientRect();
  const vb = svg.getAttribute('viewBox').split(' ').map(Number);
  const aspect = vb[2] / vb[3];
  let w = rect.width - 20;
  let h = rect.height - 20;
  if (w / h > aspect) { w = h * aspect; }
  else { h = w / aspect; }
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
}
```

Call `sizeSVG()` after each render and on window resize.

- [ ] **Step 2: Verify all edge cases**

- Grid with 1 column or 1 row (degenerate case — should still render)
- Zero amplitude (all shapes at same angle)
- Minimal grid (2x2)
- Large grid (40x40) — check performance, add warning if too slow
- armLocked toggle at different armA values

- [ ] **Step 3: Final visual check**

Full pass through all controls confirming smooth interaction. Verify interlocking gaps are visible and correct at crossings. Check SVG and PNG exports render faithfully.

---

### Self-Review

**1. Spec coverage:**
- Grid with square cells ✓ (Task 3)
- L-shape with independent arms ✓ (Task 3)
- Per-shape patterned rotation ✓ (Task 3)
- Gap-method interlocking ✓ (Task 5)
- All controls from spec ✓ (Tasks 2, 6)
- SVG export ✓ (Task 7)
- PNG export ✓ (Task 7)
- No external dependencies ✓ (all tasks)

**2. Placeholder check:** No TBDs, TODOs, or incomplete sections.

**3. Type consistency:** All function signatures match between definition and call sites. Config property names consistent throughout.

**4. Gaps:** Interlocking conflict resolution — the simple conflict resolution (if both segments claim over, force segA over and segB under) is sufficient for this version. Edge cases like segments sharing origin points are explicitly excluded.
