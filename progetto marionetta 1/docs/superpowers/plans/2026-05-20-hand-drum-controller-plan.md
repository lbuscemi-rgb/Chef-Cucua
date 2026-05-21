# Hand Gesture Drum Controller Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based virtual drum kit controlled by hand gestures via MediaPipe hand pose detection.

**Architecture:** Single-page web app with a 50/50 split layout — left side shows live camera feed with hand landmark overlay, right side shows a 2D canvas drum kit. Hand position maps to drum zones for sound selection, z-depth controls volume, three finger gestures determine attack type (single hit, sustained rhythm, cymbal crash).

**Tech Stack:** `@tensorflow-models/hand-pose-detection` (MediaPipe runtime), `@mediapipe/hands`, `@tensorflow/tfjs-core`, `@tensorflow/tfjs-backend-webgl` (all CDN-loaded), vanilla Canvas 2D API, Web Audio API.

---

### File Structure

```
progetto marionetta/
├── index.html              — HTML layout + inline CSS (50/50 split)
├── script.js               — All JavaScript logic
├── drum-short.wav          — User-provided audio sample
├── tom-tom-roll.wav        — User-provided audio sample
└── cymbal-crash.wav        — User-provided audio sample
```

---

### Task 1: HTML layout with 50/50 split + CSS

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the HTML file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hand Drum Controller</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #111; font-family: system-ui, sans-serif; }

    .app { display: flex; width: 100%; height: 100vh; }
    .panel { flex: 1; position: relative; overflow: hidden; }
    .panel-left { background: #000; }
    .panel-right { background: #1a1a1a; }

    #camera-feed { width: 100%; height: 100%; object-fit: cover; display: block; }
    #overlay-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
    #drum-canvas { width: 100%; height: 100%; display: block; }

    #status {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.8); color: #fff; padding: 8px 20px;
      border-radius: 8px; font-size: 14px; z-index: 10;
    }
    #error {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      background: rgba(200,0,0,0.9); color: #fff; padding: 20px 32px;
      border-radius: 12px; font-size: 18px; z-index: 20; display: none;
    }
  </style>
</head>
<body>
  <div class="app">
    <div class="panel panel-left">
      <video id="camera-feed" autoplay playsinline></video>
      <canvas id="overlay-canvas"></canvas>
    </div>
    <div class="panel panel-right">
      <canvas id="drum-canvas"></canvas>
    </div>
  </div>
  <div id="status">Loading...</div>
  <div id="error"></div>

  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl"></script>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/hand-pose-detection"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands"></script>
  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify layout loads**

Open `index.html` in a browser. Confirm the screen splits 50/50 with two dark panels and "Loading..." status at the bottom.

---

### Task 2: Camera integration + MediaPipe hand detector

**Files:**
- Create: `script.js`

- [ ] **Step 1: Write camera + detector initialization**

```javascript
let detector = null;
let video = null;
let overlayCanvas, overlayCtx;
let drumCanvas, drumCtx;
let audioBuffers = {};
let audioCtx = null;

const STATUS_EL = document.getElementById('status');
const ERROR_EL = document.getElementById('error');

function setStatus(msg) { STATUS_EL.textContent = msg; }
function showError(msg) { ERROR_EL.textContent = msg; ERROR_EL.style.display = 'block'; }

async function initCamera() {
  video = document.getElementById('camera-feed');
  const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
  video.srcObject = stream;
  await new Promise((resolve) => { video.onloadedmetadata = () => { video.play(); resolve(); }; });
}

async function initDetector() {
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const config = {
    runtime: 'mediapipe',
    modelType: 'full',
    maxHands: 1,
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
  };
  detector = await handPoseDetection.createDetector(model, config);
}

function initCanvases() {
  overlayCanvas = document.getElementById('overlay-canvas');
  overlayCtx = overlayCanvas.getContext('2d');
  drumCanvas = document.getElementById('drum-canvas');
  drumCtx = drumCanvas.getContext('2d');
}

function resizeCanvases() {
  const leftPanel = document.querySelector('.panel-left');
  overlayCanvas.width = leftPanel.clientWidth;
  overlayCanvas.height = leftPanel.clientHeight;
  const rightPanel = document.querySelector('.panel-right');
  drumCanvas.width = rightPanel.clientWidth;
  drumCanvas.height = rightPanel.clientHeight;
}

async function init() {
  try {
    initCanvases();
    await initCamera();
    await initDetector();
    setStatus('Ready — show your hand');
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
    requestAnimationFrame(mainLoop);
  } catch (err) {
    showError('Camera or model failed: ' + err.message);
    setStatus('Error');
  }
}
```

