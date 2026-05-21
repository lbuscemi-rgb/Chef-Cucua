# Maschera Sonora Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single standalone HTML page that interpolates between two SVG mask states driven by real-time microphone audio.

**Architecture:** Three layers (Audio → Interpolation Engine → SVG) in a single `index.html`. Audio captured via Web Audio API, RMS normalised 0–100. Path morphing for forma and matching bocca paths, opacity cross-fade for occhi and non-matching mouth elements.

**Tech Stack:** HTML5, CSS, Vanilla JS, Web Audio API

---

### Task 1: HTML shell with both SVGs inlined

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create the base HTML file**

```html
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Maschera Sonora</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #1a1a2e;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: system-ui, sans-serif;
  }
  .container {
    position: relative;
    width: 595px;
    max-width: 100vw;
  }
  svg { width: 100%; height: auto; display: block; }
  #error-msg {
    display: none;
    position: absolute;
    bottom: -40px;
    left: 0;
    right: 0;
    text-align: center;
    color: #e6262e;
    font-size: 14px;
  }
  #error-msg.visible { display: block; }
</style>
</head>
<body>
<div class="container" id="container">
  <svg id="maschera" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595.3 897.7">
    <defs>
      <style>
        .q-fill-forma { fill: #ffd625; }
        .q-fill-occhi-b { fill: #3766af; }
        .q-fill-occhi-g { fill: #e0e0e0; }
        .q-fill-bocca { fill: #e6262e; }
        .n-fill-forma { fill: #ffd625; }
        .n-fill-occhi-b { fill: #3766af; }
        .n-fill-occhi-g { fill: #e0e0e0; }
        .n-fill-occhi-p { fill: #0e0d0e; }
        .n-fill-occhi-w { fill: #fff; }
        .n-fill-bocca { fill: #e6262e; }
        .n-fill-denti { fill: #fff; }
      </style>
    </defs>

    <!-- STATO DI QUIETE (sound level 0) -->
    <g id="quiete-group">
      <g id="forma-quiete">
        <path id="forma-path-q" class="q-fill-forma" d="M108.6,793.3V225c12-95.7,93.5-169.3,189.6-175.9,106.6-7.4,206.6,69.2,220.6,175.9v568.3h-156.3v-203.4c-1.1-1.7-17.2-26.6-48.8-27.7-21.7-.8-42.3,9.9-53.5,27.7v203.4H108.6Z"/>
      </g>

      <g id="occhi-quiete">
        <g>
          <path class="q-fill-occhi-b" d="M336.6,263.6c14.1-33.7,47-55,82.2-53.7,32.9,1.3,62.5,22.3,75.6,53.7"/>
          <path class="q-fill-occhi-g" d="M494.5,263.6c-14.1,33-47,54-82.2,52.6-32.9-1.3-62.5-21.8-75.6-52.6"/>
          <path d="M381.5,262.5c1,17.9,16,32.1,34,32.1,17.9,0,33-14.2,34-32.1"/>
        </g>
        <g>
          <path class="q-fill-occhi-b" d="M137.6,264.1c14.1-33.7,47-55,82.2-53.7,32.9,1.3,62.5,22.3,75.6,53.7"/>
          <path class="q-fill-occhi-g" d="M295.4,264.1c-14.1,33-47,54-82.2,52.6-32.9-1.3-62.5-21.8-75.6-52.6"/>
          <path d="M182.5,263c1,17.9,16,32.1,34,32.1,17.9,0,33-14.2,34-32.1"/>
        </g>
      </g>

      <g id="bocca-quiete">
        <path id="bocca-path-q1" class="q-fill-bocca" d="M396.4,444.4h-165.4c-.2-24.9,21.7-44.7,46.3-43.6,15.4.7,29.1,9.5,36.4,22.3,8-13.9,23.7-23,40.6-22.3,23.1,1.1,42.3,20.3,42,43.6Z"/>
        <path id="bocca-path-q2" class="q-fill-bocca" d="M395.6,449.6c-3,3.9-33.5,42.5-85.1,40.9-47.7-1.5-75-36.2-78.6-40.9h163.7Z"/>
      </g>
    </g>

    <!-- STATO DI MASSIMO RUMORE (sound level 100) -->
    <g id="rumore-group">
      <g id="forma-rumore">
        <path id="forma-path-n" class="n-fill-forma" d="M119.5,845.8V225.7c11.3-104.4,88-184.7,178.3-192,100.2-8.1,194.2,75.5,207.5,192v620.1h-147v-221.9c-1-1.9-16.2-29-45.9-30.3-20.4-.9-39.7,10.8-50.3,30.3v221.9H119.5Z"/>
      </g>

      <g id="occhi-rumore">
        <g>
          <path class="n-fill-occhi-g" d="M488.5,233.4c-14.5,33.8-48.2,55.3-84.3,53.9-33.8-1.3-64.1-22.3-77.5-53.9,14.5-34.5,48.2-56.4,84.3-55,33.7,1.3,64,22.8,77.5,55Z"/>
          <circle class="n-fill-occhi-b" cx="407.6" cy="232.9" r="29.2"/>
          <circle class="n-fill-occhi-p" cx="407.6" cy="232.9" r="16"/>
        </g>
        <g>
          <path class="n-fill-occhi-g" d="M305.4,233.4c-14.5,33.8-48.2,55.3-84.3,53.9-33.8-1.3-64.1-22.3-77.5-53.9,14.5-34.5,48.2-56.4,84.3-55,33.7,1.3,64,22.8,77.5,55Z"/>
          <circle class="n-fill-occhi-b" cx="224.5" cy="232.9" r="29.2"/>
          <circle class="n-fill-occhi-p" cx="224.5" cy="232.9" r="16"/>
        </g>
      </g>

      <g id="bocca-rumore">
        <path id="bocca-path-n1" class="n-fill-bocca" d="M389.1,396h-155.5c-.2-23.4,20.4-42.1,43.5-41,14.5.7,27.4,8.9,34.3,20.9,7.6-13.1,22.3-21.7,38.2-20.9,21.7,1,39.8,19,39.5,41Z"/>
        <path id="bocca-path-n2" class="n-fill-bocca" d="M389.1,513.2c0,16-6.2,31.5-17.6,42.8-15.8,15.6-37.3,24.7-60.2,24.7s-51.2-12.3-67.2-32.6c-7-8.8-10.6-19.8-10.6-31v-121.2h155.5v117.2Z"/>
        <path id="bocca-path-n3" class="n-fill-bocca" d="M381.9,544.6c-2.6,3.7-28.9,40-73.4,38.5-41.1-1.4-64.7-34-67.7-38.5h141.1Z"/>
        <g id="denti-rumore">
          <path class="n-fill-denti" d="M309.4,544.5v-8.2c0-2.6-1.4-4.7-3.2-4.7h-21.2c-2.2,0-3.9,2.6-3.9,5.8v7.1s28.3.3,28.3,0Z"/>
          <path class="n-fill-denti" d="M341.7,544.5v-8.2c0-2.6-1.4-4.7-3.2-4.7h-21.2c-2.2,0-3.9,2.6-3.9,5.8v7.1s28.3.3,28.3,0Z"/>
        </g>
        <g id="dettagli-rumore">
          <path class="n-fill-denti" d="M281.1,396.1v5.8c0,1.8,1.5,3.3,3.3,3.3h21.9c2.3,0,4.1-1.8,4.1-4.1v-5s-29.3-.2-29.3,0Z"/>
          <path class="n-fill-denti" d="M312.4,396.1v5.8c0,1.8,1.5,3.3,3.3,3.3h21.9c2.3,0,4.1-1.8,4.1-4.1v-5s-29.3-.2-29.3,0Z"/>
        </g>
      </g>
    </g>
  </svg>
  <div id="error-msg"></div>
</div>

<script>
// ...JS will go here
</script>
</body>
</html>
```

