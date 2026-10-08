// ─── Puzzle Play design tokens ───────────────────────────────────────────────
// Printed-puzzle-book direction: warm paper, ink type, one flat colour per game.

export const C = {
  paper:       '#F5F1E8',
  paperDeep:   '#ECE6D9',
  surface:     '#FFFDF8',
  ink:         '#17171A',
  ink2:        '#4F4B44',
  ink3:        '#8A847A',
  line:        'rgba(23,23,26,0.12)',
  lineSoft:    'rgba(23,23,26,0.07)',
  success:     '#2E9E5B',
  successTint: '#D6EFDF',
  danger:      '#D2402F',
  dangerTint:  '#FBE0DB',
} as const;

export const FONT = {
  display: "'Fraunces', Georgia, serif",
  ui:      "'Figtree', -apple-system, BlinkMacSystemFont, sans-serif",
} as const;

export type GameKey = 'sudoku' | 'words' | 'jigsaw';

export interface GameTheme {
  key: GameKey;
  name: string;
  path: string;
  color: string;   // identity colour
  tint: string;    // light wash of the colour
  tint2: string;   // stronger wash
  deep: string;    // darker shade for text on tint
  on: string;      // text colour on `color`
  tagline: string;
  blurb: string;
}

export const GAMES: Record<GameKey, GameTheme> = {
  sudoku: {
    key: 'sudoku', name: 'Sudoku', path: '/sudoku',
    color: '#2B4EDB', tint: '#E4E9FC', tint2: '#C6D2F8', deep: '#1B3299', on: '#FFFFFF',
    tagline: 'Fill the grid. Every row, column and box.',
    blurb: 'Pure logic, from a 4×4 warm-up to a 23-clue expert grid.',
  },
  words: {
    key: 'words', name: 'Word Search', path: '/wordsearch',
    color: '#F2B630', tint: '#FCF0CD', tint2: '#F8DE96', deep: '#8A5D00', on: '#17171A',
    tagline: 'Find every word hiding in the letters.',
    blurb: 'Themed grids that open up to all eight directions.',
  },
  jigsaw: {
    key: 'jigsaw', name: 'Jigsaw', path: '/jigsaw',
    color: '#E5533D', tint: '#FBE2DC', tint2: '#F6C3B8', deep: '#A32B19', on: '#FFFFFF',
    tagline: 'Piece the photograph back together.',
    blurb: 'Eighty photographs, from 4 pieces to 225.',
  },
};

export const EASE = [0.22, 1, 0.36, 1] as const;
