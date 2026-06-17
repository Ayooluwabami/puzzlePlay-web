import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWordSearchStore } from '../store/wordSearchStore';
import { WS_LEVELS } from '../utils/wordSearchGenerator';
import { formatTime } from '../utils/sudokuGenerator';

// Deep teal theme — inspired by thina-landing's #1A2820 forest green sections
const BG      = '#134E4A';   // teal-900
const CARD    = 'rgba(255,255,255,0.1)';
const CARD_S  = 'rgba(255,255,255,0.07)';
const BDR     = 'rgba(255,255,255,0.14)';
const T1      = '#FFFFFF';
const T2      = 'rgba(255,255,255,0.70)';
const T3      = 'rgba(255,255,255,0.38)';
const ACCENT  = '#34D399';   // emerald-400 — bright pop on teal
const ACC_SUB = 'rgba(52,211,153,0.12)';
const ACC_BDR = 'rgba(52,211,153,0.28)';

const SEL_BG  = 'rgba(251,191,36,0.45)';   // amber selection
const HINT_BG = '#818CF8';                   // indigo hint

export default function WordSearchPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'levels' | 'game'>('levels');
  const isDragging = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const [dims, setDims] = useState(() => ({
    vw: typeof window !== 'undefined' ? window.innerWidth : 390,
    vh: typeof window !== 'undefined' ? window.innerHeight : 844,
  }));
  useEffect(() => {
    const handle = () => setDims({ vw: window.innerWidth, vh: window.innerHeight });
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

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
        minHeight: '100vh', background: BG,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(24px,5vh,48px) 16px', position: 'relative', overflow: 'hidden',
      }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.55, pointerEvents: 'none' }} />
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.12) 0%, transparent 65%)',
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
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
                  (e.currentTarget as HTMLElement).style.borderColor = ACC_BDR;
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = CARD;
                  (e.currentTarget as HTMLElement).style.borderColor = BDR;
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', background: CARD,
                  border: `1px solid ${BDR}`, borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.18s ease', backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
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

  // ─── GAME screen — fills viewport, no scroll ───────────────────────
  const { vw, vh } = dims;
  const HEADER_H    = 50;
  const WORDPANEL_H = 72;
  const PADDING_V   = 20;
  const availH = vh - HEADER_H - WORDPANEL_H - PADDING_V;
  const availW = vw - 24;

  const cellSize = Math.max(18, Math.min(
    Math.floor(availH / level.size),
    Math.floor(availW / level.size),
  ));
  const gridPx = cellSize * level.size;

  return (
    <div style={{ height: '100dvh', background: BG, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', flexShrink: 0,
        background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${BDR}`,
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
              background: hintsLeft > 0 ? ACC_SUB : 'rgba(255,255,255,0.06)',
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

      <main style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '10px 12px', gap: 8, overflow: 'hidden',
      }}>
        {/* Word chips — compact panel */}
        <div style={{
          width: '100%', maxWidth: gridPx + 8,
          background: CARD_S, border: `1px solid ${BDR}`,
          borderRadius: 12, padding: '8px 12px',
          backdropFilter: 'blur(8px)', flexShrink: 0,
        }}>
          <div style={{
            fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.14em',
            color: ACCENT, textTransform: 'uppercase', textAlign: 'center', marginBottom: 6,
          }}>
            {theme} · {found.length}/{words.length}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {words.map(word => {
              const fnd = found.find(f => f.word === word);
              return (
                <span key={word} style={{
                  fontSize: 'clamp(0.65rem,2vw,0.8rem)', fontWeight: 700,
                  color: fnd ? '#fff' : T2,
                  background: fnd ? fnd.color : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${fnd ? 'transparent' : BDR}`,
                  padding: '2px 9px', borderRadius: 20,
                  textDecoration: fnd ? 'line-through' : 'none',
                  opacity: fnd ? 0.9 : 1,
                  transition: 'all 0.25s ease',
                  letterSpacing: '0.03em',
                  display: 'inline-block', lineHeight: 1.6,
                }}>
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Letter grid */}
        <div
          ref={gridRef}
          style={{
            background: CARD, border: `1px solid ${BDR}`,
            borderRadius: 14, padding: 6,
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(12px)',
            userSelect: 'none', touchAction: 'none', cursor: 'crosshair',
            flexShrink: 0,
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
                const bg    = fnd ? fnd.color : hint ? HINT_BG : sel ? SEL_BG : 'transparent';
                const color = fnd || hint || sel ? '#fff' : T1;
                return (
                  <div
                    key={c}
                    data-row={r}
                    data-col={c}
                    style={{
                      width: cellSize, height: cellSize,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: Math.round(cellSize * 0.44),
                      fontWeight: fnd ? 800 : 600,
                      color, backgroundColor: bg,
                      borderRadius: 3,
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
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: 'rgba(19,78,74,0.92)',
            border: `1px solid ${BDR}`, borderRadius: 24, padding: '36px 28px',
            maxWidth: 340, width: '100%', textAlign: 'center',
            animation: 'fadeUp 0.3s cubic-bezier(.34,1.56,.64,1)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
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
                }}>{f.word}</span>
              ))}
            </div>
            <button
              onClick={() => startPuzzle(level.id)}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#059669')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = ACCENT)}
              style={{
                width: '100%', padding: '13px 0',
                background: ACCENT, border: 'none', borderRadius: 10,
                color: '#000', fontSize: '0.92rem', fontWeight: 800,
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