At this point the page renders both SVGs stacked. Open in browser to verify rendering.

- [ ] **Step 2: Open in browser to verify**

Run: `open index.html`
Expected: Both SVGs visible, stacked on top of each other (rumore on top).

- [ ] **Step 3: Initialise rumore group hidden**

Add to `<script>`:
```js
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('rumore-group').style.opacity = '0';
});
```

Expected: Only quiete state visible on load.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add HTML shell with both SVGs inlined"
```

---

### Task 2: Audio pipeline

**Files:**
- Modify: `index.html` (JavaScript section)

- [ ] **Step 1: Add audio initialisation code**

```js
let audioContext = null;
let analyser = null;
let smoothedLevel = 0;
const SMOOTHING = 0.3;
const errorEl = document.getElementById('error-msg');

async function initAudio() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    return true;
  } catch (err) {
    errorEl.textContent = 'Microfono non accessibile. Mostrato stato di quiete.';
    errorEl.classList.add('visible');
    return false;
  }
}

function getAudioLevel() {
  if (!analyser) return 0;
  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const val = data[i] - 128;
    sum += val * val;
  }
  const rms = Math.sqrt(sum / data.length) / 128;
  const level = Math.min(1, rms * 3);
  smoothedLevel = smoothedLevel * SMOOTHING + level * (1 - SMOOTHING);
  return smoothedLevel;
}
```

- [ ] **Step 2: Add audio context resume on user interaction**

```js
document.addEventListener('click', () => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
});
```

Now the audio pipeline is ready. No visual change yet.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add audio pipeline with mic input and RMS"
```

