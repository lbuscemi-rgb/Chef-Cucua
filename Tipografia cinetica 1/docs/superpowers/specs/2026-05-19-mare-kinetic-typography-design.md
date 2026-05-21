# Kinetic Typography: "mare"

A web-based kinetic typography animation for the word **"mare"** (Italian for "sea"), using fluid wave motion inspired by tides.

## Overview

A single HTML page with embedded CSS and vanilla JS. No dependencies, no build tools. Letters of "mare" drift apart and regroup in a continuous left-to-right sweep, driven by a sinusoidal wave function.

## Motion Model

Each letter is positioned by a traveling sine wave sweeping left to right:

```
phase[i] = time * speed + i * spacing
xOffset[i] = amplitudeX * sin(phase[i])
yOffset[i] = amplitudeY * sin(phase[i] + π/2)
```

- `i` = letter index (0 = m, 1 = a, 2 = r, 3 = e)
- `time` = elapsed seconds
- `speed` = wave velocity
- `spacing` = phase offset between consecutive letters

Letters alternate displacement direction (even indices push one way, odd the other) so they spread apart rather than swaying in unison. Each letter traces a small orbit as the wave passes, then returns to rest.

## Architecture

- **Single file** (`index.html`) — HTML + CSS + JS inline
- **DOM structure**: a centered container holding 4 `<span>` elements per letter, each absolutely positioned
- **Animation loop**: `requestAnimationFrame` computes per-frame positions, updates `transform: translate(x, y)`
- **Optional enhancements**: subtle rotation and color shift tied to displacement

## Visual Style

| Property | Value |
|---|---|
| Background | `#0a0e1a` (deep navy) |
| Letter color (rest) | `#3a6b8c` (cool mid-blue) |
| Letter color (peak) | `#7ec8e3` (luminous cyan-blue) |
| Typography | Clean sans-serif, light weight, large size |
| Color interpolation | Linear blend based on absolute displacement from rest |

Letters at rest are a calm mid-blue. As the wave displaces them, they brighten toward cyan with a subtle glow — like moonlight catching water. No saturation spikes.

## Parameters (tuneable in JS)

- `speed` — wave travel speed
- `amplitudeX`, `amplitudeY` — horizontal/vertical displacement range
- `spacing` — phase gap between letters

## Success Criteria

- Motion is fluid, continuous, and rhythmic
- Letters visibly drift apart and regroup in a left-to-right sweep
- Colors shift subtly and atmospherically
- Runs smoothly at 60fps in a modern browser
