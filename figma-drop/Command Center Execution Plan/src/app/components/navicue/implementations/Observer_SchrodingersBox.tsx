/**
 * OBSERVER #1 — Schrödinger's Box
 * "It is both. Until you open it."
 * ARCHETYPE: Pattern A (Tap ×1) — One tap. One decision. Collapse.
 * ENTRY: Cold Open — "OPEN" pulses, the box waits
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function Observer_SchrodingersBox({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [opened, setOpened] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const open = () => {
    if (opened) return;
    setOpened(true);
    t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 4000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0.4, 0.8] }}
            transition={{ duration: 2, times: [0, 0.3, 0.6, 1] }} exit={{ opacity: 0 }}
            style={{ fontSize: '24px', fontFamily: 'serif', letterSpacing: '0.3em', color: palette.text }}>
            OPEN
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The outcome does not exist yet. It is in superposition: all possibilities at once. You hold the key. Do not fear the result.
            </div>
            <motion.div onClick={open}
              animate={opened ? { scaleY: 0.1, opacity: 0.3 } : { scale: [1, 1.02, 1] }}
              transition={opened ? { duration: 0.6 } : { duration: 2, repeat: Infinity }}
              style={{ width: '100px', height: '100px', borderRadius: radius.sm, cursor: opened ? 'default' : 'pointer',
                background: themeColor(TH.primaryHSL, 0.12, 8),
                border: `1px solid ${themeColor(TH.accentHSL, opened ? 0.2 : 0.06, 12)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!opened && (
                <div style={{ fontSize: '20px', opacity: 0.15 }}>?</div>
              )}
            </motion.div>
            {opened && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em',
                  color: themeColor(TH.accentHSL, 0.2, 18) }}>
                COLLAPSED
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Superposition. Before you opened it, every outcome existed simultaneously. Uncertainty is not anxiety: it is infinite potential. You collapsed the wave. Now play the hand.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Both. Until you look.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}