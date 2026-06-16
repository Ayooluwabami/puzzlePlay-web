import { create } from 'zustand';
import {
  generatePuzzle,
  isBoardComplete,
  getSolvableHintCell,
  PUZZLE_CONFIGS,
} from '../utils/sudokuGenerator';
import type { Grid, Difficulty, PuzzleConfig } from '../utils/sudokuGenerator';
import { setBestTime, loadAllBestTimes } from '../utils/highScores';

export type Notes = boolean[][][]; // [row][col][num-1], always 9 slots

const INITIAL_HINTS = 3;

const emptyNotes = (size: number): Notes =>
  Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => Array(9).fill(false))
  );

const cloneNotes = (notes: Notes): Notes =>
  notes.map(row => row.map(cell => [...cell]));

interface HistoryEntry { grid: Grid; notes: Notes }

interface GameState {
  puzzle: Grid;
  solution: Grid;
  userGrid: Grid;
  notes: Notes;
  selectedCell: [number, number] | null;
  difficulty: Difficulty;
  puzzleConfig: PuzzleConfig;
  isNotesMode: boolean;
  mistakes: number;
  hintsLeft: number;
  history: HistoryEntry[];
  isComplete: boolean;
  seconds: number;
  flashingLines: { rows: number[]; cols: number[] };
  bestTimes: Partial<Record<Difficulty, number>>;
  isNewRecord: boolean;

  startGame: (difficulty: Difficulty) => void;
  selectCell: (row: number, col: number) => void;
  inputNumber: (num: number) => void;
  erase: () => void;
  undo: () => void;
  toggleNotes: () => void;
  useHint: () => void;
  tick: () => void;
}

let flashTimeout: ReturnType<typeof setTimeout> | null = null;

function detectNewlyCompleteLines(
  newGrid: Grid,
  oldGrid: Grid,
  solution: Grid,
  changedRow: number,
  changedCol: number,
  size: number
): { rows: number[]; cols: number[] } {
  const rows: number[] = [];
  const cols: number[] = [];

  const rowNowDone = newGrid[changedRow].every((v, c) => v === solution[changedRow][c]);
  const rowWasDone = oldGrid[changedRow].every((v, c) => v !== null && v === solution[changedRow][c]);
  if (rowNowDone && !rowWasDone) rows.push(changedRow);

  const colNowDone = Array.from({ length: size }, (_, r) => newGrid[r][changedCol] === solution[r][changedCol]).every(Boolean);
  const colWasDone = Array.from({ length: size }, (_, r) => oldGrid[r][changedCol] !== null && oldGrid[r][changedCol] === solution[r][changedCol]).every(Boolean);
  if (colNowDone && !colWasDone) cols.push(changedCol);

  return { rows, cols };
}

