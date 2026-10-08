import type { ReactNode } from 'react';
import Icon from './Icon';
import { C, FONT } from '../../design/tokens';

// Shared top bar for every game screen: back · title/meta · action
export default function TopBar({ title, meta, onBack, backLabel = 'Back', right, progress, progressColor }: {
  title: string;
  meta?: ReactNode;
  onBack: () => void;
  backLabel?: string;
  right?: ReactNode;
  progress?: number;         // 0..1, draws a rule under the bar
  progressColor?: string;
}) {
  return (
    <header style={{ position: 'relative', flexShrink: 0, background: C.paper }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '42px 1fr 42px', alignItems: 'center', gap: 12,
        padding: '10px 16px 12px', maxWidth: 720, margin: '0 auto',
      }}>
        <button className="icon-btn" onClick={onBack} aria-label={backLabel}>
          <Icon name="back" size={20} />
        </button>
        <div style={{ textAlign: 'center', minWidth: 0 }}>
          <div style={{ fontFamily: FONT.display, fontSize: '1.1875rem', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            {title}
          </div>
          {meta && (
            <div className="tnum" style={{ fontSize: '0.8125rem', fontWeight: 600, color: C.ink2, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {meta}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
      </div>
      <div style={{ height: 1.5, background: C.ink, opacity: 0.9 }} />
      {progress !== undefined && (
        <div aria-hidden="true" style={{
          position: 'absolute', left: 0, bottom: -2, height: 4, width: '100%',
          background: progressColor ?? C.ink,
          transform: `scaleX(${Math.max(0, Math.min(1, progress))})`, transformOrigin: 'left',
          transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1), background-color 0.3s',
        }} />
      )}
    </header>
  );
}
