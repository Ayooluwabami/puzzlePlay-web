import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useJigsawStore } from '../store/jigsawStore';
import { JIGSAW_LEVELS, IMAGE_COUNT, getImageUrl } from '../utils/jigsawData';
import { formatTime } from '../utils/sudokuGenerator';
import LevelScreen from '../components/ui/LevelScreen';
import TopBar from '../components/ui/TopBar';
import RestartButton from '../components/ui/RestartButton';
import CompletionSheet from '../components/ui/CompletionSheet';
import Icon from '../components/ui/Icon';
import { useElementSize } from '../hooks/useElementSize';
import { C, FONT, GAMES } from '../design/tokens';

const G = GAMES.jigsaw;

// ─── Jigsaw shape helpers ─────────────────────────────────────────────────────

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

// ─── SVG piece renderer ───────────────────────────────────────────────────────

interface PieceSVGProps {
  pieceId: number;
  gridSize: number;
  imageUrl: string;
  cellSize: number;
  edges: { top: EdgeType; right: EdgeType; bottom: EdgeType; left: EdgeType };
  correct?: boolean;
  selected?: boolean;
}

function PieceSVG({ pieceId, gridSize, imageUrl, cellSize: s, edges, correct, selected }: PieceSVGProps) {
  const pad = Math.round(s * 0.32);
  const total = s + 2 * pad;
  const row = Math.floor(pieceId / gridSize);
  const col = pieceId % gridSize;
  const uid = `jpc-${pieceId}-${s}-${gridSize}`;
  const path = jigsawPath(s, pad, edges);

  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id={uid}><path d={path} /></clipPath>
      </defs>
      <image
        href={imageUrl}
        x={pad - col * s} y={pad - row * s}
        width={s * gridSize} height={s * gridSize}
        clipPath={`url(#${uid})`}
        preserveAspectRatio="none"
      />
      <path
        d={path} fill="none"
        stroke={selected ? C.ink : correct ? 'none' : 'rgba(23,23,26,0.45)'}
        strokeWidth={selected ? 3 : 1.25}
        style={{ pointerEvents: 'none' }}
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JigsawPage() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'levels' | 'game'>('levels');
  const [previewSeed, setPreviewSeed] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [mainRef, area] = useElementSize<HTMLDivElement>();
  const [trayRef, trayArea] = useElementSize<HTMLDivElement>();

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
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!imageUrl) return;
    setImageLoaded(false);
    const img = new Image();
    img.onload  = () => setImageLoaded(true);
    img.onerror = () => setImageLoaded(true); // fail-open
    img.src = imageUrl;
  }, [imageUrl]);

  const slotAt = (x: number, y: number) => {
    const el = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest('[data-row]') as HTMLElement | null;
    return el?.dataset.row !== undefined && el?.dataset.col !== undefined
      ? { row: Number(el.dataset.row), col: Number(el.dataset.col) } : null;
  };

  // Mouse drag
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!drag) return;
      setDrag(d => d ? { ...d, x: e.clientX, y: e.clientY } : null);
      setDropTarget(slotAt(e.clientX, e.clientY));
    };
    const up = (e: MouseEvent) => {
      if (!drag) return;
      const slot = slotAt(e.clientX, e.clientY);
      if (slot) placeOnBoardById(drag.pieceId, slot.row, slot.col);
      setDrag(null); setDropTarget(null);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [drag, placeOnBoardById]);

  // Touch drag. A touch on a tray piece is only "pending" until it moves:
  // moving toward the board lifts the piece; moving along the tray scrolls it.
  const pendingRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const dragRef = useRef(drag);
  dragRef.current = drag;
  const wideRef = useRef(false);

  useEffect(() => {
    const touchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      const p = pendingRef.current;
      if (!dragRef.current && p) {
        const dx = Math.abs(t.clientX - p.x), dy = Math.abs(t.clientY - p.y);
        if (Math.hypot(dx, dy) < 8) return;
        pendingRef.current = null;
        const towardBoard = wideRef.current ? dx > dy : dy > dx * 0.8;
        if (!towardBoard) return;                    // let the tray scroll
        e.preventDefault();
        setDrag({ pieceId: p.id, x: t.clientX, y: t.clientY });
        return;
      }
      if (!dragRef.current) return;
      e.preventDefault();
      setDrag(d => d ? { ...d, x: t.clientX, y: t.clientY } : null);
      setDropTarget(slotAt(t.clientX, t.clientY));
    };
    const touchUp = (e: TouchEvent) => {
      pendingRef.current = null;
      const d = dragRef.current;
      if (!d) return;
      const t = e.changedTouches[0];
      const slot = slotAt(t.clientX, t.clientY);
      if (slot) placeOnBoardById(d.pieceId, slot.row, slot.col);
      setDrag(null); setDropTarget(null);
    };
    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('touchend', touchUp);
    window.addEventListener('touchcancel', touchUp);
    return () => {
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchUp);
      window.removeEventListener('touchcancel', touchUp);
    };
  }, [placeOnBoardById]);

  // ─── Levels ─────────────────────────────────────────────────────────────────
  if (screen === 'levels') {
    return (
      <LevelScreen
        game="jigsaw"
        onBack={() => navigate('/')}
        levels={JIGSAW_LEVELS.map(l => ({ id: l.id, label: l.label, meta: `${l.gridSize * l.gridSize} pieces · ${l.description.split('—')[1]?.trim() ?? ''}` }))}
        onPick={id => { startPuzzle(id, previewSeed); setScreen('game'); }}
        extra={
          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 2px 10px' }}>
              <p className="eyebrow">Choose a photograph</p>
              <span className="tnum" style={{ fontSize: '0.75rem', fontWeight: 700, color: C.ink3 }}>{previewSeed + 1} / {IMAGE_COUNT}</span>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{
                width: 112, height: 112, flexShrink: 0, borderRadius: 18, overflow: 'hidden',
                border: `1.5px solid ${C.ink}`, boxShadow: `0 4px 0 ${C.ink}`, background: C.paperDeep,
              }}>
                <img key={previewSeed} src={getImageUrl(previewSeed, 240)} alt="Selected photograph"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', animation: 'fadeUp 0.3s ease' }} />
              </div>
              <div className="no-scrollbar" style={{
                display: 'grid', gridTemplateRows: 'repeat(2, 50px)', gridAutoFlow: 'column', gridAutoColumns: '50px',
                gap: 8, overflowX: 'auto', padding: '4px 4px 6px', flex: 1, minWidth: 0,
              }}>
                {Array.from({ length: IMAGE_COUNT }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPreviewSeed(i)}
                    aria-label={`Photograph ${i + 1}`}
                    aria-pressed={previewSeed === i}
                    style={{
                      padding: 0, borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                      border: previewSeed === i ? `2.5px solid ${C.ink}` : `1.5px solid ${C.line}`,
                      transform: previewSeed === i ? 'scale(1.06)' : 'none',
                      transition: 'transform 0.15s, border-color 0.15s', background: C.paperDeep,
                    }}
                  >
                    <img src={getImageUrl(i, 100)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />
    );
  }

  // ─── Game ───────────────────────────────────────────────────────────────────
  const n = level.gridSize;
  const wide = area.width >= 760;
  const TRAY_MIN = 150;
  const boardMax = wide
    ? Math.min(area.height, area.width - 340 - 32, 640)
    : Math.min(area.width, area.height - TRAY_MIN - 14, 560);
  const cellSize = Math.max(14, Math.floor((boardMax - 4) / n));
  const boardPx  = cellSize * n;
  const pad      = Math.round(cellSize * 0.32);

  wideRef.current = wide;
  const trayWidth = wide ? 340 : Math.max(boardPx + 4, Math.min(area.width, 520));
  // Desktop: wrapping grid, 5 across. Phone: a sideways strip, 2 rows tall.
  const trayCellSize = wide
    ? Math.max(18, Math.min(52, Math.floor((trayWidth - 24) / 5 / 1.64)))
    : Math.max(18, Math.min(72, cellSize, Math.floor(((trayArea.height - 16) / 2 - 2) / 1.64)));
  const trayPad  = Math.round(trayCellSize * 0.32);
  const trayBox  = trayCellSize + 2 * trayPad;
  const trayRows = wide ? 0 : Math.max(1, Math.floor((trayArea.height - 16) / (trayBox + 2)));

  const placedCount = board.flat().filter(Boolean).length;
  const total = n * n;

  return (
    <div style={{
      height: '100dvh', background: C.paper,
      paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      touchAction: drag ? 'none' : 'auto',
    }}>
      <TopBar
        title="Jigsaw"
        meta={<>{level.label} · {formatTime(seconds)}</>}
        onBack={() => setScreen('levels')}
        backLabel="Back to levels"
        right={<RestartButton onConfirm={() => newGame(level.id)} needsConfirm={placedCount > 0 && !isComplete} label="New photograph" />}
        progress={board.flat().filter(c => c?.correct).length / total}
        progressColor={isComplete ? C.success : G.color}
      />

      <main ref={mainRef} style={{
        flex: 1, minHeight: 0, width: '100%', maxWidth: 1100, margin: '0 auto',
        display: 'flex', flexDirection: wide ? 'row' : 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: wide ? 32 : 14, padding: wide ? '24px 32px' : '14px 16px 12px',
      }}>
        {area.width > 0 && (
          <>
            {/* Board */}
            <div style={{
              position: 'relative', width: boardPx + 4, height: boardPx + 4, flexShrink: 0,
              background: C.surface, border: `2px solid ${C.ink}`, borderRadius: 10,
              boxShadow: `0 4px 0 ${C.ink}`,
            }}>
              {/* Slot grid */}
              <svg width={boardPx} height={boardPx} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
                {Array.from({ length: n - 1 }, (_, i) => (
                  <g key={i} stroke={C.line} strokeWidth="1" strokeDasharray="3 4">
                    <line x1={(i + 1) * cellSize} y1="0" x2={(i + 1) * cellSize} y2={boardPx} />
                    <line x1="0" y1={(i + 1) * cellSize} x2={boardPx} y2={(i + 1) * cellSize} />
                  </g>
                ))}
              </svg>
              {!imageLoaded && <div className="shimmer" style={{ position: 'absolute', inset: 0, borderRadius: 8, zIndex: 10, pointerEvents: 'none' }} />}
              {Array.from({ length: n }, (_, row) =>
                Array.from({ length: n }, (_, col) => {
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
                      onClick={() => {
                        if (drag) return;
                        if (selectedTrayId !== null) placeOnBoard(row, col);
                        else if (cell) returnToTray(row, col);
                      }}
                      style={{
                        position: 'absolute', left: col * cellSize, top: row * cellSize,
                        width: cellSize, height: cellSize,
                        background: isHintSlot ? G.tint2 : isDropHere ? G.tint : 'transparent',
                        outline: isHintSlot ? `2.5px solid ${C.ink}` : isDropHere ? `2px solid ${G.color}` : 'none',
                        outlineOffset: -2,
                        animation: isHintSlot ? 'hintPulse 1s ease-in-out infinite' : undefined,
                        cursor: cell || selectedTrayId !== null ? 'pointer' : 'default',
                        zIndex: cell ? (cell.correct ? 1 : 2) : 0,
                        transition: 'background-color 0.12s',
                      }}
                    >
                      {cell && (
                        <div style={{ position: 'absolute', left: -pad, top: -pad, pointerEvents: 'none' }}>
                          <PieceSVG
                            pieceId={cell.pieceId} gridSize={n}
                            imageUrl={imageUrl} cellSize={cellSize}
                            edges={getEdges(cell.pieceId)} correct={cell.correct}
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Tray */}
            <section style={{
              width: trayWidth, maxWidth: '100%', alignSelf: wide ? 'center' : 'stretch',
              flex: wide ? undefined : 1, minHeight: 0, maxHeight: wide ? boardPx : undefined,
              display: 'flex', flexDirection: 'column', margin: wide ? undefined : '0 auto',
              background: C.surface, border: `1.5px solid ${C.ink}`, borderRadius: 18, overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                padding: '10px 12px 10px 14px', borderBottom: `1px solid ${C.line}`, flexShrink: 0,
              }}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: FONT.display, fontSize: '1.0625rem', fontWeight: 700 }}>Pieces</span>
                  <span className="tnum" style={{ fontSize: '0.8125rem', fontWeight: 700, color: C.ink3 }}>{placedCount}/{total} placed</span>
                </span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setShowPreview(true)} aria-label="Show the full photograph" style={chip(true)}>
                    <Icon name="eye" size={16} /> Peek
                  </button>
                  <button onClick={useHint} disabled={hintsLeft === 0 || isComplete} aria-label={`Hint, ${hintsLeft} left`} style={chip(hintsLeft > 0)}>
                    <Icon name="bulb" size={16} /> {hintsLeft}
                  </button>
                </span>
              </div>
              <div ref={trayRef} className={wide ? undefined : 'no-scrollbar'} style={wide ? {
                flex: 1, minHeight: 0, overflowY: 'auto', touchAction: drag ? 'none' : 'pan-y',
                display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', justifyContent: 'center',
                gap: 2, padding: 8,
              } : {
                flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden', touchAction: drag ? 'none' : 'pan-x',
                display: 'grid', gridAutoFlow: 'column', gridTemplateRows: `repeat(${trayRows}, ${trayBox}px)`,
                gridAutoColumns: `${trayBox}px`, alignContent: 'center',
                gap: 2, padding: 8,
              }}>
                {tray.map(id => {
                  const isSel = selectedTrayId === id;
                  const isDragged = drag?.pieceId === id;
                  return (
                    <div
                      key={id}
                      style={{
                        width: trayBox, height: trayBox,
                        transform: isSel ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.15s cubic-bezier(0.22,1,0.36,1), opacity 0.12s',
                        cursor: 'grab', opacity: isDragged ? 0.15 : 1,
                        filter: isSel ? 'drop-shadow(0 4px 0 rgba(23,23,26,0.9))' : 'none',
                      }}
                      onMouseDown={e => { e.preventDefault(); setDrag({ pieceId: id, x: e.clientX, y: e.clientY }); }}
                      onTouchStart={e => {
                        const t = e.touches[0];
                        pendingRef.current = { id, x: t.clientX, y: t.clientY };
                      }}
                      onClick={() => selectTrayPiece(id)}
                    >
                      <PieceSVG
                        pieceId={id} gridSize={n}
                        imageUrl={imageUrl} cellSize={trayCellSize}
                        edges={getEdges(id)} selected={isSel}
                      />
                    </div>
                  );
                })}
                {tray.length === 0 && !isComplete && (
                  <p style={{ gridRow: '1 / -1', whiteSpace: 'normal', width: wide ? '100%' : 260, color: C.ink2, fontSize: '0.875rem', fontWeight: 600, padding: '18px 0', textAlign: 'center' }}>
                    All pieces are on the board. Tap a piece to lift it back.
                  </p>
                )}
              </div>
              <div style={{
                flexShrink: 0, padding: '8px 14px', borderTop: `1px solid ${C.line}`,
                fontSize: '0.75rem', fontWeight: 600, color: C.ink3, textAlign: 'center',
              }}>
                {selectedTrayId !== null ? 'Now tap a slot on the board' : wide ? 'Drag a piece onto the board, or tap it then tap a slot' : 'Swipe to browse · drag a piece up onto the board'}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Floating drag ghost */}
      {drag && (
        <div style={{
          position: 'fixed',
          left: drag.x - (cellSize + 2 * pad) / 2, top: drag.y - (cellSize + 2 * pad) / 2 - 24,
          pointerEvents: 'none', zIndex: 100,
          filter: 'drop-shadow(0 8px 0 rgba(23,23,26,0.35))',
        }}>
          <PieceSVG pieceId={drag.pieceId} gridSize={n} imageUrl={imageUrl} cellSize={cellSize} edges={getEdges(drag.pieceId)} />
        </div>
      )}

      {/* Peek at the full photograph */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            key="peek"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPreview(false)}
            role="dialog" aria-modal="true" aria-label="Full photograph"
            style={{
              position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(23,23,26,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              style={{
                width: '100%', maxWidth: 420, background: C.surface, borderRadius: 22,
                border: `1.5px solid ${C.ink}`, boxShadow: `0 5px 0 ${C.ink}`, padding: 12,
              }}
            >
              <img src={imageUrl} alt="The finished puzzle" style={{ width: '100%', aspectRatio: '1', borderRadius: 12, display: 'block', objectFit: 'cover' }} />
              <button className="btn btn-ink press" style={{ width: '100%', marginTop: 12 }} onClick={() => setShowPreview(false)}>
                <Icon name="close" size={18} /> Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isComplete && (
        <CompletionSheet
          game="jigsaw"
          title="Complete."
          subtitle={`${level.label} · ${total} pieces`}
          media={
            <img src={imageUrl} alt="Your finished puzzle" style={{
              width: '100%', aspectRatio: '1', maxHeight: 260, objectFit: 'cover', display: 'block',
              borderRadius: 16, border: `1.5px solid ${C.ink}`,
            }} />
          }
          stats={[
            { label: 'Time', value: formatTime(seconds), highlight: true },
            { label: 'Pieces', value: String(total) },
            { label: 'Hints used', value: String(3 - hintsLeft) },
          ]}
          primary={{ label: 'Next photograph', onClick: () => newGame(level.id) }}
          secondary={[
            { label: 'Play again', onClick: () => startPuzzle(level.id, imageSeed) },
            { label: 'Change level', onClick: () => setScreen('levels') },
          ]}
        />
      )}
    </div>
  );
}

function chip(enabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    height: 32, padding: '0 11px', borderRadius: 999,
    background: enabled ? G.tint : 'transparent',
    border: `1.5px solid ${enabled ? C.ink : C.line}`,
    color: C.ink, fontSize: '0.8125rem', fontWeight: 700,
    cursor: enabled ? 'pointer' : 'default', opacity: enabled ? 1 : 0.45,
  };
}
