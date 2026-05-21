# Couscous Interactive Recipe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page interactive recipe website for "Couscous con zucchine" with adjustable portions, step-by-step guided cooking, and smart timers.

**Architecture:** Three static files (HTML + CSS + JS) in one directory. Recipe data lives as a JavaScript object. UI reads from the data object and updates the DOM on interactions. No framework, no build step.

**Tech Stack:** HTML5, CSS3 (Google Fonts, CSS transitions/animations), vanilla JavaScript (Web Audio API for timer chime).

---

### Task 1: Create index.html — Semantic Structure

**Files:**
- Create: `index.html`

- [ ] **Write the HTML**

Create `index.html` in the project directory with the following structure:

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Couscous con zucchine — Ricetta</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playwrite+GB+S+Guides&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container" id="app">
    <!-- Header -->
    <header class="recipe-header">
      <h1 class="recipe-title">Couscous con zucchine</h1>
      <p class="recipe-chef">di Cucua</p>
    </header>

    <!-- Ingredients Card -->
    <section class="card ingredients-card" id="ingredients-card">
      <h2 class="card-title">Ingredienti</h2>
      <div class="serving-adjuster">
        <span class="serving-label">Porzioni:</span>
        <button class="serving-btn" id="serving-minus" aria-label="Diminuisci porzioni">−</button>
        <span class="serving-count" id="serving-count">1</span>
        <button class="serving-btn" id="serving-plus" aria-label="Aumenta porzioni">+</button>
      </div>
      <ul class="ingredients-list" id="ingredients-list">
        <!-- Populated by JS -->
      </ul>
      <button class="btn btn-start" id="btn-start-cooking">Inizia la cottura</button>
    </section>

    <!-- Guided Cooking Panel -->
    <section class="card cooking-panel" id="cooking-panel" style="display: none;">
      <h2 class="card-title">Passaggi</h2>

      <!-- Timer Status Bar -->
      <div class="timer-bar" id="timer-bar">
        <!-- Active timers rendered here by JS -->
      </div>

      <!-- Step Progress Dots -->
      <div class="step-dots" id="step-dots">
        <!-- Populated by JS -->
      </div>

      <!-- Step Content -->
      <div class="step-content" id="step-content">
        <!-- Populated by JS -->
      </div>

      <!-- Step Navigation -->
      <div class="step-nav">
        <button class="btn btn-nav" id="btn-prev" disabled>Precedente</button>
        <button class="btn btn-nav btn-primary" id="btn-next">Avanti</button>
      </div>
    </section>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Verify the file is saved**

Run: `ls -la index.html` (from the project directory). Expected: file exists, non-empty.

---

### Task 2: Create style.css — Visual Design (Cous Cous Illustrato inspired)

**Files:**
- Create: `style.css`

- [ ] **Write the full stylesheet**

Create `style.css` with the warm, illustrated aesthetic:

