export interface JigsawLevel {
  id: string;
  label: string;
  gridSize: number; // N×N pieces
  color: string;
  bg: string;
  border: string;
  description: string;
}

export const JIGSAW_LEVELS: JigsawLevel[] = [
  {
    id: 'tiny',   label: 'Tiny',   gridSize: 2,
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    description: '4 pieces — perfect warm-up',
  },
  {
    id: 'small',  label: 'Small',  gridSize: 3,
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    description: '9 pieces — easy does it',
  },
  {
    id: 'medium', label: 'Medium', gridSize: 4,
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    description: '16 pieces — getting tricky',
  },
  {
    id: 'hard',   label: 'Hard',   gridSize: 5,
    color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8',
    description: '25 pieces — a real challenge',
  },
  {
    id: 'expert', label: 'Expert', gridSize: 6,
    color: '#b45309', bg: '#fffbeb', border: '#fde68a',
    description: '36 pieces — master-level',
  },
];

// Picsum seed IDs — replace with your own images later
const IMAGE_IDS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export function getImageUrl(seed: number, size = 480) {
  const id = IMAGE_IDS[seed % IMAGE_IDS.length];
  return `https://picsum.photos/id/${id}/${size}/${size}`;
}

export interface JigsawPiece {
  id: number; // linear index: row * gridSize + col
  correctRow: number;
  correctCol: number;
}

export function buildPieces(gridSize: number): JigsawPiece[] {
  const pieces: JigsawPiece[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      pieces.push({ id: r * gridSize + c, correctRow: r, correctCol: c });
    }
  }
  return pieces;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
