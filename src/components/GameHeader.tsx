import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../utils/sudokuGenerator';

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
      background: 'rgba(17,25,39,0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Level badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/sudoku')}
          onMouseEnter={e => (e.currentTarget.style.color = '#4F8EF7')}
          onMouseLeave={e => (e.currentTarget.style.color = '#484F58')}
          style={{
            color: '#484F58', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'color 0.15s',
          }}
        >
          ← Levels
        </button>
        <span style={{
          fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em',
          padding: '4px 10px', borderRadius: 100,
          background: 'rgba(79,142,247,0.12)',
          color: '#4F8EF7',
          border: '1px solid rgba(79,142,247,0.25)',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
      </div>

      {/* Timer */}
      <span style={{
        fontSize: '1.5rem', fontWeight: 800, color: '#F0F6FC',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em',
        fontFamily: "'DM Sans', monospace",
      }}>
        {formatTime(seconds)}
      </span>

      {/* New Game */}
      <button
        onClick={() => startGame(difficulty)}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,247,0.25)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,142,247,0.5)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,247,0.12)';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,142,247,0.25)';
        }}
        style={{
          fontSize: '0.75rem', fontWeight: 700,
          padding: '6px 14px', borderRadius: 100,
          background: 'rgba(79,142,247,0.12)',
          color: '#4F8EF7',
          border: '1px solid rgba(79,142,247,0.25)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          letterSpacing: '0.04em',
        }}
      >
        New Game
      </button>
    </div>
  );
}
