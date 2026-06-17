import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJigsawStore } from '../store/jigsawStore';
import { JIGSAW_LEVELS, IMAGE_COUNT, getImageUrl } from '../utils/jigsawData';
import { formatTime } from '../utils/sudokuGenerator';

const PAGE_BG       = '#0B0F1A';
const BOARD_BG      = '#1A1F2E';
const TRAY_BG       = '#131720';
const ACCENT        = '#F59E0B';
const ACCENT_DIM    = 'rgba(245,158,11,0.1)';
const ACCENT_BORDER = 'rgba(245,158,11,0.22)';
const BDR           = 'rgba(255,255,255,0.08)';
const T1            = '#F1F5F9';
const T2            = '#94A3B8';
const T3            = '#475569';

// ─── Jigsaw shape helpers ────────────────────────────────────────────────────

type EdgeType = -1 | 0 | 1;

function buildEdgeTypes(gridSize: number, seed: number) {
  let s = (seed * 1664525 + 1013904223) & 0x7fffffff;
  const rng = () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
  const h: EdgeType[][] = Array.from({ length: Math.max(gridSize - 1, 0) }, () =>
    Array.from({ length: gridSize }, () => (rng() > 0.5 ? 1 : -1) as EdgeType)
  );
  const v: EdgeType[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: Math.max(gridSize - 1, 0) }, () => (rng() > 0.5 ? 1 : -1) as EdgeType)
  );
  return { h, v };
}

function getPieceEdges(row: number, col: number, gridSize: number, h: EdgeType[][], v: EdgeType[][]): { top: EdgeType; right: EdgeType; bottom: EdgeType; left: EdgeType } {
  return {
    top:    row === 0            ? 0 : ((-h[row - 1][col]) as EdgeType),
    bottom: row === gridSize - 1 ? 0 : h[row][col],
    left:   col === 0            ? 0 : ((-v[row][col - 1]) as EdgeType),
    right:  col === gridSize - 1 ? 0 : v[row][col],
  };
}

function drawEdge(x0: number, y0: number, x1: number, y1: number, tab: EdgeType, ox: number, oy: number): string {
  if (tab === 0) return `L ${x1} ${y1}`;
  const dx = x1 - x0, dy = y1 - y0;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  const w = len * 0.38, h = len * 0.26 * tab;
  const m = (len - w) / 2;
  const sx = x0 + ux * m, sy = y0 + uy * m;
  const ex = x0 + ux * (m + w), ey = y0 + uy * (m + w);
  const mx = x0 + ux * (len / 2) + ox * h, my = y0 + uy * (len / 2) + oy * h;
  const c1x = sx + ox * h * 0.75, c1y = sy + oy * h * 0.75;
  const c2x = mx - ux * w * 0.28, c2y = my - uy * w * 0.28;
  const c3x = mx + ux * w * 0.28, c3y = my + uy * w * 0.28;
  const c4x = ex + ox * h * 0.75, c4y = ey + oy * h * 0.75;
  return `L ${sx} ${sy} C ${c1x} ${c1y} ${c2x} ${c2y} ${mx} ${my} C ${c3x} ${c3y} ${c4x} ${c4y} ${ex} ${ey} L ${x1} ${y1}`;
}

function jigsawPath(s: number, p: number, edges: { top: EdgeType; right: EdgeType; bottom: EdgeType; left: EdgeType }): string {
  const [x0, y0, x1, y1] = [p, p, p + s, p + s];
  return [
    `M ${x0} ${y0}`,
    drawEdge(x0, y0, x1, y0, edges.top,    0, -1),
    drawEdge(x1, y0, x1, y1, edges.right,  1,  0),
    drawEdge(x1, y1, x0, y1, edges.bottom, 0,  1),
    drawEdge(x0, y1, x0, y0, edges.left,  -1,  0),
    'Z',
  ].join(' ');
}

// ─── SVG piece renderer ──────────────────────────────────────────────────────

