import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWordSearchStore } from '../store/wordSearchStore';
import { WS_LEVELS } from '../utils/wordSearchGenerator';
import { formatTime } from '../utils/sudokuGenerator';

const ACCENT = '#34D399';
const ACCENT_DIM = 'rgba(52,211,153,0.12)';
const ACCENT_BORDER = 'rgba(52,211,153,0.25)';

export default function WordSearchPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'levels' | 'game'>('levels');
  const isDragging = useRef(false);

  const {
    level, grid, found, selCells,
    startPuzzle, startSelection, setHover, commitSelection, cancelSelection,
    tick, seconds, isComplete,
  } = useWordSearchStore();

  useEffect(() => {
    if (screen !== 'game') return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick, screen]);

  const handleMouseDown = useCallback((row: number, col: number) => {
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

  useEffect(() => {
    const up = () => {
      if (isDragging.current) { isDragging.current = false; cancelSelection(); }
    };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, [cancelSelection]);

  const isSel = (r: number, c: number) => selCells.some(cell => cell.row === r && cell.col === c);
  const getFound = (r: number, c: number) => found.find(f => f.cells.some(cell => cell.row === r && cell.col === c));

  if (screen === 'levels') {
    return (
      <div
        className="bg-grid"
        style={{
          minHeight: '100vh',
          backgroundColor: '#0A0D14',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', pointerEvents: 'none',
          top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 320,
          background: 'radial-gradient(ellipse, rgba(52,211,153,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />

        <div style={{ width: '100%', maxWidth: 448, position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => navigate('/')}
            onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: '#374151', fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0 0 32px', transition: 'color 0.15s',
            }}
          >
            ← All Games
          </button>

          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 76, height: 76, borderRadius: 22,
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.25)',
              fontSize: 36, marginBottom: 20,
              boxShadow: '0 0 40px rgba(52,211,153,0.1)',
            }}>🔍</div>
            <h1 className="gradient-text-green" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: 10, fontWeight: 900 }}>
              Word Search
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Find every hidden word in the grid
            </p>
          </div>

          <p style={{
            fontSize: '0.65rem', fontWeight: 800, color: '#374151',
            letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14, paddingLeft: 2,
          }}>Choose Difficulty</p>

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
                  padding: '16px 20px',
                  background: 'linear-gradient(145deg, #141B2D 0%, #111927 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(.34,1.56,.64,1)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                    <span style={{
                      fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.07em',
                      padding: '3px 9px', borderRadius: 100,
                      background: ACCENT_DIM, color: ACCENT,
                      border: `1px solid ${ACCENT_BORDER}`, textTransform: 'uppercase',
                    }}>
                      {lvl.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#484F58' }}>{lvl.theme}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#8B949E' }}>{lvl.description}</span>
                </div>
                <span style={{ color: ACCENT, fontSize: '1.1rem', fontWeight: 300, marginLeft: 16 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cellSize = Math.min(38, Math.floor((Math.min(window.innerWidth - 32, 540)) / level.size));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0D14', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(17,25,39,0.95)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <button
          onClick={() => setScreen('levels')}
          onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={e => (e.currentTarget.style.color = '#484F58')}
          style={{ color: '#484F58', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
        >
          ← Levels
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 100, background: ACCENT_DIM, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, textTransform: 'uppercase' }}>
            {level.label}
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F0F6FC', fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(seconds)}
          </span>
        </div>
        <button
          onClick={() => startPuzzle(level.id)}
          onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
          style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
        >
          New
        </button>
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 40, padding: '32px 16px', flexWrap: 'wrap' }}>
        {/* Grid */}
        <div
          style={{ userSelect: 'none', flexShrink: 0 }}
          onMouseLeave={() => { if (isDragging.current) { isDragging.current = false; cancelSelection(); } }}
        >
          {grid.map((row, r) => (
            <div key={r} style={{ display: 'flex' }}>
              {row.map((letter, c) => {
                const sel = isSel(r, c);
                const fnd = getFound(r, c);
                return (
                  <div
                    key={c}
                    style={{
                      width: cellSize, height: cellSize,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: Math.round(cellSize * 0.44),
                      fontWeight: fnd ? 800 : 600,
                      color: fnd || sel ? '#111927' : '#8B949E',
                      backgroundColor: fnd ? ACCENT : sel ? 'rgba(52,211,153,0.5)' : 'transparent',
                      borderRadius: 4,
                      cursor: 'default',
                      transition: 'background-color 0.08s',
                    }}
                    onMouseDown={() => handleMouseDown(r, c)}
                    onMouseEnter={() => handleMouseEnter(r, c)}
                    onMouseUp={() => handleMouseUp(r, c)}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Word list */}
        <div style={{ minWidth: 160 }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#374151', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
            {level.theme} Words
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {level.words.map(word => {
              const isFound = found.some(f => f.word === word);
              return (
                <div key={word} style={{
                  fontSize: '0.85rem', fontWeight: 700,
                  padding: '8px 14px', borderRadius: 10,
                  background: isFound ? ACCENT_DIM : 'rgba(255,255,255,0.03)',
                  color: isFound ? ACCENT : '#484F58',
                  border: `1px solid ${isFound ? ACCENT_BORDER : 'rgba(255,255,255,0.06)'}`,
                  textDecoration: isFound ? 'line-through' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {word}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.72rem', color: '#374151', marginTop: 14 }}>
            {found.length} / {level.words.length} found
          </p>
        </div>
      </main>

      {/* Victory modal */}
      {isComplete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #152A1E 0%, #111927 100%)',
            border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 28, padding: 40,
            maxWidth: 360, width: '100%', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            animation: 'fadeUp 0.3s cubic-bezier(.34,1.56,.64,1)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F0F6FC', marginBottom: 6 }}>All Found!</h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: 28 }}>{level.theme} · {formatTime(seconds)}</p>
            <button
              onClick={() => startPuzzle(level.id)}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.22)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(52,211,153,0.12)')}
              style={{
                width: '100%', padding: '14px 0',
                background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.35)',
                borderRadius: 14, color: ACCENT, fontSize: '1rem', fontWeight: 800,
                cursor: 'pointer', marginBottom: 10, transition: 'background 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >New Game</button>
            <button
              onClick={() => setScreen('levels')}
              onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.color = '#484F58')}
              style={{
                width: '100%', padding: '8px 0', background: 'none', border: 'none',
                color: '#484F58', fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', transition: 'color 0.15s', fontFamily: "'DM Sans', sans-serif",
              }}
            >Change Difficulty</button>
          </div>
        </div>
      )}
    </div>
  );
}
