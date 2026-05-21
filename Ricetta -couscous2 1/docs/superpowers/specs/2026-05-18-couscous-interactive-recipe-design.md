# Interactive Recipe Website — Couscous con zucchine

## Overview

A single-page interactive recipe website for "Couscous con zucchine" by Chef Cucua. Warm, illustrated aesthetic inspired by *Cous Cous Illustrato* with earthy browns and greens. Three interactive features: adjustable portions, step-by-step guided cooking, and smart timers.

## File Structure

```
📁 ricetta-couscous/
├── index.html      # HTML structure
├── style.css       # All styling
└── app.js          # All interactivity logic
```

Single directory, no build step. Open `index.html` in any browser.

## Visual Style

- **Inspiration:** *Cous Cous Illustrato* — warm, handmade, editorial food illustration
- **Palette:** Earthy browns (#5C3A21, #8B6350, #D4A574) and greens (#6B8E23, #8FBC6F, #E8F0D8)
- **Texture:** Subtle paper-like background texture via CSS, soft rounded corners
- **Typography:** Title uses Google Fonts "Playwrite GB S Guides" (handwritten style). Body: a serif or warm sans-serif (e.g., Georgia or system serif)
- **UI elements:** Buttons are prominent, rounded, with warm fills and subtle shadows. Timer buttons stand out with an amber/orange glow or accent. Avoid flat/cold/"standard" UI.

## Layout

Centered single-column card layout, max-width ~720px. Two vertical sections:

### 1. Ingredients Card
- Recipe title (Playwrite font) + chef credit
- Serving adjuster: "Serves: [−] 1 [+] " — ± buttons, live updates ingredient amounts
- Ingredients list with scaled amounts. Base serving = 1

### 2. Guided Cooking Panel
- Hidden until user clicks "Start Cooking"
- Shows one step at a time (1/3, 2/3, 3/3)
- Step-dot progress indicator (● ● ●)
- Step instruction text
- "Previous" / "Next" navigation buttons
- Timer buttons embedded in relevant steps

## Interactive Features

### Serving Adjuster
- +/− buttons increment/decrement servings (min 1, max 10)
- Ingredient amounts scale multiplicatively: 70g → 140g → 210g etc.
- All amounts update instantly in the DOM

### Step-by-Step Mode
- "Start Cooking" button transitions from ingredient view to step view
- Each prep step displayed one at a time
- Navigation: "Previous" (disabled on step 1), "Next" (changes to "Done" on step 3)
- Step-dot progress indicator
- Step text is static (does not scale with servings) — ingredient scaling is handled in the ingredients card only
- Changing servings while in step mode is allowed; ingredient list updates live above

### Smart Timers
- Step 1 (couscous rest): 5-minute timer button
- Step 2 (zucchini cooking): 10-minute timer button
- Clicking a timer starts a countdown. Button becomes a live countdown display (mm:ss)
- Multiple timers can run simultaneously
- Persistent countdown badge visible in a fixed timer bar at the top of the cooking panel, regardless of current step
- When timer expires: chime sound (Web Audio API or Audio element), visual pulse/flash on the timer
- Timer buttons are visually prominent: warmer accent color, slightly larger, with a subtle glow/shadow

## Data

Recipe data (ingredients, steps, timer durations) lives as a JavaScript object in `app.js`. This keeps it separate from UI logic and easy to edit.

```js
const recipe = {
  title: "Couscous con zucchine",
  chef: "Cucua",
  baseServings: 1,
  ingredients: [
    { name: "Couscous precotto", amount: 70, unit: "g" },
    { name: "Zucchine", amount: 140, unit: "g" },
    { name: "Olio", amount: 1, unit: "cucchiaio" },
    { name: "Sale", amount: null, unit: "q.b." }
  ],
  steps: [
    { text: "Versare 70 g di couscous precotto in una ciotola e condire con olio e un pizzico di sale. Aggiungere 70 ml di acqua bollente, coprire con pellicola e lasciar riposare per 5 minuti.", timer: 300 },
    { text: "Tagliare le zucchine a rondelle e cuocerle in una padella preriscaldata con un filo d'olio per 10 minuti.", timer: 600 },
    { text: "Trascorso il tempo di riposo, sgranare il couscous con una forchetta, unire le zucchine cotte e servire.", timer: null }
  ]
};
```

## Edge Cases & States

| Feature | Edge Case | Behavior |
|---------|-----------|----------|
| Serving adjuster | Min (1) reached | "−" button disabled, greyed out |
| Serving adjuster | Max (10) reached | "+" button disabled, greyed out |
| Timer | Already running on same step | Button shows countdown, re-clicking is no-op |
| Timer | Multiple timers | Both countdowns run independently |
| Timer | Completed | "Tempo scaduto!" text + chime + pulse animation |
| Step nav | Step 1, "Previous" | Button hidden/disabled |
| Step nav | Step 3, "Next" | Button shows "Done" — resets to ingredient view |
| Initial load | No timers active, step 1 | Clean state, no countdowns, step 1 active |

## Non-Goals

- No database, no server, no build tools
- No responsive/mobile-first beyond basic centering (desktop-first is fine)
- No multi-recipe support — this is for one recipe only
- No print stylesheet
- No i18n beyond Italian (recipe is in Italian)
