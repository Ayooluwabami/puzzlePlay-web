import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function NumberPad() {
  const inputNumber = useGameStore(s => s.inputNumber);
  const isComplete  = useGameStore(s => s.isComplete);
  const size        = useGameStore(s => s.puzzleConfig.size);
  const [pressing, setPressing] = useState<number | null>(null);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${size}, 1fr)`,
      gap: 6,
      width: '100%',
    }}>
      {Array.from({ length: size }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onMouseDown={() => setPressing(n)}
          onMouseUp={() => { setPressing(null); if (!isComplete) inputNumber(n); }}
          onMouseLeave={() => setPressing(null)}
          disabled={isComplete}
          style={{
            aspectRatio: '1',
            borderRadius: 12,
            background: pressing === n
              ? 'rgba(79,142,247,0.25)'
              : 'linear-gradient(145deg, #1A2235 0%, #141B2D 100%)',
            border: pressing === n
              ? '1px solid rgba(79,142,247,0.5)'
              : '1px solid rgba(255,255,255,0.08)',
            color: isComplete ? '#374151' : '#60A5FA',
            fontWeight: 800,
            fontSize: 'clamp(14px, 2.5vw, 20px)',
            cursor: isComplete ? 'not-allowed' : 'pointer',
            transition: 'all 0.1s ease',
            transform: pressing === n ? 'scale(0.93)' : 'scale(1)',
            boxShadow: pressing === n ? '0 0 16px rgba(79,142,247,0.2)' : 'none',
            fontFamily: "'DM Sans', sans-serif",
            opacity: isComplete ? 0.3 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
