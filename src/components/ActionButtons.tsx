import { useGameStore } from '../store/gameStore';
import Icon, { type IconName } from './ui/Icon';
import { C } from '../design/tokens';

export default function ActionButtons() {
  const undo        = useGameStore(s => s.undo);
  const erase       = useGameStore(s => s.erase);
  const toggleNotes = useGameStore(s => s.toggleNotes);
  const useHint     = useGameStore(s => s.useHint);
  const isNotesMode = useGameStore(s => s.isNotesMode);
  const hintsLeft   = useGameStore(s => s.hintsLeft);
  const history     = useGameStore(s => s.history);
  const isComplete  = useGameStore(s => s.isComplete);

  const actions: { id: string; icon: IconName; label: string; aria: string; onClick: () => void; disabled: boolean; active?: boolean; badge?: string }[] = [
    { id: 'undo',  icon: 'undo',   label: 'Undo',  aria: 'Undo last move',      onClick: undo,        disabled: history.length === 0 || isComplete },
    { id: 'erase', icon: 'erase',  label: 'Erase', aria: 'Erase selected cell', onClick: erase,       disabled: isComplete },
    { id: 'notes', icon: 'pencil', label: 'Notes', aria: `Notes mode ${isNotesMode ? 'on' : 'off'}`, onClick: toggleNotes, disabled: isComplete, active: isNotesMode, badge: isNotesMode ? 'ON' : 'OFF' },
    { id: 'hint',  icon: 'bulb',   label: 'Hint',  aria: `Use hint, ${hintsLeft} left`, onClick: useHint, disabled: hintsLeft <= 0 || isComplete, badge: String(hintsLeft) },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
      {actions.map(a => (
        <button
          key={a.id}
          aria-label={a.aria}
          aria-pressed={a.id === 'notes' ? a.active : undefined}
          onClick={a.onClick}
          disabled={a.disabled}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            padding: '6px 0', background: 'none', border: 'none',
            cursor: a.disabled ? 'default' : 'pointer',
            opacity: a.disabled ? 0.35 : 1,
            color: C.ink,
            transition: 'opacity 0.2s',
          }}
        >
          <span style={{
            position: 'relative',
            width: 46, height: 46, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: a.active ? C.ink : 'transparent',
            color: a.active ? C.paper : C.ink,
            border: `1.5px solid ${a.active ? C.ink : C.line}`,
            transition: 'background-color 0.18s, color 0.18s, border-color 0.18s',
          }}>
            <Icon name={a.icon} size={21} />
            {a.badge && (
              <span className="tnum" style={{
                position: 'absolute', top: -4, right: -8,
                minWidth: 20, height: 18, padding: '0 5px', borderRadius: 999,
                background: a.active ? C.surface : C.ink, color: a.active ? C.ink : C.paper,
                border: `1.5px solid ${C.ink}`,
                fontSize: '0.5625rem', fontWeight: 800, letterSpacing: '0.04em',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{a.badge}</span>
            )}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: C.ink2 }}>{a.label}</span>
        </button>
      ))}
    </div>
  );
}