```css
/* === Reset & Base === */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Georgia, 'Times New Roman', serif;
  background-color: #F5EDE0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
  color: #3A2210;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;
  line-height: 1.6;
}

/* === Container === */
.container {
  max-width: 720px;
  width: 100%;
}

/* === Header === */
.recipe-header {
  text-align: center;
  margin-bottom: 2rem;
}

.recipe-title {
  font-family: 'Playwrite GB S Guides', cursive;
  font-size: 2.2rem;
  color: #5C3A21;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.recipe-chef {
  font-size: 1rem;
  color: #8B6350;
  font-style: italic;
}

/* === Card === */
.card {
  background: #FFF8F0;
  border-radius: 20px;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 20px rgba(92, 58, 33, 0.12), 0 1px 4px rgba(92, 58, 33, 0.08);
  border: 1px solid #E8D5C0;
  margin-bottom: 1.5rem;
}

.card-title {
  font-family: Georgia, serif;
  font-size: 1.3rem;
  color: #5C3A21;
  margin-bottom: 1.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #DCC5AD;
}

/* === Serving Adjuster === */
.serving-adjuster {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  font-size: 1.1rem;
}

.serving-label {
  color: #8B6350;
  font-weight: bold;
}

.serving-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #6B8E23;
  background: #E8F0D8;
  color: #5C3A21;
  font-size: 1.4rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(107, 142, 35, 0.2);
}

.serving-btn:hover:not(:disabled) {
  background: #6B8E23;
  color: #FFF;
  transform: scale(1.05);
}

.serving-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.serving-count {
  font-size: 1.4rem;
  font-weight: bold;
  color: #5C3A21;
  min-width: 30px;
  text-align: center;
}

/* === Ingredients List === */
.ingredients-list {
  list-style: none;
  margin-bottom: 1.5rem;
}

.ingredients-list li {
  padding: 0.5rem 0;
  border-bottom: 1px dashed #E8D5C0;
  font-size: 1.05rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ingredients-list li:last-child {
  border-bottom: none;
}

.ingredient-amount {
  font-weight: bold;
  color: #6B8E23;
  white-space: nowrap;
}

/* === Buttons === */
.btn {
  font-family: Georgia, serif;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 40px;
  border: 2px solid #8B6350;
  background: #FFF8F0;
  color: #5C3A21;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(92, 58, 33, 0.1);
  font-weight: bold;
}

.btn:hover:not(:disabled) {
  background: #8B6350;
  color: #FFF;
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(92, 58, 33, 0.15);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: #D4A574;
  border-color: #D4A574;
  color: #FFF;
}

.btn-primary:hover:not(:disabled) {
  background: #C49464;
  border-color: #C49464;
}

.btn-start {
  display: block;
  width: 100%;
  padding: 1rem;
  font-size: 1.15rem;
  background: #6B8E23;
  border-color: #6B8E23;
  color: #FFF;
  box-shadow: 0 4px 15px rgba(107, 142, 35, 0.3);
}

.btn-start:hover {
  background: #5A7A1C;
  border-color: #5A7A1C;
}

/* === Timer Bar === */
.timer-bar {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
  min-height: 40px;
}

.timer-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  border-radius: 30px;
  background: #FFF0D0;
  border: 2px solid #D4A574;
  font-size: 0.9rem;
  font-weight: bold;
  color: #5C3A21;
  box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
  animation: timerPulse 2s infinite;
}

@keyframes timerPulse {
  0%, 100% { box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3); }
  50% { box-shadow: 0 2px 16px rgba(212, 165, 116, 0.6); }
}

.timer-badge.expired {
  background: #F5D0C0;
  border-color: #C46850;
  animation: timerFlash 0.5s ease-in-out 3;
}

@keyframes timerFlash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* === Step Dots === */
.step-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.step-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #DCC5AD;
  border: 2px solid #C4AD95;
  transition: all 0.3s ease;
}

.step-dot.active {
  background: #6B8E23;
  border-color: #5A7A1C;
  transform: scale(1.2);
}

.step-dot.completed {
  background: #8FBC6F;
  border-color: #6B8E23;
}

/* === Step Content === */
.step-content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #3A2210;
  margin-bottom: 1.5rem;
  padding: 1rem 0.5rem;
  min-height: 100px;
}

/* === Timer Button (inside step) === */
.step-timer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.7rem 1.5rem;
  border-radius: 40px;
  border: 2px solid #D4A574;
  background: #FFF0D0;
  color: #5C3A21;
  font-family: Georgia, serif;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 12px rgba(212, 165, 116, 0.35);
}

.step-timer-btn:hover:not(:disabled) {
  background: #D4A574;
  color: #FFF;
  transform: scale(1.03);
}

.step-timer-btn.running {
  background: #D4A574;
  color: #FFF;
  border-color: #C49464;
  cursor: default;
}

.step-timer-btn.done {
  background: #6B8E23;
  color: #FFF;
  border-color: #5A7A1C;
  cursor: default;
}

/* === Step Navigation === */
.step-nav {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #E8D5C0;
}

.btn-nav {
  flex: 1;
  max-width: 160px;
}
```

- [ ] **Verify the file is saved**

Run: `ls -la style.css`. Expected: file exists, non-empty.

---

### Task 3: Create app.js — Recipe Data + All Interactivity

**Files:**
- Create: `app.js`

- [ ] **Write recipe data object**

