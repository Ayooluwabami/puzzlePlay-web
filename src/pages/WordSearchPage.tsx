import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWordSearchStore } from '../store/wordSearchStore';
import { WS_LEVELS } from '../utils/wordSearchGenerator';
import { formatTime } from '../utils/sudokuGenerator';
import LevelScreen from '../components/ui/LevelScreen';
import TopBar from '../components/ui/TopBar';
import RestartButton from '../components/ui/RestartButton';
import CompletionSheet from '../components/ui/CompletionSheet';
import Icon from '../components/ui/Icon';
import { useElementSize } from '../hooks/useElementSize';
import { C, FONT, GAMES } from '../design/tokens';

const G = GAMES.words;
const GRID_PAD = 8;

type Cell = { row: number; col: number };

// A capsule from the first to the last cell of a run, drawn under the letters
function Capsule({ cells, cell, color, outline, dashed, animate }: {
  cells: Cell[]; cell: number; color: string; outline?: boolean; dashed?: boolean; animate?: boolean;
}) {
  if (cells.length === 0) return null;
  const a = cells[0], b = cells[cells.length - 1];
  const x1 = GRID_PAD + a.col * cell + cell / 2, y1 = GRID_PAD + a.row * cell + cell / 2;
  const x2 = GRID_PAD + b.col * cell + cell / 2, y2 = GRID_PAD + b.row * cell + cell / 2;
  const w = cell * 0.76;
  const len = Math.hypot(x2 - x1, y2 - y1) + 1;
  const anim: React.CSSProperties | undefined = animate
    ? { strokeDasharray: len, animation: 'drawStroke 0.32s cubic-bezier(0.22,1,0.36,1) both', '--len': `${len}` } as React.CSSProperties
    : undefined;

  if (dashed) {
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth={w} strokeLinecap="round" strokeOpacity={0.12} />;
  }
  return (
    <g>
      {outline && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.ink} strokeWidth={w + 3} strokeLinecap="round" style={anim} />}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" style={anim} />
    </g>
  );
}

