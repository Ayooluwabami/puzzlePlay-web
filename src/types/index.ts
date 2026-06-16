export interface GameState {
  puzzle: (number | null)[][];
  solution: number[][];
  userGrid: (number | null)[][];
  notes: boolean[][][];
  selectedCell: [number, number] | null;
  isNotesMode: boolean;
  difficulty: Difficulty;
  seconds: number;
  mistakes: number;
  hintsLeft: number;
  history: HistoryEntry[];
  isComplete: boolean;
  isNewRecord: boolean;
  bestTimes: Record<Difficulty, number | null>;
  puzzleConfig: PuzzleConfig;
  flashingLines: boolean;
  startGame: (difficulty: Difficulty) => void;
  inputNumber: (num: number) => void;
  erase: () => void;
  undo: () => void;
  selectCell: (row: number, col: number) => void;
  toggleNotes: () => void;
  useHint: () => void;
  tick: () => void;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface PuzzleConfig {
  label: string;
  size: number;
  boxRows: number;
  boxCols: number;
  clues: number;
}

export interface HistoryEntry {
  grid: (number | null)[][];
  notes: boolean[][][];
}
