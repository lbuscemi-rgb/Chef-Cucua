# Landing Page — Lucia Buscemi Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file landing page at `/sito/index.html` with an interactive card deck that cycles through 5 workshop projects on hover.

**Architecture:** Single `index.html` with inline CSS and JS. Cards are positioned in a 3D-layered deck where only the front card is fully visible. Hover triggers two-phase animation (micro-feedback → slide down → reposition at back). Click during micro-feedback opens the project in a new tab. Deck loops infinitely.

**Tech Stack:** HTML5, CSS3, Vanilla JS, Google Fonts (Space Grotesk + Inter)

---

### Task 1: HTML skeleton + hero + deck container

**Files:**
- Overwrite: `/Users/luciabuscemi/Desktop/VAULT OBSIDIAN /Workshop_No brain No game/sito/index.html`

- [ ] **Step 1: Write the full HTML with hero, deck section, and base styles**

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lucia Buscemi — Archive</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      background-color: #0B0B0B;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
      color: #F5F5F0;
      font-family: 'Inter', sans-serif;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .hero h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: clamp(56px, 14vw, 120px);
      color: #F5F5F0;
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .hero .label {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 500;
      font-size: 14px;
      letter-spacing: 0.15em;
      color: #E5E548;
      margin-top: 16px;
      text-transform: uppercase;
    }
    .deck-section {
      width: 100%;
      max-width: 440px;
      padding: 60px 20px 120px;
    }
    .deck {
      position: relative;
      width: 100%;
      height: 180px;
    }
    .card {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 140px;
      padding: 24px 20px;
      border-radius: 6px;
      border: none;
      color: #0B0B0B;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      cursor: default;
    }
    .card.front {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='22' fill='none' stroke='%23E5E548' stroke-width='1.2' opacity='0.8'/%3E%3Ctext x='24' y='24' text-anchor='middle' dominant-baseline='central' fill='%23E5E548' font-family='Space+Grotesk' font-size='10' font-weight='600'%3EOPEN%3C/text%3E%3C/svg%3E") 24 24, pointer;
    }
    .card-code {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 500;
      font-size: 13px;
      letter-spacing: 0.12em;
      margin-bottom: 4px;
      color: #0B0B0B;
    }
    .card-title {
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 15px;
      color: #0B0B0B;
      line-height: 1.3;
    }
    .card-glyph {
      position: absolute;
      top: 14px;
      right: 14px;
      opacity: 0.35;
      transition: opacity 500ms cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }
    .card.hovered .card-glyph {
      opacity: 1;
    }
    .card.hovered {
      transform: translateY(35px) scale(1.02) rotate(1deg) !important;
      box-shadow: 0 12px 32px rgba(0,0,0,0.6), inset 0 0 0 2px #7A0019;
      z-index: 100 !important;
    }
    .card.sliding {
      transform: translateY(300px) rotate(4deg) !important;
      box-shadow: 0 12px 32px rgba(0,0,0,0.6);
      transition: transform 800ms cubic-bezier(0.16, 1, 0.3, 1),
                  box-shadow 800ms cubic-bezier(0.16, 1, 0.3, 1) !important;
      z-index: 100 !important;
    }
    .card.no-transition {
      transition: none !important;
    }
  </style>
</head>
<body>
  <section class="hero">
    <h1>LUCIA BUSCEMI</h1>
    <p class="label">PROJECTS</p>
  </section>
  <section class="deck-section">
    <div class="deck" id="deck"></div>
  </section>
  <script>
    // JS in Task 2
  </script>
</body>
</html>
```

---

### Task 2: Deck JS logic — layout, hover cycle, click

**Files:**
- Modify: `/Users/luciabuscemi/Desktop/VAULT OBSIDIAN /Workshop_No brain No game/sito/index.html`

- [ ] **Step 1: Add JS that creates cards, positions deck, handles hover cycle and click**

Replace `// JS in Task 2` with:

