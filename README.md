# Neon Tetris

A modern, neon-styled Tetris game built with pure HTML, CSS, and vanilla JavaScript.

Matches the visual language of [Neon Snake](https://souravbanerjeedata.github.io/snake-game-in-javascript/) — dark cyber aesthetic, glowing pieces, Orbitron typography, and smooth mobile support.

---

## Play Online

Open `index.html` in any modern browser, or host the folder on GitHub Pages.

---

## Features

- **Neon visual design** — glowing tetrominoes, animated background grid, floating orbs
- **Next piece preview** + **Hold** (press `C`)
- **Ghost piece** showing where the current piece will land
- **Scoring & levels** — lines clear faster as level increases
- **7-bag randomizer** for fair piece distribution
- **Hard drop** (Space) and soft drop (↓)
- **Wall kicks** for smoother rotation near edges
- **Pause** (P)
- **Mobile-friendly** — swipe left/right to move, tap to rotate, swipe down to soft/hard drop
- Fully responsive layout

---

## Controls

### Desktop

| Key | Action |
|-----|--------|
| ← → | Move left / right |
| ↑ or X | Rotate clockwise |
| Z | Rotate counter-clockwise |
| ↓ | Soft drop |
| Space | Hard drop |
| C | Hold / swap piece |
| P | Pause / resume |

### Mobile

1. Tap **START**
2. **Swipe left / right** to move
3. **Tap** the board to rotate
4. **Swipe down** (short = soft drop, long = hard drop)

---

## How Scoring Works

| Lines cleared | Points (× level) |
|---------------|------------------|
| 1 (Single)    | 100              |
| 2 (Double)    | 300              |
| 3 (Triple)    | 500              |
| 4 (Tetris)    | 800              |

- Soft drop: +1 point per cell
- Hard drop: +2 points per cell
- Level increases every 10 lines cleared
- Drop speed increases with level

---

## Project Structure

```
tetris/
├── index.html   # Markup + modals
├── style.css    # Neon theme, responsive layout
├── app.js       # Game logic
└── README.md
```

No build step. No dependencies. Just open and play.

---

## Improvements over the original

The original repo was a basic tutorial-style Tetris (yellow background, plain blocks, minimal UI). This version adds:

- Full neon aesthetic matching Neon Snake
- Proper scoring, levels, and progressive speed
- Hold queue + next-piece preview
- Ghost piece
- 7-bag randomizer
- Wall-kick rotation
- Pause support
- Mobile swipe + tap controls
- Game-over and start modals
- Clean, modern responsive UI

---

## Author

**Sourav Banerjee**

GitHub: [Souravbanerjeedata](https://github.com/Souravbanerjeedata)
