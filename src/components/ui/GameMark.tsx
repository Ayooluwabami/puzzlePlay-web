import { C, GAMES, type GameKey } from '../../design/tokens';

// Illustrated marks for each game, drawn on a 120×120 canvas.
// `plain` draws the mark without its coloured tile (for use on a coloured band).

function SudokuArt() {
  const digits: Record<number, string> = { 0: '5', 2: '3', 4: '7', 6: '1', 8: '9' };
  return (
    <g>
      <rect x="22" y="22" width="76" height="76" rx="8" fill={C.surface} stroke={C.ink} strokeWidth="3" />
      <path d="M47.3 22v76M72.6 22v76M22 47.3h76M22 72.6h76" stroke={C.ink} strokeWidth="2" />
      {Array.from({ length: 9 }, (_, i) => {
        const x = 22 + (i % 3) * 25.3 + 12.65;
        const y = 22 + Math.floor(i / 3) * 25.3 + 12.65;
        if (i === 4) {
          return (
            <g key={i}>
              <rect x={x - 11} y={y - 11} width="22" height="22" rx="3" fill={GAMES.sudoku.color} />
              <text x={x} y={y + 6.5} textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff" fontFamily="Figtree, sans-serif">{digits[i]}</text>
            </g>
          );
        }
        return digits[i]
          ? <text key={i} x={x} y={y + 6.5} textAnchor="middle" fontSize="18" fontWeight="700" fill={C.ink} fontFamily="Figtree, sans-serif">{digits[i]}</text>
          : null;
      })}
    </g>
  );
}

function WordsArt() {
  const letters = ['W', 'O', 'R', 'D', 'A', 'K', 'E', 'S', 'P', 'L', 'U', 'M', 'Z', 'I', 'N', 'G'];
  return (
    <g>
      <rect x="20" y="20" width="80" height="80" rx="8" fill={C.surface} stroke={C.ink} strokeWidth="3" />
      {/* found-word capsule, diagonal */}
      <line x1="32" y1="32" x2="88" y2="88" stroke={GAMES.words.color} strokeWidth="16" strokeLinecap="round" />
      {/* second capsule, horizontal */}
      <line x1="32" y1="32" x2="88" y2="32" stroke={C.ink} strokeOpacity="0.12" strokeWidth="16" strokeLinecap="round" />
      {letters.map((l, i) => (
        <text
          key={i}
          x={32 + (i % 4) * 18.7} y={32 + Math.floor(i / 4) * 18.7 + 5.5}
          textAnchor="middle" fontSize="15" fontWeight="700" fill={C.ink}
          fontFamily="Figtree, sans-serif"
        >{l}</text>
      ))}
    </g>
  );
}

function JigsawArt() {
  // two interlocking pieces, one slightly lifted
  const piece = 'M0 0h18c-3-9 15-9 12 0h18v18c9-3 9 15 0 12v18H30c3 9-15 9-12 0H0z';
  return (
    <g>
      <g transform="translate(22 30)">
        <path d={piece} fill={C.surface} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
        <path d="M8 38l10-12 8 8 6-6 10 10" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="34" cy="13" r="4" fill={C.ink} />
      </g>
      <g transform="translate(58 46) rotate(12 24 24)">
        <path d={piece} fill={GAMES.words.color} stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
      </g>
    </g>
  );
}

const ART: Record<GameKey, () => JSX.Element> = { sudoku: SudokuArt, words: WordsArt, jigsaw: JigsawArt };

export default function GameMark({ game, size = 56, plain = false, tileColor }: {
  game: GameKey; size?: number; plain?: boolean; tileColor?: string;
}) {
  const Art = ART[game];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      {!plain && <rect x="1.5" y="1.5" width="117" height="117" rx="28" fill={tileColor ?? GAMES[game].tint} stroke={C.ink} strokeWidth="3" />}
      <Art />
    </svg>
  );
}
