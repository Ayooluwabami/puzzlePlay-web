import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Icon from './Icon';
import { C } from '../../design/tokens';

// Two-tap restart: the first tap arms it ("New?"), the second confirms.
// Skips the confirmation when there's nothing to lose.
export default function RestartButton({ onConfirm, needsConfirm = true, label = 'New puzzle' }: {
  onConfirm: () => void; needsConfirm?: boolean; label?: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 2600);
    return () => clearTimeout(t);
  }, [armed]);

  const handle = () => {
    if (!needsConfirm || armed) { setArmed(false); onConfirm(); }
    else setArmed(true);
  };

  return (
    <div style={{ position: 'relative', width: 42, height: 42 }}>
      <AnimatePresence initial={false}>
        {armed ? (
          <motion.button
            key="armed"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={handle}
            aria-label={`Confirm ${label.toLowerCase()}`}
            style={{
              position: 'absolute', right: 0, top: 0, height: 42, padding: '0 14px',
              borderRadius: 999, background: C.ink, color: C.paper, border: `1.5px solid ${C.ink}`,
              fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer',
            }}
          >New?</motion.button>
        ) : (
          <motion.button
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="icon-btn" onClick={handle} aria-label={label}
            style={{ position: 'absolute', right: 0, top: 0 }}
          >
            <Icon name="restart" size={19} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
