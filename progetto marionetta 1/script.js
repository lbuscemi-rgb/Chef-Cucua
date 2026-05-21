let detector = null;
let video = null;
let overlayCanvas, overlayCtx;
let drumCanvas, drumCtx;
let audioBuffers = {};
let audioCtx = null;

const STATUS_EL = document.getElementById('status');

const DRUM_ZONES = [
  { id: 'crash',  label: 'Crash',  x: 0.25, y: 0.20, radius: 0.10, color: '#e8b830' },
  { id: 'hihat',  label: 'Hi-Hat', x: 0.20, y: 0.50, radius: 0.10, color: '#d4a017' },
  { id: 'tom1',   label: 'Tom 1',  x: 0.55, y: 0.20, radius: 0.10, color: '#2a7f62' },
  { id: 'tom2',   label: 'Tom 2',  x: 0.80, y: 0.20, radius: 0.10, color: '#2a7f62' },
  { id: 'snare',  label: 'Snare',  x: 0.55, y: 0.55, radius: 0.11, color: '#c9a87c' },
  { id: 'kick',   label: 'Kick',   x: 0.55, y: 0.80, radius: 0.13, color: '#555' },
];
const ERROR_EL = document.getElementById('error');

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

function setStatus(msg) { STATUS_EL.textContent = msg; }
function showError(msg) { ERROR_EL.textContent = msg; ERROR_EL.style.display = 'block'; }