```javascript
const recipe = {
  title: 'Couscous con zucchine',
  chef: 'Cucua',
  baseServings: 1,
  ingredients: [
    { name: 'Couscous precotto', amount: 70, unit: 'g', scalable: true },
    { name: 'Acqua', amount: 70, unit: 'ml', scalable: true },
    { name: 'Zucchine', amount: 140, unit: 'g', scalable: true },
    { name: 'Olio', amount: 1, unit: 'cucchiaio', scalable: true },
    { name: 'Sale', amount: null, unit: 'q.b.', scalable: false }
  ],
  steps: [
    {
      text: 'Versare 70 g di couscous precotto in una ciotola e condire con olio e un pizzico di sale. Aggiungere 70 ml di acqua bollente, coprire con pellicola e lasciar riposare per 5 minuti.',
      timer: 300
    },
    {
      text: 'Tagliare le zucchine a rondelle e cuocerle in una padella preriscaldata con un filo d\'olio per 10 minuti.',
      timer: 600
    },
    {
      text: 'Trascorso il tempo di riposo, sgranare il couscous con una forchetta, unire le zucchine cotte e servire.',
      timer: null
    }
  ]
};
```

- [ ] **Write state object and DOM cache**

```javascript
const state = {
  servings: 1,
  currentStep: 0,
  timers: {} // { stepIndex: { remaining, intervalId } }
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
```

- [ ] **Write ingredient rendering (with scaling)**

```javascript
function renderIngredients() {
  const list = $('#ingredients-list');
  list.innerHTML = recipe.ingredients.map(ing => {
    const amount = ing.scalable && ing.amount !== null
      ? ing.amount * state.servings
      : ing.amount;
    const amountStr = amount !== null ? `${amount} ${ing.unit}` : ing.unit;
    return `<li><span>${ing.name}</span><span class="ingredient-amount">${amountStr}</span></li>`;
  }).join('');
}
```

- [ ] **Write serving adjuster logic**

```javascript
function updateServings(delta) {
  const newVal = state.servings + delta;
  if (newVal < 1 || newVal > 10) return;
  state.servings = newVal;
  $('#serving-count').textContent = newVal;
  $('#serving-minus').disabled = newVal <= 1;
  $('#serving-plus').disabled = newVal >= 10;
  renderIngredients();
}

$('#serving-minus').addEventListener('click', () => updateServings(-1));
$('#serving-plus').addEventListener('click', () => updateServings(1));
```

- [ ] **Write step rendering and navigation**

```javascript
function renderStepDots() {
  const container = $('#step-dots');
  container.innerHTML = recipe.steps.map((_, i) =>
    `<span class="step-dot ${i === state.currentStep ? 'active' : ''} ${i < state.currentStep ? 'completed' : ''}"></span>`
  ).join('');
}

function renderStep() {
  const step = recipe.steps[state.currentStep];
  const stepNum = state.currentStep + 1;
  const totalSteps = recipe.steps.length;

  let timerHtml = '';
  if (step.timer) {
    const timerState = state.timers[state.currentStep];
    let btnClass = 'step-timer-btn';
    let btnText = '⏱ Avvia timer';
    let disabled = false;
    if (timerState) {
      if (timerState.remaining <= 0) {
        btnClass += ' done';
        btnText = '✅ Tempo scaduto!';
        disabled = true;
      } else {
        btnClass += ' running';
        const mins = Math.floor(timerState.remaining / 60);
        const secs = timerState.remaining % 60;
        btnText = `⏱ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        disabled = true;
      }
    }
    timerHtml = `<br><button class="${btnClass}" data-step="${state.currentStep}" ${disabled ? 'disabled' : ''}>${btnText}</button>`;
  }

  $('#step-content').innerHTML =
    `<p><strong>Passaggio ${stepNum}/${totalSteps}:</strong></p><p>${step.text}</p>${timerHtml}`;

  renderStepDots();

  $('#btn-prev').disabled = state.currentStep === 0;
  const nextBtn = $('#btn-next');
  if (state.currentStep === totalSteps - 1) {
    nextBtn.textContent = 'Completato';
  } else {
    nextBtn.textContent = 'Avanti';
  }
}

function nextStep() {
  if (state.currentStep === recipe.steps.length - 1) {
    // Reset to ingredient view
    $('#cooking-panel').style.display = 'none';
    $('#btn-start-cooking').style.display = 'block';
    state.currentStep = 0;
    return;
  }
  state.currentStep++;
  renderStep();
}

