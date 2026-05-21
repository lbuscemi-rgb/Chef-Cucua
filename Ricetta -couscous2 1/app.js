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

const state = {
  servings: 1,
  currentStep: 0,
  timers: {}
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

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
  nextBtn.textContent = state.currentStep === totalSteps - 1 ? 'Completato' : 'Avanti';
}

function nextStep() {
  if (state.currentStep === recipe.steps.length - 1) {
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
    return `<div class="timer-badge">⏱ Passaggio ${Number(stepIdx) + 1}: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}</div>`;
  }).join('');
}

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
    // Audio not available
  }
}

function startTimer(stepIndex) {
  if (state.timers[stepIndex]) return;
  const duration = recipe.steps[stepIndex].timer;
  if (!duration) return;

  state.timers[stepIndex] = { remaining: duration };
  renderStep();
  renderTimerBar();

  state.timers[stepIndex].intervalId = setInterval(() => {
    state.timers[stepIndex].remaining--;
    renderTimerBar();
    if (state.currentStep === stepIndex) {
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

$('#step-content').addEventListener('click', (e) => {
  const btn = e.target.closest('.step-timer-btn');
  if (btn && !btn.disabled) {
    const stepIndex = Number(btn.dataset.step);
    startTimer(stepIndex);
  }
});

function startCooking() {
  $('#btn-start-cooking').style.display = 'none';
  $('#cooking-panel').style.display = 'block';
  state.currentStep = 0;
  renderStep();
}

$('#btn-start-cooking').addEventListener('click', startCooking);

renderIngredients();
$('#serving-minus').disabled = true;
