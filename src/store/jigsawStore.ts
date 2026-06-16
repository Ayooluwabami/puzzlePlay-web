import { create } from 'zustand';
import {
  JIGSAW_LEVELS, buildPieces, shuffle, getImageUrl,
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
  pieces: JigsawPiece[];          // all pieces
  tray: number[];                  // piece IDs in tray (unplaced)
  board: (PlacedState | null)[][]; // grid[row][col]
  selectedTrayId: number | null;
  seconds: number;
  isComplete: boolean;

  startPuzzle: (levelId: string, seed?: number) => void;
  selectTrayPiece: (id: number) => void;
  placeOnBoard: (row: number, col: number) => void;
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
  seconds: 0,
  isComplete: false,

  startPuzzle(levelId: string, seed = Math.floor(Math.random() * 10)) {
    const level = JIGSAW_LEVELS.find(l => l.id === levelId) ?? JIGSAW_LEVELS[0];
    const { gridSize } = level;
    const pieces = buildPieces(gridSize);
    const tray = shuffle(pieces.map(p => p.id));
    const board: (PlacedState | null)[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
    set({
      level, imageSeed: seed, imageUrl: getImageUrl(seed),
      pieces, tray, board,
      selectedTrayId: null, seconds: 0, isComplete: false,
    });
  },

  selectTrayPiece(id: number) {
    const { selectedTrayId } = get();
    set({ selectedTrayId: selectedTrayId === id ? null : id });
  },

  placeOnBoard(row: number, col: number) {
    const { selectedTrayId, pieces, board, tray } = get();
    if (selectedTrayId === null) return;

    const piece = pieces.find(p => p.id === selectedTrayId);
    if (!piece) return;

    // If the slot is occupied, swap that piece back to tray
    const existing = board[row][col];
    const newBoard = board.map(r => [...r]);
    const newTray = tray.filter(id => id !== selectedTrayId);

    if (existing) {
      newTray.push(existing.pieceId);
    }

    const correct = piece.correctRow === row && piece.correctCol === col;
    newBoard[row][col] = { pieceId: selectedTrayId, correct };

    const isComplete = newBoard.every(r => r.every(cell => cell?.correct));
    set({ board: newBoard, tray: newTray, selectedTrayId: null, isComplete });
  },

  tick() {
    if (!get().isComplete) set(s => ({ seconds: s.seconds + 1 }));
  },
}));