function drawDrumKit(ctx, width, height, activeZoneIds = [], hitZoneId = null, handCursors = [], hitTime = 0) {
  const flashElapsed = Date.now() - hitTime;
  const flashAlpha = Math.max(0, 1 - flashElapsed / 250);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  for (const zone of DRUM_ZONES) {
    const cx = zone.x * width;
    const cy = zone.y * height;
    const r = zone.radius * width;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    if (hitZoneId === zone.id && flashAlpha > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = flashAlpha;
    } else if (activeZoneIds.includes(zone.id)) {
      ctx.fillStyle = zone.color;
      ctx.globalAlpha = 0.9;
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

  for (const cursor of handCursors) {
    const hx = cursor.x * width;
    const hy = cursor.y * height;
    ctx.beginPath();
    ctx.arc(hx, hy, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ff4488';
    ctx.fill();
  }
}

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
    maxHands: 2,
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

const COOLDOWN_MS = 200;
const RELEASE_MS = 200;

const handStates = {};

function getHandState(handedness) {
  if (!handStates[handedness]) {
    handStates[handedness] = {
      currentZoneId: null,
      lastGesture: GESTURES.NONE,
      lastGestureZone: null,
      sustainedTimer: null,
      hitCooldown: 0,
      gestureReleaseTime: 0,
      hitFlashTime: 0,
      lastWrist: null,
    };
  }
  return handStates[handedness];
}

function cleanupHand(handedness) {
  const hs = handStates[handedness];
  if (hs && hs.sustainedTimer) { clearInterval(hs.sustainedTimer); hs.sustainedTimer = null; }
  delete handStates[handedness];
}

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

function processHand(keypoints, score, hs, handedness) {
  if (score < 0.5) return;

  if (hs.hitCooldown > 0) hs.hitCooldown--;
  const wrist = keypoints.find(k => k.name === 'wrist');
  if (!wrist) return;

  hs.currentZoneId = findDrumZone(wrist.x, wrist.y);
  hs.lastWrist = wrist;
  const gesture = detectGesture(keypoints);
  const vol = getZVolume(keypoints);
  console.log(`[${handedness}] zone: ${hs.currentZoneId} | gesture: ${gesture} | vol: ${vol.toFixed(2)}`);

  if (gesture === GESTURES.NONE) {
    hs.gestureReleaseTime = Date.now();
    if (hs.sustainedTimer) { clearInterval(hs.sustainedTimer); hs.sustainedTimer = null; }
  } else {
    const timeSinceRelease = Date.now() - hs.gestureReleaseTime;
    if (timeSinceRelease < RELEASE_MS) {
      hs.lastGesture = gesture;
      hs.lastGestureZone = hs.currentZoneId;
      return;
    }
  }

  if (hs.currentZoneId && gesture !== GESTURES.NONE && hs.hitCooldown === 0) {
    const hasKeypoints4_8_20 = keypoints[4] && keypoints[8] && keypoints[20];
    if (!hasKeypoints4_8_20) {
      console.log(`[${handedness}] missing keypoints 4/8/20, skipping trigger`);
      return;
    }
    const audioName = getAudioForZone(hs.currentZoneId, gesture);
    if (audioName) {
      console.log(`[${handedness}] trigger audio: ${audioName} zone=${hs.currentZoneId} gesture=${gesture}`);
      if (gesture === GESTURES.SUSTAINED && hs.lastGesture !== gesture) {
        if (hs.sustainedTimer) clearInterval(hs.sustainedTimer);
        playSound(audioName, vol);
        hs.hitFlashTime = Date.now();
        hs.sustainedTimer = setInterval(() => {
          console.log(`[${handedness}] sustained tick: ${audioName}`);
          playSound(audioName, getZVolume(keypoints));
        }, 500);
      } else if (gesture === GESTURES.SUSTAINED) {
      } else {
        if (hs.sustainedTimer) { clearInterval(hs.sustainedTimer); hs.sustainedTimer = null; }
        playSound(audioName, vol);
        hs.hitFlashTime = Date.now();
      }
      hs.hitCooldown = Math.round(COOLDOWN_MS / 16.67);
    } else {
      console.log(`[${handedness}] no audio for zone=${hs.currentZoneId} gesture=${gesture}`);
    }
  }

  if (gesture === GESTURES.NONE) {
    if (hs.sustainedTimer) { clearInterval(hs.sustainedTimer); hs.sustainedTimer = null; }
  }

  hs.lastGesture = gesture;
  hs.lastGestureZone = hs.currentZoneId;
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

function drawKeypoints(ctx, keypoints, width, height) {
  const sx = (kp) => kp.x * (width / video.videoWidth);
  const sy = (kp) => kp.y * (height / video.videoHeight);

  const connections = [
    [0,1], [1,2], [2,3], [3,4],
    [0,5], [5,6], [6,7], [7,8],
    [0,9], [9,10], [10,11], [11,12],
    [0,13], [13,14], [14,15], [15,16],
    [0,17], [17,18], [18,19], [19,20],
    [5,9], [9,13], [13,17]
  ];

  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  for (const [i, j] of connections) {
    const a = keypoints[i];
    const b = keypoints[j];
    if (a && b) {
      ctx.beginPath();
      ctx.moveTo(sx(a), sy(a));
      ctx.lineTo(sx(b), sy(b));
      ctx.stroke();
    }
  }

  for (const kp of keypoints) {
    ctx.beginPath();
    ctx.arc(sx(kp), sy(kp), 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#00ff88';
    ctx.fill();
  }
}

async function mainLoop() {
  if (!detector || !video) { requestAnimationFrame(mainLoop); return; }
  const hands = await detector.estimateHands(video);
  const w = overlayCanvas.width;
  const h = overlayCanvas.height;

  overlayCtx.clearRect(0, 0, w, h);

  const activeZones = [];
  const handCursors = [];
  const usedHandedness = new Set();

  if (hands.length > 0) {
    for (const hand of hands) {
      const handedness = hand.handedness || 'Unknown';
      usedHandedness.add(handedness);
      const hs = getHandState(handedness);
      drawKeypoints(overlayCtx, hand.keypoints, w, h);
      const flatKeypoints = hand.keypoints.map(kp => ({
        x: kp.x / video.videoWidth,
        y: kp.y / video.videoHeight,
        z: hand.keypoints3D ? hand.keypoints3D.find(k3 => k3.name === kp.name)?.z || 0 : 0,
        name: kp.name
      }));
      processHand(flatKeypoints, hand.score, hs, handedness);
      if (hs.currentZoneId) {
        activeZones.push({ zoneId: hs.currentZoneId, hitFlashTime: hs.hitFlashTime });
      }
      if (hs.lastWrist) {
        handCursors.push(hs.lastWrist);
      }
    }
  }

  for (const hName of Object.keys(handStates)) {
    if (!usedHandedness.has(hName)) {
      cleanupHand(hName);
    }
  }

  const activeZoneIds = activeZones.map(z => z.zoneId);
  const latestHit = activeZones.length > 0
    ? activeZones.reduce((a, b) => a.hitFlashTime > b.hitFlashTime ? a : b)
    : null;

  drawDrumKit(drumCtx, drumCanvas.width, drumCanvas.height, activeZoneIds, latestHit ? latestHit.zoneId : null, handCursors, latestHit ? latestHit.hitFlashTime : 0);

  const totalZones = activeZones.map(z => z.zoneId).filter(Boolean).join(' + ') || '—';
  setStatus(`Hands: ${hands.length} | Zones: ${totalZones}`);

  requestAnimationFrame(mainLoop);
}

async function initAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const files = {
    'drum_short': 'ElevenLabs_Snare_drum_rimshot_during_a_jazz_solo,_sharp_and_crisp.mp3',
    'tom_tom_roll': 'ElevenLabs_Tom-tom_roll_in_a_rock_drum_fill,_energetic_and_dynamic.mp3',
    'cymbal_crash': 'ElevenLabs_Cymbal_crash_at_the_climax_of_a_concert,_explosive_and_bright.mp3',
  };
  for (const [key, path] of Object.entries(files)) {
    const resp = await fetch(path);
    const arrayBuf = await resp.arrayBuffer();
    audioBuffers[key] = await audioCtx.decodeAudioData(arrayBuf);
  }
}

function playSound(name, volume = 1.0) {
  if (!audioCtx || !audioBuffers[name]) { console.warn('playSound: audioCtx or buffer missing for', name); return; }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  console.log(`🎵 playSound: ${name} | volume: ${volume.toFixed(2)}`);
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = audioBuffers[name];
  gain.gain.value = Math.max(0.2, Math.min(1.0, volume));
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(0);
}

async function init() {
  if (window.location.protocol === 'file:') {
    showError('Apri il file con un server HTTP. Usa: python3 -m http.server 8080');
    setStatus('Error — serve via HTTP');
    return;
  }
  try {
    initCanvases();
    await initCamera();
    try { await initAudio(); } catch (e) { console.warn('Audio init failed:', e); }
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

document.addEventListener('DOMContentLoaded', init);
