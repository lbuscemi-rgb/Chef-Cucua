# L-Shape Weave Pattern Tool — Design Spec

## Overview

A single-page HTML tool for generative textile pattern design. Each point on a square grid hosts an L-shape (two perpendicular arms forming a 90° angle). Shapes overlap and interweave via computed over/under intersections, creating woven textile effects. Export to SVG and PNG.

## Architecture

- **File:** Single `index.html` with embedded CSS and JavaScript
- **Rendering:** Pure SVG — the live view is the export
- **State:** All parameters held in a central config object; any change triggers full regeneration

## Layout

- **Canvas area (left/center):** `<svg>` element filling the main viewport
- **Control panel (right/bottom):** grouped sliders and inputs

## Geometry Engine

### Grid
- Square grid, configurable columns (2–50) and rows (2–50)
- Spacing between grid points (px)
- Each grid cell has one L-shape at its center

### L-Shape
- Origin: `(cx, cy)` — the grid point
- Arm A: extends from origin along one axis (length `lenA`)
- Arm B: extends from origin perpendicular to Arm A (length `lenB`)
- Default: `lenA = lenB` with optional "lock arms" toggle; when unlocked, each can be controlled independently
- Rotation: the entire L-shape rotates around its origin

### Per-Shape Rotation (Patterned)
- Rotation angle at each `(col, row)` determined by a formula:
  `angle(col, row) = amplitude * ( sin(col * freqX + phaseX) + cos(row * freqY + phaseY) )`
- Pattern types: sine wave, gradient, checker, spiral
- Controls: frequency X/Y, amplitude (0–180°), phase offset

## Interlocking System

### Intersection Detection
- Collect all line segments from all L-shapes
- Brute-force O(n²) segment-segment intersection test (with bounding-box prefilter if needed)
- Record: intersection point, position along each segment, which segments

### Segment Splitting
- For each segment, sort crossings by position along its length
- Split into sub-segments between consecutive intersection points

### Over/Under Assignment
- Along any given segment, alternate over/under at each crossing
- This produces a balanced textile weave appearance

### SVG Rendering (Gap Method)
- "Over" sub-segments: rendered as normal SVG `<line>` / `<path>` with full stroke
- "Under" sub-segments: not drawn — a gap equal to some portion of stroke width is left at each crossing
- Gap size is user-configurable (percentage of stroke width)

## Controls

| Control | Type | Details |
|---|---|---|
| Grid columns | number | 2–50 |
| Grid rows | number | 2–50 |
| Spacing | slider | px |
| Arm A length | slider | px, relative to spacing |
| Arm B length | slider | px, relative to spacing |
| Lock arms | toggle | lenB = lenA when on |
| Stroke width | slider | px |
| Stroke color | color picker | hex |
| Background color | color picker | hex |
| Pattern type | dropdown | sine wave, gradient, checker, spiral |
| Frequency X | slider | 0–5 |
| Frequency Y | slider | 0–5 |
| Amplitude | slider | 0°–180° |
| Phase offset | slider | 0–360° |
| Interlocking mode | dropdown | gap (default), opacity, off |
| Gap ratio | slider | fraction of stroke width |
| Random seed | number | for randomization layer |
| **Export SVG** | button | |
| **Export PNG** | button | |

## Export

- **SVG:** Serialize the live `<svg>` element to string → `Blob` → download as `.svg`
- **PNG:** Load SVG into an `Image`, draw to offscreen `<canvas>`, `canvas.toBlob()` → download as `.png`

## No External Dependencies

The tool is entirely self-contained in one HTML file. No build step, no npm, no frameworks.
