import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../utils/sudokuGenerator';
import SudokuBoard from '../components/SudokuBoard';
import NumberPad from '../components/NumberPad';
import ActionButtons from '../components/ActionButtons';
import TopBar from '../components/ui/TopBar';
import RestartButton from '../components/ui/RestartButton';
import CompletionSheet from '../components/ui/CompletionSheet';
import { useElementSize } from '../hooks/useElementSize';
import { C, GAMES } from '../design/tokens';

const G = GAMES.sudoku;

function useWide(breakpoint = 900) {
  const [wide, setWide] = useState(() => window.innerWidth >= breakpoint);
  useEffect(() => {
    const on = () => setWide(window.innerWidth >= breakpoint);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [breakpoint]);
  return wide;
}

export default function GamePage() {
  const navigate     = useNavigate();
  const tick         = useGameStore(s => s.tick);
  const inputNumber  = useGameStore(s => s.inputNumber);
  const erase        = useGameStore(s => s.erase);
  const undo         = useGameStore(s => s.undo);
  const toggleNotes  = useGameStore(s => s.toggleNotes);
  const selectedCell = useGameStore(s => s.selectedCell);
  const selectCell   = useGameStore(s => s.selectCell);
  const isComplete   = useGameStore(s => s.isComplete);
  const startGame    = useGameStore(s => s.startGame);
  const difficulty   = useGameStore(s => s.difficulty);
  const seconds      = useGameStore(s => s.seconds);
  const mistakes     = useGameStore(s => s.mistakes);
  const isNewRecord  = useGameStore(s => s.isNewRecord);
  const bestTimes    = useGameStore(s => s.bestTimes);
  const userGrid     = useGameStore(s => s.userGrid);
  const puzzle       = useGameStore(s => s.puzzle);
  const { label, size } = useGameStore(s => s.puzzleConfig);

  const wide = useWide();
  const [mainRef, area] = useElementSize<HTMLDivElement>();
  const [controlsRef, controlsSize] = useElementSize<HTMLDivElement>();

  useEffect(() => {
    const p = useGameStore.getState().puzzle;
    const hasGame = p.some(row => row.some(cell => cell !== null));
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
      if (e.key === 'n' || e.key === 'N') { toggleNotes(); return; }
      if (!selectedCell) return;
      const [r, c] = selectedCell;
      if (e.key === 'ArrowUp'    && r > 0)        selectCell(r - 1, c);
      if (e.key === 'ArrowDown'  && r < size - 1) selectCell(r + 1, c);
      if (e.key === 'ArrowLeft'  && c > 0)        selectCell(r, c - 1);
      if (e.key === 'ArrowRight' && c < size - 1) selectCell(r, c + 1);
    },
    [inputNumber, erase, undo, toggleNotes, selectedCell, selectCell, size, isComplete]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const filled = userGrid.flat().filter(v => v !== null).length;
  const given  = puzzle.flat().filter(v => v !== null).length;
  const progress = (filled - given) / Math.max(1, size * size - given);
  const hasPlayed = filled > given;

  const prevBest = bestTimes[difficulty];
  const GAP = wide ? 48 : 18;
  const boardMax = wide
    ? Math.min(area.height, area.width - 380 - GAP, 640)
    : Math.min(area.width, area.height - controlsSize.height - GAP, 600);

  const controls = (
    <div ref={controlsRef} style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      width: '100%', maxWidth: wide ? 380 : 520, flexShrink: 0,
    }}>
      <ActionButtons />
      <NumberPad columns={wide ? (size === 4 ? 2 : 3) : undefined} />
    </div>
  );

  return (
    <div style={{
      height: '100dvh', background: C.paper,
      paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {mistakes > 0 && `${mistakes} mistake${mistakes !== 1 ? 's' : ''} made.`}
        {isComplete && `Puzzle solved in ${formatTime(seconds)}!`}
      </div>

      <TopBar
        title="Sudoku"
        meta={<>{label} · <span aria-label={`Time ${formatTime(seconds)}`}>{formatTime(seconds)}</span></>}
        onBack={() => navigate('/sudoku')}
        backLabel="Back to levels"
        right={<RestartButton onConfirm={() => startGame(difficulty)} needsConfirm={hasPlayed && !isComplete} />}
        progress={progress}
        progressColor={isComplete ? C.success : G.color}
      />

      <main ref={mainRef} style={{
        flex: 1, minHeight: 0, display: 'flex',
        flexDirection: wide ? 'row' : 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: GAP,
        padding: wide ? '24px 32px' : '16px 16px 18px',
        maxWidth: wide ? 1100 : undefined, width: '100%', margin: '0 auto',
      }}>
        {area.width > 0 && boardMax > 0 && <SudokuBoard maxPx={boardMax - 6} />}
        {controls}
      </main>

      {isComplete && (
        <CompletionSheet
          game="sudoku"
          title="Solved."
          subtitle={`${label} Sudoku`}
          badge={isNewRecord ? 'New personal best' : undefined}
          stats={[
            { label: 'Time', value: formatTime(seconds), highlight: true },
            { label: 'Mistakes', value: String(mistakes) },
            { label: 'Best', value: prevBest !== undefined ? formatTime(prevBest) : '—' },
          ]}
          primary={{ label: 'Next puzzle', onClick: () => startGame(difficulty) }}
          secondary={[
            { label: 'Change level', onClick: () => navigate('/sudoku') },
            { label: 'All games', onClick: () => navigate('/') },
          ]}
        />
      )}
    </div>
  );
}
