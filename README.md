# Asymptotic Runtime Trainer (Refactored)

This is a refactored GitHub Pages–friendly version of the runtime trainer.

## Project structure

- `index.html` — page structure only
- `styles.css` — all styling
- `questions.js` — question bank and per-question explanations
- `app.js` — rendering, state, randomness, and interaction logic

## Why this organization is easier to edit

### Edit the UI only
- Change `index.html`
- Change `styles.css`

### Add or edit questions
- Open `questions.js`
- Copy one existing question factory
- Change:
  - `lines`
  - `blocks`
  - `answer`
  - `choices`
  - `explanation`
- Then add that factory to the appropriate level inside `templatesByLevel`

### Change trainer behavior
- Open `app.js`
- Update:
  - question selection logic
  - block visibility logic
  - rendering behavior
  - future features like scoring, hints, or progress tracking

## Current features preserved

- Next button only after answering
- No auto-advance
- Block labels hidden by default before answering
- Optional toggle to show block labels before answering
- Level selection (1–4)
- Summary table before long-form explanation
- Compiled math via MathJax
- Reduced immediate repetition via shuffled decks + recent-template avoidance

## Recommended future improvements

1. Add cumulative level mode
   - Level 3 could optionally draw from levels 1–3

2. Add a score/progress panel

3. Add a hint button

4. Add insertion-sort walkthrough mode

5. Move shared explanation templates into helper functions
   - especially for common patterns like:
     - linear loop
     - triangular loop
     - logarithmic loop
     - polynomial-type summation

## Deployment

Upload all files to the root of your GitHub Pages repository.

The page should work as long as these files stay together in the same directory:
- `index.html`
- `styles.css`
- `questions.js`
- `app.js`
