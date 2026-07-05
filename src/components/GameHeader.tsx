import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../utils/sudokuGenerator';

const BDR  = 'rgba(255,255,255,0.14)';
const BLUE = '#93C5FD';
const T3   = 'rgba(255,255,255,0.55)';

function timerColor(seconds: number, bestSeconds: number | undefined): { color: string; animation?: string } {
  if (bestSeconds !== undefined) {
    if (seconds > bestSeconds * 2.2) return { color: '#FCA5A5', animation: 'timerPulse 1.2s ease-in-out infinite' };
    if (seconds > bestSeconds * 1.4) return { color: '#FCD34D' };
  } else {
    if (seconds > 360) return { color: '#FCA5A5', animation: 'timerPulse 1.2s ease-in-out infinite' };
    if (seconds > 180) return { color: '#FCD34D' };
  }
  return { color: '#FFFFFF' };
}

export default function GameHeader() {
  const navigate   = useNavigate();
  const seconds    = useGameStore(s => s.seconds);
  const difficulty = useGameStore(s => s.difficulty);
  const startGame  = useGameStore(s => s.startGame);
  const bestTimes  = useGameStore(s => s.bestTimes);
  const userGrid   = useGameStore(s => s.userGrid);
  const isComplete = useGameStore(s => s.isComplete);
  const { label, size } = useGameStore(s => s.puzzleConfig);
  const best       = bestTimes[difficulty];
  const { color: timerClr, animation: timerAnim } = timerColor(seconds, best);

  const filled   = userGrid.flat().filter(v => v !== null).length;
  const progress = filled / (size * size);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'rgba(0,0,0,0.25)',
      borderBottom: `1px solid ${BDR}`,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Progress bar — fills as the board fills, green on completion */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: -1, height: 2,
        background: isComplete ? '#34D399' : BLUE,
        transform: `scaleX(${progress})`,
        transformOrigin: 'left',
        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), background 0.4s',
        boxShadow: isComplete ? '0 0 10px rgba(52,211,153,0.6)' : '0 0 8px rgba(147,197,253,0.4)',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={() => navigate('/sudoku')}
          onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
          onMouseLeave={e => (e.currentTarget.style.color = T3)}
          aria-label="Back to levels"
          style={{
            color: T3, fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.15s', padding: '4px 0',
          }}
        >← Levels</button>
        <span style={{
          fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
          padding: '4px 12px', borderRadius: 100,
          background: 'rgba(147,197,253,0.12)',
          color: BLUE,
          border: '1px solid rgba(147,197,253,0.28)',
          textTransform: 'uppercase',
        }}>{label}</span>
      </div>

      <span
        aria-live="polite"
        aria-label={`Time elapsed: ${formatTime(seconds)}`}
        style={{
          fontSize: '1.5rem', fontWeight: 800,
          color: timerClr,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
          transition: 'color 0.6s ease',
          animation: timerAnim,
        }}
      >
        {formatTime(seconds)}
      </span>

      <button
        onClick={() => startGame(difficulty)}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(147,197,253,0.2)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(147,197,253,0.4)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(147,197,253,0.1)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(147,197,253,0.25)';
        }}
        style={{
          fontSize: '0.75rem', fontWeight: 700,
          padding: '7px 16px', borderRadius: 100,
          background: 'rgba(147,197,253,0.1)',
          color: BLUE,
          border: '1px solid rgba(147,197,253,0.25)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          letterSpacing: '0.04em',
        }}
      >New Game</button>
    </div>
  );
}
