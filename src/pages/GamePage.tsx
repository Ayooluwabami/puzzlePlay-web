import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../utils/sudokuGenerator';
import SudokuBoard from '../components/SudokuBoard';
import NumberPad from '../components/NumberPad';
import ActionButtons from '../components/ActionButtons';
import GameHeader from '../components/GameHeader';

export default function GamePage() {
  const navigate     = useNavigate();
  const tick         = useGameStore(s => s.tick);
  const inputNumber  = useGameStore(s => s.inputNumber);
  const erase        = useGameStore(s => s.erase);
  const undo         = useGameStore(s => s.undo);
  const selectedCell = useGameStore(s => s.selectedCell);
  const selectCell   = useGameStore(s => s.selectCell);
  const isComplete   = useGameStore(s => s.isComplete);
  const startGame    = useGameStore(s => s.startGame);
  const difficulty   = useGameStore(s => s.difficulty);
  const seconds      = useGameStore(s => s.seconds);
  const mistakes     = useGameStore(s => s.mistakes);
  const isNewRecord  = useGameStore(s => s.isNewRecord);
  const bestTimes    = useGameStore(s => s.bestTimes);
  const { label, size } = useGameStore(s => s.puzzleConfig);

  useEffect(() => {
    const puzzle = useGameStore.getState().puzzle;
    const hasGame = puzzle.some(row => row.some(cell => cell !== null));
    if (!hasGame) startGame(difficulty);
  }, []);

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isComplete) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= size) { inputNumber(num); return; }
      if (e.key === 'Backspace' || e.key === 'Delete') { erase(); return; }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { undo(); return; }
      if (!selectedCell) return;
      const [r, c] = selectedCell;
      if (e.key === 'ArrowUp'    && r > 0)        selectCell(r - 1, c);
      if (e.key === 'ArrowDown'  && r < size - 1) selectCell(r + 1, c);
      if (e.key === 'ArrowLeft'  && c > 0)        selectCell(r, c - 1);
      if (e.key === 'ArrowRight' && c < size - 1) selectCell(r, c + 1);
    },
    [inputNumber, erase, undo, selectedCell, selectCell, size, isComplete]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const prevBest = bestTimes[difficulty];

  const BLUE = '#93C5FD';
  const T3   = 'rgba(255,255,255,0.38)';
  const T2   = 'rgba(255,255,255,0.65)';
  const BDR  = 'rgba(255,255,255,0.14)';

  return (
    <div style={{ height: '100dvh', background: '#1E3A8A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <GameHeader />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        gap: 32, padding: '20px 16px',
        flexWrap: 'wrap', overflow: 'hidden',
      }}>
        <div style={{ flexShrink: 0 }}>
          <SudokuBoard />
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 14,
          width: '100%', maxWidth: 340,
        }}>
          <ActionButtons />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <NumberPad />
          <button
            onClick={() => navigate('/sudoku')}
            onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
            onMouseLeave={e => (e.currentTarget.style.color = T3)}
            style={{
              marginTop: 4, fontSize: '0.75rem', fontWeight: 700,
              color: T3, letterSpacing: '0.06em', textTransform: 'uppercase',
              background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'center', transition: 'color 0.15s',
            }}
          >← Sudoku Levels</button>
        </div>
      </main>

      {/* Victory modal */}
      {isComplete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: 'rgba(30,58,138,0.95)',
            border: `1px solid ${BDR}`,
            borderRadius: 28, padding: 40,
            maxWidth: 380, width: '100%', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            animation: 'fadeUp 0.3s cubic-bezier(.34,1.56,.64,1)',
            backdropFilter: 'blur(20px)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>{isNewRecord ? '🏆' : '🎉'}</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', marginBottom: 6 }}>Puzzle Solved!</h2>
            <p style={{ color: T2, fontSize: '0.9rem', marginBottom: 4 }}>{label} · {formatTime(seconds)}</p>
            {mistakes > 0 && (
              <p style={{ color: T3, fontSize: '0.78rem', marginBottom: 4 }}>
                {mistakes} mistake{mistakes !== 1 ? 's' : ''}
              </p>
            )}
            <div style={{ margin: '16px 0 28px' }}>
              {isNewRecord ? (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 16px', borderRadius: 100,
                  background: 'rgba(110,231,183,0.15)',
                  border: '1px solid rgba(110,231,183,0.35)',
                  color: '#6EE7B7', fontSize: '0.85rem', fontWeight: 700,
                }}>✦ New Record!</div>
              ) : prevBest !== undefined ? (
                <p style={{ color: T3, fontSize: '0.8rem' }}>Best: {formatTime(prevBest)}</p>
              ) : null}
            </div>
            <button
              onClick={() => startGame(difficulty)}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(147,197,253,0.22)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(147,197,253,0.12)')}
              style={{
                width: '100%', padding: '14px 0',
                background: 'rgba(147,197,253,0.12)',
                border: '1px solid rgba(147,197,253,0.3)',
                borderRadius: 14, color: BLUE,
                fontSize: '1rem', fontWeight: 800,
                cursor: 'pointer', marginBottom: 10,
                transition: 'background 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >New Game</button>
            <button
              onClick={() => navigate('/sudoku')}
              onMouseEnter={e => (e.currentTarget.style.color = BLUE)}
              onMouseLeave={e => (e.currentTarget.style.color = T3)}
              style={{
                width: '100%', padding: '8px 0',
                background: 'none', border: 'none',
                color: T3, fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', transition: 'color 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >Change Difficulty</button>
          </div>
        </div>
      )}
    </div>
  );
}