interface PieceSVGProps {
  pieceId: number;
  gridSize: number;
  imageUrl: string;
  cellSize: number;
  edges: { top: EdgeType; right: EdgeType; bottom: EdgeType; left: EdgeType };
  glowColor?: string;
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
}

function PieceSVG({ pieceId, gridSize, imageUrl, cellSize: s, edges, glowColor, style, onMouseDown, onClick }: PieceSVGProps) {
  const pad = Math.round(s * 0.32);
  const total = s + 2 * pad;
  const row = Math.floor(pieceId / gridSize);
  const col = pieceId % gridSize;
  const uid = `jpc-${pieceId}-${s}-${gridSize}`;
  const path = jigsawPath(s, pad, edges);

  return (
    <svg
      width={total} height={total}
      viewBox={`0 0 ${total} ${total}`}
      style={{ display: 'block', overflow: 'visible', cursor: onMouseDown ? 'grab' : onClick ? 'pointer' : 'default', ...style }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <defs>
        <clipPath id={uid}><path d={path} /></clipPath>
        {glowColor && (
          <filter id={`gf-${uid}`}>
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={glowColor} floodOpacity="0.9" />
          </filter>
        )}
      </defs>
      <image
        href={imageUrl}
        x={pad - col * s} y={pad - row * s}
        width={s * gridSize} height={s * gridSize}
        clipPath={`url(#${uid})`}
        style={{ userSelect: 'none' }}
      />
      <path
        d={path} fill="none"
        stroke={glowColor ?? 'rgba(255,255,255,0.2)'}
        strokeWidth={glowColor ? 2.5 : 1}
        filter={glowColor ? `url(#gf-${uid})` : undefined}
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function JigsawPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'levels' | 'game'>('levels');
  const [previewSeed, setPreviewSeed] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const {
    level, imageUrl, imageSeed, tray, board, selectedTrayId,
    hintsLeft, hintCell, flashCorrect,
    startPuzzle, newGame, selectTrayPiece, placeOnBoard, placeOnBoardById, returnToTray,
    useHint, tick, seconds, isComplete,
  } = useJigsawStore();

  useEffect(() => {
    if (screen !== 'game') return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick, screen]);

  const edgeData = useMemo(() => buildEdgeTypes(level.gridSize, imageSeed), [level.gridSize, imageSeed]);

  const getEdges = useCallback((pieceId: number) => {
    const row = Math.floor(pieceId / level.gridSize);
    const col = pieceId % level.gridSize;
    return getPieceEdges(row, col, level.gridSize, edgeData.h, edgeData.v);
  }, [level.gridSize, edgeData]);

  // Drag state
  const [drag, setDrag] = useState<{ pieceId: number; x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => { if (drag) setDrag(d => d ? { ...d, x: e.clientX, y: e.clientY } : null); };
    const up = (e: MouseEvent) => {
      if (!drag) return;
      const el = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement)?.closest('[data-row]') as HTMLElement | null;
      if (el?.dataset.row !== undefined && el?.dataset.col !== undefined) {
        placeOnBoardById(drag.pieceId, Number(el.dataset.row), Number(el.dataset.col));
      }
      setDrag(null); setDropTarget(null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [drag, placeOnBoardById]);

  // Responsive sizing
  const vw = typeof window !== 'undefined' ? window.innerWidth : 900;
  const isMobile = vw < 700;
  const maxBoard = isMobile ? Math.min(vw - 24, 400) : Math.min(vw * 0.52, 560);
  const minCell = isMobile ? 20 : 26;
  const cellSize = Math.max(minCell, Math.floor(maxBoard / level.gridSize));
  const boardPx = cellSize * level.gridSize;
  const pad = Math.round(cellSize * 0.32);

  // Tray: fit pieces across available width
  const trayWidth = isMobile ? Math.min(vw - 32, boardPx) : 280;
  const trayColumns = Math.min(level.gridSize, isMobile ? 5 : 7);
  const trayCellSize = Math.max(14, Math.min(isMobile ? 50 : 62, Math.floor(trayWidth / trayColumns) - 6));

  const placedCount = board.flat().filter(Boolean).length;

  // ─── Levels screen ────────────────────────────────────────────────────────
  if (screen === 'levels') {
    return (
      <div style={{
        minHeight: '100vh', background: PAGE_BG,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(24px,5vh,48px) 16px', position: 'relative',
      }}>
        <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => navigate('/')}
            onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = T3)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, color: T3,
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 28px', transition: 'color 0.15s',
            }}
          >← All Games</button>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64, borderRadius: 18,
              background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`,
              fontSize: 28, marginBottom: 16,
            }}>🧩</div>
            <h1 style={{ fontSize: '2.4rem', lineHeight: 1.1, marginBottom: 8, fontWeight: 900, color: T1 }}>
              Jigsaw
            </h1>
            <p style={{ color: T2, fontSize: '0.875rem', lineHeight: 1.65 }}>
              Piece together beautiful photographs
            </p>
          </div>

          {/* Photo picker — scrollable row of all images */}
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, color: T3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              Choose Photo ({IMAGE_COUNT} available)
            </p>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'thin' }}>
              {Array.from({ length: IMAGE_COUNT }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewSeed(i)}
                  style={{
                    flexShrink: 0, padding: 0, border: 'none', borderRadius: 8,
                    overflow: 'hidden', cursor: 'pointer',
                    outline: previewSeed === i ? `2.5px solid ${ACCENT}` : `2px solid ${BDR}`,
                    outlineOffset: 2, transition: 'outline 0.15s',
                  }}
                >
                  <img src={getImageUrl(i, 48)} alt="" style={{ width: 44, height: 44, display: 'block' }} />
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '0.62rem', fontWeight: 700, color: T3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            Choose Difficulty
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {JIGSAW_LEVELS.map(lvl => (
              <button
                key={lvl.id}
                onClick={() => { startPuzzle(lvl.id, previewSeed); setScreen('game'); }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#1F2537';
                  (e.currentTarget as HTMLElement).style.borderColor = `${ACCENT}30`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '#1A1F2E';
                  (e.currentTarget as HTMLElement).style.borderColor = BDR;
                  (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#1A1F2E',
                  border: `1px solid ${BDR}`,
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.18s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.07em',
                      padding: '2px 8px', borderRadius: 100,
                      background: ACCENT_DIM, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, textTransform: 'uppercase',
                    }}>{lvl.label}</span>
                    <span style={{ fontSize: '0.72rem', color: T3 }}>{lvl.gridSize}×{lvl.gridSize} = {lvl.gridSize * lvl.gridSize} pieces</span>
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

  // ─── Game screen ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: PAGE_BG, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(11,15,26,0.9)', borderBottom: `1px solid ${BDR}`,
        backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 20,
        flexWrap: 'wrap', gap: 8,
      }}>
        <button
          onClick={() => setScreen('levels')}
          onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
          onMouseLeave={e => (e.currentTarget.style.color = T3)}
          style={{ color: T3, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
        >← Levels</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setShowPreview(true)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = ACCENT_BORDER)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
              borderRadius: 20, background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`,
              color: ACCENT, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'border-color 0.15s',
            }}
          >👁 Preview</button>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: T1, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(seconds)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={useHint}
            disabled={hintsLeft === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20,
              background: hintsLeft > 0 ? ACCENT_DIM : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hintsLeft > 0 ? ACCENT_BORDER : BDR}`,
              color: hintsLeft > 0 ? ACCENT : T3,
              fontSize: '0.7rem', fontWeight: 700, cursor: hintsLeft > 0 ? 'pointer' : 'not-allowed',
            }}
          >💡 {hintsLeft}</button>
          <button
            onClick={() => newGame(level.id)}
            onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
            onMouseLeave={e => (e.currentTarget.style.color = T3)}
            style={{ color: T3, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
          >New</button>
        </div>
      </div>

      <main style={{
        flex: 1, display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        justifyContent: 'center',
        gap: 20, padding: '16px 12px 28px',
      }}>
        {/* Board */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: '0.58rem', fontWeight: 700, color: T3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Board</p>
            <p style={{ fontSize: '0.62rem', color: T2, fontWeight: 600 }}>
              {placedCount}/{level.gridSize * level.gridSize} · tap placed piece to return
            </p>
          </div>
          <div style={{
            position: 'relative', width: boardPx, height: boardPx,
            background: BOARD_BG, borderRadius: 12,
            border: `1px solid ${BDR}`,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}>
            {Array.from({ length: level.gridSize }, (_, row) =>
              Array.from({ length: level.gridSize }, (_, col) => {
                const cell = board[row]?.[col];
                const isHintSlot = hintCell?.row === row && hintCell?.col === col;
                const isDropHere = dropTarget?.row === row && dropTarget?.col === col;
                const isFlashing = cell ? flashCorrect.includes(cell.pieceId) : false;
                return (
                  <div
                    key={`${row}-${col}`}
                    data-row={row}
                    data-col={col}
                    className={isFlashing ? 'piece-correct-flash' : undefined}
                    onMouseEnter={() => drag && setDropTarget({ row, col })}
                    onMouseLeave={() => drag && setDropTarget(null)}
                    onClick={() => {
                      if (drag) return;
                      if (selectedTrayId !== null) placeOnBoard(row, col);
                      else if (cell) returnToTray(row, col);
                    }}
                    style={{
                      position: 'absolute',
                      left: col * cellSize, top: row * cellSize,
                      width: cellSize, height: cellSize,
                      border: isHintSlot
                        ? '2px solid #FBBF24'
                        : isDropHere
                        ? '2px dashed rgba(124,58,237,0.6)'
                        : cell?.correct
                        ? '1px solid rgba(52,211,153,0.3)'
                        : '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 2,
                      backgroundColor: isHintSlot ? 'rgba(251,191,36,0.12)' : cell ? 'transparent' : 'rgba(255,255,255,0.4)',
                      boxShadow: isHintSlot ? '0 0 14px rgba(251,191,36,0.5)' : 'none',
                      transition: 'border-color 0.12s',
                      cursor: cell ? 'pointer' : 'default',
                      overflow: 'visible', zIndex: cell ? 1 : 0,
                    }}
                  >
                    {cell && (
                      <div style={{ position: 'absolute', left: -pad, top: -pad, zIndex: 2, pointerEvents: 'none' }}>
                        <PieceSVG
                          pieceId={cell.pieceId}
                          gridSize={level.gridSize}
                          imageUrl={imageUrl}
                          cellSize={cellSize}
                          edges={getEdges(cell.pieceId)}
                          glowColor={cell.correct ? 'rgba(52,211,153,0.6)' : undefined}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tray */}
        <div style={{ maxWidth: isMobile ? boardPx : 300, width: '100%' }}>
          <p style={{ fontSize: '0.58rem', fontWeight: 700, color: T3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Pieces ({tray.length}) · drag to board
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start',
            background: TRAY_BG, padding: 10, borderRadius: 14,
            border: `1px solid ${BDR}`,
            minHeight: 80, maxHeight: isMobile ? 220 : 460, overflowY: 'auto',
          }}>
            {tray.map(id => {
              const isSel = selectedTrayId === id;
              const isDragged = drag?.pieceId === id;
              const trayPad = Math.round(trayCellSize * 0.32);
              return (
                <div
                  key={id}
                  style={{
                    outline: isSel ? `2px solid ${ACCENT}` : '2px solid transparent',
                    borderRadius: 6, transition: 'outline 0.12s, transform 0.12s, opacity 0.12s',
                    transform: isSel ? 'scale(1.07)' : 'scale(1)',
                    cursor: 'grab', opacity: isDragged ? 0.25 : 1,
                    width: trayCellSize + 2 * trayPad,
                    height: trayCellSize + 2 * trayPad,
                  }}
                  onMouseDown={e => { e.preventDefault(); setDrag({ pieceId: id, x: e.clientX, y: e.clientY }); }}
                  onClick={() => selectTrayPiece(id)}
                >
                  <PieceSVG
                    pieceId={id}
                    gridSize={level.gridSize}
                    imageUrl={imageUrl}
                    cellSize={trayCellSize}
                    edges={getEdges(id)}
                  />
                </div>
              );
            })}
            {tray.length === 0 && (
              <p style={{ color: ACCENT, fontSize: '0.8rem', width: '100%', textAlign: 'center', padding: '16px 0' }}>
                All pieces placed!
              </p>
            )}
          </div>
          {selectedTrayId !== null && !drag && (
            <p style={{ fontSize: '0.7rem', color: ACCENT, textAlign: 'center', marginTop: 8, fontWeight: 600 }}>
              Click a board slot to place
            </p>
          )}
        </div>
      </main>

      {/* Floating drag ghost */}
      {drag && (() => {
        const gPad = Math.round(trayCellSize * 0.32);
        const gTotal = trayCellSize + 2 * gPad;
        return (
          <div style={{
            position: 'fixed',
            left: drag.x - gTotal / 2, top: drag.y - gTotal / 2,
            pointerEvents: 'none', zIndex: 100,
            opacity: 0.88, transform: 'scale(1.12)',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.7))',
          }}>
            <PieceSVG
              pieceId={drag.pieceId}
              gridSize={level.gridSize}
              imageUrl={imageUrl}
              cellSize={trayCellSize}
              edges={getEdges(drag.pieceId)}
            />
          </div>
        );
      })()}

      {/* Complete image preview modal */}
      {showPreview && (
        <div
          onClick={() => setShowPreview(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#111927', border: `1px solid ${ACCENT_BORDER}`,
              borderRadius: 20, padding: 20, maxWidth: 420, width: '100%', textAlign: 'center',
              animation: 'fadeUp 0.25s cubic-bezier(.34,1.56,.64,1)',
            }}
          >
            <p style={{ fontSize: '0.63rem', fontWeight: 800, letterSpacing: '0.1em', color: ACCENT, textTransform: 'uppercase', marginBottom: 12 }}>
              Complete Image
            </p>
            <img src={imageUrl} alt="Complete puzzle" style={{ width: '100%', borderRadius: 12, display: 'block', border: `1px solid ${ACCENT_BORDER}` }} />
            <button
              onClick={() => setShowPreview(false)}
              style={{
                marginTop: 14, padding: '10px 32px',
                background: ACCENT_DIM, border: `1px solid ${ACCENT_BORDER}`,
                borderRadius: 10, color: ACCENT, fontSize: '0.875rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              }}
            >Got it</button>
          </div>
        </div>
      )}

      {/* Victory modal */}
      {isComplete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: '#1A1F2E',
            border: `1px solid ${BDR}`,
            borderRadius: 24, padding: '32px 28px',
            maxWidth: 320, width: '100%', textAlign: 'center',
            animation: 'fadeUp 0.3s cubic-bezier(.34,1.56,.64,1)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 46, marginBottom: 10 }}>🧩</div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: T1, marginBottom: 4 }}>Complete!</h2>
            <p style={{ color: T2, fontSize: '0.875rem', marginBottom: 16 }}>{level.label} · {formatTime(seconds)}</p>
            <img src={imageUrl} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: 18, border: `1px solid ${BDR}` }} />
            <button
              onClick={() => newGame(level.id)}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#D97706')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = ACCENT)}
              style={{
                width: '100%', padding: '12px 0',
                background: ACCENT, border: 'none',
                borderRadius: 10, color: '#fff', fontSize: '0.92rem', fontWeight: 700,
                cursor: 'pointer', marginBottom: 8, transition: 'background 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >New Game</button>
            <button
              onClick={() => startPuzzle(level.id, imageSeed)}
              onMouseEnter={e => (e.currentTarget.style.color = ACCENT)}
              onMouseLeave={e => (e.currentTarget.style.color = T3)}
              style={{
                width: '100%', padding: '8px 0', background: 'none', border: 'none',
                color: T3, fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', transition: 'color 0.15s', fontFamily: "'DM Sans', sans-serif",
                marginBottom: 4,
              }}
            >Play Again (same photo)</button>
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
