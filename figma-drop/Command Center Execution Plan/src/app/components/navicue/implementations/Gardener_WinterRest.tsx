/**
 * GARDENER II #8 — The Winter Rest
 * "Activity is not the only sign of life. Winter is when the roots grow."
 * Pattern C (Hold) — Snow falls; tree looks dead; hold "Sleep" — no activity allowed
 * STEALTH KBE: Holding stillness / accepting dormancy = Restorative Logic / Rest Acceptance (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Ecological Identity', 'embodying', 'Canopy');
type Stage = 'arriving' | 'winter' | 'dreaming' | 'resonant' | 'afterglow';

export default function Gardener_WinterRest({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] WinterRest restAcceptance=confirmed restorativeLogic=true`);
      setStage('dreaming');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('winter'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <span style={{ fontSize: '11px', color: 'hsla(0,0%,80%,0.08)' }}>·</span>
          </motion.div>
        )}
        {stage === 'winter' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Snow falls. The tree looks dead. But it is not dead — it is dreaming. Hold the silence. Respect the dormancy.
            </div>
            {/* Bare tree */}
            <svg width="40" height="40" viewBox="0 0 40 40">
              <line x1="20" y1="38" x2="20" y2="18" stroke={themeColor(TH.primaryHSL, 0.05, 3)} strokeWidth="2" />
              <line x1="20" y1="24" x2="12" y2="16" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" />
              <line x1="20" y1="24" x2="28" y2="14" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" />
              <line x1="20" y1="20" x2="14" y2="10" stroke={themeColor(TH.primaryHSL, 0.03, 1)} strokeWidth="0.5" />
              <line x1="20" y1="20" x2="26" y2="8" stroke={themeColor(TH.primaryHSL, 0.03, 1)} strokeWidth="0.5" />
            </svg>
            <div style={{ fontSize: '11px', color: palette.textFaint, fontStyle: 'italic' }}>
              {hold.isHolding ? `Dreaming... ${Math.round(hold.progress * 100)}%` : '"It is not dead. It is dreaming."'}
            </div>
            <motion.div {...hold.holdProps}
              style={immersiveHoldPillThemed(TH.accentHSL).container(hold.progress)}>
              <div style={immersiveHoldPillThemed(TH.accentHSL).label(hold.progress)}>
                {hold.isHolding ? 'Resting...' : 'Hold to Sleep'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'dreaming' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Dreamed. Activity is not the only sign of life. Winter is when the roots grow. You held the silence. No rushing to spring. No forcing buds. In the dormancy, something was gathering strength. The tree knew what you just learned: rest is not the absence of work. It is the deepest form of work.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Dormancy and restoration. In botany, vernalization is the requirement for cold exposure before spring growth — winter is not optional, it is essential. Sleep science: the glymphatic system clears metabolic waste from the brain during sleep; memory consolidation occurs during rest, not activity. Sabbatical research: forced rest periods increase subsequent creativity and productivity. The Protestant work ethic conflates activity with value. Nature knows better: fallow fields produce richer harvests.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Dormant.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}