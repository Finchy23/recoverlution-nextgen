/**
 * MAGNUM OPUS II #3 — The Gold Standard
 * "You are the reserve currency. You set the standard."
 * Pattern A (Hold) — Hold the scale steady; balance confirms Internal Valuation
 * STEALTH KBE: Stability of hold = Self-Worth (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'scale' | 'balanced' | 'resonant' | 'afterglow';

export default function Mastery_GoldStandard({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('scale'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const hold = useHoldInteraction({
    duration: 4000,
    onComplete: () => {
      if (stage !== 'scale') return;
      console.log(`[KBE:E] GoldStandard holdSteady=true internalValuation=true selfWorth=confirmed`);
      setStage('balanced');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '2px', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'scale' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Scale beam */}
              <motion.div animate={{ rotate: hold.isHolding ? 0 : [-2, 2, -2] }}
                transition={{ repeat: hold.isHolding ? 0 : Infinity, duration: 1.5 }}
                style={{ width: '160px', height: '2px', background: themeColor(TH.accentHSL, 0.15, 6),
                  position: 'relative' }}>
                {/* Left pan — Gold */}
                <div style={{ position: 'absolute', left: '-10px', top: '8px', textAlign: 'center' }}>
                  <div style={{ width: '40px', height: '24px', borderRadius: '0 0 20px 20px',
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 4)}`, borderTop: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px' }}>Au</span>
                  </div>
                </div>
                {/* Right pan — Your Worth */}
                <div style={{ position: 'absolute', right: '-10px', top: '8px', textAlign: 'center' }}>
                  <div style={{ width: '50px', height: '24px', borderRadius: '0 0 20px 20px',
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 4)}`, borderTop: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '7px', color: palette.textFaint }}>You</span>
                  </div>
                </div>
                {/* Fulcrum */}
                <div style={{ position: 'absolute', left: '50%', top: '-6px', transform: 'translateX(-50%)',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.12, 5) }} />
              </motion.div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A scale. Gold on one side, Your Worth on the other. Hold to steady it.
            </div>
            <motion.div {...hold.bindHold()} whileTap={{ scale: 0.95 }}
              style={{ padding: '12px 26px', borderRadius: '9999px', cursor: 'pointer',
                background: hold.isHolding ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.14 : 0.06, 4)}` }}>
              <div style={{ ...navicueType.choice, color: hold.isHolding ? themeColor(TH.accentHSL, 0.45, 14) : palette.textFaint }}>
                {hold.isHolding ? `Steadying... ${Math.round(hold.progress * 100)}%` : 'Hold to balance'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'balanced' && (
          <motion.div key="bal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            Balanced. Perfectly. Stop looking for the market price. You are the reserve currency. You set the standard. Self-worth that depends on external validation is a currency pegged to someone else's economy. True worth is gold-backed — intrinsic, immutable.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Self-Determination Theory (Deci & Ryan): intrinsic motivation — autonomy, competence, relatedness — produces sustainable well-being. Extrinsic worth metrics (salary, status, likes) are volatile currencies. Your gold standard is internal.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sovereign.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}