---

### Task 3: Interpolation engine

**Files:**
- Modify: `index.html` (JavaScript section)

- [ ] **Step 1: Add path interpolation utilities**

```js
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function parsePathNumbers(d) {
  const nums = [];
  const re = /-?\d+\.?\d*/g;
  let m;
  while ((m = re.exec(d)) !== null) {
    nums.push(parseFloat(m[0]));
  }
  return nums;
}

function rebuildPath(d, numbers) {
  let idx = 0;
  return d.replace(/-?\d+\.?\d*/g, () => {
    const val = numbers[idx++];
    return val % 1 === 0 ? val.toString() : val.toFixed(1);
  });
}

function interpolatePath(dQuiet, dNoise, t) {
  const numsQ = parsePathNumbers(dQuiet);
  const numsN = parsePathNumbers(dNoise);
  if (numsQ.length !== numsN.length) {
    console.warn('Path number count mismatch', numsQ.length, numsN.length);
    return t < 0.5 ? dQuiet : dNoise;
  }
  const lerped = numsQ.map((q, i) => lerp(q, numsN[i], t));
  return rebuildPath(dQuiet, lerped);
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add SVG path interpolation engine"
```

---

### Task 4: Wire up forma interpolation

**Files:**
- Modify: `index.html` (JavaScript section)

- [ ] **Step 1: Add forma update function**

```js
const formaPathQ = document.getElementById('forma-path-q');
const formaPathN = document.getElementById('forma-path-n');

function updateForma(t) {
  const d = interpolatePath(
    'M108.6,793.3V225c12-95.7,93.5-169.3,189.6-175.9,106.6-7.4,206.6,69.2,220.6,175.9v568.3h-156.3v-203.4c-1.1-1.7-17.2-26.6-48.8-27.7-21.7-.8-42.3,9.9-53.5,27.7v203.4H108.6Z',
    'M119.5,845.8V225.7c11.3-104.4,88-184.7,178.3-192,100.2-8.1,194.2,75.5,207.5,192v620.1h-147v-221.9c-1-1.9-16.2-29-45.9-30.3-20.4-.9-39.7,10.8-50.3,30.3v221.9H119.5Z',
    t
  );
  formaPathQ.setAttribute('d', d);
  formaPathN.setAttribute('d', d);
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add forma path morphing"
```

---

### Task 5: Wire up occhi cross-fade

**Files:**
- Modify: `index.html` (JavaScript section)

- [ ] **Step 1: Add occhi update function**

```js
const occhiQuiete = document.getElementById('occhi-quiete');
const occhiRumore = document.getElementById('occhi-rumore');

function updateOcchi(t) {
  occhiQuiete.style.opacity = 1 - t;
  occhiRumore.style.opacity = t;
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add eye cross-fade"
```

---

### Task 6: Wire up bocca mixed interpolation

**Files:**
- Modify: `index.html` (JavaScript section)

Path mapping:
- bocca-path-q1 ↔ bocca-path-n1 (outer shape, same structure) → morph
- bocca-path-q2 ↔ bocca-path-n3 (bottom shadow, same structure) → morph
- bocca-path-n2 (open interior) → appear at t > 0.3 via opacity
- denti-rumore → appear at t > 0.3 via opacity
- dettagli-rumore → appear at t > 0.5 via opacity

- [ ] **Step 1: Add bocca update function**

