import { create } from 'zustand';
import {
  WS_LEVELS, generateWordSearch, getLineCells, cellsToWord,
  type WSLevel, type PlacedWord,
} from '../utils/wordSearchGenerator';

export interface FoundWord {
  word: string;
  cells: { row: number; col: number }[];
}

interface WSState {
  level: WSLevel;
  grid: string[][];
  placed: PlacedWord[];
  found: FoundWord[];
  selStart: { row: number; col: number } | null;
  selCells: { row: number; col: number }[];
  seconds: number;
  isComplete: boolean;

  startPuzzle: (levelId: string) => void;
  setHover: (row: number, col: number) => void;
  commitSelection: (endRow: number, endCol: number) => void;
  cancelSelection: () => void;
  startSelection: (row: number, col: number) => void;
  tick: () => void;
}

let tickTimer: ReturnType<typeof setInterval> | null = null;

export const useWordSearchStore = create<WSState>((set, get) => ({
  level: WS_LEVELS[0],
  grid: [],
  placed: [],
  found: [],
  selStart: null,
  selCells: [],
  seconds: 0,
  isComplete: false,

  startPuzzle(levelId: string) {
    const level = WS_LEVELS.find(l => l.id === levelId) ?? WS_LEVELS[0];
    const { grid, placed } = generateWordSearch(level);
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
    set({ level, grid, placed, found: [], selStart: null, selCells: [], seconds: 0, isComplete: false });
  },

  startSelection(row: number, col: number) {
    set({ selStart: { row, col }, selCells: [{ row, col }] });
  },

  setHover(row: number, col: number) {
    const { selStart } = get();
    if (!selStart) return;
    const cells = getLineCells(selStart.row, selStart.col, row, col);
    set({ selCells: cells ?? [selStart] });
  },

  commitSelection(endRow: number, endCol: number) {
    const { selStart, grid, placed, found } = get();
    if (!selStart) return;

    const cells = getLineCells(selStart.row, selStart.col, endRow, endCol);
    if (!cells || cells.length < 2) { set({ selStart: null, selCells: [] }); return; }

    const forward  = cellsToWord(cells, grid);
    const backward = [...cells].reverse().map(({ row, col }) => grid[row][col]).join('');

    const match = placed.find(p => p.word === forward || p.word === backward);
    const alreadyFound = found.some(f => f.word === match?.word);

    if (match && !alreadyFound) {
      const newFound = [...found, { word: match.word, cells }];
      const isComplete = newFound.length === placed.length;
      if (isComplete && tickTimer) { clearInterval(tickTimer); tickTimer = null; }
      set({ found: newFound, isComplete, selStart: null, selCells: [] });
    } else {
      set({ selStart: null, selCells: [] });
    }
  },

  cancelSelection() {
    set({ selStart: null, selCells: [] });
  },

  tick() {
    if (!get().isComplete) set(s => ({ seconds: s.seconds + 1 }));
  },
}));
