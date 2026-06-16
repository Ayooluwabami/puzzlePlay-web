import type { Difficulty } from './sudokuGenerator';

const KEY = (d: Difficulty) => `sudoku_best_${d}`;

export function getBestTime(d: Difficulty): number | null {
  try {
    const v = localStorage.getItem(KEY(d));
    return v !== null ? parseInt(v, 10) : null;
  } catch { return null; }
}

export function setBestTime(d: Difficulty, seconds: number): boolean {
  try {
    const existing = getBestTime(d);
    if (existing === null || seconds < existing) {
      localStorage.setItem(KEY(d), String(seconds));
      return true;
    }
    return false;
  } catch { return false; }
}

export function loadAllBestTimes(): Partial<Record<Difficulty, number>> {
  const all: Difficulty[] = ['4x4', '6x6', 'easy', 'medium', 'hard', 'expert'];
  const result: Partial<Record<Difficulty, number>> = {};
  for (const d of all) {
    const t = getBestTime(d);
    if (t !== null) result[d] = t;
  }
  return result;
}
