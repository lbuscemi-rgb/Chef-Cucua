# Scroll-Triggered Card Cycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the fan-out hover interaction with a scroll-triggered card cycle in `/sito/index.html`

**Architecture:** Single-file HTML with GSAP CDN for physics-based animation. Cards stack in 3D layering; scroll-down triggers a 3-phase cycle (micro-feedback → slide-down with rotation → reposition at back). Mobile uses touch swipe detection.

**Tech Stack:** GSAP 3.12+, vanilla JS, CSS transitions for text/icon colors

---

### Task 1: Add GSAP dependency and update CSS for stacked scroll layout

**Files:**
- Modify: `/sito/index.html`

- [ ] **Step 1: Add GSAP script tag and update CSS**

Add GSAP CDN before the closing `</head>`. Replace CSS to remove fan-out styles, add stacked-only layout, keep hover (bordeaux) styles for micro-feedback phase, and keep responsive breakpoints.

```html
<head>
  ...
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <style>
    /* Keep: reset, html/body, .hero, .hero h1, .hero .label, body background */
    /* Keep: media queries */
    /* Replace: .deck-section, .deck, .card, .card-code, .card-title, .card-icon */
    /* Remove: all .card.hovered rules (will be handled by .active class in JS) */

    .deck-section {
      width: 100%;
      max-width: 450px;
      padding: 80px 20px;
      margin: 0 auto;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .deck {
      position: relative;
      width: 100%;
      max-width: 450px;
      aspect-ratio: 4 / 5;
    }
    .card {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      padding: 24px 20px;
      border-radius: 6px;
      border: none;
      color: #0B0B0B;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      will-change: transform;
      user-select: none;
    }
    .card-code {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 500;
      font-size: clamp(12px, 2.5vw, 14px);
      letter-spacing: 0.12em;
      margin-bottom: 4px;
    }
    .card-title {
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: clamp(13px, 3vw, 17px);
      line-height: 1.3;
    }
    .card-icon {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-icon svg {
      width: clamp(40px, 12vw, 64px);
      height: clamp(40px, 12vw, 64px);
      display: block;
    }
    .card.active .card-code,
    .card.active .card-title { color: #F5F5F0; }
    .card.active .card-icon svg path,
    .card.active .card-icon svg line,
    .card.active .card-icon svg rect,
    .card.active .card-icon svg ellipse,
    .card.active .card-icon svg circle:not([fill]) { stroke: #F5F5F0; }
    .card.active .card-icon svg text,
    .card.active .card-icon svg circle[fill] { fill: #F5F5F0; }

    @media (max-width: 600px) {
      .hero h1 { font-size: 56px; }
      .deck-section { padding: 40px 16px; }
      .card { padding: 20px 16px; }
    }
  </style>
</head>
```

- [ ] **Step 2: Run the file in browser to verify styles applied**

Run: `open "/Users/luciabuscemi/Desktop/VAULT OBSIDIAN /Workshop_No brain No game/sito/index.html"`
Expected: 5 cards visible but stacked without fan-out behavior. Cards are in a vertical stack, only front card fully visible.

---

### Task 2: Write scroll-triggered cycle JS (core interaction)

**Files:**
- Modify: `/sito/index.html` (the `<script>` block at bottom)

- [ ] **Step 1: Write the cycle logic**

Replace the entire `<script>` block:

