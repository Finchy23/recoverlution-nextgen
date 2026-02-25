/**
 * NAVIGATOR #8 — The Joy Snap
 * "Stop. Taste this moment. Let it imprint."
 * INTERACTION: A camera shutter. Tap to snap. A polaroid
 * develops instantly — a moment of joy captured as fuel.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Attention Shift', 'embodying', 'InventorySpark');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const JOY_MOMENTS = [
  'The warmth of this light.',
  'The breath you just took.',
  'That you are still here.',
  'A sound that is not a threat.',
  'The weight of your own hands.',
];

export default function Navigator_JoySnap({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [snapped, setSnapped] = useState(false);
  const [developing, setDeveloping] = useState(false);
  const [moment, setMoment] = useState('');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleSnap = () => {
    if (stage !== 'active' || snapped) return;
    setSnapped(true);
    setMoment(JOY_MOMENTS[Math.floor(Math.random() * JOY_MOMENTS.length)]);
    // Flash effect
    addTimer(() => setDeveloping(true), 300);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3500);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Attention Shift" kbe="embodying" form="InventorySpark" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Stop.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Taste this moment. Let it imprint.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to capture</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            {/* Flash overlay */}
            {snapped && !developing && (
              <motion.div initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }}
                style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 100, pointerEvents: 'none' }} />
            )}
            {!snapped ? (
              /* Shutter button */
              <motion.button onClick={handleSnap} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}
                style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'transparent', border: `3px solid ${palette.primary}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: palette.primaryGlow }} />
              </motion.button>
            ) : (
              /* Polaroid developing */
              <motion.div initial={{ opacity: 0, y: 20, rotateZ: -3 }} animate={{ opacity: 1, y: 0, rotateZ: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: '180px', padding: '12px 12px 40px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: radius.xs, border: `1px solid ${palette.primaryFaint}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Photo area */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: developing ? 0.6 : 0 }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  style={{ width: '100%', aspectRatio: '1', background: `radial-gradient(circle, ${palette.primaryGlow}, ${palette.primaryFaint})`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                  <div style={{ ...navicueType.texture, color: palette.text, textAlign: 'center', fontSize: '13px' }}>
                    {moment}
                  </div>
                </motion.div>
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {snapped ? 'developing...' : 'find one thing that is okay'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Captured. Imprinted.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Fuel for the dark days.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The crack where the light gets in.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}