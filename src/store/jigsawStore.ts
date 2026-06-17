import { create } from 'zustand';
import {
  JIGSAW_LEVELS, buildPieces, shuffle, getImageUrl, IMAGE_COUNT,
  type JigsawLevel, type JigsawPiece,
} from '../utils/jigsawData';

interface PlacedState {
  pieceId: number;
  correct: boolean;
}

interface JigsawState {
  level: JigsawLevel;
  imageSeed: number;
  imageUrl: string;
  pieces: JigsawPiece[];
  tray: number[];
  board: (PlacedState | null)[][];
  selectedTrayId: number | null;
  hintsLeft: number;
  hintCell: { row: number; col: number } | null;
  seconds: number;
  isComplete: boolean;
  imageCursors: Record<string, number>;

  startPuzzle: (levelId: string, seed?: number) => void;
  newGame: (levelId: string) => void;
  selectTrayPiece: (id: number) => void;
  placeOnBoard: (row: number, col: number) => void;
  placeOnBoardById: (pieceId: number, row: number, col: number) => void;
  returnToTray: (row: number, col: number) => void;
  useHint: () => void;
  tick: () => void;
}

export const useJigsawStore = create<JigsawState>((set, get) => ({
  level: JIGSAW_LEVELS[0],
  imageSeed: 0,
  imageUrl: getImageUrl(0),
  pieces: [],
  tray: [],
  board: [],
  selectedTrayId: null,
  hintsLeft: 3,
  hintCell: null,
  seconds: 0,
  isComplete: false,
  imageCursors: {},

  startPuzzle(levelId: string, seed?: number) {
    const { imageCursors, imageSeed: prevSeed } = get();
    const level = JIGSAW_LEVELS.find(l => l.id === levelId) ?? JIGSAW_LEVELS[0];
    const { gridSize } = level;

    let actualSeed: number;
    let newCursors = imageCursors;

    if (seed !== undefined) {
      actualSeed = seed % IMAGE_COUNT;
    } else {
      // Auto-advance: pick next image, skipping the current one
      const cursor = imageCursors[levelId] ?? Math.floor(Math.random() * IMAGE_COUNT);
      actualSeed = cursor % IMAGE_COUNT;
      // Ensure we don't show the same image twice in a row
      if (actualSeed === prevSeed && IMAGE_COUNT > 1) {
        actualSeed = (actualSeed + 1) % IMAGE_COUNT;
      }
      newCursors = { ...imageCursors, [levelId]: (actualSeed + 1) % IMAGE_COUNT };
    }

    const pieces = buildPieces(gridSize);
    const tray = shuffle(pieces.map(p => p.id));
    const board: (PlacedState | null)[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    set({
      level, imageSeed: actualSeed, imageUrl: getImageUrl(actualSeed),
      pieces, tray, board,
      selectedTrayId: null, hintsLeft: 3, hintCell: null, seconds: 0, isComplete: false,
      imageCursors: newCursors,
    });
  },

  newGame(levelId: string) {
    get().startPuzzle(levelId);
  },

  selectTrayPiece(id: number) {
    const { selectedTrayId } = get();
    set({ selectedTrayId: selectedTrayId === id ? null : id });
  },

  placeOnBoard(row: number, col: number) {
    const { selectedTrayId } = get();
    if (selectedTrayId === null) return;
    get().placeOnBoardById(selectedTrayId, row, col);
    set({ selectedTrayId: null });
  },

  placeOnBoardById(pieceId: number, row: number, col: number) {
    const { pieces, board, tray } = get();
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const existing = board[row][col];
    const newBoard = board.map(r => [...r]);
    const newTray = tray.filter(id => id !== pieceId);

    if (existing) newTray.push(existing.pieceId);

    const correct = piece.correctRow === row && piece.correctCol === col;
    newBoard[row][col] = { pieceId, correct };

    const isComplete = newBoard.every(r => r.every(cell => cell?.correct));
    set({ board: newBoard, tray: newTray, isComplete });
  },

  returnToTray(row: number, col: number) {
    const { board } = get();
    const cell = board[row]?.[col];
    if (!cell) return;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = null;
    set({ board: newBoard, tray: [...get().tray, cell.pieceId], selectedTrayId: null });
  },

  useHint() {
    const { pieces, board, hintsLeft } = get();
    if (hintsLeft <= 0) return;
    const wrongCells: { row: number; col: number }[] = [];
    board.forEach((r, ri) => r.forEach((cell, ci) => {
      if (!cell?.correct) wrongCells.push({ row: ri, col: ci });
    }));
    if (wrongCells.length === 0) return;
    const target = wrongCells[Math.floor(Math.random() * wrongCells.length)];
    const correct = pieces.find(p => p.correctRow === target.row && p.correctCol === target.col);
    if (!correct) return;
    set({ hintsLeft: hintsLeft - 1, hintCell: target });
    setTimeout(() => set({ hintCell: null }), 2500);
  },

  tick() {
    if (!get().isComplete) set(s => ({ seconds: s.seconds + 1 }));
  },
}));
