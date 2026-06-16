import { useNavigate } from 'react-router-dom';

const GAMES = [
  {
    path: '/sudoku',
    emoji: '🔢',
    name: 'Sudoku',
    tagline: 'Fill the grid. Train the mind.',
    levels: '6 levels',
    color: '#4F8EF7',
    glow: 'rgba(79,142,247,0.15)',
    border: 'rgba(79,142,247,0.22)',
    borderHover: 'rgba(79,142,247,0.5)',
    textClass: 'gradient-text-blue',
  },
  {
    path: '/wordsearch',
    emoji: '🔍',
    name: 'Word Search',
    tagline: 'Hunt every hidden word.',
    levels: '5 levels',
    color: '#34D399',
    glow: 'rgba(52,211,153,0.15)',
    border: 'rgba(52,211,153,0.22)',
    borderHover: 'rgba(52,211,153,0.5)',
    textClass: 'gradient-text-green',
  },
  {
    path: '/jigsaw',
    emoji: '🧩',
    name: 'Jigsaw',
    tagline: 'Piece together the picture.',
    levels: '5 levels',
    color: '#FBBF24',
    glow: 'rgba(251,191,36,0.15)',
    border: 'rgba(251,191,36,0.22)',
    borderHover: 'rgba(251,191,36,0.5)',
    textClass: 'gradient-text-amber',
  },
] as const;

export default function GameSelectPage() {
  const navigate = useNavigate();

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
        padding: '64px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500,
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        bottom: '-10%', left: '5%',
        width: 400, height: 300,
        background: 'radial-gradient(ellipse, rgba(52,211,153,0.07) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', pointerEvents: 'none',
        bottom: '-10%', right: '5%',
        width: 400, height: 300,
        background: 'radial-gradient(ellipse, rgba(251,191,36,0.07) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 10 }}>
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 9999,
            fontSize: '0.75rem', fontWeight: 600, marginBottom: 32,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: '#6B7280',
            letterSpacing: '0.06em',
          }}
        >
          <span>🎮</span>
          <span>THREE GAMES · ZERO ADS · PURE FUN</span>
        </div>

        <h1
          style={{ fontSize: 'clamp(3.2rem, 9vw, 6rem)', lineHeight: 1.0, fontWeight: 900, letterSpacing: '-0.025em', marginBottom: 20 }}
        >
          <span style={{ color: '#F0F6FC' }}>Puzzle</span>
          {' '}
          <span className="gradient-text">Play</span>
        </h1>

        <p style={{ color: '#6B7280', fontSize: '1.05rem', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
          Built by a puzzle lover who got tired of ads.
          <br />No distractions. Just the game.
        </p>
      </div>

      {/* Game cards */}
      <div
        style={{
          position: 'relative', zIndex: 10, width: '100%',
          maxWidth: 980,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: 18,
        }}
      >
        {GAMES.map(game => (
          <GameCard key={game.path} game={game} onClick={() => navigate(game.path)} />
        ))}
      </div>

      <p style={{ color: '#374151', fontSize: '0.72rem', marginTop: 52, position: 'relative', zIndex: 10, letterSpacing: '0.05em' }}>
        BUILT WITH ❤️ FOR PUZZLE LOVERS
      </p>
    </div>
  );
}

function GameCard({ game, onClick }: { game: typeof GAMES[number]; onClick: () => void }) {
  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.transform = 'translateY(-6px)';
    el.style.borderColor = game.borderHover;
    el.style.boxShadow = `0 20px 60px ${game.glow}, 0 0 0 1px ${game.border}`;
  };
  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    el.style.transform = 'translateY(0)';
    el.style.borderColor = game.border;
    el.style.boxShadow = 'none';
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        textAlign: 'left',
        background: 'linear-gradient(145deg, #141B2D 0%, #111927 100%)',
        border: `1px solid ${game.border}`,
        borderRadius: 24,
        padding: '28px 28px 24px',
        cursor: 'pointer',
        transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1), border-color 0.2s, box-shadow 0.25s',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Ambient corner glow */}
      <div style={{
        position: 'absolute', top: -50, right: -50,
        width: 180, height: 180, borderRadius: '50%',
        background: `radial-gradient(circle, ${game.glow} 0%, transparent 70%)`,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Emoji icon box */}
      <div style={{
        fontSize: 38, marginBottom: 20,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 68, height: 68, borderRadius: 18,
        background: `${game.glow}`,
        border: `1px solid ${game.border}`,
      }}>
        {game.emoji}
      </div>

      {/* Name */}
      <h2
        className={game.textClass}
        style={{ fontSize: '1.5rem', lineHeight: 1.15, marginBottom: 8, fontWeight: 900 }}
      >
        {game.name}
      </h2>

      {/* Tagline */}
      <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24, flexGrow: 1 }}>
        {game.tagline}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.09em',
          padding: '3px 10px', borderRadius: 100,
          background: game.glow,
          color: game.color,
          border: `1px solid ${game.border}`,
          textTransform: 'uppercase',
        }}>
          {game.levels}
        </span>
        <span style={{
          color: game.color, fontSize: '1.2rem', fontWeight: 400,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          Play →
        </span>
      </div>
    </button>
  );
}
