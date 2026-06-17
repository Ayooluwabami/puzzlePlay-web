export interface PlacedWord {
  word: string;
  row: number;
  col: number;
  dr: number;
  dc: number;
}

export interface WSPuzzle {
  theme: string;
  words: string[];
}

export interface WSLevel {
  id: string;
  label: string;
  size: number;
  puzzles: WSPuzzle[];
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
    id: 'mini', label: 'Mini', size: 8,
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    description: '8×8 grid · 5 words',
    puzzles: [
      { theme: 'Animals',  words: ['CAT', 'DOG', 'LION', 'BEAR', 'WOLF'] },
      { theme: 'Fruits',   words: ['APPLE', 'MANGO', 'KIWI', 'PEAR', 'LIME'] },
      { theme: 'Colors',   words: ['RED', 'BLUE', 'GREEN', 'PINK', 'GOLD'] },
      { theme: 'Sports',   words: ['RUN', 'SWIM', 'JUMP', 'KICK', 'GOLF'] },
      { theme: 'Weather',  words: ['RAIN', 'SNOW', 'WIND', 'HAIL', 'MIST'] },
      { theme: 'Kitchen',  words: ['POT', 'PAN', 'CUP', 'FORK', 'BOWL'] },
      { theme: 'Ocean',    words: ['WAVE', 'FISH', 'REEF', 'CRAB', 'KELP'] },
      { theme: 'Music',    words: ['DRUM', 'HORN', 'HARP', 'LUTE', 'NOTE'] },
      { theme: 'Garden',   words: ['ROSE', 'FERN', 'SEED', 'SOIL', 'RAKE'] },
      { theme: 'Space',    words: ['MOON', 'STAR', 'MARS', 'ORBIT', 'SUN'] },
      { theme: 'School',   words: ['PEN', 'BOOK', 'DESK', 'CHALK', 'RULE'] },
      { theme: 'Clothes',  words: ['COAT', 'SOCK', 'BOOT', 'VEST', 'BELT'] },
      { theme: 'Birds',    words: ['CROW', 'HAWK', 'WREN', 'DOVE', 'LARK'] },
      { theme: 'Farm',     words: ['COW', 'HEN', 'GOAT', 'LAMB', 'DUCK'] },
      { theme: 'Body',     words: ['ARM', 'LEG', 'EAR', 'CHIN', 'NOSE'] },
    ],
  },
  {
    id: 'easy', label: 'Easy', size: 10,
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    description: '10×10 grid · 7 words',
    puzzles: [
      { theme: 'Sports',     words: ['SOCCER', 'TENNIS', 'GOLF', 'RUGBY', 'SWIM', 'RACE', 'POLO'] },
      { theme: 'Food',       words: ['PIZZA', 'BURGER', 'PASTA', 'SALAD', 'BREAD', 'CURRY', 'TACOS'] },
      { theme: 'Nature',     words: ['RIVER', 'FOREST', 'CLOUD', 'MEADOW', 'CANYON', 'DELTA', 'MARSH'] },
      { theme: 'Wild Animals', words: ['TIGER', 'EAGLE', 'SHARK', 'RHINO', 'PANDA', 'COBRA', 'MOOSE'] },
      { theme: 'Countries',  words: ['FRANCE', 'JAPAN', 'BRAZIL', 'INDIA', 'CHINA', 'EGYPT', 'KENYA'] },
      { theme: 'Planets',    words: ['MERCURY', 'VENUS', 'EARTH', 'MARS', 'SATURN', 'URANUS', 'NEPTUNE'] },
      { theme: 'Instruments', words: ['GUITAR', 'VIOLIN', 'PIANO', 'TRUMPET', 'FLUTE', 'CELLO', 'DRUMS'] },
      { theme: 'Vehicles',   words: ['TRAIN', 'PLANE', 'TRUCK', 'YACHT', 'CANOE', 'BLIMP', 'FERRY'] },
      { theme: 'Tropical Fruits', words: ['BANANA', 'CHERRY', 'PAPAYA', 'LYCHEE', 'MANGO', 'LEMON', 'GUAVA'] },
      { theme: 'Shades',     words: ['VIOLET', 'ORANGE', 'YELLOW', 'INDIGO', 'MAROON', 'SCARLET', 'OLIVE'] },
      { theme: 'Careers',    words: ['DOCTOR', 'NURSE', 'PILOT', 'ARTIST', 'JUDGE', 'WRITER', 'COACH'] },
      { theme: 'Gems',       words: ['DIAMOND', 'EMERALD', 'SAPPHIRE', 'TOPAZ', 'GARNET', 'OPAL', 'RUBY'] },
      { theme: 'Cities',     words: ['LONDON', 'PARIS', 'TOKYO', 'BERLIN', 'SYDNEY', 'DUBAI', 'ROME'] },
      { theme: 'Emotions',   words: ['HAPPY', 'ANGRY', 'BRAVE', 'PROUD', 'LONELY', 'GENTLE', 'JOYFUL'] },
      { theme: 'Sea Life',   words: ['DOLPHIN', 'OCTOPUS', 'LOBSTER', 'SEAHORSE', 'CORAL', 'SQUID', 'URCHIN'] },
    ],
  },
  {
    id: 'medium', label: 'Medium', size: 12,
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    description: '12×12 grid · 8 words',
    puzzles: [
      { theme: 'Landscapes',  words: ['RIVER', 'FOREST', 'MOUNTAIN', 'OCEAN', 'DESERT', 'VALLEY', 'GLACIER', 'PLATEAU'] },
      { theme: 'Ancient World', words: ['PHARAOH', 'EMPEROR', 'DYNASTY', 'EMPIRE', 'MEDIEVAL', 'ANCIENT', 'FEUDAL', 'KINGDOM'] },
      { theme: 'Science',     words: ['MOLECULE', 'NEUTRON', 'PROTON', 'ELECTRON', 'ELEMENT', 'NUCLEUS', 'PLASMA', 'PHOTON'] },
      { theme: 'Sweet Treats', words: ['CHOCOLATE', 'SANDWICH', 'NOODLES', 'OMELETTE', 'PANCAKE', 'CUSTARD', 'BISCUIT', 'WAFFLE'] },
      { theme: 'Big Animals', words: ['ELEPHANT', 'DOLPHIN', 'PENGUIN', 'GIRAFFE', 'PANTHER', 'LOBSTER', 'VULTURE', 'CHEETAH'] },
      { theme: 'Mythology',   words: ['HERCULES', 'POSEIDON', 'ATHENA', 'APOLLO', 'MEDUSA', 'CYCLOPS', 'DRAGON', 'PHOENIX'] },
      { theme: 'Careers',     words: ['ENGINEER', 'SCULPTOR', 'DIRECTOR', 'SURGEON', 'GEOLOGIST', 'CAPTAIN', 'ANALYST', 'TEACHER'] },
      { theme: 'Countries',   words: ['AUSTRALIA', 'ARGENTINA', 'PORTUGAL', 'THAILAND', 'UKRAINE', 'BELGIUM', 'DENMARK', 'FINLAND'] },
      { theme: 'Adjectives',  words: ['BRILLIANT', 'POWERFUL', 'GRACEFUL', 'FEARLESS', 'CURIOUS', 'VIBRANT', 'MAGICAL', 'GLOWING'] },
      { theme: 'Bugs',        words: ['BUTTERFLY', 'DRAGONFLY', 'LADYBUG', 'MANTIS', 'FIREFLY', 'SCORPION', 'CRICKET', 'TERMITE'] },
      { theme: 'Dinosaurs',   words: ['TRICERATOPS', 'STEGOSAURUS', 'PTERODACTYL', 'ALLOSAURUS', 'IGUANODON', 'SPINOSAURUS', 'ANKYLOSAUR', 'VELOCIRAPTOR'] },
      { theme: 'Wonders',     words: ['COLOSSEUM', 'PARTHENON', 'ACROPOLIS', 'ALHAMBRA', 'STONEHENGE', 'PANTHEON', 'VERSAILLES', 'EPIDAURUS'] },
    ],
  },
  {
    id: 'hard', label: 'Hard', size: 14,
    color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8',
    description: '14×14 grid · 10 words',
    puzzles: [
      { theme: 'Outer Space',   words: ['PLANET', 'GALAXY', 'COMET', 'NEBULA', 'ORBIT', 'METEOR', 'SATURN', 'ECLIPSE', 'ASTEROID', 'COSMOS'] },
      { theme: 'Biology',       words: ['CHROMOSOME', 'EVOLUTION', 'ORGANISM', 'ECOSYSTEM', 'GENETICS', 'PROTEIN', 'BACTERIA', 'CELLULAR', 'MITOSIS', 'MEMBRANE'] },
      { theme: 'Architecture',  words: ['CATHEDRAL', 'SKYSCRAPER', 'MONUMENT', 'BASILICA', 'COLOSSEUM', 'PYRAMID', 'PAGODA', 'FORTRESS', 'AQUEDUCT', 'PAVILION'] },
      { theme: 'Literature',    words: ['NARRATIVE', 'CHARACTER', 'METAPHOR', 'DIALOGUE', 'SYNOPSIS', 'PROLOGUE', 'CLIMAX', 'SUSPENSE', 'ANTHOLOGY', 'SYMBOLISM'] },
      { theme: 'Mathematics',   words: ['ALGORITHM', 'EQUATION', 'FUNCTION', 'CALCULUS', 'GEOMETRY', 'VARIABLE', 'PARABOLA', 'INTEGRAL', 'THEOREM', 'LOGARITHM'] },
      { theme: 'Psychology',    words: ['PERCEPTION', 'COGNITION', 'MOTIVATION', 'BEHAVIOR', 'EMPATHY', 'ANXIETY', 'REASONING', 'INTUITION', 'ATTENTION', 'LEARNING'] },
      { theme: 'Music Theory',  words: ['HARMONY', 'SYMPHONY', 'CADENCE', 'INTERVAL', 'DYNAMICS', 'TIMBRE', 'RESONANCE', 'OVERTONE', 'CHROMATIC', 'NOTATION'] },
      { theme: 'Geography',     words: ['HEMISPHERE', 'EQUATORIAL', 'LONGITUDE', 'LATITUDE', 'CONTINENT', 'MERIDIAN', 'PENINSULA', 'MONSOON', 'TRIBUTARY', 'ARCHIPELAGO'] },
      { theme: 'Chemistry',     words: ['HYDROGEN', 'NITROGEN', 'OXYGEN', 'CARBON', 'CALCIUM', 'CHLORINE', 'PHOSPHORUS', 'POTASSIUM', 'MAGNESIUM', 'TITANIUM'] },
      { theme: 'Government',    words: ['DEMOCRACY', 'PARLIAMENT', 'REPUBLIC', 'MONARCHY', 'FEDERATION', 'CONSTITUTION', 'LEGISLATION', 'JUDICIARY', 'DIPLOMACY', 'SOVEREIGNTY'] },
    ],
  },
  {
    id: 'expert', label: 'Expert', size: 16,
    color: '#b45309', bg: '#fffbeb', border: '#fde68a',
    description: '16×16 grid · 12 words',
    puzzles: [
      { theme: 'Technology',  words: ['ALGORITHM', 'DATABASE', 'NETWORK', 'SERVER', 'PYTHON', 'COMPILER', 'BINARY', 'PIXEL', 'ROUTER', 'KERNEL', 'CACHE', 'SOCKET'] },
      { theme: 'Philosophy',  words: ['EXISTENTIAL', 'METAPHYSICS', 'EPISTEMOLOGY', 'DIALECTIC', 'RATIONALISM', 'EMPIRICISM', 'PRAGMATISM', 'NIHILISM', 'DETERMINISM', 'PHENOMENOLOGY', 'CONSCIOUSNESS', 'UTILITARIANISM'] },
      { theme: 'Medicine',    words: ['CARDIOVASCULAR', 'RESPIRATORY', 'IMMUNOLOGY', 'PATHOLOGY', 'PHARMACOLOGY', 'NEUROLOGY', 'CARDIOLOGY', 'PSYCHIATRY', 'RADIOLOGY', 'DERMATOLOGY', 'ONCOLOGY', 'ORTHOPEDICS'] },
      { theme: 'Environment', words: ['BIODIVERSITY', 'PHOTOSYNTHESIS', 'DEFORESTATION', 'SUSTAINABILITY', 'CONSERVATION', 'ECOSYSTEM', 'ATMOSPHERE', 'GREENHOUSE', 'BIOSPHERE', 'ENDANGERED', 'RENEWABLE', 'POLLUTANT'] },
      { theme: 'Politics',    words: ['GEOPOLITICS', 'DIPLOMACY', 'MULTILATERAL', 'CONSTITUTION', 'SOVEREIGNTY', 'LEGISLATION', 'REFERENDUM', 'PARLIAMENT', 'FEDERALISM', 'SANCTIONS', 'COALITION', 'DEMOCRACY'] },
      { theme: 'Economics',   words: ['MACROECONOMICS', 'MICROECONOMICS', 'GLOBALIZATION', 'CRYPTOCURRENCY', 'INFLATION', 'DEFLATION', 'RECESSION', 'MONOPOLY', 'OLIGOPOLY', 'DERIVATIVES', 'INVESTMENT', 'SPECULATION'] },
      { theme: 'Astronomy',   words: ['CONSTELLATION', 'SUPERNOVA', 'MAGNETOSPHERE', 'PHOTOSPHERE', 'INTERSTELLAR', 'SPECTROSCOPY', 'COSMOLOGY', 'GRAVITATIONAL', 'OBSERVATORY', 'EXOPLANET', 'HELIOSPHERE', 'REDSHIFT'] },
      { theme: 'Literature',  words: ['CHARACTERIZATION', 'FORESHADOWING', 'ONOMATOPOEIA', 'ALLITERATION', 'PERSONIFICATION', 'JUXTAPOSITION', 'SOLILOQUY', 'OMNISCIENT', 'PROTAGONIST', 'ANTAGONIST', 'DENOUEMENT', 'FLASHBACK'] },
    ],
  },
];

function makeLcg(seed: number) {
  let s = (seed ^ 0xDEADBEEF) >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

export function generateWordSearch(
  level: WSLevel,
  seed: number,
  puzzle: WSPuzzle,
): { grid: string[][], placed: PlacedWord[] } {
  const rng = makeLcg(seed);
  const { size } = level;
  const { words } = puzzle;
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(''));
  const placed: PlacedWord[] = [];

  const sorted = [...words].sort((a, b) => b.length - a.length);

  for (const word of sorted) {
    let ok = false;
    for (let attempt = 0; attempt < 400 && !ok; attempt++) {
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