function prevStep() {
  if (state.currentStep === 0) return;
  state.currentStep--;
  renderStep();
}

$('#btn-next').addEventListener('click', nextStep);
$('#btn-prev').addEventListener('click', prevStep);
```

- [ ] **Write timer badge rendering in the timer bar**

```javascript
function renderTimerBar() {
  const bar = $('#timer-bar');
  const activeTimers = Object.entries(state.timers).filter(([_, t]) => t.remaining > 0);
  if (activeTimers.length === 0) {
    bar.innerHTML = '';
    return;
  }
  bar.innerHTML = activeTimers.map(([stepIdx, t]) => {
    const mins = Math.floor(t.remaining / 60);
    const secs = t.remaining % 60;
    const label = state.currentStep === Number(stepIdx)
      ? `Passaggio ${Number(stepIdx) + 1}`
      : `Passaggio ${Number(stepIdx) + 1}`;
    return `<div class="timer-badge">⏱ ${label}: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</div>`;
  }).join('');
}
```

- [ ] **Write timer start and tick logic with audio chime**

```javascript
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
    // Second chime
    setTimeout(() => {
      const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
      const osc2 = ctx2.createOscillator();
      const gain2 = ctx2.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx2.destination);
      osc2.frequency.value = 1100;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, ctx2.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx2.currentTime + 0.6);
      osc2.start(ctx2.currentTime);
      osc2.stop(ctx2.currentTime + 0.6);
    }, 200);
  } catch (e) {
    // Audio not available — silently ignore
  }
}

function startTimer(stepIndex) {
  if (state.timers[stepIndex]) return; // already running or done
  const duration = recipe.steps[stepIndex].timer;
  if (!duration) return;

  state.timers[stepIndex] = { remaining: duration };
  renderStep();
  renderTimerBar();

  state.timers[stepIndex].intervalId = setInterval(() => {
    state.timers[stepIndex].remaining--;
    renderTimerBar();
    if (state.currentStep === stepIndex) {
      // Update the timer button text if we're on this step
      const btn = document.querySelector(`.step-timer-btn[data-step="${stepIndex}"]`);
      if (btn) {
        const rem = state.timers[stepIndex].remaining;
        if (rem > 0) {
          const mins = Math.floor(rem / 60);
          const secs = rem % 60;
          btn.textContent = `⏱ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
      }
    }
    if (state.timers[stepIndex].remaining <= 0) {
      clearInterval(state.timers[stepIndex].intervalId);
      playChime();
      renderStep();
      renderTimerBar();
    }
  }, 1000);
}

// Delegate click for timer buttons (they're dynamically rendered)
$('#step-content').addEventListener('click', (e) => {
  const btn = e.target.closest('.step-timer-btn');
  if (btn && !btn.disabled) {
    const stepIndex = Number(btn.dataset.step);
    startTimer(stepIndex);
  }
});
```

- [ ] **Write "Start Cooking" handler and initial render**

```javascript
function startCooking() {
  $('#btn-start-cooking').style.display = 'none';
  $('#cooking-panel').style.display = 'block';
  state.currentStep = 0;
  renderStep();
}

$('#btn-start-cooking').addEventListener('click', startCooking);

// Initial render
renderIngredients();
$('#serving-minus').disabled = true;
```

- [ ] **Verify the file is saved and open in browser**

```bash
ls -la app.js
```
Expected: file exists, non-empty. Open `index.html` in a browser to verify all three features work.

---

### Task 4: Manual Verification

**Files:** (no changes)

- [ ] **Open the page and test all features**

Open `index.html` in a browser and verify:

1. **Visual:** Title renders in Playwrite font. Colors are warm browns/greens. Background has subtle paper texture.
2. **Serving adjuster:** Click +/−, ingredient amounts scale (70→140→210). Min/max disable buttons.
3. **Start Cooking:** Button hides, cooking panel appears. Step 1 shows with timer button.
4. **Step navigation:** Next/Prev cycle through 3 steps. Step 3 "Completato" resets to ingredients.
5. **Timers:** Click "Avvia timer" — button becomes countdown, badge appears in timer bar.
6. **Multiple timers:** Start step 1 timer, navigate to step 2, start step 2 timer — both count down.
7. **Timer completion:** When timer hits 0, chime plays, flash animation, "Tempo scaduto!" shown.
