import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useGameStore } from '../store/gameStore';
import { formatTime, PUZZLE_CONFIGS } from '../utils/sudokuGenerator';
import type { Difficulty } from '../utils/sudokuGenerator';
import { WS_LEVELS } from '../utils/wordSearchGenerator';
import { JIGSAW_LEVELS } from '../utils/jigsawData';
import GameMark from '../components/ui/GameMark';
import Icon from '../components/ui/Icon';
import { C, FONT, GAMES, EASE, type GameKey } from '../design/tokens';

const ORDER: GameKey[] = ['sudoku', 'words', 'jigsaw'];

const LEVEL_COUNT: Record<GameKey, number> = {
  sudoku: Object.keys(PUZZLE_CONFIGS).length,
  words: WS_LEVELS.length,
  jigsaw: JIGSAW_LEVELS.length,
};

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return 'Up late?';
  if (h < 12) return 'Good morning.';
  if (h < 18) return 'Good afternoon.';
  return 'Good evening.';
}

// Faint texture in each band, echoing the game itself
function BandPattern({ game }: { game: GameKey }) {
  const stroke = game === 'words' ? 'rgba(23,23,26,0.10)' : 'rgba(255,255,255,0.16)';
  if (game === 'sudoku') {
    return (
      <svg aria-hidden="true" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="pp-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke={stroke} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pp-grid)" />
      </svg>
    );
  }
  if (game === 'words') {
    return (
      <svg aria-hidden="true" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="pp-letters" width="34" height="30" patternUnits="userSpaceOnUse">
            <text x="6" y="20" fontSize="14" fontWeight="700" fill={stroke} fontFamily="Figtree, sans-serif">A</text>
            <text x="23" y="9" fontSize="10" fontWeight="700" fill={stroke} fontFamily="Figtree, sans-serif">Q</text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pp-letters)" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <pattern id="pp-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="1.6" fill={stroke} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pp-dots)" />
    </svg>
  );
}

function GameCard({ game, index, note, onClick }: {
  game: GameKey; index: number; note: string; onClick: () => void;
}) {
  const g = GAMES[game];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.12 + index * 0.08, ease: EASE }}
    >
      <button
        onClick={onClick}
        className="press press-lg"
        aria-label={`Play ${g.name}`}
        style={{
          width: '100%', textAlign: 'left', padding: 0,
          background: C.surface, borderRadius: 24, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{
          position: 'relative', height: 140, background: g.color,
          borderBottom: `1.5px solid ${C.ink}`, overflow: 'hidden',
        }}>
          <BandPattern game={game} />
          <div style={{ position: 'absolute', left: 14, bottom: -18, transform: 'rotate(-6deg)' }}>
            <GameMark game={game} size={150} plain />
          </div>
          <span style={{
            position: 'absolute', top: 14, right: 14,
            padding: '4px 10px', borderRadius: 999,
            background: C.surface, border: `1.5px solid ${C.ink}`,
            fontSize: '0.75rem', fontWeight: 700, color: C.ink,
          }}>
            {LEVEL_COUNT[game]} levels
          </span>
        </div>

        <div style={{ padding: '18px 20px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <h2 className="display" style={{ fontFamily: FONT.display, fontSize: '1.75rem', lineHeight: 1.05, fontWeight: 700, color: C.ink }}>
              {g.name}
            </h2>
            <p style={{ marginTop: 6, fontSize: '0.9375rem', lineHeight: 1.45, color: C.ink2, fontWeight: 500 }}>
              {g.blurb}
            </p>
            <p className="tnum" style={{ marginTop: 10, fontSize: '0.8125rem', fontWeight: 700, color: C.ink }}>
              {note}
            </p>
          </div>
          <span aria-hidden="true" style={{
            width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
            background: C.ink, color: C.paper,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="chevron" size={20} stroke={2.4} />
          </span>
        </div>
      </button>
    </motion.div>
  );
}

export default function GameSelectPage() {
  const navigate  = useNavigate();
  const bestTimes = useGameStore(s => s.bestTimes);

  // Best Sudoku time, preferring the hardest level the player has finished
  const sudokuOrder: Difficulty[] = ['expert', 'hard', 'medium', 'easy', '6x6', '4x4'];
  const bestKey = sudokuOrder.find(d => bestTimes[d] !== undefined);
  const notes: Record<GameKey, string> = {
    sudoku: bestKey ? `Best · ${PUZZLE_CONFIGS[bestKey].label} in ${formatTime(bestTimes[bestKey]!)}` : 'Start with a 4×4 warm-up',
    words:  'New theme every game',
    jigsaw: 'Drag pieces, or tap to place',
  };

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{
      minHeight: '100dvh', background: C.paper,
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 16px' }}>
        {/* Masthead */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '16px 0 14px', borderBottom: `1.5px solid ${C.ink}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/icon.svg" alt="" width={30} height={30} style={{ display: 'block' }} />
            <span className="display" style={{ fontFamily: FONT.display, fontSize: '1.3125rem', fontWeight: 700 }}>Puzzle Play</span>
          </div>
          <span className="eyebrow" style={{ color: C.ink2 }}>{today}</span>
        </header>

        {/* Greeting */}
        <motion.section
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          style={{ padding: '30px 0 26px', maxWidth: 620 }}
        >
          <h1 className="display" style={{ fontFamily: FONT.display, fontSize: 'clamp(2.75rem, 11vw, 4.5rem)', lineHeight: 0.98, fontWeight: 700 }}>
            {greeting()}
          </h1>
          <p style={{ marginTop: 14, fontSize: '1.0625rem', lineHeight: 1.5, color: C.ink2, fontWeight: 500, maxWidth: 440 }}>
            Three puzzles and nothing else. No ads, no accounts, no streak guilt. Pick one and settle in.
          </p>
        </motion.section>

        {/* Games */}
        <div style={{
          display: 'grid', gap: 18,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        }}>
          {ORDER.map((key, i) => (
            <GameCard key={key} game={key} index={i} note={notes[key]} onClick={() => navigate(GAMES[key].path)} />
          ))}
        </div>

        {/* Colophon */}
        <motion.footer
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            marginTop: 36, paddingTop: 16, borderTop: `1px solid ${C.line}`,
            display: 'flex', flexWrap: 'wrap', gap: '8px 22px', justifyContent: 'space-between',
            fontSize: '0.8125rem', fontWeight: 600, color: C.ink3,
          }}
        >
          <span>No ads, ever · Works offline</span>
          <span>Made by a puzzle lover who got tired of the ads</span>
        </motion.footer>
      </div>
    </div>
  );
}
