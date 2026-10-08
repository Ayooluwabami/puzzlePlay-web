// Hand-drawn 24px line icons, 2px stroke, round caps — one family, no emoji.

export type IconName =
  | 'back' | 'chevron' | 'restart' | 'undo' | 'erase' | 'pencil'
  | 'bulb' | 'eye' | 'check' | 'trophy' | 'close' | 'grid';

const PATHS: Record<IconName, React.ReactNode> = {
  back:    <path d="M15 5l-7 7 7 7" />,
  chevron: <path d="M9 5l7 7-7 7" />,
  restart: <><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4.5h4.5" /></>,
  undo:    <><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></>,
  erase:   <><path d="M20 20H9L4.6 15.6a2 2 0 0 1 0-2.8l8.8-8.8a2 2 0 0 1 2.8 0l3.6 3.6a2 2 0 0 1 0 2.8L11 19.2" /><path d="M8.5 9.5l6 6" /></>,
  pencil:  <><path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z" /><path d="M13.5 7l3 3" /></>,
  bulb:    <><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2.2h5c.1-1 .5-1.7 1.1-2.2A6 6 0 0 0 12 3z" /></>,
  eye:     <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  check:   <path d="M5 12.5l4.5 4.5L19 7.5" />,
  trophy:  <><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4" /><path d="M12 13v4M9 20h6" /></>,
  close:   <path d="M6 6l12 12M18 6L6 18" />,
  grid:    <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 12h16M12 4v16" /></>,
};

export default function Icon({ name, size = 22, stroke = 2, style }: {
  name: IconName; size?: number; stroke?: number; style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ display: 'block', flexShrink: 0, ...style }}
    >
      {PATHS[name]}
    </svg>
  );
}