- [ ] **Step 2: Write the detection + overlay drawing loop**

```javascript
function drawKeypoints(ctx, keypoints, width, height) {
  ctx.clearRect(0, 0, width, height);
  for (const kp of keypoints) {
    ctx.beginPath();
    ctx.arc(kp.x * (width / video.videoWidth), kp.y * (height / video.videoHeight), 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
  }
}

async function mainLoop() {
  if (!detector || !video) { requestAnimationFrame(mainLoop); return; }
  const hands = await detector.estimateHands(video);
  if (hands.length > 0) {
    const hand = hands[0];
    const w = overlayCanvas.width;
    const h = overlayCanvas.height;
    drawKeypoints(overlayCtx, hand.keypoints, w, h);
    const flatKeypoints = hand.keypoints.map(kp => ({
      x: kp.x / video.videoWidth,
      y: kp.y / video.videoHeight,
      z: hand.keypoints3D ? hand.keypoints3D.find(k3 => k3.name === kp.name)?.z || 0 : 0,
      name: kp.name
    }));
    processFrame(flatKeypoints, hand.score);
  } else {
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }
  requestAnimationFrame(mainLoop);
}
```

- [ ] **Step 3: Wire up init call at the end of script.js**

```javascript
document.addEventListener('DOMContentLoaded', init);
```

---

### Task 3: Drum kit canvas rendering

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Define drum zone layout + draw function**

```javascript
const DRUM_ZONES = [
  { id: 'crash',  label: 'Crash',  x: 0.25, y: 0.20, radius: 0.10, color: '#e8b830' },
  { id: 'hihat',  label: 'Hi-Hat', x: 0.20, y: 0.50, radius: 0.10, color: '#d4a017' },
  { id: 'tom1',   label: 'Tom 1',  x: 0.55, y: 0.20, radius: 0.10, color: '#2a7f62' },
  { id: 'tom2',   label: 'Tom 2',  x: 0.80, y: 0.20, radius: 0.10, color: '#2a7f62' },
  { id: 'snare',  label: 'Snare',  x: 0.55, y: 0.55, radius: 0.11, color: '#c9a87c' },
  { id: 'kick',   label: 'Kick',   x: 0.55, y: 0.80, radius: 0.13, color: '#555' },
];

function drawDrumKit(ctx, width, height, activeZoneId = null, hitZoneId = null, handPos = null) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  for (const zone of DRUM_ZONES) {
    const cx = zone.x * width;
    const cy = zone.y * height;
    const r = zone.radius * width;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    if (hitZoneId === zone.id) {
      ctx.fillStyle = '#ffffff';
    } else if (activeZoneId === zone.id) {
      ctx.fillStyle = zone.color;
    } else {
      ctx.fillStyle = zone.color;
      ctx.globalAlpha = 0.6;
    }
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = `${Math.round(r * 0.6)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(zone.label, cx, cy);
  }

  if (handPos) {
    const hx = handPos.x * width;
    const hy = handPos.y * height;
    ctx.beginPath();
    ctx.arc(hx, hy, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff4488';
    ctx.fill();
  }
}
```

- [ ] **Step 2: Call drawDrumKit when no hand is detected**

Update the `mainLoop` else branch to also draw the drum kit:

```javascript
} else {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height);
}
```

Add a `processFrame` function that maps hand position to drum zones:

```javascript
let currentZoneId = null;

function processFrame(keypoints, score) {
  if (score < 0.5) {
    drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height);
    return;
  }

  const wrist = keypoints.find(k => k.name === 'wrist');
  if (!wrist) { drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height); return; }

  currentZoneId = findDrumZone(wrist.x, wrist.y);
  drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height, currentZoneId, null, wrist);
}

