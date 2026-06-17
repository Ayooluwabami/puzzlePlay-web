export interface PlacedWord {
  word: string;
  row: number;
  col: number;
  dr: number;
  dc: number;
}

export interface WSLevel {
  id: string;
  label: string;
  size: number;
  theme: string;
  words: string[];
  color: string;
  bg: string;
  border: string;
  description: string;
}

// [dr, dc] — 8 directions
const DIRECTIONS: [number, number][] = [
  [0, 1], [0, -1], [1, 0], [-1, 0],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

export const WS_LEVELS: WSLevel[] = [
  {
    id: 'mini', label: 'Mini', size: 8, theme: 'Animals',
    words: ['CAT', 'DOG', 'LION', 'BEAR', 'WOLF'],
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    description: '8×8 grid · 5 animal words',
  },
  {
    id: 'easy', label: 'Easy', size: 10, theme: 'Sports',
    words: ['SOCCER', 'TENNIS', 'GOLF', 'RUGBY', 'SWIM', 'RACE', 'POLO'],
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    description: '10×10 grid · 7 sport words',
  },
  {
    id: 'medium', label: 'Medium', size: 12, theme: 'Nature',
    words: ['RIVER', 'FOREST', 'MOUNTAIN', 'OCEAN', 'DESERT', 'VALLEY', 'LAKE', 'CLOUD'],
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    description: '12×12 grid · 8 nature words',
  },
  {
    id: 'hard', label: 'Hard', size: 14, theme: 'Space',
    words: ['PLANET', 'GALAXY', 'COMET', 'NEBULA', 'ORBIT', 'METEOR', 'SATURN', 'ECLIPSE', 'ASTEROID', 'COSMOS'],
    color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8',
    description: '14×14 grid · 10 space words',
  },
  {
    id: 'expert', label: 'Expert', size: 16, theme: 'Technology',
    words: ['ALGORITHM', 'DATABASE', 'NETWORK', 'SERVER', 'PYTHON', 'COMPILER', 'BINARY', 'PIXEL', 'ROUTER', 'KERNEL', 'CACHE', 'SOCKET'],
    color: '#b45309', bg: '#fffbeb', border: '#fde68a',
    description: '16×16 grid · 12 tech words',
  },
];

function makeLcg(seed: number) {
  let s = (seed ^ 0xDEADBEEF) >>> 0;
  return () => { s = Math.imul(s, 1664525) + 1013904223 >>> 0; return s / 4294967296; };
}

export function generateWordSearch(level: WSLevel, seed: number): { grid: string[][], placed: PlacedWord[] } {
  const rng = makeLcg(seed);
  const { size, words } = level;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placed: PlacedWord[] = [];

  const sorted = [...words].sort((a, b) => b.length - a.length);

  for (const word of sorted) {
    let ok = false;
    for (let attempt = 0; attempt < 300 && !ok; attempt++) {
      const [dr, dc] = DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)];
      const row = Math.floor(rng() * size);
      const col = Math.floor(rng() * size);
      const endRow = row + dr * (word.length - 1);
      const endCol = col + dc * (word.length - 1);
      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i, c = col + dc * i;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) { canPlace = false; break; }
      }
      if (!canPlace) continue;

      for (let i = 0; i < word.length; i++) {
        grid[row + dr * i][col + dc * i] = word[i];
      }
      placed.push({ word, row, col, dr, dc });
      ok = true;
    }
  }

  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') grid[r][c] = alpha[Math.floor(rng() * 26)];
    }
  }

  return { grid, placed };
}

export function getLineCells(
  startRow: number, startCol: number, endRow: number, endCol: number
): { row: number; col: number }[] | null {
  const dr = endRow - startRow;
  const dc = endCol - startCol;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return null;

  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  // Must be horizontal, vertical, or 45° diagonal
  if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;

  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i <= len; i++) {
    cells.push({ row: startRow + stepR * i, col: startCol + stepC * i });
  }
  return cells;
}

export function cellsToWord(cells: { row: number; col: number }[], grid: string[][]): string {
  return cells.map(({ row, col }) => grid[row][col]).join('');
}
