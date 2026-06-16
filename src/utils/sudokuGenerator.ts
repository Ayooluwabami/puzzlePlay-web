export type Difficulty = '4x4' | '6x6' | 'easy' | 'medium' | 'hard' | 'expert';
export type Grid = (number | null)[][];

export interface PuzzleConfig {
  size: number;
  boxRows: number;
  boxCols: number;
  cellsToRemove: number;
  label: string;
  clueLabel: string;
  description: string;
  colorClass: string;
  badgeClass: string;
}

export const PUZZLE_CONFIGS: Record<Difficulty, PuzzleConfig> = {
  '4x4':   { size: 4, boxRows: 2, boxCols: 2, cellsToRemove: 8,  label: '4×4 Mini',  clueLabel: '8 clues',  description: 'The perfect starter',    colorClass: 'border-violet-200 hover:border-violet-400 bg-violet-50', badgeClass: 'bg-violet-100 text-violet-700' },
  '6x6':   { size: 6, boxRows: 2, boxCols: 3, cellsToRemove: 18, label: '6×6 Mini',  clueLabel: '18 clues', description: 'A fun mini challenge',     colorClass: 'border-sky-200 hover:border-sky-400 bg-sky-50',         badgeClass: 'bg-sky-100 text-sky-700' },
  'easy':   { size: 9, boxRows: 3, boxCols: 3, cellsToRemove: 36, label: 'Easy',       clueLabel: '45 clues', description: 'Perfect for beginners',    colorClass: 'border-green-200 hover:border-green-400 bg-green-50',   badgeClass: 'bg-green-100 text-green-700' },
  'medium': { size: 9, boxRows: 3, boxCols: 3, cellsToRemove: 46, label: 'Medium',     clueLabel: '35 clues', description: 'A gentle challenge',       colorClass: 'border-blue-200 hover:border-blue-400 bg-blue-50',      badgeClass: 'bg-blue-100 text-blue-700' },
  'hard':   { size: 9, boxRows: 3, boxCols: 3, cellsToRemove: 52, label: 'Hard',       clueLabel: '29 clues', description: 'Tests your logic',          colorClass: 'border-amber-200 hover:border-amber-400 bg-amber-50',   badgeClass: 'bg-amber-100 text-amber-700' },
  'expert': { size: 9, boxRows: 3, boxCols: 3, cellsToRemove: 58, label: 'Expert',     clueLabel: '23 clues', description: 'For true masters',          colorClass: 'border-red-200 hover:border-red-400 bg-red-50',         badgeClass: 'bg-red-100 text-red-700' },
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number,
  boxRows: number,
  boxCols: number,
  size: number
): boolean {
  for (let c = 0; c < size; c++) {
    if (grid[row][c] === num) return false;
  }
  for (let r = 0; r < size; r++) {
    if (grid[r][col] === num) return false;
  }
  const startRow = Math.floor(row / boxRows) * boxRows;
  const startCol = Math.floor(col / boxCols) * boxCols;
  for (let r = startRow; r < startRow + boxRows; r++) {
    for (let c = startCol; c < startCol + boxCols; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function solveBoard(
  grid: number[][],
  boxRows: number,
  boxCols: number,
  size: number,
  randomize = false
): boolean {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) {
        const nums = randomize
          ? shuffle(Array.from({ length: size }, (_, i) => i + 1))
          : Array.from({ length: size }, (_, i) => i + 1);
        for (const num of nums) {
          if (isValidPlacement(grid, r, c, num, boxRows, boxCols, size)) {
            grid[r][c] = num;
            if (solveBoard(grid, boxRows, boxCols, size, randomize)) return true;
            grid[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: Grid; solution: Grid } {
  const { size, boxRows, boxCols, cellsToRemove } = PUZZLE_CONFIGS[difficulty];
  const board = Array(size).fill(null).map(() => Array(size).fill(0));
  solveBoard(board, boxRows, boxCols, size, true);

  const solution: Grid = board.map(row => [...row]);
  const puzzle: Grid = board.map(row => [...row]);

  const positions = shuffle(
    Array.from({ length: size * size }, (_, i) => [Math.floor(i / size), i % size] as [number, number])
  );

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= cellsToRemove) break;
    puzzle[r][c] = null;
    removed++;
  }

  return { puzzle, solution };
}

export function isBoardComplete(userGrid: Grid, solution: Grid): boolean {
  for (let r = 0; r < solution.length; r++) {
    for (let c = 0; c < solution[r].length; c++) {
      if (userGrid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}

export function getSolvableHintCell(userGrid: Grid, solution: Grid): [number, number] | null {
  const wrong: [number, number][] = [];
  for (let r = 0; r < solution.length; r++) {
    for (let c = 0; c < solution[r].length; c++) {
      if (userGrid[r][c] !== solution[r][c]) wrong.push([r, c]);
    }
  }
  if (wrong.length === 0) return null;
  return wrong[Math.floor(Math.random() * wrong.length)];
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
