/**
 * WEAVER #8 — The Bridge of Opposites
 * "Strength and softness. Control and surrender."
 * INTERACTION: Opposite qualities on either side. Tap to build a
 * bridge between each pair — not choosing, but integrating.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Self-Compassion', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const OPPOSITES = [
  { left: 'Strength', right: 'Softness', bridge: 'Gentle power.' },
  { left: 'Control', right: 'Surrender', bridge: 'Directed trust.' },
  { left: 'Solitude', right: 'Belonging', bridge: 'Whole together.' },
  { left: 'Grief', right: 'Gratitude', bridge: 'Love remembered.' },
];

export default function Weaver_BridgeOfOpposites({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [bridged, setBridged] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleBridge = (i: number) => {
    if (stage !== 'active' || bridged.includes(i)) return;
    if (i !== bridged.length) return;
    const next = [...bridged, i];
    setBridged(next);
    if (next.length >= OPPOSITES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Self-Compassion" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Opposites. Or are they?
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Build bridges between opposites.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each pair to connect them</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '300px' }}>
            {OPPOSITES.map((o, i) => {
              const isBridged = bridged.includes(i);
              const isNext = i === bridged.length;
              return (
                <motion.button key={i} onClick={() => handleBridge(i)}
                  animate={{ opacity: isBridged ? 0.8 : isNext ? 0.4 : 0.15 }}
                  whileHover={isNext ? { opacity: 0.6 } : undefined}
                  style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isBridged ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isNext ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ ...navicueType.texture, color: palette.text, fontSize: '12px' }}>{o.left}</span>
                  <motion.div animate={{ width: isBridged ? '40px' : '20px', opacity: isBridged ? 0.5 : 0.1 }}
                    style={{ height: '1px', background: isBridged ? palette.accent : palette.primaryFaint, flexShrink: 0 }} />
                  {isBridged && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                      style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', position: 'absolute', left: '50%', transform: 'translateX(-50%) translateY(-10px)' }}>
                      {o.bridge}
                    </motion.span>
                  )}
                  <span style={{ ...navicueType.texture, color: palette.text, fontSize: '12px' }}>{o.right}</span>
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '4px' }}>{bridged.length} of {OPPOSITES.length} bridged</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every opposition is an invitation to integrate.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You are the bridge.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Not either/or. Both/and.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}