import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { PUZZLE_CONFIGS, formatTime } from '../utils/sudokuGenerator';
import type { Difficulty } from '../utils/sudokuGenerator';

const DIFFICULTY_ORDER: Difficulty[] = ['4x4', '6x6', 'easy', 'medium', 'hard', 'expert'];

// Dark-mode accent colours per difficulty
const DARK_ACCENT: Record<Difficulty, { color: string; glow: string; border: string }> = {
  '4x4':   { color: '#C084FC', glow: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.22)' },
  '6x6':   { color: '#38BDF8', glow: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.22)'  },
  easy:    { color: '#34D399', glow: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.22)'  },
  medium:  { color: '#60A5FA', glow: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.22)'  },
  hard:    { color: '#FBBF24', glow: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.22)'  },
  expert:  { color: '#F87171', glow: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.22)' },
};

export default function HomePage() {
  const navigate  = useNavigate();
  const startGame = useGameStore(s => s.startGame);
  const bestTimes = useGameStore(s => s.bestTimes);

  const handlePlay = (difficulty: Difficulty) => {
    startGame(difficulty);
    navigate('/sudoku/play');
  };

  return (
    <div
      className="bg-grid"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0D14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        position: 'relative',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(79,142,247,0.09) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      <div style={{ width: '100%', maxWidth: 448, position: 'relative', zIndex: 10 }}>
        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          onMouseEnter={e => (e.currentTarget.style.color = '#4F8EF7')}
          onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#374151', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0 0 32px', transition: 'color 0.15s',
          }}
        >
          ← All Games
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 76, height: 76, borderRadius: 22,
            background: 'linear-gradient(145deg, rgba(79,142,247,0.18), rgba(79,142,247,0.06))',
            border: '1px solid rgba(79,142,247,0.28)',
            fontSize: 36, marginBottom: 20,
            boxShadow: '0 0 40px rgba(79,142,247,0.12)',
          }}>
            🔢
          </div>
          <h1
            className="gradient-text-blue"
            style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: 10, fontWeight: 900 }}
          >
            Sudoku
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Train your brain, one number at a time
          </p>
        </div>

        {/* Level list */}
        <p style={{
          fontSize: '0.65rem', fontWeight: 800, color: '#374151',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          marginBottom: 14, paddingLeft: 2,
        }}>
          Choose Difficulty
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {DIFFICULTY_ORDER.map(key => {
            const cfg    = PUZZLE_CONFIGS[key];
            const accent = DARK_ACCENT[key];
            const best   = bestTimes[key];
            return (
              <LevelCard key={key} cfg={cfg} accent={accent} best={best} onClick={() => handlePlay(key)} />
            );
          })}
        </div>

        <p style={{
          textAlign: 'center', color: '#374151',
          fontSize: '0.7rem', marginTop: 32, letterSpacing: '0.04em',
        }}>
          Inspired by LinkedIn Games
        </p>
      </div>
    </div>
  );
}

function LevelCard({
  cfg, accent, best, onClick,
}: {
  cfg: { label: string; clueLabel: string; description: string };
  accent: { color: string; glow: string; border: string };
  best: number | undefined;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.background = 'linear-gradient(145deg, #1A2540 0%, #151D30 100%)';
        el.style.borderColor = accent.color + '55';
        el.style.transform = 'translateX(4px)';
        el.style.boxShadow = `0 4px 24px ${accent.glow}`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.background = 'linear-gradient(145deg, #141B2D 0%, #111927 100%)';
        el.style.borderColor = 'rgba(255,255,255,0.07)';
        el.style.transform = 'translateX(0)';
        el.style.boxShadow = 'none';
      }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'linear-gradient(145deg, #141B2D 0%, #111927 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
          <span style={{
            fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.07em',
            padding: '3px 9px', borderRadius: 100,
            background: accent.glow, color: accent.color,
            border: `1px solid ${accent.border}`,
            textTransform: 'uppercase',
          }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#484F58' }}>{cfg.clueLabel}</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: '#8B949E' }}>{cfg.description}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 16, flexShrink: 0 }}>
        {best !== undefined && (
          <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700 }}>
            🏆 {formatTime(best)}
          </span>
        )}
        <span style={{ color: accent.color, fontSize: '1.1rem', fontWeight: 300 }}>›</span>
      </div>
    </button>
  );
}
