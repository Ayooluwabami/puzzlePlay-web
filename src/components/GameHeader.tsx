import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../utils/sudokuGenerator';

const T1   = '#FFFFFF';
const T3   = 'rgba(255,255,255,0.38)';
const BDR  = 'rgba(255,255,255,0.14)';
const BLUE = '#93C5FD';

export default function GameHeader() {
  const navigate   = useNavigate();
  const seconds    = useGameStore(s => s.seconds);
  const difficulty = useGameStore(s => s.difficulty);
  const startGame  = useGameStore(s => s.startGame);
  const { label }  = useGameStore(s => s.puzzleConfig);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/sudoku')}
          onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
          onMouseLeave={e => (e.currentTarget.style.color = T3)}
          style={{
            color: T3, fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.15s',
          }}
        >← Levels</button>
        <span style={{
          fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
          padding: '4px 10px', borderRadius: 100,
          background: 'rgba(147,197,253,0.12)',
          color: BLUE,
          border: '1px solid rgba(147,197,253,0.28)',
          textTransform: 'uppercase',
        }}>{label}</span>
      </div>

      <span style={{
        fontSize: '1.5rem', fontWeight: 800, color: T1,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
      }}>
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
          padding: '6px 14px', borderRadius: 100,
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
