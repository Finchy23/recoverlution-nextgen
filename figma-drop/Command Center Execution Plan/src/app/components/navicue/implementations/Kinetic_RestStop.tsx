/**
 * KINETIC #9 — The Rest Stop (Active)
 * "Stopping is not quitting. Stopping is strategy. Refuel fast."
 * ARCHETYPE: Pattern A (Tap) — Choose "Scrolling" vs "Breathing" for pit stop
 * ENTRY: Cold open — F1 pit stop
 * STEALTH KBE: Choosing Breathing = Active Recovery knowledge (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'active' | 'refueled' | 'resonant' | 'afterglow';

export default function Kinetic_RestStop({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'scrolling' | 'breathing' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const pick = (c: 'scrolling' | 'breathing') => {
    if (stage !== 'active') return;
    setChoice(c);
    console.log(`[KBE:K] RestStop recovery=${c} activeRecovery=${c === 'breathing'}`);
    setStage('refueled');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.25, 8), letterSpacing: '0.12em' }}>
            PIT STOP
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Pit stop. 2.5 seconds. What do you fill with?
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('scrolling')}
                style={{ padding: '12px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>Scrolling</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('breathing')}
                style={{ padding: '12px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Breathing</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'refueled' && (
          <motion.div key="rf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'breathing'
                ? 'Refueled. Active recovery. Back on track with more than you started.'
                : 'Empty calories. You scrolled but didn\'t recharge. The tires are still worn.'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Active recovery. Stopping is not quitting, it{"'"}s strategy. But what you fill the stop with matters. Scrolling drains attention; breathing restores it. The F1 pit stop: refuel fast, get back on track.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Refueled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}