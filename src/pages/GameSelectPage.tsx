import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { PUZZLE_CONFIGS, formatTime } from '../utils/sudokuGenerator';
import type { Difficulty } from '../utils/sudokuGenerator';

// Warm artistic palette: cream · amber · mint · blue
const BG_GRAD = 'linear-gradient(155deg, #FDF3E7 0%, #FAFAF7 45%, #EAF4F2 100%)';
const CARD    = 'rgba(255,255,255,0.78)';
const BDR     = 'rgba(242,182,109,0.22)';
const T1      = '#1A1A2E';
const T2      = 'rgba(26,26,46,0.68)';
const T3      = 'rgba(26,26,46,0.38)';
const AMBER   = '#F2B66D';
const BLUE    = '#60A5FA';

const DIFFICULTY_ORDER: Difficulty[] = ['4x4', '6x6', 'easy', 'medium', 'hard', 'expert'];

const GAMES = [
  {
    path: '/sudoku',
    emoji: '🔢',
    name: 'Sudoku',
    tagline: 'Fill the grid. Train your mind.',
    sub: 'Logic · Numbers · Patience',
    levels: '6 levels',
    accent: '#60A5FA',
    accentGlow: 'rgba(96,165,250,0.16)',
    accentSubtle: 'rgba(96,165,250,0.09)',
    textColor: '#2563EB',
    featured: true,
  },
  {
    path: '/wordsearch',
    emoji: '🔍',
    name: 'Word Search',
    tagline: 'Hunt every hidden word.',
    sub: 'Speed · Vocabulary',
    levels: '5 levels',
    accent: '#0D9488',
    accentGlow: 'rgba(13,148,136,0.14)',
    accentSubtle: 'rgba(13,148,136,0.08)',
    textColor: '#0F766E',
    featured: false,
  },
  {
    path: '/jigsaw',
    emoji: '🧩',
    name: 'Jigsaw',
    tagline: 'Piece together the picture.',
    sub: 'Vision · Spatial',
    levels: '9 levels',
    accent: '#A78BFA',
    accentGlow: 'rgba(167,139,250,0.18)',
    accentSubtle: 'rgba(167,139,250,0.08)',
    textColor: '#6D28D9',
    featured: false,
  },
] as const;

// ─── Magnetic card hook ───────────────────────────────────────────────────────
function useMagnetic(strength = 8) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    setPos({ x: dx * strength, y: dy * strength - 4 }); // bias upward
  }, [strength]);

  const onLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);

  return { ref, pos, onMove, onLeave };
}