```javascript
const projects = [ /* ... same project data ... */ ];
const C = { giallo: '#E5E548', lilla: '#B79DFF' };
const B = '#7A0019';

const deck = document.getElementById('deck');
const section = document.querySelector('.deck-section');
const els = {};
let order = [0, 1, 2, 3, 4];
let busy = false;

function gh() { return els[order[0]] ? els[order[0]].offsetHeight : 500; }

function sp(n) {
  const p = [];
  for (let i = 0; i < n; i++) {
    p.push({ y: i === 0 ? 0 : 12 - i * 12, s: 1 - i * 0.045, z: 100 - i, r: 0 });
  }
  return p;
}

function deckPos(animate) {
  const p = sp(order.length);
  order.forEach((idx, i) => {
    const el = els[idx];
    if (!el) return;
    const bg = projects[idx].color === 'giallo' ? C.giallo : C.lilla;
    const v = { y: p[i].y, scaleX: p[i].s, scaleY: p[i].s, rotation: p[i].r,
                zIndex: p[i].z, backgroundColor: bg, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' };
    if (animate) gsap.to(el, { ...v, duration: 0.5, ease: 'power3.out' });
    else gsap.set(el, v);
    el.classList.remove('active');
  });
}

function advanceCard() {
  if (busy) return;
  busy = true;

  const fi = order[0];
  const el = els[fi];
  if (!el) { busy = false; return; }
  const h = gh();
  const og = projects[fi].color === 'giallo' ? C.giallo : C.lilla;

  el.classList.add('active');

  gsap.to(el, {
    y: -4, rotation: 0.5, scaleX: 1.01, scaleY: 1.01,
    backgroundColor: B, boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
    duration: 0.3, ease: 'power2.out',
    onComplete: () => {
      el.classList.remove('active');

      gsap.to(el, {
        y: Math.round(h * 0.85), rotation: 5, scaleX: 0.92, scaleY: 0.92,
        backgroundColor: og, boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
        zIndex: 200, duration: 0.8, ease: 'elastic.out(1, 0.25)',
        onComplete: () => {
          order.push(order.shift());
          gsap.set(el, { zIndex: 96 });

          const np = sp(order.length);
          order.forEach((idx, i) => {
            const card = els[idx];
            const bg = projects[idx].color === 'giallo' ? C.giallo : C.lilla;
            const v = np[i];
            gsap.to(card, {
              y: v.y, rotation: v.r, scaleX: v.s, scaleY: v.s,
              zIndex: v.z, backgroundColor: bg,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              duration: 0.5, ease: 'power3.out'
            });
          });

          busy = false;
        }
      });
    }
  });
}

// Scroll handler
section.addEventListener('wheel', (e) => {
  if (e.deltaY > 0) {
    e.preventDefault();
    advanceCard();
  }
}, { passive: false });

// Touch/swipe for mobile
let touchStartY = 0;
section.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
}, { passive: true });

section.addEventListener('touchend', (e) => {
  const dy = touchStartY - e.changedTouches[0].clientY;
  if (dy < -40) advanceCard(); // swipe up = scroll down
}, { passive: true });

// Click opens project
function handleClick(idx) {
  window.open(projects[idx].path, '_blank');
}

// Build cards (same as before)
projects.forEach((p, i) => {
  const c = document.createElement('div');
  c.className = 'card';
  c.style.backgroundColor = p.color === 'giallo' ? C.giallo : C.lilla;
  c.innerHTML = `<div class="card-code">${p.code}</div><div class="card-title">${p.title}</div><div class="card-icon">${getIcon(i)}</div>`;
  c.addEventListener('click', () => handleClick(i));
  deck.appendChild(c);
  els[i] = c;
});

deckPos(false);

function getIcon(index) {
  // ... same icons as before ...
}
```

- [ ] **Step 2: Test in browser**

Run: `open "/Users/luciabuscemi/Desktop/VAULT OBSIDIAN /Workshop_No brain No game/sito/index.html"`
Expected: 
- 5 cards stacked, front card fully visible
- Scroll down on deck-section: front card lifts (bordeaux) → slides down with rotation → resets behind → next card is front
- Click on card: opens project in new tab
- Mobile: swipe up advances card

---

### Task 3: Verify final implementation

**Files:**
- Test: `/sito/index.html` in browser

- [ ] **Step 1: Open in browser and test all paths**

Run: `open "/Users/luciabuscemi/Desktop/VAULT OBSIDIAN /Workshop_No brain No game/sito/index.html"`

Verify:
1. Hero visible fullscreen → scroll down → deck section visible
2. Cards stacked in 3D layered pile
3. Each scroll down advances one card with fluid animation
4. Card slides down with rotation ~5°, then repositions to back
5. Infinite cycle continues
6. Click opens correct project in new tab
7. Mobile touch works (swipe up)