function findDrumZone(nx, ny) {
  for (const zone of DRUM_ZONES) {
    const dx = nx - zone.x;
    const dy = ny - zone.y;
    if (Math.sqrt(dx * dx + dy * dy) < zone.radius) {
      return zone.id;
    }
  }
  return null;
}
```

---

### Task 4: Gesture recognition

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Write gesture detection functions**

```javascript
const GESTURES = { NONE: 'none', SINGLE_HIT: 'single_hit', SUSTAINED: 'sustained', CYMBAL: 'cymbal' };

function isExtended(tip, pip) {
  return tip && pip && tip.y < pip.y;
}

function detectGesture(keypoints) {
  const idxTip   = keypoints.find(k => k.name === 'index_finger_tip');
  const idxPip   = keypoints.find(k => k.name === 'index_finger_dip');
  const midTip   = keypoints.find(k => k.name === 'middle_finger_tip');
  const midPip   = keypoints.find(k => k.name === 'middle_finger_dip');
  const thumbTip = keypoints.find(k => k.name === 'thumb_tip');
  const pinkyTip = keypoints.find(k => k.name === 'pinky_finger_tip');

  const idxUp   = isExtended(idxTip, idxPip);
  const midUp   = isExtended(midTip, midPip);

  if (idxUp && midUp) {
    return GESTURES.SUSTAINED;
  }
  if (idxUp) {
    const thumbUp = thumbTip && idxTip && thumbTip.y < idxTip.y;
    const pinkyUp = pinkyTip && idxTip && pinkyTip.y < idxTip.y;
    if (thumbUp && pinkyUp) {
      return GESTURES.CYMBAL;
    }
    const midDown = !midUp;
    if (midDown) {
      return GESTURES.SINGLE_HIT;
    }
  }
  return GESTURES.NONE;
}
```

---

### Task 5: Audio engine with z-volume

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Write audio loading and playback**

```javascript
async function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const files = {
    'drum_short': 'drum-short.wav',
    'tom_tom_roll': 'tom-tom-roll.wav',
    'cymbal_crash': 'cymbal-crash.wav',
  };
  for (const [key, path] of Object.entries(files)) {
    const resp = await fetch(path);
    const arrayBuf = await resp.arrayBuffer();
    audioBuffers[key] = await audioCtx.decodeAudioData(arrayBuf);
  }
}

function playSound(name, volume = 1.0) {
  if (!audioCtx || !audioBuffers[name]) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = audioBuffers[name];
  gain.gain.value = Math.max(0.2, Math.min(1.0, volume));
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(0);
}
```

- [ ] **Step 2: Initialize audio in init()**

Add to the `init()` function after `initCanvases()`:

```javascript
try { await initAudio(); } catch (e) { console.warn('Audio init failed:', e); }
```

---

### Task 6: Gesture → sound integration with hit logic

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Write the hit state machine**

```javascript
let lastGesture = GESTURES.NONE;
let lastGestureZone = null;
let sustainedTimer = null;
let hitCooldown = 0;
const COOLDOWN_MS = 200;
const RELEASE_MS = 200;
let gestureReleaseTime = 0;

function getAudioForZone(zoneId, gesture) {
  if (zoneId === 'kick') return null;
  if (zoneId === 'crash' || zoneId === 'hihat') {
    if (gesture === GESTURES.CYMBAL) return 'cymbal_crash';
    if (gesture === GESTURES.SINGLE_HIT) return 'cymbal_crash';
    if (gesture === GESTURES.SUSTAINED) return 'cymbal_crash';
    return null;
  }
  if (zoneId === 'snare' || zoneId === 'tom1' || zoneId === 'tom2') {
    if (gesture === GESTURES.SINGLE_HIT) return 'drum_short';
    if (gesture === GESTURES.SUSTAINED) return 'tom_tom_roll';
    if (gesture === GESTURES.CYMBAL) return 'cymbal_crash';
    return null;
  }
  return null;
}

