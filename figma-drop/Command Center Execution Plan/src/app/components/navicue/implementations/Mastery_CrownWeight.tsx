/**
 * MAGNUM OPUS II #8 — The Crown Weight
 * "Sovereignty is heavy. Wear the weight."
 * Pattern A (Hold) — Accept crown; screen dips simulating weight
 * STEALTH KBE: Accepting heaviness = Sovereign Agency / Responsibility (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'hovering' | 'crowned' | 'resonant' | 'afterglow';

export default function Mastery_CrownWeight({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('hovering'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const hold = useHoldInteraction({
    duration: 4000,
    onComplete: () => {
      if (stage !== 'hovering') return;
      console.log(`[KBE:E] CrownWeight accepted=true sovereignAgency=true responsibility=true`);
      setStage('crowned');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '12px', borderRadius: '2px 2px 0 0', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'hovering' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <motion.div animate={{ y: hold.isHolding ? [0, 6] : [0, -4, 0] }}
              transition={hold.isHolding ? { duration: 2 } : { repeat: Infinity, duration: 2 }}
              style={{ fontSize: '28px', filter: `drop-shadow(0 ${hold.isHolding ? 2 : 4}px ${hold.isHolding ? 4 : 8}px ${themeColor(TH.accentHSL, 0.1, 4)})` }}>
              &#x1F451;
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A crown hovers. Hold to place it on your head. It is heavy.
            </div>
            <motion.div {...hold.bindHold()} whileTap={{ scale: 0.95 }}
              style={{ padding: '12px 26px', borderRadius: '9999px', cursor: 'pointer',
                background: hold.isHolding ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.14 : 0.06, 4)}` }}>
              <div style={{ ...navicueType.choice, color: hold.isHolding ? themeColor(TH.accentHSL, 0.45, 14) : palette.textFaint }}>
                {hold.isHolding ? `Bearing... ${Math.round(hold.progress * 100)}%` : 'Hold to accept the crown'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'crowned' && (
          <motion.div key="c" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            Uneasy lies the head that wears a crown. Sovereignty is heavy. It means no one is coming to save you. You are the monarch. No one else sets the agenda, excuses the failure, or celebrates the victory. The weight is the proof of your agency.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Extreme Ownership (Willink & Babin): in high-performing teams, the leader takes full responsibility — no blame, no excuses. The crown isn{"'"}t a reward. It{"'"}s an acceptance of total accountability. Heavy? Yes. But lighter than victimhood.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Crowned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}