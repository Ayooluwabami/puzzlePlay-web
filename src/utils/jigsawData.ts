export interface JigsawLevel {
  id: string;
  label: string;
  gridSize: number;
  color: string;
  bg: string;
  border: string;
  description: string;
}

export const JIGSAW_LEVELS: JigsawLevel[] = [
  {
    id: 'tiny',     label: 'Tiny',     gridSize: 2,
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    description: '4 pieces — perfect warm-up',
  },
  {
    id: 'small',    label: 'Small',    gridSize: 3,
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    description: '9 pieces — easy does it',
  },
  {
    id: 'medium',   label: 'Medium',   gridSize: 4,
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    description: '16 pieces — getting tricky',
  },
  {
    id: 'hard',     label: 'Hard',     gridSize: 5,
    color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8',
    description: '25 pieces — a real challenge',
  },
  {
    id: 'expert',   label: 'Expert',   gridSize: 6,
    color: '#b45309', bg: '#fffbeb', border: '#fde68a',
    description: '36 pieces — serious puzzling',
  },
  {
    id: 'large',    label: 'Large',    gridSize: 8,
    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
    description: '64 pieces — test your patience',
  },
  {
    id: 'xl',       label: 'XL',       gridSize: 10,
    color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe',
    description: '100 pieces — dedicated puzzler',
  },
  {
    id: 'xxl',      label: 'XXL',      gridSize: 12,
    color: '#9333ea', bg: '#faf5ff', border: '#e9d5ff',
    description: '144 pieces — expert territory',
  },
  {
    id: 'ultimate', label: 'Ultimate', gridSize: 15,
    color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
    description: '225 pieces — the ultimate challenge',
  },
];

const IMAGE_IDS = [
  // 80 curated Picsum photo IDs
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 22, 24, 26, 28, 29, 30, 32, 33, 36,
  37, 39, 40, 42, 43, 45, 47, 48, 49, 50,
  51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
  61, 62, 63, 64, 65, 66, 67, 68, 69, 70,
  71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
  82, 83, 84, 85, 86, 87, 88, 89, 90, 91,
  92, 93, 94, 95, 96, 97, 98, 99, 100, 101,
];

export const IMAGE_COUNT = IMAGE_IDS.length;

export function getImageUrl(seed: number, size = 480) {
  const id = IMAGE_IDS[seed % IMAGE_IDS.length];
  return `https://picsum.photos/id/${id}/${size}/${size}`;
}

export interface JigsawPiece {
  id: number;
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