```javascript
const projects = [
  { code: 'PRJ_01', title: 'Ricette di Cucua',   path: 'Ricetta -couscous2 1/index.html',      color: 'giallo' },
  { code: 'PRJ_02', title: 'Pattern Generation',  path: 'Pattern esercizio 1/index.html',       color: 'lilla'  },
  { code: 'PRJ_03', title: 'Tipografia cinetica', path: 'Tipografia cinetica 1/index.html',     color: 'giallo' },
  { code: 'PRJ_04', title: 'Maschera Sonora',     path: 'Maschera sonora 1/index.html',         color: 'lilla'  },
  { code: 'PRJ_05', title: 'Suoniamo insieme',    path: 'progetto marionetta 1/index.html',     color: 'giallo' }
];

const deck = document.getElementById('deck');
let deckOrder = [0, 1, 2, 3, 4]; // front to back
const cardEls = [];
let hoverTimer = null;
let isSliding = false;
let frontIndex = 0;

function layoutDeck(animate = true) {
  if (!animate) {
    cardEls.forEach(c => c.classList.add('no-transition'));
  }

  deckOrder.forEach((projIdx, pos) => {
    const el = cardEls[projIdx];
    const y = 40 - pos * 8;
    el.style.transform = `translateY(${y}px) scale(${1 - pos * 0.03})`;
    el.style.zIndex = 100 - pos;
    el.classList.toggle('front', pos === 0);
  });

  if (!animate) {
    cardEls[0].offsetHeight; // force reflow
    cardEls.forEach(c => c.classList.remove('no-transition'));
  }
  frontIndex = deckOrder[0];
}

function startHover(index) {
  if (index !== deckOrder[0] || isSliding) return;
  const el = cardEls[index];
  el.classList.add('hovered');

  hoverTimer = setTimeout(() => {
    el.classList.remove('hovered');
    el.classList.add('sliding');
    isSliding = true;

    setTimeout(() => {
      el.classList.remove('sliding');
      deckOrder.push(deckOrder.shift());
      layoutDeck(false);
      isSliding = false;
    }, 800);
  }, 600);
}

function endHover(index) {
  if (index !== deckOrder[0]) return;
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
  if (!isSliding) {
    cardEls[index].classList.remove('hovered');
  }
}

projects.forEach((p, i) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.background = p.color === 'giallo' ? '#E5E548' : '#B79DFF';

  card.innerHTML = `
    <div class="card-code">${p.code}</div>
    <div class="card-title">${p.title}</div>
    <div class="card-glyph">${getGlyph(i)}</div>
  `;

  card.addEventListener('mouseenter', () => startHover(i));
  card.addEventListener('mouseleave', () => endHover(i));
  card.addEventListener('click', () => {
    if (i !== deckOrder[0] || isSliding) return;
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    card.classList.remove('hovered');
    window.open(p.path, '_blank');
  });

  deck.appendChild(card);
  cardEls.push(card);
});

layoutDeck(true);

function getGlyph(index) {
  const glyphs = [
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" stroke-width="1.5"><path d="M4 8h16M6 8v10a2 2 0 002 2h8a2 2 0 002-2V8M9 4h6l1 2H8l1-2z"/><path d="M10 12l2 2 2-2"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" stroke-width="1.5"><path d="M3 18l6-8 5 6 7-10"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" stroke-width="1.5"><text x="4" y="20" font-family="Space Grotesk" font-size="20" font-weight="700">A</text></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" stroke-width="1.5"><path d="M3 12h3l2-5 4 10 4-9 2 4h3"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 9V5M12 19v-4M15 12h4M5 12h4"/></svg>'
  ];
  return glyphs[index];
}
```

- [ ] **Step 2: Add responsive rules before closing `</style>`**

```css
@media (max-width: 600px) {
  .hero h1 { font-size: 56px; }
  .deck-section { padding: 40px 16px 80px; max-width: 340px; }
  .deck { height: 160px; }
  .card { height: 120px; padding: 20px 16px; }
  .card-title { font-size: 13px; }
  .card-code { font-size: 12px; }
  .card-glyph { top: 12px; right: 12px; }
}
```

- [ ] **Step 3: Open in browser and verify**

Run: `open "/Users/luciabuscemi/Desktop/VAULT OBSIDIAN /Workshop_No brain No game/sito/index.html"`

Expected:
- Hero with "LUCIA BUSCEMI"
- Below: 5 colored cards in a layered deck, front card fully visible, others peeking from above
- Hover front card → lifts up with bordeaux border (500ms)
- Then slides down with rotation (800ms) → repositions at back
- Click during micro-feedback → opens project in new tab
- Cycle continues infinitely
- Responsive layout on mobile
