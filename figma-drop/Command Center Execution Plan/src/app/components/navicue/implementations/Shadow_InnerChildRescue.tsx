/**
 * SHADOW WORKER #6 — The Inner Child Rescue
 * "Logic will not save the child. The child needs presence."
 * ARCHETYPE: Pattern C (Hold) — Hold to soothe; vibration calms
 * ENTRY: Scene-first — blurred past scene
 * STEALTH KBE: Maintaining hold = Self-Soothing Capacity (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Ocean');
type Stage = 'arriving' | 'active' | 'soothed' | 'resonant' | 'afterglow';

export default function Shadow_InnerChildRescue({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 6000,
    onComplete: () => {
      console.log(`[KBE:E] InnerChildRescue selfSoothing=confirmed`);
      setStage('soothed');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const chaosLevel = 1 - hold.progress;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '50px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2), filter: 'blur(3px)',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A child is crying. Logic won{"'"}t help. Hold the hand.
            </div>
            <motion.div animate={{ x: hold.isHolding ? [0, chaosLevel * 3, -chaosLevel * 3, 0] : [0, 4, -4, 2, 0] }}
              transition={{ duration: hold.isHolding ? 0.5 + hold.progress : 0.3, repeat: Infinity }}
              style={{ width: '20px', height: '26px', borderRadius: '50% 50% 40% 40%',
                background: themeColor(TH.primaryHSL, 0.06 + hold.progress * 0.04, 4),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
            <div {...hold.holdProps}
              style={{ padding: '14px 32px', borderRadius: '9999px', cursor: 'pointer', userSelect: 'none',
                background: hold.isHolding ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.accentHSL, 0.05, 3),
                border: `2px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.15 : 0.08, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>
                {hold.isHolding ? `holding... ${Math.round(hold.progress * 100)}%` : 'Hold the hand'}
              </div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {hold.isHolding ? 'the shaking is calming...' : 'press and hold. be present'}
            </div>
          </motion.div>
        )}
        {stage === 'soothed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '20px', height: '26px', borderRadius: '50% 50% 40% 40%',
              background: themeColor(TH.accentHSL, 0.08, 5),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 7)}` }} />
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Still now. Safe. The adult showed up. The child can rest.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-soothing. Logic will not save the inner child. The child needs presence: a held hand, a patient witness. Being the parent you needed is the deepest form of self-healing. Sit down. Hold the hand. Be present.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Present.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}