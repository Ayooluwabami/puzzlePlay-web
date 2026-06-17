import { useNavigate } from 'react-router-dom';

// Design tokens
const BG    = '#0B0F1A';
const SUR   = '#131720';
const CARD  = '#1A1F2E';
const BDR   = 'rgba(255,255,255,0.08)';
const T1    = '#F1F5F9';
const T2    = '#94A3B8';
const T3    = '#475569';

const GAMES = [
  {
    path: '/sudoku',
    emoji: '🔢',
    name: 'Sudoku',
    tagline: 'Fill the grid. Train your mind.',
    levels: '6 levels',
    accent: '#3B82F6',
    accentGlow: 'rgba(59,130,246,0.15)',
    accentSubtle: 'rgba(59,130,246,0.1)',
    textClass: 'gradient-text-blue',
  },
  {
    path: '/wordsearch',
    emoji: '🔍',
    name: 'Word Search',
    tagline: 'Hunt every hidden word.',
    levels: '5 levels',
    accent: '#10B981',
    accentGlow: 'rgba(16,185,129,0.15)',
    accentSubtle: 'rgba(16,185,129,0.1)',
    textClass: 'gradient-text-green',
  },
  {
    path: '/jigsaw',
    emoji: '🧩',
    name: 'Jigsaw',
    tagline: 'Piece together the picture.',
    levels: '9 levels',
    accent: '#F59E0B',
    accentGlow: 'rgba(245,158,11,0.15)',
    accentSubtle: 'rgba(245,158,11,0.1)',
    textClass: 'gradient-text-amber',
  },
] as const;

export default function GameSelectPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: BG,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(40px,7vh,80px) 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot grid */}
      <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '-5%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 16px', borderRadius: 9999,
          fontSize: '0.7rem', fontWeight: 700, marginBottom: 28,
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          color: '#60A5FA',
          letterSpacing: '0.1em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
          THREE GAMES · ZERO ADS · PURE FUN
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem,8vw,5.5rem)',
          lineHeight: 1.0, fontWeight: 900,
          letterSpacing: '-0.04em', marginBottom: 20, color: T1,
        }}>
          Puzzle<span className="gradient-text"> Play</span>
        </h1>

        <p style={{ color: T2, fontSize: '1rem', maxWidth: 360, margin: '0 auto', lineHeight: 1.75 }}>
          Built by a puzzle lover who got tired of ads.
          No distractions — just the game.
        </p>
      </div>

      {/* Game cards */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: 940,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
        gap: 14,
      }}>
        {GAMES.map(game => (
          <GameCard key={game.path} game={game} onClick={() => navigate(game.path)} />
        ))}
      </div>

      <p style={{ color: T3, fontSize: '0.68rem', marginTop: 52, position: 'relative', zIndex: 10, letterSpacing: '0.08em' }}>
        BUILT FOR PUZZLE LOVERS
      </p>
    </div>
  );
}

function GameCard({ game, onClick }: { game: typeof GAMES[number]; onClick: () => void }) {
  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-6px)';
    e.currentTarget.style.boxShadow = `0 20px 56px ${game.accentGlow}, 0 0 0 1px ${game.accent}40`;
    e.currentTarget.style.borderColor = `${game.accent}40`;
  };
  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    e.currentTarget.style.borderColor = BDR;
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        textAlign: 'left',
        background: CARD,
        border: `1px solid ${BDR}`,
        borderRadius: 20,
        padding: '28px 26px 24px',
        cursor: 'pointer',
        transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s, border-color 0.25s',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${game.accent}, ${game.accent}00)`,
      }} />

      {/* Subtle corner glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 200, height: 200,
        background: `radial-gradient(circle at 0% 0%, ${game.accentSubtle}, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Emoji icon */}
      <div style={{
        fontSize: 28, marginBottom: 20, marginTop: 6,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 56, height: 56, borderRadius: 16,
        background: game.accentSubtle,
        border: `1px solid ${game.accent}30`,
      }}>
        {game.emoji}
      </div>

      <h2 className={game.textClass} style={{ fontSize: '1.5rem', lineHeight: 1.15, marginBottom: 8, fontWeight: 800 }}>
        {game.name}
      </h2>

      <p style={{ color: T2, fontSize: '0.875rem', lineHeight: 1.65, marginBottom: 24, flexGrow: 1 }}>
        {game.tagline}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          padding: '3px 10px', borderRadius: 100,
          background: game.accentSubtle,
          color: game.accent,
          border: `1px solid ${game.accent}25`,
          textTransform: 'uppercase',
        }}>
          {game.levels}
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: game.accent }}>
          Play →
        </span>
      </div>
    </button>
  );
}
