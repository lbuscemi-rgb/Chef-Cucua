# Maschera Sonora — Sound-Responsive SVG Interpolation

## Overview

Single standalone HTML page that captures real-time microphone audio and interpolates between two SVG states ("Stato di Quiete" at sound level 0, "Stato di Massimo Rumore" at sound level 100). Three moving elements: **forma** (face shape), **occhi** (eyes), **bocca** (mouth).

## Architecture

Three-layer architecture in a single `index.html`:

1. **Audio Layer** — Web Audio API microphone input → RMS normalisation 0–100
2. **Interpolation Engine** — maps audio value to SVG path morphing + opacity cross-fade via `requestAnimationFrame`
3. **SVG Layer** — both SVGs inlined in DOM, elements selected by ID for interpolation

## Audio Pipeline

- `navigator.mediaDevices.getUserMedia({ audio: true })` → `AudioContext` → `AnalyserNode` (fftSize: 256)
- Every frame: read `getByteTimeDomainData`, compute RMS, normalise to 0–100
- Exponential moving average smoothing to prevent jitter
- No audio playback — microphone data drives visual only

## SVG Interpolation

Both SVGs embedded inline. Each interpolated element identified by data attributes or IDs.

### Forma (Path Morphing)

- Quiet: `<path id="forma-quiete" d="M108.6,793.3V225...">`
- Noise: `<path id="forma-rumore" d="M119.5,845.8V225.7...">`
- Both paths share identical command structure (M, V, c, c, v, h, v, c, c, v, h, Z)
- Parse each `d` into arrays of numbers, linear interpolate at current `t` (0–1), reconstruct string
- Fill colour `#ffd625` stays constant

### Occhi (Opacity Cross-Fade)

- Structures differ significantly: quiete uses closed outline paths, rumore uses wide-open shapes with separate iris/pupil circles
- Quiet eye group opacity: `1 - t`
- Noise eye group opacity: `t`
- Smooth transition avoids structural mismatch

### Bocca (Mixed)

- Quiet has 2 closed-smile paths; noise has 6 paths (open mouth + teeth + interior)
- Matching paths (same command structure): path morphing
- Teeth/interior paths (noise-only): fade in from `t > 0.3` with opacity `0 → 1` (teeth appear as mouth opens)
- Nostril-like detail paths: appear via opacity at `t > 0.5`

### Naso

- Stationary rectangle, minor position/size difference
- Linear interpolate x, y, width, height between the two states

## Interpolation Engine

```js
function lerp(a, b, t) { return a + (b - a) * t }

function interpolatePath(dQuiet, dNoise, t) {
  const numsQ = parsePathNumbers(dQuiet)
  const numsN = parsePathNumbers(dNoise)
  const lerped = numsQ.map((q, i) => lerp(q, numsN[i], t))
  return rebuildPath(dQuiet, lerped) // preserve command letters
}
```

Run on `requestAnimationFrame` loop:
1. Read current RMS value → `t` (0–1)
2. Update forma path, naso rect, bocca paths
3. Update eye group opacities
4. Show/hide teeth based on `t`

## Error Handling

- No mic permission → show fallback message, animation stays at t=0
- Audio context suspended → resume on user gesture
- Audio processing error → freeze current state

## Deliverables

- Single `index.html` — no build step, no dependencies
- SVG files remain alongside as source assets
- Works in modern browsers (Chrome, Firefox, Safari)
