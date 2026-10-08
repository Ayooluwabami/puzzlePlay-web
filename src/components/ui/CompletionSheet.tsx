import { useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'motion/react';
import Icon from './Icon';
import { C, FONT, GAMES, type GameKey } from '../../design/tokens';

const CONFETTI = 22;

function Confetti({ colors }: { colors: string[] }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 0, pointerEvents: 'none' }}>
      {Array.from({ length: CONFETTI }, (_, i) => {
        const angle = (-160 + (i / (CONFETTI - 1)) * 140) * (Math.PI / 180);
        const dist = 120 + (i % 4) * 34;
        const w = 8 + (i % 3) * 3;
        return (
          <span key={i} style={{
            position: 'absolute', left: 0, top: 0,
            width: w, height: i % 2 ? w : w * 0.45,
            background: colors[i % colors.length],
            border: `1.5px solid ${C.ink}`, borderRadius: i % 3 === 0 ? '50%' : 2,
            animation: `confettiFall 1.1s ${i * 0.018}s cubic-bezier(0.22,1,0.36,1) forwards`,
            '--tx': `${Math.cos(angle) * dist}px`,
            '--ty': `${Math.sin(angle) * dist + 60}px`,
            '--rot': `${(i % 2 ? 1 : -1) * (180 + i * 20)}deg`,
          } as React.CSSProperties} />
        );
      })}
    </div>
  );
}

export interface Stat { label: string; value: string; highlight?: boolean }

// Bottom sheet shown when a puzzle is solved — shared by all three games
export default function CompletionSheet({ game, title, subtitle, stats, badge, media, primary, secondary }: {
  game: GameKey;
  title: string;
  subtitle: string;
  stats: Stat[];
  badge?: string;
  media?: ReactNode;
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void }[];
}) {
  const g = GAMES[game];
  const ref = useRef<HTMLDivElement>(null);

  // Focus the primary action and trap Tab inside the sheet
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>('button');
    focusable[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{
      position: 'fixed', inset: 0, zIndex: 80,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(23,23,26,0.42)' }}
      />
      <motion.div
        ref={ref}
        initial={{ y: '100%' }} animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        style={{
          position: 'relative', width: '100%', maxWidth: 480,
          background: C.surface, color: C.ink,
          borderTop: `1.5px solid ${C.ink}`, borderLeft: `1.5px solid ${C.ink}`, borderRight: `1.5px solid ${C.ink}`,
          borderRadius: '28px 28px 0 0',
          padding: '0 20px calc(20px + env(safe-area-inset-bottom))',
          maxHeight: '92dvh', overflowY: 'auto',
        }}
      >
        <Confetti colors={[g.color, GAMES.sudoku.color, GAMES.words.color, GAMES.jigsaw.color, C.surface]} />

        {/* Colour band */}
        <div style={{
          margin: '0 -20px', padding: '26px 20px 22px', background: g.color, color: g.on,
          borderBottom: `1.5px solid ${C.ink}`, borderRadius: '26px 26px 0 0', textAlign: 'center',
        }}>
          <motion.div
            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}
            style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
              background: C.surface, color: C.ink, border: `1.5px solid ${C.ink}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name={badge ? 'trophy' : 'check'} size={28} stroke={2.4} />
          </motion.div>
          <h2 className="display" style={{ fontFamily: FONT.display, fontSize: '2.25rem', lineHeight: 1, fontWeight: 700 }}>{title}</h2>
          <p style={{ marginTop: 8, fontSize: '0.9375rem', fontWeight: 600, opacity: 0.9 }}>{subtitle}</p>
          {badge && (
            <span style={{
              display: 'inline-block', marginTop: 12, padding: '4px 12px', borderRadius: 999,
              background: C.ink, color: C.paper, fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>{badge}</span>
          )}
        </div>

        {media && <div style={{ marginTop: 18 }}>{media}</div>}

        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          margin: '18px 0 20px', border: `1.5px solid ${C.ink}`, borderRadius: 16, overflow: 'hidden',
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              padding: '12px 8px', textAlign: 'center',
              borderLeft: i ? `1px solid ${C.line}` : 'none',
              background: s.highlight ? g.tint : 'transparent',
            }}>
              <div className="tnum" style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{s.value}</div>
              <div className="eyebrow" style={{ marginTop: 4, fontSize: '0.625rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button className="btn btn-ink press press-lg" style={{ width: '100%' }} onClick={primary.onClick}>
          {primary.label}
        </button>
        {secondary && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
            {secondary.map(s => (
              <button key={s.label} className="btn-text" onClick={s.onClick}>{s.label}</button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
