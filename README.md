# Puzzle Play — Web

A browser-based puzzle game hub built with **Vite + React 19 + TypeScript + Tailwind CSS v4**.

## Why I built this

I love puzzles — Sudoku, Word Search, and Jigsaw Puzzles have always been my go-to for a mental workout. But every app I found was riddled with ads that constantly interrupted my flow. So I built my own: clean, fast, and completely ad-free.

## Games

### 🔢 Sudoku
Six difficulty levels from a quick 4×4 Mini to a brutal 9×9 Expert. Features:
- Unlimited puzzles per level — play as many rounds as you like without leaving
- Undo, Erase, Notes mode, and 3 Hints per game
- Green streak animation when you complete a row, column, or the full board
- Best time tracking per level (persisted in `localStorage`)
- No game-over — mistakes are shown only in the final summary

### 🔍 Word Search
Five difficulty levels from Mini (8×8, 6 words) to Expert (15×15, 15 words). Features:
- Randomly generated grids with themed word lists
- Directions scale with difficulty: horizontal/vertical → all 8 directions
- Tap-to-select word highlighting
- Timer and found-word counter

### 🧩 Jigsaw Puzzles
Five difficulty levels from Tiny (4 pieces) to Expert (30 pieces). Features:
- Beautiful photography from Picsum Photos — replace `src/utils/jigsawData.ts` URLs with your own images
- Tap-to-select-and-place interaction
- Pieces lock green when placed correctly
- Timer tracks your solve time

## Tech stack

| Tool | Version |
|------|---------|
| React | 19 |
| Vite | latest |
| TypeScript | 5.x |
| Tailwind CSS | v4 |
| Zustand | 5.x |
| React Router | 6 |

## Getting started

```bash
cd sudoku-web
npm install
npm run dev
```

Open [http://localhost:5199](http://localhost:5199)

## Replacing Jigsaw images

Edit `src/utils/jigsawData.ts` and swap the `url` values in `JIGSAW_IMAGES` with your own photo URLs or local paths (use `/public/images/photo.jpg` for local files).
