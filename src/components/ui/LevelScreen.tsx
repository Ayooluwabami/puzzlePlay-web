import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import Icon from './Icon';
import GameMark from './GameMark';
import { C, FONT, GAMES, EASE, type GameKey } from '../../design/tokens';
import { formatTime } from '../../utils/sudokuGenerator';

export interface LevelOption {
  id: string;
  label: string;
  meta: string;
  best?: number;
}

// Difficulty pips: filled count rises with level index
function Pips({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', gap: 3 }}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: 2,
          background: i < filled ? color : 'transparent',
          border: `1.5px solid ${i < filled ? C.ink : C.line}`,
        }} />
      ))}
    </span>
  );
}

export default function LevelScreen({ game, onBack, levels, onPick, extra }: {
  game: GameKey;
  onBack: () => void;
  levels: LevelOption[];
  onPick: (id: string) => void;
  extra?: ReactNode;
}) {
  const g = GAMES[game];
  const pipTotal = Math.min(levels.length, 5);

  return (
    <div style={{
      minHeight: '100dvh', background: C.paper,
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '10px 16px 0' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 4px 8px 0',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.9375rem', fontWeight: 600, color: C.ink2,
          }}
        >
          <Icon name="back" size={18} /> All games
        </button>

        {/* Hero band */}
        <motion.section
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{
            marginTop: 8, background: g.color, color: g.on,
            border: `1.5px solid ${C.ink}`, borderRadius: 24,
            boxShadow: `0 4px 0 ${C.ink}`,
            padding: '22px 20px 22px 22px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            overflow: 'hidden', position: 'relative',
          }}
        >
          <div style={{ minWidth: 0, position: 'relative', zIndex: 1 }}>
            <h1 className="display" style={{ fontFamily: FONT.display, fontSize: 'clamp(2.2rem, 9vw, 2.8rem)', lineHeight: 1, fontWeight: 700 }}>
              {g.name}
            </h1>
            <p style={{ marginTop: 10, fontSize: '0.9375rem', lineHeight: 1.45, fontWeight: 500, opacity: 0.92, maxWidth: 260 }}>
              {g.tagline}
            </p>
          </div>
          <motion.div
            initial={{ rotate: -8, scale: 0.85 }} animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
          >
            <GameMark game={game} size={96} tileColor={C.surface} />
          </motion.div>
        </motion.section>

        {extra}

        <p className="eyebrow" style={{ margin: '28px 2px 10px' }}>Choose a level</p>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
          style={{
            background: C.surface, border: `1.5px solid ${C.ink}`, borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          {levels.map((lvl, i) => {
            const filled = Math.max(1, Math.round(((i + 1) / levels.length) * pipTotal));
            return (
              <button key={lvl.id} className="level-row" onClick={() => onPick(lvl.id)}>
                <span className="tnum" style={{ fontSize: '0.875rem', fontWeight: 700, color: C.ink3, letterSpacing: '0.04em' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: FONT.display, fontSize: '1.25rem', fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>
                      {lvl.label}
                    </span>
                    <Pips filled={filled} total={pipTotal} color={g.color} />
                  </span>
                  <span style={{ display: 'block', marginTop: 3, fontSize: '0.875rem', color: C.ink2, fontWeight: 500 }}>
                    {lvl.meta}
                  </span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {lvl.best !== undefined && (
                    <span className="tnum" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: '0.75rem', fontWeight: 700, color: C.ink,
                      background: g.tint, border: `1px solid ${C.line}`,
                      padding: '3px 8px', borderRadius: 999,
                    }}>
                      <Icon name="trophy" size={13} stroke={2.2} />{formatTime(lvl.best)}
                    </span>
                  )}
                  <span className="chev" style={{ color: C.ink }}><Icon name="chevron" size={18} /></span>
                </span>
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