export const useGameStore = create<GameState>((set, get) => ({
  puzzle: Array(9).fill(null).map(() => Array(9).fill(null)),
  solution: Array(9).fill(null).map(() => Array(9).fill(null)),
  userGrid: Array(9).fill(null).map(() => Array(9).fill(null)),
  notes: emptyNotes(9),
  selectedCell: null,
  difficulty: 'easy',
  puzzleConfig: PUZZLE_CONFIGS['easy'],
  isNotesMode: false,
  mistakes: 0,
  hintsLeft: INITIAL_HINTS,
  history: [],
  isComplete: false,
  seconds: 0,
  flashingLines: { rows: [], cols: [] },
  bestTimes: loadAllBestTimes(),
  isNewRecord: false,

  startGame: (difficulty) => {
    const config = PUZZLE_CONFIGS[difficulty];
    const { puzzle, solution } = generatePuzzle(difficulty);
    if (flashTimeout) { clearTimeout(flashTimeout); flashTimeout = null; }
    set({
      puzzle,
      solution,
      userGrid: puzzle.map(row => [...row]),
      notes: emptyNotes(config.size),
      selectedCell: null,
      difficulty,
      puzzleConfig: config,
      isNotesMode: false,
      mistakes: 0,
      hintsLeft: INITIAL_HINTS,
      history: [],
      isComplete: false,
      seconds: 0,
      flashingLines: { rows: [], cols: [] },
      isNewRecord: false,
    });
  },

  selectCell: (row, col) => set({ selectedCell: [row, col] }),

  inputNumber: (num) => {
    const { selectedCell, puzzle, userGrid, solution, notes, isNotesMode, history, mistakes, puzzleConfig, difficulty, bestTimes } = get();
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== null) return;
    if (get().isComplete) return;

    if (isNotesMode) {
      const newNotes = cloneNotes(notes);
      newNotes[row][col][num - 1] = !newNotes[row][col][num - 1];
      set({ notes: newNotes });
      return;
    }

    const savedHistory: HistoryEntry = {
      grid: userGrid.map(r => [...r]),
      notes: cloneNotes(notes),
    };

    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = num;

    const newNotes = cloneNotes(notes);
    newNotes[row][col] = Array(9).fill(false);
    const { size, boxRows, boxCols } = puzzleConfig;
    for (let c = 0; c < size; c++) newNotes[row][c][num - 1] = false;
    for (let r = 0; r < size; r++) newNotes[r][col][num - 1] = false;
    const boxR = Math.floor(row / boxRows) * boxRows;
    const boxC = Math.floor(col / boxCols) * boxCols;
    for (let r = boxR; r < boxR + boxRows; r++)
      for (let c = boxC; c < boxC + boxCols; c++)
        newNotes[r][c][num - 1] = false;

    const newMistakes = num !== solution[row][col] ? mistakes + 1 : mistakes;
    const newComplete = isBoardComplete(newGrid, solution);

    let newFlashing = { rows: [] as number[], cols: [] as number[] };
    if (newComplete) {
      // Full board celebration flash
      const allIdx = Array.from({ length: size }, (_, i) => i);
      newFlashing = { rows: allIdx, cols: allIdx };
      if (flashTimeout) clearTimeout(flashTimeout);
      flashTimeout = setTimeout(() => { set({ flashingLines: { rows: [], cols: [] } }); flashTimeout = null; }, 1500);
    } else if (num === solution[row][col]) {
      newFlashing = detectNewlyCompleteLines(newGrid, userGrid, solution, row, col, size);
      if (newFlashing.rows.length > 0 || newFlashing.cols.length > 0) {
        if (flashTimeout) clearTimeout(flashTimeout);
        flashTimeout = setTimeout(() => { set({ flashingLines: { rows: [], cols: [] } }); flashTimeout = null; }, 900);
      }
    }

    // Record best time on completion
    let newBestTimes = bestTimes;
    let isNewRecord = false;
    if (newComplete) {
      const seconds = get().seconds;
      if (setBestTime(difficulty, seconds)) {
        newBestTimes = { ...bestTimes, [difficulty]: seconds };
        isNewRecord = true;
      }
    }

    set({
      userGrid: newGrid,
      notes: newNotes,
      history: [...history, savedHistory],
      mistakes: newMistakes,
      isComplete: newComplete,
      flashingLines: newFlashing,
      bestTimes: newBestTimes,
      isNewRecord,
    });
  },

  erase: () => {
    const { selectedCell, puzzle, userGrid, notes, history, isComplete } = get();
    if (!selectedCell || isComplete) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== null) return;
    if (userGrid[row][col] === null && !notes[row][col].some(Boolean)) return;

    const savedHistory: HistoryEntry = { grid: userGrid.map(r => [...r]), notes: cloneNotes(notes) };
    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = null;
    const newNotes = cloneNotes(notes);
    newNotes[row][col] = Array(9).fill(false);
    set({ userGrid: newGrid, notes: newNotes, history: [...history, savedHistory] });
  },

  undo: () => {
    const { history, isComplete } = get();
    if (history.length === 0 || isComplete) return;
    const prev = history[history.length - 1];
    set({ userGrid: prev.grid, notes: prev.notes, history: history.slice(0, -1) });
  },

  toggleNotes: () => set(state => ({ isNotesMode: !state.isNotesMode })),

  useHint: () => {
    const { selectedCell, puzzle, userGrid, solution, notes, history, hintsLeft, isComplete, difficulty, bestTimes } = get();
    if (hintsLeft <= 0 || isComplete) return;

    let targetCell = selectedCell;
    if (
      !targetCell ||
      puzzle[targetCell[0]][targetCell[1]] !== null ||
      userGrid[targetCell[0]][targetCell[1]] === solution[targetCell[0]][targetCell[1]]
    ) {
      targetCell = getSolvableHintCell(userGrid, solution);
    }
    if (!targetCell) return;

    const [row, col] = targetCell;
    const { size } = get().puzzleConfig;
    const savedHistory: HistoryEntry = { grid: userGrid.map(r => [...r]), notes: cloneNotes(notes) };
    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = solution[row][col]!;
    const newNotes = cloneNotes(notes);
    newNotes[row][col] = Array(9).fill(false);
    const newComplete = isBoardComplete(newGrid, solution);

    const newFlashing = detectNewlyCompleteLines(newGrid, userGrid, solution, row, col, size);
    if (newFlashing.rows.length > 0 || newFlashing.cols.length > 0) {
      if (flashTimeout) clearTimeout(flashTimeout);
      flashTimeout = setTimeout(() => {
        set({ flashingLines: { rows: [], cols: [] } });
        flashTimeout = null;
      }, 900);
    }

    let newBestTimes = bestTimes;
    let isNewRecord = false;
    if (newComplete) {
      const seconds = get().seconds;
      if (setBestTime(difficulty, seconds)) {
        newBestTimes = { ...bestTimes, [difficulty]: seconds };
        isNewRecord = true;
      }
    }

    set({
      userGrid: newGrid,
      notes: newNotes,
      history: [...history, savedHistory],
      hintsLeft: hintsLeft - 1,
      selectedCell: [row, col],
      isComplete: newComplete,
      flashingLines: newFlashing,
      bestTimes: newBestTimes,
      isNewRecord,
    });
  },

  tick: () => {
    if (!get().isComplete) set(state => ({ seconds: state.seconds + 1 }));
  },
}));
