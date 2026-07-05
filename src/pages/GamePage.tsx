import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGameStore } from '../store/gameStore';
import { formatTime } from '../utils/sudokuGenerator';
import SudokuBoard from '../components/SudokuBoard';
import NumberPad from '../components/NumberPad';
import ActionButtons from '../components/ActionButtons';
import GameHeader from '../components/GameHeader';

// ─── Focus trap ───────────────────────────────────────────────────────────────
function useFocusTrap(active: boolean, ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);
}

// ─── Confetti particles ───────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#93C5FD','#6EE7B7','#FCD34D','#FCA5A5','#C4B5FD','#7DD3FC','#F9A8D4','#86EFAC'];
const PARTICLE_COUNT  = 14;

function Confetti() {
  return (
    <>
      {Array.from({ length: PARTICLE_COUNT }, (_, i) => {
        const angle  = (i / PARTICLE_COUNT) * 360;
        const dist   = 90 + (i % 3) * 30;
        const tx     = Math.cos(angle * Math.PI / 180) * dist;
        const ty     = Math.sin(angle * Math.PI / 180) * dist;
        const size   = 7 + (i % 4) * 3;
        const color  = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const delay  = i * 0.035;
        const round  = i % 3 !== 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%', top: '40%',
              width: size, height: round ? size : size * 0.5,
              borderRadius: round ? '50%' : 3,
              background: color,
              pointerEvents: 'none',
              zIndex: 10,
              animation: `completionBurst 0.85s ${delay}s cubic-bezier(0.22,1,0.36,1) forwards`,
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
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

  // New-record toast
  const toastedRef = useRef(false);
  useEffect(() => {
    if (isComplete && isNewRecord && !toastedRef.current) {
      toastedRef.current = true;
      toast.success('🏆 New Record!', { description: `${label} — ${formatTime(seconds)}` });
    }
    if (!isComplete) toastedRef.current = false;
  }, [isComplete, isNewRecord, label, seconds]);

  const prevBest  = bestTimes[difficulty];
  const modalRef  = useRef<HTMLDivElement>(null);
  useFocusTrap(isComplete, modalRef);

  const BLUE = '#93C5FD';
  const T3   = 'rgba(255,255,255,0.55)';
  const T2   = 'rgba(255,255,255,0.72)';
  const BDR  = 'rgba(255,255,255,0.14)';

  return (
    <div style={{ height: '100dvh', background: '#1E3A8A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* aria-live region for screen readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {mistakes > 0 && `${mistakes} mistake${mistakes !== 1 ? 's' : ''} made.`}
        {isComplete && `Puzzle solved in ${formatTime(seconds)}!`}
      </div>

      <GameHeader />

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(14px, 3vh, 32px)', padding: 'clamp(10px, 2vh, 24px) 16px',
        flexWrap: 'wrap', overflow: 'hidden',
      }}>
        <div style={{ flexShrink: 0 }}>
          <SudokuBoard />
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.6vh, 16px)',
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
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Puzzle complete"
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <Confetti />
          <div
            ref={modalRef}
            style={{
              background: 'rgba(30,58,138,0.95)',
              border: `1px solid ${BDR}`,
              borderRadius: 28, padding: 40,
              maxWidth: 380, width: '100%', textAlign: 'center',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
              animation: 'fadeUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
              backdropFilter: 'blur(20px)',
              position: 'relative', zIndex: 2,
            }}
          >
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
                fontFamily: "'Outfit', sans-serif",
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
                fontFamily: "'Outfit', sans-serif",
              }}
            >Change Difficulty</button>
          </div>
        </div>
      )}
    </div>
  );
}
