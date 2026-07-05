import { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  row: number;
  col: number;
  cellPx: number;
}

export default function SudokuCell({ row, col, cellPx }: Props) {
  const userGrid      = useGameStore(s => s.userGrid);
  const puzzle        = useGameStore(s => s.puzzle);
  const notes         = useGameStore(s => s.notes);
  const selectedCell  = useGameStore(s => s.selectedCell);
  const selectCell    = useGameStore(s => s.selectCell);
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

  // Conflict: same number appears twice in this row, column, or box.
  // Rule-violation feedback only — never compared against the solution.
  let hasConflict = false;
  if (value !== null && !isPreFilled) {
    for (let c = 0; c < size && !hasConflict; c++) {
      if (c !== col && userGrid[row][c] === value) hasConflict = true;
    }
    for (let r = 0; r < size && !hasConflict; r++) {
      if (r !== row && userGrid[r][col] === value) hasConflict = true;
    }
    const boxR = Math.floor(row / boxRows) * boxRows;
    const boxC = Math.floor(col / boxCols) * boxCols;
    for (let r = boxR; r < boxR + boxRows && !hasConflict; r++) {
      for (let c = boxC; c < boxC + boxCols && !hasConflict; c++) {
        if ((r !== row || c !== col) && userGrid[r][c] === value) hasConflict = true;
      }
    }
  }

  // Green streak when this cell's row, column, or box was just completed correctly
  const boxIndex = Math.floor(row / boxRows) * (size / boxCols) + Math.floor(col / boxCols);
  const shouldFlash =
    flashingLines.rows.includes(row) ||
    flashingLines.cols.includes(col) ||
    flashingLines.boxes.includes(boxIndex);
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

  // Cell background on navy (#1E3A8A)
  const bgColor = hasConflict
    ? 'rgba(248,113,113,0.16)'
    : isSelected
    ? 'rgba(147,197,253,0.28)'
    : isSameNumber
    ? 'rgba(147,197,253,0.14)'
    : isHighlighted
    ? 'rgba(255,255,255,0.06)'
    : 'transparent';

  // Pre-filled: white · user-entered: light blue · conflict: red
  const textColor = hasConflict ? '#F87171' : isPreFilled ? '#FFFFFF' : '#93C5FD';
  const fontSize  = Math.round(cellPx * 0.52);
  const noteFontSz = Math.round(cellPx * 0.19);

  const cellLabel = isPreFilled
    ? `Row ${row + 1}, column ${col + 1}: given ${value}`
    : value !== null
    ? `Row ${row + 1}, column ${col + 1}: ${value}${hasConflict ? ', conflicts with another cell' : ''}`
    : `Row ${row + 1}, column ${col + 1}: empty`;

  return (
    <td
      role="gridcell"
      aria-rowindex={row + 1}
      aria-colindex={col + 1}
      aria-label={cellLabel}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
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
      {/* Green streak — row/column/box completed correctly */}
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
          textShadow: hasConflict
            ? '0 0 12px rgba(248,113,113,0.5)'
            : isPreFilled ? 'none' : '0 0 12px rgba(147,197,253,0.4)',
          transition: 'color 0.15s ease',
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
