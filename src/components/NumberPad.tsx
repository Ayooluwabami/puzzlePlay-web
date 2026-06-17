import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const BLUE = '#93C5FD';
const BDR  = 'rgba(255,255,255,0.14)';
const T3   = 'rgba(255,255,255,0.38)';

export default function NumberPad() {
  const inputNumber = useGameStore(s => s.inputNumber);
  const isComplete  = useGameStore(s => s.isComplete);
  const size        = useGameStore(s => s.puzzleConfig.size);
  const [pressing, setPressing] = useState<number | null>(null);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${size}, 1fr)`,
      gap: 6, width: '100%',
    }}>
      {Array.from({ length: size }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onMouseDown={() => setPressing(n)}
          onMouseUp={() => { setPressing(null); if (!isComplete) inputNumber(n); }}
          onMouseLeave={() => setPressing(null)}
          onTouchStart={() => setPressing(n)}
          onTouchEnd={() => { setPressing(null); if (!isComplete) inputNumber(n); }}
          disabled={isComplete}
          style={{
            aspectRatio: '1',
            borderRadius: 12,
            background: pressing === n
              ? 'rgba(147,197,253,0.22)'
              : 'rgba(255,255,255,0.07)',
            border: pressing === n
              ? '1px solid rgba(147,197,253,0.5)'
              : `1px solid ${BDR}`,
            color: isComplete ? T3 : BLUE,
            fontWeight: 800,
            fontSize: 'clamp(14px, 2.5vw, 20px)',
            cursor: isComplete ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s ease',
            transform: pressing === n ? 'scale(0.93)' : 'scale(1)',
            boxShadow: pressing === n ? '0 0 16px rgba(147,197,253,0.2)' : 'none',
            fontFamily: "'DM Sans', sans-serif",
            opacity: isComplete ? 0.3 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
