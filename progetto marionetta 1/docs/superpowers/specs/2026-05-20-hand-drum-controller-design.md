# Hand Gesture Drum Controller

A web tool that uses MediaPipe hand pose detection to turn hand gestures into a virtual drum controller.

## Layout

50/50 side-by-side split:
- **Left:** Live camera feed with hand skeleton overlay (21 keypoints drawn)
- **Right:** 2D Canvas drum kit

## Drum Layout (right canvas)

Six drum zones arranged vertically:
```
  [Crash]         [Tom 1]      [Tom 2]
       [Hi-Hat]            [Snare]
               [Kick]
```

Each zone is a labeled colored circle. The hand's 2D position maps x/y to drum zones. A small cursor shows the current hand position over the drum canvas.

## Gesture → Drum Zone → Sound Mapping

### Gesture detection
Using MediaPipe 21-keypoint model. Keypoints: thumb tip (4), index tip (8), index PIP (6), middle tip (12), middle PIP (10), pinky tip (20), pinky PIP (18).

Three gestures based on finger extension (fingertip y < PIP y in image coords):

| Gesture | Detection | Trigger behavior |
|---|---|---|
| Single hit | keypoint 8 extended ONLY | Single hit fires once per gesture detection, then blocks re-trigger until gesture is released (all fingers down) for ≥200ms |
| Sustained rhythm | keypoints 8 AND 12 extended | Repeated hits at ~120 BPM as long as gesture is held (fingers remain extended) |
| Cymbal crash | keypoints 4, 8, AND 20 extended | Single crash fires once per gesture detection, re-trigger only after gesture released for ≥200ms |

### Zone mapping

| Gesture | Over Snare/Tom1/Tom2 | Over Crash/Hi-hat | Over Kick |
|---|---|---|---|
| Index up (single hit) | drum short | cymbal crash | silent |
| Index+middle (sustained) | tom tom roll | cymbal crash | silent |
| Thumb+index+pinky (cymbal) | cymbal crash | cymbal crash | silent |

Kick drum is visually present but produces no sound in this version.

## Volume (Z-axis)

Hand distance from camera (z-value from keypoints3D) controls hit volume:
- Closer to camera → louder (1.0)
- Farther → quieter (minimum 0.2)
- Linearly mapped, clamped to [0.2, 1.0]

## Audio

Three `.wav` samples loaded via Web Audio API (placed alongside the HTML file):
- `drum-short.wav` — single sharp drum hit
- `tom-tom-roll.wav` — sustained drum rhythm
- `cymbal-crash.wav` — cymbal crash

AudioContext creates a buffer for each via `fetch()` + `decodeAudioData()`. Volume applied per-playback via `GainNode`.

## Edge Cases

- **No hand detected:** Keep last known zone highlighted, no triggers. Show "No hand" indicator.
- **Low confidence:** Skip frames where `hand.score < 0.5`.
- **Camera unavailable:** Show error message and fallback UI.
- **Multiple hands:** Use only the first detected hand.
- **Gesture transition:** Debounce gesture changes to avoid double-triggers (minimum 100ms between same-zone hits).

## Stack

- Single HTML file (no bundler)
- CDN-loaded: `@tensorflow-models/hand-pose-detection` (MediaPipe runtime), `@mediapipe/hands`, `@tensorflow/tfjs-core`, `@tensorflow/tfjs-backend-webgl`
- Vanilla Canvas 2D API for both camera overlay and drum kit rendering
- Web Audio API for sound playback

## Data Flow

```
Camera → estimator.estimateHands(video) → keypoints
                                              ↓
                                    Gesture recognizer (finger angles)
                                              ↓
                                    Position mapper (which drum zone?)
                                              ↓
                                    Audio playback + Canvas animation
```
