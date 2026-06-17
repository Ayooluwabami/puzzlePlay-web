import { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  row: number;
  col: number;
  cellPx: number;
}

export default function SudokuCell({ row, col, cellPx }: Props) {
  const userGrid     = useGameStore(s => s.userGrid);
  const puzzle       = useGameStore(s => s.puzzle);
  const notes        = useGameStore(s => s.notes);
  const selectedCell = useGameStore(s => s.selectedCell);
  const selectCell   = useGameStore(s => s.selectCell);
  const flashingLines = useGameStore(s => s.flashingLines);
  const { size, boxRows, boxCols } = useGameStore(s => s.puzzleConfig);

  const value       = userGrid[row][col];
  const cellNotes   = notes[row][col];
  const isPreFilled = puzzle[row][col] !== null;

  const selRow   = selectedCell?.[0] ?? -1;
  const selCol   = selectedCell?.[1] ?? -1;
  const selValue = selRow >= 0 ? userGrid[selRow][selCol] : null;

  const isSelected    = row === selRow && col === selCol;
  const isHighlighted = !isSelected && selRow >= 0 && (
    row === selRow || col === selCol ||
    (Math.floor(row / boxRows) === Math.floor(selRow / boxRows) &&
     Math.floor(col / boxCols) === Math.floor(selCol / boxCols))
  );
  const isSameNumber = !isSelected && selValue !== null && value === selValue && value !== null;
  const hasNotes     = cellNotes.slice(0, size).some(Boolean);

  const shouldFlash = flashingLines.rows.includes(row) || flashingLines.cols.includes(col);
  const [showFlash, setShowFlash] = useState(false);
  const flashRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (shouldFlash) {
      clearTimeout(flashRef.current);
      setShowFlash(true);
      flashRef.current = setTimeout(() => setShowFlash(false), 900);
    }
    return () => clearTimeout(flashRef.current);
  }, [shouldFlash]);

  const borderRight  = (col + 1) % boxCols === 0 && col !== size - 1;
  const borderBottom = (row + 1) % boxRows === 0 && row !== size - 1;

  // Cell background on navy (#1E3A8A) background
  const bgColor = isSelected
    ? 'rgba(147,197,253,0.28)'
    : isSameNumber
    ? 'rgba(147,197,253,0.14)'
    : isHighlighted
    ? 'rgba(255,255,255,0.06)'
    : 'transparent';

  // Pre-filled: white; user-entered: light blue
  const textColor = isPreFilled ? '#FFFFFF' : '#93C5FD';
  const fontSize  = Math.round(cellPx * 0.52);
  const noteFontSz = Math.round(cellPx * 0.19);

  return (
    <td
      onClick={() => selectCell(row, col)}
      style={{
        width: cellPx, height: cellPx, minWidth: cellPx,
        backgroundColor: bgColor,
        borderRight:  borderRight  ? '1.5px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
        borderBottom: borderBottom ? '1.5px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.1s ease',
        outline: isSelected ? '2px solid rgba(147,197,253,0.7)' : 'none',
        outlineOffset: '-2px',
      }}
    >
      {showFlash && (
        <div style={{
          position: 'absolute', inset: 0,
          animation: 'flashGreen 0.9s ease forwards',
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}

      {value !== null && !hasNotes ? (
        <span style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize, fontWeight: isPreFilled ? 700 : 600,
          color: textColor, lineHeight: 1, zIndex: 2,
          textShadow: isPreFilled ? 'none' : '0 0 12px rgba(147,197,253,0.4)',
        }}>
          {value}
        </span>
      ) : hasNotes ? (
        <div style={{
          position: 'absolute', inset: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${boxCols}, 1fr)`,
          gridTemplateRows: `repeat(${boxRows}, 1fr)`,
          zIndex: 2,
        }}>
          {Array.from({ length: size }, (_, i) => i + 1).map(n => (
            <span key={n} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: noteFontSz, fontWeight: 600,
              color: 'rgba(147,197,253,0.55)', lineHeight: 1,
            }}>
              {cellNotes[n - 1] ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </td>
  );
}
