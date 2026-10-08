import { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { C, FONT, GAMES } from '../design/tokens';

const G = GAMES.sudoku;

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

  // Green sweep when this cell's row, column, or box was just completed correctly
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

  const boxEdgeRight  = (col + 1) % boxCols === 0 && col !== size - 1;
  const boxEdgeBottom = (row + 1) % boxRows === 0 && row !== size - 1;

  const bgColor = isSelected
    ? (hasConflict ? C.danger : G.color)
    : hasConflict
    ? C.dangerTint
    : isSameNumber
    ? G.tint2
    : isHighlighted
    ? G.tint
    : C.surface;

  const textColor = isSelected
    ? '#FFFFFF'
    : hasConflict
    ? C.danger
    : isPreFilled ? C.ink : G.color;

  const fontSize   = Math.round(cellPx * (size === 9 ? 0.56 : 0.5));
  const noteFontSz = Math.max(8, Math.round(cellPx * (size === 9 ? 0.24 : 0.2)));

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
        width: cellPx, height: cellPx, minWidth: cellPx, padding: 0,
        backgroundColor: bgColor,
        borderRight:  boxEdgeRight  ? `2px solid ${C.ink}` : col !== size - 1 ? `1px solid ${C.line}` : 'none',
        borderBottom: boxEdgeBottom ? `2px solid ${C.ink}` : row !== size - 1 ? `1px solid ${C.line}` : 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.12s ease',
      }}
    >
      {showFlash && (
        <div style={{
          position: 'absolute', inset: 0,
          animation: 'lineSweep 0.9s ease forwards',
          pointerEvents: 'none', zIndex: 1,
        }} />
      )}

      {value !== null && !hasNotes ? (
        <span
          key={value}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT.ui,
            fontSize, fontWeight: isPreFilled ? 700 : 500,
            color: textColor, lineHeight: 1, zIndex: 2,
            animation: isPreFilled ? undefined : hasConflict ? 'shake 0.3s ease' : 'cellPop 0.28s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {value}
        </span>
      ) : hasNotes ? (
        <div style={{
          position: 'absolute', inset: 2,
          display: 'grid',
          gridTemplateColumns: `repeat(${boxCols}, 1fr)`,
          gridTemplateRows: `repeat(${boxRows}, 1fr)`,
          zIndex: 2,
        }}>
          {Array.from({ length: size }, (_, i) => i + 1).map(n => (
            <span key={n} className="tnum" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: noteFontSz, fontWeight: 600,
              color: isSelected ? 'rgba(255,255,255,0.9)' : selValue === n ? G.color : C.ink2,
              lineHeight: 1,
            }}>
              {cellNotes[n - 1] ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </td>
  );
}