function getZVolume(keypoints) {
  const wrist = keypoints.find(k => k.name === 'wrist');
  if (!wrist) return 1.0;
  const z = wrist.z;
  const normalized = 1.0 - Math.max(0, Math.min(1, (z + 0.3) / 0.6));
  return Math.max(0.2, Math.min(1.0, normalized));
}
```

- [ ] **Step 2: Update processFrame with full gesture → sound logic**

Replace the `processFrame` function:

```javascript
function processFrame(keypoints, score) {
  if (score < 0.5) {
    drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height);
    return;
  }

  if (hitCooldown > 0) hitCooldown--;
  const wrist = keypoints.find(k => k.name === 'wrist');
  if (!wrist) { drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height); return; }

  currentZoneId = findDrumZone(wrist.x, wrist.y);
  const gesture = detectGesture(keypoints);
  const vol = getZVolume(keypoints);

  let hitZoneId = null;

  if (gesture === GESTURES.NONE) {
    gestureReleaseTime = Date.now();
    if (sustainedTimer) { clearInterval(sustainedTimer); sustainedTimer = null; }
  } else {
    const timeSinceRelease = Date.now() - gestureReleaseTime;
    if (timeSinceRelease < RELEASE_MS) {
      lastGesture = gesture;
      lastGestureZone = currentZoneId;
      drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height, currentZoneId, null, wrist);
      return;
    }
  }

  if (currentZoneId && gesture !== GESTURES.NONE && hitCooldown === 0) {
    const audioName = getAudioForZone(currentZoneId, gesture);
    if (audioName) {
      if (gesture === GESTURES.SUSTAINED && lastGesture !== gesture) {
        if (sustainedTimer) clearInterval(sustainedTimer);
        playSound(audioName, vol);
        sustainedTimer = setInterval(() => playSound(audioName, getZVolume(keypoints)), 500);
      } else if (gesture === GESTURES.SUSTAINED) {
      } else {
        if (sustainedTimer) { clearInterval(sustainedTimer); sustainedTimer = null; }
        playSound(audioName, vol);
      }
      hitZoneId = currentZoneId;
      hitCooldown = Math.round(COOLDOWN_MS / 16.67);
    }
  }

  if (gesture === GESTURES.NONE) {
    if (sustainedTimer) { clearInterval(sustainedTimer); sustainedTimer = null; }
  }

  lastGesture = gesture;
  lastGestureZone = currentZoneId;
  drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height, currentZoneId, hitZoneId, wrist);

  const gestureNames = { single_hit: 'Single Hit', sustained: 'Sustained', cymbal: 'Cymbal', none: '—' };
  const zoneName = currentZoneId || '—';
  const volPct = Math.round(vol * 100);
  setStatus(`Zone: ${zoneName} | Gesture: ${gestureNames[gesture]} | Vol: ${volPct}%`);
}
```

---

### Task 7: Hit flash animation + cleanup

**Files:**
- Modify: `script.js`

- [ ] **Step 1: Add hit flash fade**

Modify `drawDrumKit` to accept a `hitTime` parameter and fade the flash over ~200ms:

```javascript
let hitFlashTime = 0;

function drawDrumKit(ctx, width, height, activeZoneId = null, hitZoneId = null, handPos = null, hitTime = 0) {
  // ... same as before but add flash alpha:
  const flashElapsed = Date.now() - hitTime;
  const flashAlpha = Math.max(0, 1 - flashElapsed / 250);

  for (const zone of DRUM_ZONES) {
    const cx = zone.x * width;
    const cy = zone.y * height;
    const r = zone.radius * width;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    if (hitZoneId === zone.id && flashAlpha > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = flashAlpha;
    } else if (activeZoneId === zone.id) {
      ctx.fillStyle = zone.color;
      ctx.globalAlpha = 0.9;
    } else {
      ctx.fillStyle = zone.color;
      ctx.globalAlpha = 0.6;
    }
    ctx.fill();
    ctx.globalAlpha = 1.0;
    // ... rest same
  }
}
```

Update `processFrame` to pass `hitFlashTime`:

```javascript
if (audioName) {
  if (gesture !== GESTURES.SUSTAINED || lastGesture !== gesture) {
    playSound(audioName, vol);
    hitFlashTime = Date.now();
  }
  // ...
}
```

And update the drum kit draw call:

```javascript
drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height, currentZoneId, hitZoneId, wrist, hitFlashTime);
```