export default function WordSearchPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'levels' | 'game'>('levels');
  const isDragging = useRef(false);
  const [mainRef, area] = useElementSize<HTMLDivElement>();
  const [listRef, listSize] = useElementSize<HTMLElement>();

  const {
    level, theme, words, grid, found, selCells, hintCells, hintsLeft,
    startPuzzle, startSelection, setHover, commitSelection, cancelSelection,
    useHint, tick, seconds, isComplete,
  } = useWordSearchStore();

  useEffect(() => {
    if (screen !== 'game') return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick, screen]);

  const handleMouseDown = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    isDragging.current = true;
    startSelection(row, col);
  }, [startSelection]);

  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (!isDragging.current) return;
    setHover(row, col);
  }, [setHover]);

  const handleMouseUp = useCallback((row: number, col: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    commitSelection(row, col);
  }, [commitSelection]);

  const handleTouchStart = useCallback((e: React.TouchEvent, row: number, col: number) => {
    e.preventDefault();
    isDragging.current = true;
    startSelection(row, col);
  }, [startSelection]);

  const cellFromTouch = (t: React.Touch) => {
    const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
    return el?.dataset.row !== undefined && el?.dataset.col !== undefined
      ? { row: Number(el.dataset.row), col: Number(el.dataset.col) } : null;
  };

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging.current) return;
    const c = cellFromTouch(e.touches[0]);
    if (c) setHover(c.row, c.col);
  }, [setHover]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging.current) return;
    isDragging.current = false;
    const c = cellFromTouch(e.changedTouches[0]);
    if (c) commitSelection(c.row, c.col); else cancelSelection();
  }, [commitSelection, cancelSelection]);

  useEffect(() => {
    const up = () => { if (isDragging.current) { isDragging.current = false; cancelSelection(); } };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, [cancelSelection]);

  // ─── Levels ─────────────────────────────────────────────────────────
  if (screen === 'levels') {
    return (
      <LevelScreen
        game="words"
        onBack={() => navigate('/')}
        levels={WS_LEVELS.map(l => ({ id: l.id, label: l.label, meta: `${l.description} · ${l.puzzles.length} themes` }))}
        onPick={id => { startPuzzle(id); setScreen('game'); }}
      />
    );
  }

  // ─── Game ───────────────────────────────────────────────────────────
  const n = level.size;
  const fit = Math.min(area.width, area.height - listSize.height - 16, 620) - GRID_PAD * 2 - 4;
  const cell = Math.max(16, Math.floor(fit / n));
  const gridPx = cell * n + GRID_PAD * 2;
  const foundSet = new Set(found.flatMap(f => f.cells.map(c => `${c.row}-${c.col}`)));
  const selSet = new Set(selCells.map(c => `${c.row}-${c.col}`));

  return (
    <div style={{
      height: '100dvh', background: C.paper,
      paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <TopBar
        title="Word Search"
        meta={<>{theme} · {formatTime(seconds)}</>}
        onBack={() => setScreen('levels')}
        backLabel="Back to levels"
        right={<RestartButton onConfirm={() => startPuzzle(level.id)} needsConfirm={found.length > 0 && !isComplete} />}
        progress={found.length / words.length}
        progressColor={isComplete ? C.success : G.color}
      />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {found.length > 0 && `Found ${found[found.length - 1]?.word}. ${found.length} of ${words.length} words found.`}
      </div>

      <main ref={mainRef} style={{
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '14px 16px 16px', gap: 16, width: '100%', maxWidth: 720, margin: '0 auto',
      }}>
        {/* Grid */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
          {area.width > 0 && listSize.height > 0 && (
            <div
              style={{
                position: 'relative', width: gridPx, height: gridPx,
                background: C.surface, border: `2px solid ${C.ink}`, borderRadius: 16,
                boxShadow: `0 4px 0 ${C.ink}`,
                touchAction: 'none', cursor: 'pointer',
              }}
              onMouseLeave={() => { if (isDragging.current) { isDragging.current = false; cancelSelection(); } }}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <svg width={gridPx} height={gridPx} style={{ position: 'absolute', inset: -2, overflow: 'visible', pointerEvents: 'none' }} aria-hidden="true">
                {hintCells.length > 0 && <Capsule cells={hintCells} cell={cell} color="none" dashed />}
                {found.map(f => <Capsule key={f.word} cells={f.cells} cell={cell} color={f.color} animate />)}
                {selCells.length > 0 && <Capsule cells={selCells} cell={cell} color={G.color} outline />}
              </svg>
              <div style={{ position: 'absolute', inset: GRID_PAD - 2 }}>
                {grid.map((row, r) => (
                  <div key={r} style={{ display: 'flex' }}>
                    {row.map((letter, c) => {
                      const key = `${r}-${c}`;
                      const active = selSet.has(key);
                      const isFound = foundSet.has(key);
                      return (
                        <div
                          key={c}
                          data-row={r}
                          data-col={c}
                          style={{
                            width: cell, height: cell,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: FONT.ui,
                            fontSize: Math.round(cell * 0.5),
                            fontWeight: active || isFound ? 800 : 600,
                            color: C.ink,
                            opacity: isComplete && !isFound ? 0.3 : 1,
                            transform: active ? 'scale(1.12)' : 'none',
                            transition: 'transform 0.1s, opacity 0.4s',
                          }}
                          onMouseDown={e => handleMouseDown(e, r, c)}
                          onMouseEnter={() => handleMouseEnter(r, c)}
                          onMouseUp={() => handleMouseUp(r, c)}
                          onTouchStart={e => handleTouchStart(e, r, c)}
                        >
                          {letter}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Word list */}
        <section ref={listRef} style={{
          width: '100%', maxWidth: Math.max(gridPx, 320), flexShrink: 0,
          background: C.surface, border: `1.5px solid ${C.ink}`, borderRadius: 18,
          padding: '12px 14px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: FONT.display, fontSize: '1.0625rem', fontWeight: 700 }}>{theme}</span>
              <span className="tnum" style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.ink3 }}>{found.length}/{words.length}</span>
            </span>
            <button
              onClick={useHint}
              disabled={hintsLeft === 0 || isComplete}
              aria-label={`Show a word, ${hintsLeft} hints left`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 34, padding: '0 12px', borderRadius: 999,
                background: hintsLeft > 0 ? G.tint : 'transparent',
                border: `1.5px solid ${hintsLeft > 0 ? C.ink : C.line}`,
                color: C.ink, fontSize: '0.8125rem', fontWeight: 700,
                cursor: hintsLeft > 0 ? 'pointer' : 'default', opacity: hintsLeft > 0 ? 1 : 0.45,
              }}
            >
              <Icon name="bulb" size={16} /> Hint · {hintsLeft}
            </button>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
            {words.map(word => {
              const fnd = found.find(f => f.word === word);
              return (
                <li key={word} style={{
                  position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '0.05em',
                  color: fnd ? C.ink3 : C.ink, transition: 'color 0.3s',
                }}>
                  <span aria-hidden="true" style={{
                    width: 8, height: 8, borderRadius: 2,
                    background: fnd ? fnd.color : 'transparent',
                    border: `1.5px solid ${fnd ? C.ink : C.line}`,
                  }} />
                  <span style={{ position: 'relative' }}>
                    {word}
                    {fnd && (
                      <span aria-hidden="true" style={{
                        position: 'absolute', left: -2, right: -2, top: '52%', height: 2,
                        background: C.ink, transformOrigin: 'left',
                        animation: 'strike 0.35s cubic-bezier(0.22,1,0.36,1) both',
                      }} />
                    )}
                  </span>
                  {fnd && <span className="sr-only">(found)</span>}
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      {isComplete && (
        <CompletionSheet
          game="words"
          title="All found."
          subtitle={`${theme} · ${level.label}`}
          stats={[
            { label: 'Time', value: formatTime(seconds), highlight: true },
            { label: 'Words', value: String(words.length) },
            { label: 'Hints used', value: String(3 - hintsLeft) },
          ]}
          primary={{ label: 'Next puzzle', onClick: () => startPuzzle(level.id) }}
          secondary={[
            { label: 'Change level', onClick: () => setScreen('levels') },
            { label: 'All games', onClick: () => navigate('/') },
          ]}
        />
      )}
    </div>
  );
}
