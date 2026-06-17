import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWordSearchStore } from '../store/wordSearchStore';
import { WS_LEVELS } from '../utils/wordSearchGenerator';
import { formatTime } from '../utils/sudokuGenerator';

const ACCENT = '#34D399';
const ACCENT_DIM = 'rgba(52,211,153,0.12)';
const ACCENT_BORDER = 'rgba(52,211,153,0.25)';

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
    level, grid, found, selCells, hintCells, hintsLeft,
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

  const isSel = (r: number, c: number) => selCells.some(cell => cell.row === r && cell.col === c);
  const isHint = (r: number, c: number) => hintCells.some(cell => cell.row === r && cell.col === c);
  const getFound = (r: number, c: number) => found.find(f => f.cells.some(cell => cell.row === r && cell.col === c));

  // ─── LEVELS screen ───────────────────────────────────────────────────────────
  if (screen === 'levels') {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#0A0D14',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(24px,5vh,48px) 16px', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 320,
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => navigate('/')}
            onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#374151', fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 0 28px', transition: 'color 0.15s',
            }}
          >← All Games</button>

          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 72, height: 72, borderRadius: 20,
              background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`,
              fontSize: 34, marginBottom: 16,
              boxShadow: '0 0 40px rgba(52,211,153,0.1)',
            }}>🔍</div>
            <h1 className="gradient-text-green" style={{ fontSize: '2.6rem', lineHeight: 1.1, marginBottom: 8, fontWeight: 900 }}>
              Word Search
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Find every hidden word in the grid
            </p>
          </div>

          <p style={{ fontSize: '0.63rem', fontWeight: 800, color: '#374151', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
            Choose Difficulty
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WS_LEVELS.map(lvl => (
              <button
                key={lvl.id}
                onClick={() => { startPuzzle(lvl.id); setScreen('game'); }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(52,211,153,0.4)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: 'linear-gradient(145deg, #141B2D 0%, #111927 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.07em',
                      padding: '2px 8px', borderRadius: 100,
                      background: ACCENT_DIM, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, textTransform: 'uppercase',
                    }}>{lvl.label}</span>
                    <span style={{ fontSize: '0.73rem', color: '#484F58' }}>{lvl.theme}</span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#8B949E' }}>{lvl.description}</span>
                </div>
                <span style={{ color: ACCENT, fontSize: '1.1rem', fontWeight: 300, marginLeft: 14 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── GAME screen ─────────────────────────────────────────────────────────────
  const vw = typeof window !== 'undefined' ? window.innerWidth : 800;
  const maxGridW = Math.min(vw - 24, 520);
  const cellSize = Math.max(24, Math.floor(maxGridW / level.size));
  const gridPx = cellSize * level.size;
  const wordsPerRow = vw < 480 ? 2 : 3;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0D14', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(17,25,39,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <button
          onClick={() => setScreen('levels')}
          onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={e => (e.currentTarget.style.color = '#484F58')}
          style={{ color: '#484F58', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
        >← Levels</button>

        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F0F6FC', fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(seconds)}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={useHint}
            disabled={hintsLeft === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 20,
              background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`,
              color: hintsLeft > 0 ? ACCENT : '#374151',
              fontSize: '0.7rem', fontWeight: 700,
              cursor: hintsLeft > 0 ? 'pointer' : 'not-allowed',
            }}
          >💡 {hintsLeft}</button>
          <button
            onClick={() => startPuzzle(level.id)}
            onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
            style={{ color: '#6B7280', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
          >New</button>
        </div>
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 12px 28px' }}>
        {/* Word list in horizontal rows — matching reference design */}
        <div style={{
          width: '100%', maxWidth: gridPx + 8,
          background: 'linear-gradient(135deg, rgba(52,211,153,0.13) 0%, rgba(52,211,153,0.05) 100%)',
          border: `1px solid ${ACCENT_BORDER}`,
          borderRadius: 14, padding: '12px 16px', marginBottom: 14,
        }}>
          <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.12em', color: ACCENT, textTransform: 'uppercase', textAlign: 'center', marginBottom: 8 }}>
            {level.theme}
          </div>
          {wordRows(level.words, wordsPerRow).map((row, ri) => (
            <div key={ri} style={{
              display: 'flex', justifyContent: 'center',
              gap: 'clamp(12px,3.5vw,28px)',
              marginBottom: ri < wordRows(level.words, wordsPerRow).length - 1 ? 5 : 0,
            }}>
              {row.map(word => {
                const isFound = found.some(f => f.word === word);
                return (
                  <span key={word} style={{
                    fontSize: 'clamp(0.75rem,2.3vw,0.95rem)',
                    fontWeight: 800,
                    color: isFound ? '#374151' : '#F0F6FC',
                    textDecoration: isFound ? 'line-through' : 'none',
                    opacity: isFound ? 0.45 : 1,
                    transition: 'all 0.3s',
                    letterSpacing: '0.03em',
                  }}>
                    {word}
                  </span>
                );
              })}
            </div>
          ))}
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.62rem', color: '#374151', fontWeight: 600 }}>
            {found.length} / {level.words.length} found
          </div>
        </div>

        {/* Letter grid */}
        <div
          ref={gridRef}
          style={{ userSelect: 'none', touchAction: 'none', cursor: 'crosshair' }}
          onMouseLeave={() => { if (isDragging.current) { isDragging.current = false; cancelSelection(); } }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {grid.map((row, r) => (
            <div key={r} style={{ display: 'flex' }}>
              {row.map((letter, c) => {
                const sel = isSel(r, c);
                const hint = isHint(r, c);
                const fnd = getFound(r, c);
                const bg = fnd ? ACCENT : hint ? '#FBBF24' : sel ? 'rgba(52,211,153,0.5)' : 'transparent';
                const color = (fnd || hint || sel) ? '#0A0D14' : '#8B949E';
                return (
                  <div
                    key={c}
                    data-row={r}
                    data-col={c}
                    style={{
                      width: cellSize, height: cellSize,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: Math.round(cellSize * 0.43),
                      fontWeight: fnd ? 900 : 700,
                      color, backgroundColor: bg,
                      borderRadius: 3,
                      transition: 'background-color 0.06s, color 0.06s',
                      boxShadow: hint ? '0 0 10px rgba(251,191,36,0.6)' : 'none',
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
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #152A1E 0%, #111927 100%)',
            border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 24, padding: '36px 32px',
            maxWidth: 320, width: '100%', textAlign: 'center',
            animation: 'fadeUp 0.3s cubic-bezier(.34,1.56,.64,1)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#F0F6FC', marginBottom: 4 }}>All Found!</h2>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: 24 }}>{level.theme} · {formatTime(seconds)}</p>
            <button
              onClick={() => startPuzzle(level.id)}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.22)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = ACCENT_DIM)}
              style={{
                width: '100%', padding: '13px 0',
                background: ACCENT_DIM, border: `1px solid rgba(52,211,153,0.35)`,
                borderRadius: 12, color: ACCENT, fontSize: '0.95rem', fontWeight: 800,
                cursor: 'pointer', marginBottom: 8, transition: 'background 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >New Game</button>
            <button
              onClick={() => setScreen('levels')}
              onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.color = '#484F58')}
              style={{
                width: '100%', padding: '8px 0', background: 'none', border: 'none',
                color: '#484F58', fontSize: '0.82rem', fontWeight: 600,
                cursor: 'pointer', transition: 'color 0.15s', fontFamily: "'DM Sans', sans-serif",
              }}
            >Change Difficulty</button>
          </div>
        </div>
      )}
    </div>
  );
}
