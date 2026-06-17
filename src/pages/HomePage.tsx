import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { PUZZLE_CONFIGS, formatTime } from '../utils/sudokuGenerator';
import type { Difficulty } from '../utils/sudokuGenerator';

// ─── Navy theme (innovaswift vivid panel #1E3A8A) ─────────────────────────────
const BG   = '#1E3A8A';
const CARD = 'rgba(255,255,255,0.08)';
const BDR  = 'rgba(255,255,255,0.14)';
const T1   = '#FFFFFF';
const T2   = 'rgba(255,255,255,0.70)';
const T3   = 'rgba(255,255,255,0.38)';
const BLUE = '#93C5FD';

const ACCENT_MAP: Record<Difficulty, { color: string; subtle: string; border: string }> = {
  '4x4':  { color: '#C4B5FD', subtle: 'rgba(196,181,253,0.1)',  border: 'rgba(196,181,253,0.25)' },
  '6x6':  { color: '#7DD3FC', subtle: 'rgba(125,211,252,0.1)',  border: 'rgba(125,211,252,0.25)' },
  easy:   { color: '#6EE7B7', subtle: 'rgba(110,231,183,0.1)',  border: 'rgba(110,231,183,0.25)' },
  medium: { color: '#93C5FD', subtle: 'rgba(147,197,253,0.1)',  border: 'rgba(147,197,253,0.25)' },
  hard:   { color: '#FCD34D', subtle: 'rgba(252,211,77,0.1)',   border: 'rgba(252,211,77,0.25)'  },
  expert: { color: '#FCA5A5', subtle: 'rgba(252,165,165,0.1)',  border: 'rgba(252,165,165,0.25)' },
};

const DIFFICULTY_ORDER: Difficulty[] = ['4x4', '6x6', 'easy', 'medium', 'hard', 'expert'];

export default function HomePage() {
  const navigate  = useNavigate();
  const startGame = useGameStore(s => s.startGame);
  const bestTimes = useGameStore(s => s.bestTimes);

  const handlePlay = (difficulty: Difficulty) => {
    startGame(difficulty);
    navigate('/sudoku/play');
  };

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '48px 16px', position: 'relative',
    }}>
      <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(147,197,253,0.12) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 448, position: 'relative', zIndex: 10 }}>
        <button
          onClick={() => navigate('/')}
          onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
          onMouseLeave={e => (e.currentTarget.style.color = T3)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: T3, fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0 0 32px', transition: 'color 0.15s',
          }}
        >← All Games</button>

        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 76, height: 76, borderRadius: 22,
            background: 'rgba(147,197,253,0.1)',
            border: '1px solid rgba(147,197,253,0.25)',
            fontSize: 36, marginBottom: 20,
          }}>🔢</div>
          <h1 className="gradient-text-blue" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: 10, fontWeight: 900 }}>
            Sudoku
          </h1>
          <p style={{ color: T2, fontSize: '0.9rem', lineHeight: 1.6 }}>Train your brain, one number at a time</p>
        </div>

        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: T3, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14, paddingLeft: 2 }}>
          Choose Difficulty
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DIFFICULTY_ORDER.map(key => {
            const cfg    = PUZZLE_CONFIGS[key];
            const accent = ACCENT_MAP[key];
            const best   = bestTimes[key];
            return (
              <button
                key={key}
                onClick={() => handlePlay(key)}
                onMouseEnter={e => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.14)';
                  el.style.borderColor = accent.border;
                  el.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget;
                  el.style.background = CARD;
                  el.style.borderColor = BDR;
                  el.style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', background: CARD, border: `1px solid ${BDR}`,
                  borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                    <span style={{
                      fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.07em',
                      padding: '3px 9px', borderRadius: 100,
                      background: accent.subtle, color: accent.color,
                      border: `1px solid ${accent.border}`, textTransform: 'uppercase',
                    }}>{cfg.label}</span>
                    <span style={{ fontSize: '0.75rem', color: T3 }}>{cfg.clueLabel}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: T2 }}>{cfg.description}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 16, flexShrink: 0 }}>
                  {best !== undefined && (
                    <span style={{ fontSize: '0.72rem', color: '#6EE7B7', fontWeight: 700 }}>🏆 {formatTime(best)}</span>
                  )}
                  <span style={{ color: accent.color, fontSize: '1.1rem', fontWeight: 300 }}>›</span>
                </div>
              </button>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', color: T3, fontSize: '0.7rem', marginTop: 32, letterSpacing: '0.04em' }}>
          Inspired by LinkedIn Games
        </p>
      </div>
    </div>
  );
}
