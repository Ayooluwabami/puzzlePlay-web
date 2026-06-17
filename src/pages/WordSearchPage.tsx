import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWordSearchStore } from '../store/wordSearchStore';
import { WS_LEVELS } from '../utils/wordSearchGenerator';
import { formatTime } from '../utils/sudokuGenerator';

// Dark design tokens
const BG      = '#0B0F1A';
const CARD    = '#1A1F2E';
const BDR     = 'rgba(255,255,255,0.08)';
const T1      = '#F1F5F9';
const T2      = '#94A3B8';
const T3      = '#475569';
const ACCENT  = '#10B981';
const ACC_SUB = 'rgba(16,185,129,0.1)';
const ACC_BDR = 'rgba(16,185,129,0.2)';

const SEL_BG  = 'rgba(245,158,11,0.45)';  // amber selection
const HINT_BG = '#6366F1';                  // indigo hint

function wordRows(words: string[], perRow: number): string[][] {
  const rows: string[][] = [];
  for (let i = 0; i < words.length; i += perRow) rows.push(words.slice(i, i + perRow));
  return rows;
}

export default function WordSearchPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'levels' | 'game'>('levels');
  const isDragging = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

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

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging.current) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    if (el?.dataset.row !== undefined && el?.dataset.col !== undefined) {
      setHover(Number(el.dataset.row), Number(el.dataset.col));
    }
  }, [setHover]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging.current) return;
    isDragging.current = false;
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    if (el?.dataset.row !== undefined && el?.dataset.col !== undefined) {
      commitSelection(Number(el.dataset.row), Number(el.dataset.col));
    } else {
      cancelSelection();
    }
  }, [commitSelection, cancelSelection]);

  useEffect(() => {
    const up = () => { if (isDragging.current) { isDragging.current = false; cancelSelection(); } };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, [cancelSelection]);

  const isSel    = (r: number, c: number) => selCells.some(cell => cell.row === r && cell.col === c);
  const isHint   = (r: number, c: number) => hintCells.some(cell => cell.row === r && cell.col === c);
  const getFound = (r: number, c: number) => found.find(f => f.cells.some(cell => cell.row === r && cell.col === c));

  // ─── LEVELS screen ─────────────────────────────────────────────────
  if (screen === 'levels') {
    return (
      <div style={{
        minHeight: '100vh',
        background: BG,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(24px,5vh,48px) 16px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => navigate('/')}
            onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = T3)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: T3, fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 0 28px', transition: 'color 0.15s',
            }}
          >← All Games</button>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 18,
              background: ACC_SUB, border: `1px solid ${ACC_BDR}`,
              fontSize: 28, marginBottom: 16,
            }}>🔍</div>
            <h1 style={{ fontSize: '2.4rem', lineHeight: 1.1, marginBottom: 8, fontWeight: 900, color: T1 }}>
              Word Search
            </h1>
            <p style={{ color: T2, fontSize: '0.875rem', lineHeight: 1.65 }}>
              Find every hidden word · New theme every game
            </p>
          </div>

          <p style={{ fontSize: '0.62rem', fontWeight: 700, color: T3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            Choose Difficulty
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WS_LEVELS.map(lvl => (
              <button
                key={lvl.id}
                onClick={() => { startPuzzle(lvl.id); setScreen('game'); }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#1F2537';
                  (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT}30`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = CARD;
                  (e.currentTarget as HTMLElement).style.borderColor = BDR;
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: CARD,
                  border: `1px solid ${BDR}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.08em',
                      padding: '2px 8px', borderRadius: 100,
                      background: ACC_SUB, color: ACCENT, border: `1px solid ${ACC_BDR}`,
                      textTransform: 'uppercase',
                    }}>{lvl.label}</span>
                    <span style={{ fontSize: '0.72rem', color: T3 }}>{lvl.puzzles.length} puzzle themes</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: T2 }}>{lvl.description}</span>
                </div>
                <span style={{ color: ACCENT, fontSize: '1rem', fontWeight: 700, marginLeft: 12 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── GAME screen ───────────────────────────────────────────────────
  const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
  const maxGridW = Math.min(vw - 24, 520);
  const cellSize = Math.max(24, Math.floor(maxGridW / level.size));
  const gridPx = cellSize * level.size;
  const wordsPerRow = vw < 480 ? 2 : 3;

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(11,15,26,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${BDR}`,
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <button
          onClick={() => setScreen('levels')}
          onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={e => (e.currentTarget.style.color = T3)}
          style={{ color: T3, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
        >← Levels</button>

        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: T1, fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(seconds)}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={useHint}
            disabled={hintsLeft === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 20,
              background: hintsLeft > 0 ? ACC_SUB : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hintsLeft > 0 ? ACC_BDR : BDR}`,
              color: hintsLeft > 0 ? ACCENT : T3,
              fontSize: '0.7rem', fontWeight: 700,
              cursor: hintsLeft > 0 ? 'pointer' : 'not-allowed',
            }}
          >💡 {hintsLeft}</button>
          <button
            onClick={() => startPuzzle(level.id)}
            onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = T3)}
            style={{ color: T3, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
          >NEW</button>
        </div>
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px 32px' }}>
        {/* Word list */}
        <div style={{
          width: '100%', maxWidth: gridPx + 8,
          background: CARD,
          border: `1px solid ${BDR}`,
          borderRadius: 14, padding: '14px 16px', marginBottom: 12,
        }}>
          <div style={{
            fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.14em',
            color: ACCENT, textTransform: 'uppercase', textAlign: 'center', marginBottom: 10,
          }}>
            {theme}
          </div>
          {wordRows(words, wordsPerRow).map((row, ri) => (
            <div key={ri} style={{
              display: 'flex', justifyContent: 'center',
              gap: 'clamp(6px,2vw,16px)',
              marginBottom: ri < wordRows(words, wordsPerRow).length - 1 ? 6 : 0,
            }}>
              {row.map(word => {
                const fnd = found.find(f => f.word === word);
                return (
                  <span key={word} style={{
                    fontSize: 'clamp(0.7rem,2vw,0.85rem)',
                    fontWeight: 700,
                    color: fnd ? '#fff' : T2,
                    background: fnd ? fnd.color : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${fnd ? 'transparent' : BDR}`,
                    padding: '3px 10px',
                    borderRadius: 20,
                    textDecoration: fnd ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(255,255,255,0.5)',
                    opacity: fnd ? 0.85 : 1,
                    transition: 'all 0.25s ease',
                    letterSpacing: '0.03em',
                    display: 'inline-block',
                  }}>
                    {word}
                  </span>
                );
              })}
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.6rem', color: T3, fontWeight: 600 }}>
            {found.length} / {words.length} found
          </div>
        </div>

        {/* Letter grid */}
        <div
          ref={gridRef}
          style={{
            background: CARD,
            border: `1px solid ${BDR}`,
            borderRadius: 16,
            padding: 8,
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            userSelect: 'none', touchAction: 'none', cursor: 'crosshair',
          }}
          onMouseLeave={() => { if (isDragging.current) { isDragging.current = false; cancelSelection(); } }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {grid.map((row, r) => (
            <div key={r} style={{ display: 'flex' }}>
              {row.map((letter, c) => {
                const sel   = isSel(r, c);
                const hint  = isHint(r, c);
                const fnd   = getFound(r, c);
                const bg    = fnd ? fnd.color
                            : hint ? HINT_BG
                            : sel ? SEL_BG
                            : 'transparent';
                const color = fnd || hint || sel ? '#fff' : T1;
                return (
                  <div
                    key={c}
                    data-row={r}
                    data-col={c}
                    style={{
                      width: cellSize, height: cellSize,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: Math.round(cellSize * 0.42),
                      fontWeight: fnd ? 800 : 600,
                      color,
                      backgroundColor: bg,
                      borderRadius: 4,
                      transition: 'background-color 0.07s, color 0.07s',
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
      </main>

      {/* Victory modal */}
      {isComplete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: '#1A1F2E',
            border: `1px solid ${BDR}`,
            borderRadius: 24, padding: '36px 28px',
            maxWidth: 340, width: '100%', textAlign: 'center',
            animation: 'fadeUp 0.3s cubic-bezier(.34,1.56,.64,1)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: T1, marginBottom: 4 }}>All Found!</h2>
            <p style={{ color: T2, fontSize: '0.875rem', marginBottom: 20 }}>{theme} · {formatTime(seconds)}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
              {found.map(f => (
                <span key={f.word} style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: f.color, color: '#fff',
                  fontSize: '0.78rem', fontWeight: 700,
                }}>
                  {f.word}
                </span>
              ))}
            </div>

            <button
              onClick={() => startPuzzle(level.id)}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#059669')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = ACCENT)}
              style={{
                width: '100%', padding: '13px 0',
                background: ACCENT, border: 'none',
                borderRadius: 10, color: '#fff', fontSize: '0.92rem', fontWeight: 700,
                cursor: 'pointer', marginBottom: 8, transition: 'background 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >New Game →</button>
            <button
              onClick={() => setScreen('levels')}
              onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.color = T3)}
              style={{
                width: '100%', padding: '8px 0', background: 'none', border: 'none',
                color: T3, fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', transition: 'color 0.15s', fontFamily: "'DM Sans', sans-serif",
              }}
            >Change Difficulty</button>
          </div>
        </div>
      )}
    </div>
  );
}
