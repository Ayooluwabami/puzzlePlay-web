import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import SudokuCell from './SudokuCell';

function getBoardMax() {
  return Math.min(460, window.innerWidth - 32);
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
      border: '1.5px solid rgba(255,255,255,0.1)',
      background: '#0E1520',
      borderRadius: 12,
      overflow: 'hidden',
      width: boardPx,
      boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.5)',
    }}>
      <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: boardPx }}>
        <tbody>
          {Array.from({ length: size }, (_, r) => (
            <tr key={r}>
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
