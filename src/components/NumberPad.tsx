import { useGameStore } from '../store/gameStore';
import Icon from './ui/Icon';
import { C, FONT, GAMES } from '../design/tokens';

const G = GAMES.sudoku;

// `columns` lets the wide layout use a calculator-style keypad
export default function NumberPad({ columns }: { columns?: number }) {
  const inputNumber = useGameStore(s => s.inputNumber);
  const isComplete  = useGameStore(s => s.isComplete);
  const isNotesMode = useGameStore(s => s.isNotesMode);
  const userGrid    = useGameStore(s => s.userGrid);
  const size        = useGameStore(s => s.puzzleConfig.size);

  // How many times each number has been placed on the board
  const counts = Array(size + 1).fill(0);
  for (const row of userGrid) {
    for (const v of row) {
      if (v !== null && v <= size) counts[v]++;
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns ?? size}, 1fr)`,
      gap: (columns ?? size) === 9 ? 6 : 10, width: '100%',
    }}>
      {Array.from({ length: size }, (_, i) => i + 1).map(n => {
        const remaining = size - counts[n];
        const done      = remaining <= 0;
        const disabled  = isComplete || done;
        return (
          <button
            key={n}
            className={done ? undefined : 'press'}
            aria-label={done ? `${n}, all placed` : `${isNotesMode ? 'Note' : 'Enter'} ${n}, ${remaining} remaining`}
            onClick={() => { if (!disabled) inputNumber(n); }}
            disabled={disabled}
            style={{
              position: 'relative',
              height: columns && columns < size ? 72 : size === 9 ? 58 : 64,
              borderRadius: 12,
              background: done ? 'transparent' : isNotesMode ? G.tint : C.surface,
              border: done ? `1.5px dashed ${C.line}` : undefined,
              color: done ? C.ink3 : C.ink,
              fontFamily: FONT.ui,
              fontWeight: 600,
              fontSize: isNotesMode ? 'clamp(17px, 4.6vw, 22px)' : 'clamp(22px, 6vw, 28px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
              opacity: isComplete ? 0.4 : 1,
            }}
          >
            {done ? (
              <Icon name="check" size={18} stroke={2.4} />
            ) : (
              <>
                <span style={{ lineHeight: 1 }}>{n}</span>
                <span className="tnum" style={{
                  position: 'absolute', top: 4, right: 5,
                  fontFamily: FONT.ui, fontSize: '0.625rem', fontWeight: 700, color: C.ink3, lineHeight: 1,
                }}>{remaining}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
