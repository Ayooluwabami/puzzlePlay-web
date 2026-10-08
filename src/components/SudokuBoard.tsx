import { useGameStore } from '../store/gameStore';
import SudokuCell from './SudokuCell';
import { C } from '../design/tokens';

// Renders the grid at the largest whole-pixel size that fits `maxPx`
export default function SudokuBoard({ maxPx }: { maxPx: number }) {
  const { size } = useGameStore(s => s.puzzleConfig);

  const cellPx  = Math.max(24, Math.floor((maxPx - 4) / size));
  const boardPx = cellPx * size;

  return (
    <div style={{
      display: 'inline-block',
      border: `2px solid ${C.ink}`,
      borderRadius: 12,
      overflow: 'hidden',
      background: C.surface,
      boxShadow: `0 4px 0 ${C.ink}`,
    }}>
      <table
        role="grid"
        aria-label="Sudoku puzzle grid"
        style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: boardPx, display: 'block' }}
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
