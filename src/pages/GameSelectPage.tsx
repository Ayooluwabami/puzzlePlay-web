import { useNavigate } from 'react-router-dom';

// Warm artistic palette: cream · amber · mint · blue
const BG_GRAD = 'linear-gradient(155deg, #FDF3E7 0%, #FAFAF7 45%, #EAF4F2 100%)';
const CARD    = 'rgba(255,255,255,0.78)';
const BDR     = 'rgba(242,182,109,0.22)';
const T1      = '#1A1A2E';
const T2      = 'rgba(26,26,46,0.68)';
const T3      = 'rgba(26,26,46,0.38)';
const AMBER   = '#F2B66D';
const BLUE    = '#60A5FA';

const GAMES = [
  {
    path: '/sudoku',
    emoji: '🔢',
    name: 'Sudoku',
    tagline: 'Fill the grid. Train your mind.',
    levels: '6 levels',
    accent: '#60A5FA',
    accentGlow: 'rgba(96,165,250,0.14)',
    accentSubtle: 'rgba(96,165,250,0.08)',
    textColor: '#2563EB',
  },
  {
    path: '/wordsearch',
    emoji: '🔍',
    name: 'Word Search',
    tagline: 'Hunt every hidden word.',
    levels: '5 levels',
    accent: '#0D9488',
    accentGlow: 'rgba(13,148,136,0.14)',
    accentSubtle: 'rgba(13,148,136,0.08)',
    textColor: '#0F766E',
  },
  {
    path: '/jigsaw',
    emoji: '🧩',
    name: 'Jigsaw',
    tagline: 'Piece together the picture.',
    levels: '9 levels',
    accent: '#A78BFA',
    accentGlow: 'rgba(167,139,250,0.18)',
    accentSubtle: 'rgba(167,139,250,0.08)',
    textColor: '#6D28D9',
  },
] as const;

export default function GameSelectPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: BG_GRAD,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(40px,7vh,80px) 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot grid — dark dots for light bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
        backgroundImage: 'radial-gradient(circle, rgba(26,26,46,0.12) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: 520, height: 520, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(242,182,109,0.22) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: 460, height: 460, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', left: '10%',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 52, position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 16px', borderRadius: 9999,
          fontSize: '0.7rem', fontWeight: 700, marginBottom: 28,
          background: 'rgba(242,182,109,0.15)',
          border: `1px solid rgba(242,182,109,0.35)`,
          color: '#B45309',
          letterSpacing: '0.1em',
          backdropFilter: 'blur(8px)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: AMBER, display: 'inline-block' }} />
          THREE GAMES · ZERO ADS · PURE FUN
        </div>

        <h1 style={{
          fontSize: 'clamp(3rem,8vw,5.5rem)',
          lineHeight: 1.0, fontWeight: 900,
          letterSpacing: '-0.04em', marginBottom: 20, color: T1,
        }}>
          Puzzle
          <span style={{
            background: `linear-gradient(135deg, ${AMBER} 0%, ${BLUE} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}> Play</span>
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
    e.currentTarget.style.boxShadow = `0 20px 56px ${game.accentGlow}, 0 2px 8px rgba(0,0,0,0.08)`;
    e.currentTarget.style.borderColor = `${game.accent}55`;
    e.currentTarget.style.background = 'rgba(255,255,255,0.95)';
  };
  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)';
    e.currentTarget.style.borderColor = BDR;
    e.currentTarget.style.background = CARD;
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
        transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s, border-color 0.25s, background 0.2s',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${game.accent}, ${game.accent}00)`,
        borderRadius: '20px 20px 0 0',
      }} />

      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 200, height: 200,
        background: `radial-gradient(circle at 0% 0%, ${game.accentSubtle}, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Emoji icon */}
      <div style={{
        fontSize: 26, marginBottom: 20, marginTop: 6,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 54, height: 54, borderRadius: 16,
        background: game.accentSubtle,
        border: `1.5px solid ${game.accent}35`,
      }}>
        {game.emoji}
      </div>

      <h2 style={{
        fontSize: '1.5rem', lineHeight: 1.15, marginBottom: 8, fontWeight: 800,
        color: game.textColor,
      }}>
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
          color: game.textColor,
          border: `1px solid ${game.accent}35`,
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
