# Landing Page — Lucia Buscemi Archive

## Overview

Single-page landing page collecting five workshop projects as an interactive card deck. The deck cycles through projects triggered by scroll: each scroll down advances one card — it slides downward with rotation, then repositions at the bottom of the pile.

Single `index.html` at `/sito/` root — no framework, zero build step. GSAP from CDN for physics-based animation.

---

## Architecture

```
/sito/index.html            ← single HTML file (CSS + JS inline + GSAP CDN)
/sito/style-guide.md        ← design system reference
```

All external project folders remain untouched — the landing page links to their `index.html` via `window.open()` in new tabs.

---

## Project mapping

| Code | Title | Local path |
|------|-------|-----------|
| PRJ_01 | Ricette di Cucua | `Ricetta -couscous2 1/index.html` |
| PRJ_02 | Pattern Generation | `Pattern esercizio 1/index.html` |
| PRJ_03 | Tipografia cinetica | `Tipografia cinetica 1/index.html` |
| PRJ_04 | Maschera Sonora | `Maschera sonora 1/index.html` |
| PRJ_05 | Suoniamo insieme | `progetto marionetta 1/index.html` |

---

## Page Structure

### Hero Section (100vh)
- Full viewport height, centered flex
- Name "LUCIA BUSCEMI" — Space Grotesk 700, `clamp(56px, 14vw, 120px)`, `#F5F5F0`
- Sub-label "PROJECTS" — giallo `#E5E548`, 14px, letter-spacing 0.15em, uppercase
- Background: `#0B0B0B` with SVG noise texture (opacity ~0.03)

### Deck Section (100vh, below hero)
- Vertically and horizontally centered stack of 5 cards
- Cards are absolutely positioned, layered with z-index, Y offset, and scale
- Front card fully visible; each card behind peeks from above with decreasing scale
- No consultation mode / fan-out — cards ONLY appear in stacked formation

---

## Card Deck Design

### Visual
- Aspect ratio: 4:5
- Border-radius: 6px
- Solid background: giallo `#E5E548` or lilla `#B79DFF` (alternating)
- Text: `#0B0B0B`
- Soft shadow: `0 4px 12px rgba(0,0,0,0.3)`

### Content layout (top to bottom)
1. Project code — Space Grotesk 500, clamp(12px, 2.5vw, 14px), letter-spacing 0.12em
2. Project title — Inter 500, clamp(13px, 3vw, 17px)
3. Large SVG icon centered in remaining space — clamp(40px, 12vw, 64px)

### Color alternation
- PRJ_01, PRJ_03, PRJ_05 → giallo `#E5E548`
- PRJ_02, PRJ_04 → lilla `#B79DFF`

### Stack layout (5 cards)
- Front (position 0): y=0, scale=1.0, z=100
- Behind (pos 1–4): y increases upward (more negative), scale decreases 0.04/step, z decreases 1/step

---

## Deck Interaction (Scroll-Triggered Cycle)

### Trigger
- **Primary:** `wheel` event (mouse wheel / touchpad) on the `.deck-section` element
- **Mobile:** `touchstart`/`touchend` swipe-down detection
- Only scroll DOWN advances. Scroll UP is ignored.
- Click on a card opens the project in a new tab (no effect on the cycle state)

### Animation Lock
- While a card cycle animation is running, all subsequent scroll/touch inputs are ignored
- The `busy` flag prevents overlapping animations
- Animation per cycle: ~1.6s total (300ms feedback + 800ms slide + 500ms return)

### Cycle Phases (per card, GSAP-driven)

**Phase 0 — Micro-feedback (300ms)**
- Card lifts slightly: y -= 4px, rotation += 0.5deg, scale = 1.01
- Background transitions to bordeaux `#7A0019`
- Text and icon colors transition to white `#F5F5F0`
- Shadow deepens: `0 20px 50px rgba(0,0,0,0.7)`
- Easing: `power2.out` (quick, snappy)

**Phase 1 — Sfilamento (Slide Down, 800ms)**
- Card slides downward ~85% of card height
- Rotation to 4–5° (simulates paper physics)
- Scale shrinks slightly to 0.92
- Background restores to original color (giallo/lilla)
- Text and icon colors restore to dark `#0B0B0B`
- z-index: 200 (on top of everything during slide, creating depth)
- Shadow: deep `0 30px 70px rgba(0,0,0,0.8)`
- Easing: `elastic.out(1, 0.25)` — overshoot + settle, natural bounce

**Phase 2 — Riposizionamento (Return to Back, 500ms)**
- `deckOrder` rotates: front → back of array
- Front card's z-index drops instantly to 96 (behind all other cards)
- Card animates from slide-out position to back-of-stack position
  - y: from `cardH * 0.85` to `12 - 4*12` = -36
  - rotation: from 5° to 0°
  - scale: from 0.92 to 0.82
- Background stays at original color
- Shadow returns to rest state
- Easing: `power3.out` — smooth deceleration
- All other cards animate to their new deck positions simultaneously

**Infinite loop**
- The card that slid to the back (position 4) will re-emerge as front after 4 more cycles
- Cycle continues indefinitely as long as user scrolls

---

## Dependencies

- **GSAP 3.12+** — loaded from CDN (`cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js`)
- **Google Fonts** — Space Grotesk (500, 600, 700) + Inter (400, 500)
- No other external dependencies

---

## Responsive

Mobile (<600px):
- H1: 56px
- Cards: narrower padding, smaller font
- Deck container: 80vw max-width
- Touch swipe detection for scroll replacement

---

## Typography

- **Space Grotesk** — headings, codes, labels (Google Fonts)
- **Inter** — body text, card titles (Google Fonts)