// ─── Bottom sheet for Sudoku levels ──────────────────────────────────────────
function SudokuSheet({ onClose, onPlay }: { onClose: () => void; onPlay: (d: Difficulty) => void }) {
  const bestTimes = useGameStore(s => s.bestTimes);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose Sudoku difficulty"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(26,26,46,0.45)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, margin: '0 auto',
          background: '#FAFAF7',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 32px',
          boxShadow: '0 -20px 60px rgba(26,26,46,0.18)',
        }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,26,46,0.18)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 24 }}>🔢</span>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: T1, lineHeight: 1.2 }}>Sudoku</h2>
            <p style={{ fontSize: '0.75rem', color: T2 }}>Choose your difficulty</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DIFFICULTY_ORDER.map(key => {
            const cfg  = PUZZLE_CONFIGS[key];
            const best = bestTimes[key];
            return (
              <button
                key={key}
                onClick={() => onPlay(key)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'rgba(96,165,250,0.07)',
                  border: '1px solid rgba(96,165,250,0.2)',
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                  fontFamily: "'Outfit', sans-serif",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,165,250,0.14)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(96,165,250,0.07)')}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: T1, marginBottom: 2 }}>{cfg.label}</div>
                  <div style={{ fontSize: '0.75rem', color: T2 }}>{cfg.description}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0, marginLeft: 12 }}>
                  {best !== undefined && (
                    <span style={{ fontSize: '0.7rem', color: '#0D9488', fontWeight: 700 }}>🏆 {formatTime(best)}</span>
                  )}
                  <span style={{ color: BLUE, fontSize: '1rem', fontWeight: 700 }}>›</span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Game card ────────────────────────────────────────────────────────────────
function GameCard({
  game,
  onClick,
  featured = false,
  index,
}: {
  game: typeof GAMES[number];
  onClick: () => void;
  featured?: boolean;
  index: number;
}) {
  const { ref, pos, onMove, onLeave } = useMagnetic(featured ? 6 : 9);

  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = `0 20px 56px ${game.accentGlow}, 0 2px 8px rgba(0,0,0,0.06)`;
    e.currentTarget.style.borderColor = `${game.accent}55`;
    e.currentTarget.style.background = 'rgba(255,255,255,0.96)';
  };
  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = '0 2px 16px rgba(146,94,26,0.10)';
    e.currentTarget.style.borderColor = BDR;
    e.currentTarget.style.background = CARD;
    onLeave();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.09, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onMouseMove={onMove}
        animate={{ x: pos.x, y: pos.y }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        aria-label={`Play ${game.name}`}
        style={{
          textAlign: 'left',
          background: CARD,
          border: `1px solid ${BDR}`,
          borderRadius: 20,
          padding: featured ? '32px 28px 28px' : '24px 22px 20px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          minHeight: featured ? 260 : 0,
          boxShadow: '0 2px 16px rgba(146,94,26,0.10)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'box-shadow 0.25s, border-color 0.25s, background 0.2s',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: featured ? 4 : 3,
          background: `linear-gradient(90deg, ${game.accent}, ${game.accent}00)`,
          borderRadius: '20px 20px 0 0',
        }} />

        {/* Corner glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 200, height: 200,
          background: `radial-gradient(circle at 0% 0%, ${game.accentSubtle}, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {featured ? (
          /* Featured layout — emoji + name side by side at top */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{
                fontSize: 32,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 62, height: 62, borderRadius: 18, flexShrink: 0,
                background: game.accentSubtle,
                border: `1.5px solid ${game.accent}35`,
              }}>
                {game.emoji}
              </div>
              <div>
                <div style={{
                  fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: game.textColor, marginBottom: 4,
                }}>Most Popular</div>
                <h2 style={{ fontSize: '1.85rem', lineHeight: 1.1, fontWeight: 900, color: game.textColor }}>
                  {game.name}
                </h2>
              </div>
            </div>
            <p style={{ color: T2, fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 16 }}>
              {game.tagline}
            </p>

            {/* Decorative mini grid — fills the featured card's vertical space */}
            <div style={{
              flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, minHeight: 72,
            }} aria-hidden="true">
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 34px)', gridTemplateRows: 'repeat(2, 34px)',
                gap: 3, opacity: 0.75,
              }}>
                {['7', '', '3', '', '', '1', '', '9'].map((n, i) => (
                  <div key={i} style={{
                    borderRadius: 7,
                    background: n ? game.accentSubtle : 'rgba(26,26,46,0.04)',
                    border: `1px solid ${n ? `${game.accent}40` : 'rgba(26,26,46,0.08)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 800, color: game.textColor,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{n}</div>
                ))}
              </div>
            </div>

            <p style={{ color: T3, fontSize: '0.72rem', fontWeight: 600, marginBottom: 20, letterSpacing: '0.03em' }}>
              {game.sub}
            </p>
          </>
        ) : (
          /* Standard layout */
          <>
            <div style={{
              fontSize: 22, marginBottom: 16, marginTop: 2,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 14,
              background: game.accentSubtle,
              border: `1.5px solid ${game.accent}35`,
            }}>
              {game.emoji}
            </div>
            <h2 style={{ fontSize: '1.25rem', lineHeight: 1.15, marginBottom: 6, fontWeight: 800, color: game.textColor }}>
              {game.name}
            </h2>
            <p style={{ color: T2, fontSize: '0.82rem', lineHeight: 1.6, marginBottom: 16, flexGrow: 1 }}>
              {game.tagline}
            </p>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em',
            padding: '3px 10px', borderRadius: 100,
            background: game.accentSubtle,
            color: game.textColor,
            border: `1px solid ${game.accent}35`,
            textTransform: 'uppercase',
          }}>
            {game.levels}
          </span>
          <span style={{ fontSize: featured ? '0.9rem' : '0.82rem', fontWeight: 700, color: game.accent }}>
            {featured ? 'Play free →' : 'Play →'}
          </span>
        </div>
      </motion.button>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function GameSelectPage() {
  const navigate  = useNavigate();
  const startGame = useGameStore(s => s.startGame);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const handleGameClick = (path: string) => {
    if (path === '/sudoku' && isMobile) {
      setSheet(true);
    } else {
      navigate(path);
    }
  };

  const handlePlay = (difficulty: Difficulty) => {
    setSheet(false);
    startGame(difficulty);
    navigate('/sudoku/play');
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: BG_GRAD,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(40px,7vh,80px) 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
        backgroundImage: 'radial-gradient(circle, rgba(26,26,46,0.12) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Grain — breaks digital flatness */}
      <div className="grain" />

      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(242,182,109,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '10%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 52, position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 16px', borderRadius: 9999,
            fontSize: '0.7rem', fontWeight: 700, marginBottom: 28,
            background: 'rgba(242,182,109,0.15)',
            border: `1px solid rgba(242,182,109,0.35)`,
            color: '#B45309', letterSpacing: '0.1em',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: AMBER, display: 'inline-block' }} />
          NO ADS · NO ENERGY TIMERS · NO PAYWALL
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 'clamp(3rem,8vw,5.5rem)',
            lineHeight: 1.0, fontWeight: 900,
            letterSpacing: '-0.04em', marginBottom: 20, color: T1,
          }}
        >
          Puzzle<span style={{ color: AMBER }}> Play</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ color: T2, fontSize: '1rem', maxWidth: 400, margin: '0 auto', lineHeight: 1.75 }}
        >
          You know the drill: solve one puzzle, watch a 30-second ad.
          Not here. Three games, zero interruptions — built by a
          puzzle player who got tired of it too.
        </motion.p>

        {/* Proof strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'flex', justifyContent: 'center', gap: 'clamp(20px,5vw,44px)',
            marginTop: 28, flexWrap: 'wrap',
          }}
        >
          {[
            { num: '20',   label: 'levels across 3 games' },
            { num: '0',    label: 'ads, ever' },
            { num: '100%', label: 'free, works offline' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.5rem', fontWeight: 900, color: T1,
                fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
              }}>{stat.num}</div>
              <div style={{ fontSize: '0.68rem', color: T3, fontWeight: 600, letterSpacing: '0.04em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Asymmetric card grid */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: 940,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr',
        gridTemplateRows: isMobile ? 'auto' : 'auto auto',
        gap: 14,
      }}>
        {/* Featured card — Sudoku, spans both rows on desktop */}
        <div style={{ gridRow: isMobile ? 'auto' : '1 / span 2' }}>
          <GameCard
            game={GAMES[0]}
            onClick={() => handleGameClick(GAMES[0].path)}
            featured={true}
            index={0}
          />
        </div>
        {/* Word Search */}
        <GameCard
          game={GAMES[1]}
          onClick={() => handleGameClick(GAMES[1].path)}
          index={1}
        />
        {/* Jigsaw */}
        <GameCard
          game={GAMES[2]}
          onClick={() => handleGameClick(GAMES[2].path)}
          index={2}
        />
      </div>

      <p style={{ color: T3, fontSize: '0.72rem', marginTop: 52, position: 'relative', zIndex: 10, letterSpacing: '0.04em', fontWeight: 600 }}>
        Pick a game above — no sign-up, no download, nothing to install.
      </p>

      {/* Bottom sheet for Sudoku levels on mobile */}
      {sheet && (
        <SudokuSheet
          onClose={() => setSheet(false)}
          onPlay={handlePlay}
        />
      )}
    </div>
  );
}