```js
const boccaQ1 = document.getElementById('bocca-path-q1');
const boccaQ2 = document.getElementById('bocca-path-q2');
const boccaN1 = document.getElementById('bocca-path-n1');
const boccaN2 = document.getElementById('bocca-path-n2');
const boccaN3 = document.getElementById('bocca-path-n3');
const dentiGroup = document.getElementById('denti-rumore');
const dettagliGroup = document.getElementById('dettagli-rumore');

function updateBocca(t) {
  const d1 = interpolatePath(
    'M396.4,444.4h-165.4c-.2-24.9,21.7-44.7,46.3-43.6,15.4.7,29.1,9.5,36.4,22.3,8-13.9,23.7-23,40.6-22.3,23.1,1.1,42.3,20.3,42,43.6Z',
    'M389.1,396h-155.5c-.2-23.4,20.4-42.1,43.5-41,14.5.7,27.4,8.9,34.3,20.9,7.6-13.1,22.3-21.7,38.2-20.9,21.7,1,39.8,19,39.5,41Z',
    t
  );
  boccaQ1.setAttribute('d', d1);
  boccaN1.setAttribute('d', d1);

  const d2 = interpolatePath(
    'M395.6,449.6c-3,3.9-33.5,42.5-85.1,40.9-47.7-1.5-75-36.2-78.6-40.9h163.7Z',
    'M381.9,544.6c-2.6,3.7-28.9,40-73.4,38.5-41.1-1.4-64.7-34-67.7-38.5h141.1Z',
    t
  );
  boccaQ2.setAttribute('d', d2);
  boccaN3.setAttribute('d', d2);

  const innerT = Math.max(0, (t - 0.3) / 0.7);
  boccaN2.style.opacity = innerT;
  dentiGroup.style.opacity = innerT;

  const detailT = Math.max(0, (t - 0.5) / 0.5);
  dettagliGroup.style.opacity = detailT;
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add mouth mixed interpolation (morph + fade)"
```

---

### Task 7: Wire up naso interpolation

**Files:**
- Modify: `index.html` (JavaScript section)

Quiet nose: `<rect x="295.4" y="343.8" width="41.2" height="21.1"/>`
Noise nose: `<rect x="296.7" y="309.3" width="38.7" height="19.8"/>`

- [ ] **Step 1: Add ids to naso rects in HTML**

In the SVG, add ids:
```html
<rect id="naso-q" class="q-fill-occhi-b" x="295.4" y="343.8" width="41.2" height="21.1"/>
<rect id="naso-n" class="n-fill-occhi-b" x="296.7" y="309.3" width="38.7" height="19.8"/>
```

- [ ] **Step 2: Add naso update function**

```js
const nasoQ = document.getElementById('naso-q');
const nasoN = document.getElementById('naso-n');

function updateNaso(t) {
  const x = lerp(295.4, 296.7, t);
  const y = lerp(343.8, 309.3, t);
  const w = lerp(41.2, 38.7, t);
  const h = lerp(21.1, 19.8, t);
  nasoQ.setAttribute('x', x.toFixed(1));
  nasoQ.setAttribute('y', y.toFixed(1));
  nasoQ.setAttribute('width', w.toFixed(1));
  nasoQ.setAttribute('height', h.toFixed(1));
  nasoN.setAttribute('x', x.toFixed(1));
  nasoN.setAttribute('y', y.toFixed(1));
  nasoN.setAttribute('width', w.toFixed(1));
  nasoN.setAttribute('height', h.toFixed(1));
}
```

- [ ] **Step 3: Call updateNaso(t) in animate()**

```js
updateNaso(t);
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add nose position interpolation"
```

---

### Task 8: Animation loop and integration

**Files:**
- Modify: `index.html` (JavaScript section)

- [ ] **Step 1: Add the main animation loop**

```js
const rumoreGroup = document.getElementById('rumore-group');

function animate() {
  const t = getAudioLevel();
  rumoreGroup.style.opacity = t;

  updateForma(t);
  updateOcchi(t);
  updateBocca(t);
  updateNaso(t);

  requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
  animate();
  document.getElementById('quiete-group').style.opacity = '';
  document.getElementById('rumore-group').style.opacity = '0';
});
```

The `rumoreGroup` opacity serves as a base cross-fade for any rumore-only elements not individually handled.

- [ ] **Step 2: Open in browser and test with mic**

Run: `open index.html`
Expected: Click to enable audio (if needed), make noise and see the mask animate.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add animation loop integrating all elements"
```

---

### Task 9: Error handling polish, level indicator

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add a sound level indicator (optional debug)**

```html
<div id="level-indicator" style="
  position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
  color:#fff;font-family:monospace;font-size:14px;
  background:rgba(0,0,0,0.5);padding:4px 12px;border-radius:4px;
">Livello: 0%</div>
```

Update in animate:
```js
document.getElementById('level-indicator').textContent =
  `Livello: ${Math.round(t * 100)}%`;
```

- [ ] **Step 2: Handle audio context auto-resume on first click**

```js
let audioStarted = false;

async function startOnInteraction() {
  if (audioStarted) return;
  audioStarted = true;
  const ok = await initAudio();
  if (!ok) {
    errorEl.textContent = 'Microfono non accessibile. Mostrato stato di quiete.';
    errorEl.classList.add('visible');
  }
}

document.addEventListener('click', startOnInteraction, { once: true });
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add error handling and level indicator"
```
