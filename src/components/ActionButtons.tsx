import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const ICONS = {
  undo:  '↩',
  erase: '⌫',
  notes: '✏️',
  hint:  '💡',
};

export default function ActionButtons() {
  const undo        = useGameStore(s => s.undo);
  const erase       = useGameStore(s => s.erase);
  const toggleNotes = useGameStore(s => s.toggleNotes);
  const useHint     = useGameStore(s => s.useHint);
  const isNotesMode = useGameStore(s => s.isNotesMode);
  const hintsLeft   = useGameStore(s => s.hintsLeft);
  const history     = useGameStore(s => s.history);
  const isComplete  = useGameStore(s => s.isComplete);
  const [pressing, setPressing] = useState<string | null>(null);

  const actions = [
    { id: 'undo',  label: 'Undo',  sub: undefined,           onClick: undo,        disabled: history.length === 0 || isComplete, active: false },
    { id: 'erase', label: 'Erase', sub: undefined,           onClick: erase,       disabled: isComplete,                          active: false },
    { id: 'notes', label: 'Notes', sub: isNotesMode ? 'ON' : 'OFF', onClick: toggleNotes, disabled: isComplete, active: isNotesMode },
    { id: 'hint',  label: 'Hint',  sub: `${hintsLeft}`,      onClick: useHint,     disabled: hintsLeft <= 0 || isComplete,       active: false },
  ] as const;

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {actions.map(action => (
        <button
          key={action.id}
          onMouseDown={() => setPressing(action.id)}
          onMouseUp={() => { setPressing(null); if (!action.disabled) action.onClick(); }}
          onMouseLeave={() => setPressing(null)}
          disabled={action.disabled}
          style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4,
            padding: '10px 14px',
            background: action.active
              ? 'rgba(79,142,247,0.18)'
              : pressing === action.id
              ? 'rgba(255,255,255,0.08)'
              : 'linear-gradient(145deg, #1A2235 0%, #141B2D 100%)',
            border: action.active
              ? '1px solid rgba(79,142,247,0.4)'
              : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14,
            cursor: action.disabled ? 'not-allowed' : 'pointer',
            opacity: action.disabled ? 0.3 : 1,
            transform: pressing === action.id ? 'scale(0.94)' : 'scale(1)',
            transition: 'all 0.1s ease',
            minWidth: 56,
            flex: 1,
          }}
        >
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{ICONS[action.id]}</span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, color: action.active ? '#60A5FA' : '#8B949E',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            {action.label}
          </span>
          {action.sub !== undefined && (
            <span style={{
              fontSize: '0.6rem', fontWeight: 800,
              color: action.active ? '#4F8EF7' : '#484F58',
            }}>
              {action.sub}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
