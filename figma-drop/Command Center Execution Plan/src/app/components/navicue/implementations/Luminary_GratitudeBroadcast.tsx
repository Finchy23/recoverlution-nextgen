/**
 * LUMINARY #4 — The Gratitude Broadcast
 * "Send gratitude into the dark."
 * INTERACTION: Signal dots in darkness. Tap each to send a gratitude
 * pulse. Watch the signal radiate outward to unseen recipients.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Connection', 'believing', 'InventorySpark');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BROADCASTS = [
  { to: 'Someone who believed in you.', angle: 0 },
  { to: 'Someone who stayed.', angle: 72 },
  { to: 'Someone who let you go.', angle: 144 },
  { to: 'Someone you haven\'t met yet.', angle: 216 },
  { to: 'Yourself.', angle: 288 },
];

export default function Luminary_GratitudeBroadcast({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [sent, setSent] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleSend = () => {
    if (stage !== 'active') return;
    const next = sent.length;
    if (next < BROADCASTS.length) {
      setSent([...sent, next]);
      if (next + 1 >= BROADCASTS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Connection" kbe="believing" form="InventorySpark" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Gratitude in the dark.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Send gratitude into the dark.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to broadcast each signal</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleSend}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
            <div style={{ width: '220px', height: '220px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Center — you */}
              <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ width: '10px', height: '10px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 12px ${palette.accentGlow}`, zIndex: 1 }} />
              {/* Broadcast beams */}
              {BROADCASTS.map((b, i) => {
                const isSent = sent.includes(i);
                const rad = (b.angle * Math.PI) / 180;
                const endX = 50 + Math.cos(rad) * 40;
                const endY = 50 + Math.sin(rad) * 40;
                return isSent ? (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.4, scale: 1 }}
                    transition={{ duration: 1 }}
                    style={{ position: 'absolute', left: `${endX}%`, top: `${endY}%`, transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: palette.accent, boxShadow: `0 0 8px ${palette.accentGlow}` }} />
                ) : null;
              })}
            </div>
            {sent.length > 0 && (
              <motion.div key={sent.length} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.5, y: 0 }}
                style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic', textAlign: 'center', maxWidth: '240px' }}>
                {BROADCASTS[sent[sent.length - 1]].to}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{sent.length} of {BROADCASTS.length} sent</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Gratitude travels further than you think.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Even the signals they never receive change you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Keep broadcasting.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
