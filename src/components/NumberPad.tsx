import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const BLUE  = '#93C5FD';
const GREEN = '#34D399';
const BDR   = 'rgba(255,255,255,0.14)';
const T3    = 'rgba(255,255,255,0.38)';

export default function NumberPad() {
  const inputNumber = useGameStore(s => s.inputNumber);
  const isComplete  = useGameStore(s => s.isComplete);
  const userGrid    = useGameStore(s => s.userGrid);
  const size        = useGameStore(s => s.puzzleConfig.size);
  const [pressing, setPressing] = useState<number | null>(null);

  // How many times each number has been placed on the board
  const counts = Array(size + 1).fill(0);
  for (const row of userGrid) {
    for (const v of row) {
      if (v !== null && v <= size) counts[v]++;
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${size}, 1fr)`,
      gap: 8, width: '100%',
    }}>
      {Array.from({ length: size }, (_, i) => i + 1).map(n => {
        const remaining = size - counts[n];
        const done      = remaining <= 0;
        const disabled  = isComplete || done;
        return (
          <button
            key={n}
            aria-label={done ? `${n} — all placed` : `Enter ${n}, ${remaining} remaining`}
            onMouseDown={() => !disabled && setPressing(n)}
            onMouseUp={() => { setPressing(null); if (!disabled) inputNumber(n); }}
            onMouseLeave={() => setPressing(null)}
            onTouchStart={() => !disabled && setPressing(n)}
            onTouchEnd={e => { e.preventDefault(); setPressing(null); if (!disabled) inputNumber(n); }}
            disabled={disabled}
            style={{
              height: 56,
              borderRadius: 14,
              background: done
                ? 'rgba(52,211,153,0.06)'
                : pressing === n
                ? 'rgba(147,197,253,0.18)'
                : 'rgba(255,255,255,0.08)',
              border: done
                ? '1px solid rgba(52,211,153,0.18)'
                : pressing === n
                ? '1px solid rgba(147,197,253,0.5)'
                : `1px solid ${BDR}`,
              color: done ? GREEN : isComplete ? T3 : BLUE,
              fontWeight: 800,
              fontSize: 'clamp(15px, 2.8vw, 22px)',
              fontFamily: "'Outfit', sans-serif",
              cursor: disabled ? 'default' : 'pointer',
              transition: 'background 0.12s, border-color 0.12s, transform 0.1s, box-shadow 0.1s, opacity 0.25s',
              transform: pressing === n ? 'translateY(3px)' : 'translateY(0)',
              boxShadow: done
                ? 'none'
                : pressing === n
                ? 'inset 0 3px 8px rgba(0,0,0,0.35), 0 0 12px rgba(147,197,253,0.12)'
                : '0 4px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
              opacity: isComplete ? 0.3 : done ? 0.55 : 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 1, letterSpacing: '-0.01em',
            }}
          >
            {done ? (
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>✓</span>
            ) : (
              <>
                <span style={{ lineHeight: 1 }}>{n}</span>
                <span style={{
                  fontSize: '0.58rem', fontWeight: 700, color: T3,
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                }}>{remaining}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
