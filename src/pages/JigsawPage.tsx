import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJigsawStore } from '../store/jigsawStore';
import { JIGSAW_LEVELS, getImageUrl } from '../utils/jigsawData';
import { formatTime } from '../utils/sudokuGenerator';

const ACCENT = '#FBBF24';
const ACCENT_DIM = 'rgba(251,191,36,0.12)';
const ACCENT_BORDER = 'rgba(251,191,36,0.25)';
const BOARD_MAX = 420;

function PieceView({
  pieceId, gridSize, imageUrl, pieceSize, correct = false, selected = false,
}: {
  pieceId: number; gridSize: number; imageUrl: string; pieceSize: number;
  correct?: boolean; selected?: boolean;
}) {
  const row = Math.floor(pieceId / gridSize);
  const col = pieceId % gridSize;
  const totalSize = pieceSize * gridSize;

  return (
    <div style={{
      width: pieceSize, height: pieceSize,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${totalSize}px ${totalSize}px`,
      backgroundPosition: `-${col * pieceSize}px -${row * pieceSize}px`,
      borderRadius: 8,
      border: correct
        ? '2px solid rgba(52,211,153,0.7)'
        : selected
        ? '2px solid rgba(251,191,36,0.8)'
        : '1px solid rgba(255,255,255,0.1)',
      boxShadow: selected
        ? '0 0 0 3px rgba(251,191,36,0.2)'
        : correct
        ? '0 0 0 2px rgba(52,211,153,0.15)'
        : 'none',
      cursor: 'pointer',
      flexShrink: 0,
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }} />
  );
}

export default function JigsawPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'levels' | 'game'>('levels');
  const [previewSeed, setPreviewSeed] = useState(0);

  const {
    level, imageUrl, imageSeed, tray, board, selectedTrayId,
    startPuzzle, selectTrayPiece, placeOnBoard, tick, seconds, isComplete,
  } = useJigsawStore();

  useEffect(() => {
    if (screen !== 'game') return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick, screen]);

  const { gridSize } = level;
  const pieceSize = Math.floor(BOARD_MAX / gridSize);
  const boardSize = pieceSize * gridSize;

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
        <div style={{
          position: 'absolute', pointerEvents: 'none',
          top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 320,
          background: 'radial-gradient(ellipse, rgba(251,191,36,0.07) 0%, transparent 70%)',
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

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 76, height: 76, borderRadius: 22,
              background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`,
              fontSize: 36, marginBottom: 20,
              boxShadow: '0 0 40px rgba(251,191,36,0.08)',
            }}>🧩</div>
            <h1 className="gradient-text-amber" style={{ fontSize: '2.8rem', lineHeight: 1.1, marginBottom: 10, fontWeight: 900 }}>
              Jigsaw
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Piece together beautiful photographs
            </p>
          </div>

          {/* Photo picker */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#374151', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 2 }}>
              Choose Photo
            </p>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {Array.from({ length: 8 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewSeed(i)}
                  style={{
                    flexShrink: 0, padding: 0, border: 'none',
                    borderRadius: 12, overflow: 'hidden',
                    cursor: 'pointer',
                    outline: previewSeed === i ? `3px solid ${ACCENT}` : '2px solid rgba(255,255,255,0.08)',
                    outlineOffset: 2,
                    transition: 'outline 0.15s',
                  }}
                >
                  <img src={getImageUrl(i, 64)} alt="" style={{ width: 60, height: 60, display: 'block' }} />
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#374151', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14, paddingLeft: 2 }}>
            Choose Difficulty
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {JIGSAW_LEVELS.map(lvl => (
              <button
                key={lvl.id}
                onClick={() => { startPuzzle(lvl.id, previewSeed); setScreen('game'); }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(251,191,36,0.4)';
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                    <span style={{
                      fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.07em',
                      padding: '3px 9px', borderRadius: 100,
                      background: ACCENT_DIM, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, textTransform: 'uppercase',
                    }}>
                      {lvl.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#484F58' }}>{lvl.gridSize}×{lvl.gridSize} pieces</span>
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
          onClick={() => startPuzzle(level.id, imageSeed)}
          onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
          style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
        >
          New
        </button>
      </div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 40, padding: '32px 16px', flexWrap: 'wrap' }}>
        {/* Board */}
        <div>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#374151', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
            Board
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: `repeat(${gridSize}, ${pieceSize}px)`, gap: 3,
            background: '#0E1520', padding: 6, borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {Array.from({ length: gridSize }, (_, r) =>
              Array.from({ length: gridSize }, (_, c) => {
                const cell = board[r]?.[c];
                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => { if (selectedTrayId !== null) placeOnBoard(r, c); }}
                    style={{
                      width: pieceSize, height: pieceSize, borderRadius: 6,
                      border: cell?.correct
                        ? '2px solid rgba(52,211,153,0.5)'
                        : selectedTrayId !== null
                        ? '1.5px dashed rgba(251,191,36,0.4)'
                        : '1px solid rgba(255,255,255,0.06)',
                      cursor: selectedTrayId !== null ? 'pointer' : 'default',
                      backgroundColor: cell ? 'transparent' : 'rgba(255,255,255,0.02)',
                      overflow: 'hidden',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {cell && (
                      <div style={{
                        width: '100%', height: '100%',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: `${boardSize}px ${boardSize}px`,
                        backgroundPosition: `-${(cell.pieceId % gridSize) * pieceSize}px -${Math.floor(cell.pieceId / gridSize) * pieceSize}px`,
                        opacity: cell.correct ? 1 : 0.6,
                        filter: cell.correct ? 'none' : 'grayscale(20%)',
                        transition: 'opacity 0.3s',
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tray */}
        <div style={{ maxWidth: 280, width: '100%' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#374151', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Pieces ({tray.length} left)
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            background: '#111927', padding: 12, borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.07)',
            minHeight: 80,
          }}>
            {tray.map(id => (
              <div key={id} onClick={() => selectTrayPiece(id)}>
                <PieceView
                  pieceId={id}
                  gridSize={gridSize}
                  imageUrl={imageUrl}
                  pieceSize={Math.min(68, Math.floor(240 / Math.max(gridSize, 3)))}
                  selected={selectedTrayId === id}
                />
              </div>
            ))}
            {tray.length === 0 && (
              <p style={{ color: '#374151', fontSize: '0.8rem', width: '100%', textAlign: 'center', padding: '12px 0' }}>
                All pieces placed!
              </p>
            )}
          </div>
          {selectedTrayId !== null && (
            <p style={{ fontSize: '0.75rem', color: '#FBBF24', textAlign: 'center', marginTop: 10, fontWeight: 600 }}>
              Tap a board slot to place
            </p>
          )}
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
            background: 'linear-gradient(145deg, #1E1A10 0%, #111927 100%)',
            border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 28, padding: 40,
            maxWidth: 360, width: '100%', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            animation: 'fadeUp 0.3s cubic-bezier(.34,1.56,.64,1)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🧩</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F0F6FC', marginBottom: 6 }}>Complete!</h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: 28 }}>{level.label} · {formatTime(seconds)}</p>
            <button
              onClick={() => startPuzzle(level.id, imageSeed)}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(251,191,36,0.2)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = ACCENT_DIM)}
              style={{
                width: '100%', padding: '14px 0',
                background: ACCENT_DIM, border: `1px solid rgba(251,191,36,0.35)`,
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
