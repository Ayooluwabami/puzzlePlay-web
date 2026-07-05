import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import SudokuCell from './SudokuCell';

function getBoardMax() {
  // Fit within width AND height: on mobile the header (~64px), action buttons,
  // number pad and back link (~270px together) share the viewport with the board.
  const isMobileLayout = window.innerWidth < 720;
  const heightBudget = isMobileLayout
    ? window.innerHeight - 340
    : window.innerHeight - 140;
  return Math.max(240, Math.min(460, window.innerWidth - 32, heightBudget));
}

export default function SudokuBoard() {
  const { size } = useGameStore(s => s.puzzleConfig);
  const [boardMaxPx, setBoardMaxPx] = useState(getBoardMax);

  useEffect(() => {
    const handle = () => setBoardMaxPx(getBoardMax());
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const cellPx  = Math.floor(boardMaxPx / size);
  const boardPx = cellPx * size;

  return (
    <div style={{
      display: 'inline-block',
      border: '1px solid rgba(255,255,255,0.15)',
      background: 'rgba(255,255,255,0.06)',
      borderRadius: 14,
      overflow: 'hidden',
      width: boardPx,
      boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
      backdropFilter: 'blur(8px)',
    }}>
      <table
        role="grid"
        aria-label="Sudoku puzzle grid"
        style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: boardPx }}
      >
        <tbody>
          {Array.from({ length: size }, (_, r) => (
            <tr key={r} role="row">
              {Array.from({ length: size }, (_, c) => (
                <SudokuCell key={c} row={r} col={c} cellPx={cellPx} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
