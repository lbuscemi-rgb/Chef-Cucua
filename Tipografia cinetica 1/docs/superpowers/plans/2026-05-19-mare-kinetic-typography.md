# Kinetic Typography "mare" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page web animation where the word "mare" drifts apart and regroups in a fluid wave sweep.

**Architecture:** Single `index.html` with inline CSS and vanilla JS. Four `<span>` elements per letter, animated via `requestAnimationFrame` using sinusoidal wave functions. Color interpolates between rest (mid-blue) and peak (cyan) based on displacement.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (no dependencies)

---

### Task 1: HTML scaffold and CSS foundation

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the HTML structure and base styles**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>mare</title>
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: #0a0e1a;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-weight: 300;
    overflow: hidden;
  }

  #word {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 600px;
    height: 200px;
  }

  .letter {
    position: absolute;
    font-size: 100px;
    color: #3a6b8c;
    will-change: transform;
    transition: text-shadow 0.3s ease;
  }
</style>
</head>
<body>
<div id="word"></div>

<script>
  const word = "mare";
  const container = document.getElementById("word");
  const letters = [];

  word.split("").forEach((ch, i) => {
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = ch;
    container.appendChild(span);
    letters.push(span);
  });
</script>
</body>
</html>
```

- [ ] **Step 2: Verify display in browser**
  Open `index.html` in a browser. Expected: "mare" centered on a dark navy background in large light text.

---

### Task 2: Animation loop and wave function

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add JS animation parameters and loop below the letter setup**

```html
<script>
  // ... previous setup code ...

  // --- Animation parameters ---
  const SPEED = 1.2;
  const AMP_X = 80;
  const AMP_Y = 50;
  const SPACING = 0.8;        // phase offset between consecutive letters
  const REST_COLOR = [58, 107, 140];     // #3a6b8c
  const PEAK_COLOR = [126, 200, 227];    // #7ec8e3

  // Center positions for each letter (computed from layout)
  const letterCount = letters.length;
  const centerX = 300;  // half of #word width
  const centerY = 100;  // half of #word height
  const letterSpacing = 80; // px between letter rest positions
  const offsets = [];
  const totalWidth = (letterCount - 1) * letterSpacing;
  const startX = centerX - totalWidth / 2;

  letters.forEach((_, i) => {
    offsets.push({
      restX: startX + i * letterSpacing,
      restY: centerY,
    });
  });

  function lerpColor(c1, c2, t) {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return `rgb(${r},${g},${b})`;
  }

  function animate(time) {
    const t = time / 1000; // seconds

    letters.forEach((letter, i) => {
      const parity = i % 2 === 0 ? 1 : -1;
      const phase = t * SPEED + i * SPACING;

      const xOff = parity * AMP_X * Math.sin(phase);
      const yOff = AMP_Y * Math.cos(phase);

      const disp = Math.sqrt((xOff / AMP_X) ** 2 + (yOff / AMP_Y) ** 2);
      const clamped = Math.min(disp, 1);

      letter.style.transform = `translate(${offsets[i].restX + xOff}px, ${offsets[i].restY + yOff}px)`;
      letter.style.color = lerpColor(REST_COLOR, PEAK_COLOR, clamped);
      letter.style.textShadow = clamped > 0.3 ? `0 0 ${12 * clamped}px ${lerpColor(REST_COLOR, PEAK_COLOR, clamped)}` : 'none';
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
</script>
```

- [ ] **Step 2: Open in browser and verify animation**
  Open `index.html`. Expected: letters of "mare" drift apart and regroup in a continuous left-to-right wave sweep. Colors shift from deep blue to luminous cyan at peak displacement.

---

### Task 3: Refine — rotation, timing, polish

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add subtle rotation tied to wave phase**

Add to the animate loop, inside the per-letter block:
```js
const rotation = 8 * Math.sin(phase + 1.2) * parity;
```
And append ` rotate(${rotation}deg)` to the transform value.

- [ ] **Step 2: Verify rotation feels natural**
  Open in browser. Expected: each letter tilts slightly as the wave passes, adding organic fluidity without being distracting.

---

### Task 4: Final review

- [ ] **Step 1: Check all requirements against spec**
  - Motion is fluid, continuous, rhythmic? Yes — rAF loop with sin/cos.
  - Left-to-right sweep? Yes — SPACING creates phase delay per letter.
  - Letters drift apart and regroup? Yes — parity alternates direction.
  - Colors shift atmospherically? Yes — lerpColor between deep blue and cyan.
  - 60fps? Yes — simple DOM transforms, will-change hint.
