/**
 * INFINITE PLAYER II #6 — The Sunrise (Begin Again)
 * "Every day is Day One."
 * Pattern A (Hold) — Watch sun rise; patience and focus = Mindfulness / Presence (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'dark' | 'dawn' | 'resonant' | 'afterglow';

export default function Horizon_Sunrise({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('dark'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      if (stage !== 'dark') return;
      console.log(`[KBE:E] Sunrise patienceHeld=true mindfulness=true presence=true`);
      setStage('dawn');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '1px', background: themeColor(TH.primaryHSL, 0.05, 2) }} />
          </motion.div>
        )}
        {stage === 'dark' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '180px', height: '70px', overflow: 'hidden', borderRadius: radius.xs }}>
              {/* Horizon line */}
              <div style={{ position: 'absolute', bottom: '20px', width: '100%', height: '1px',
                background: themeColor(TH.primaryHSL, 0.08, 4) }} />
              {/* Sun rising */}
              <motion.div
                animate={{ bottom: hold.isHolding ? `${20 + hold.progress * 30}px` : '16px' }}
                style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.15 + hold.progress * 0.2, 6 + hold.progress * 12)}, transparent)`,
                  boxShadow: `0 0 ${hold.progress * 20}px ${themeColor(TH.accentHSL, hold.progress * 0.15, 8)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Sunset. Dark. Hold to watch the sunrise. Be patient.
            </div>
            <motion.div {...hold.bindHold()} whileTap={{ scale: 0.95 }}
              style={{ padding: '12px 26px', borderRadius: '9999px', cursor: 'pointer',
                background: hold.isHolding ? themeColor(TH.accentHSL, 0.06, 3) : themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.12 : 0.04, 4)}` }}>
              <div style={{ ...navicueType.choice, color: hold.isHolding ? themeColor(TH.accentHSL, 0.4, 12) : palette.textFaint }}>
                {hold.isHolding ? `Watching... ${Math.round(hold.progress * 100)}%` : 'Hold to wait for dawn'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'dawn' && (
          <motion.div key="dn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            Sunrise. Every day is Day One. The past is dead. The future is unborn. Today is the only reality. Begin again. The Stoics practiced this: treat each morning as a new life. Marcus Aurelius: "When you arise in the morning, think of what a privilege it is to be alive."
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Mindfulness (Kabat-Zinn): paying attention, on purpose, in the present moment, non-judgmentally. Research shows even brief mindfulness practice reduces rumination, enhances working memory, and increases cognitive flexibility. The sunrise is the reset button.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Day One.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}