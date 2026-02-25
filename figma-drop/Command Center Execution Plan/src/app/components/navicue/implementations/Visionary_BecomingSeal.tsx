/**
 * VISIONARY #10 — The Becoming Seal
 * "You are not who you were. Not yet who you'll be."
 * INTERACTION: Three silhouettes — past, present, future. Tap each
 * to acknowledge it. The identity koan: becoming is the identity.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Values Clarification', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SELVES = [
  { label: 'Who you were', sub: 'Honored. Released.', x: 20 },
  { label: 'Who you are', sub: 'Here. Now. Enough.', x: 50 },
  { label: 'Who you\'re becoming', sub: 'Unknown. Luminous.', x: 80 },
];

export default function Visionary_BecomingSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [acknowledged, setAcknowledged] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleAck = (i: number) => {
    if (stage !== 'active' || acknowledged.includes(i)) return;
    if (i !== acknowledged.length) return;
    const next = [...acknowledged, i];
    setAcknowledged(next);
    if (next.length >= SELVES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Values Clarification" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Between who and who.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are not who you were. Not yet who you'll be.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each self to acknowledge it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
              {SELVES.map((s, i) => {
                const isAck = acknowledged.includes(i);
                const isNext = i === acknowledged.length;
                return (
                  <motion.button key={i} onClick={() => handleAck(i)}
                    animate={{ opacity: isAck ? 0.8 : isNext ? 0.3 : 0.1 }}
                    whileHover={isNext ? { opacity: 0.5, scale: 1.05 } : undefined}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: isNext ? 'pointer' : 'default', padding: '12px' }}>
                    {/* Silhouette */}
                    <motion.div
                      animate={{ scale: isAck ? 1 : 0.8, opacity: isAck ? 0.6 : 0.15 }}
                      style={{ width: '40px', height: '60px', borderRadius: `${radius.xl} ${radius.xl} ${radius.sm} ${radius.sm}`, background: isAck ? palette.accent : palette.primaryFaint, boxShadow: isAck ? `0 0 12px ${palette.accentGlow}` : 'none' }} />
                    <div style={{ ...navicueType.hint, color: isAck ? palette.text : palette.textFaint, fontSize: '11px', textAlign: 'center' }}>{s.label}</div>
                    {isAck && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                        style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px' }}>{s.sub}</motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{acknowledged.length} of {SELVES.length}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Becoming is the identity.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You are the verb, not the noun.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Keep becoming.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}