/**
 * GARDENER II #5 — The Harvest Timing
 * "Patience is not waiting; it is watching."
 * Pattern A (Tap) — Fruit on tree; tap too early = resists; wait for color change = falls
 * STEALTH KBE: Waiting for visual cue before tapping = Patience (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'watching' | 'harvested' | 'resonant' | 'afterglow';

export default function Gardener_HarvestTiming({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [ripe, setRipe] = useState(false);
  const [premature, setPremature] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('watching'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage === 'watching') {
      t(() => setRipe(true), 4000 + Math.random() * 2000);
    }
  }, [stage]);

  const pick = () => {
    if (stage !== 'watching') return;
    if (!ripe) {
      setPremature(c => c + 1);
      return;
    }
    console.log(`[KBE:E] HarvestTiming patience=${premature === 0 ? 'confirmed' : 'challenged'} prematureAttempts=${premature}`);
    setStage('harvested');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'watching' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Fruit on the tree. Watch it. Wait for it to ripen. If you force it, it{"'"}s bitter.
            </div>
            <motion.div
              animate={ripe ? { scale: [1, 1.05, 1] } : {}}
              transition={ripe ? { duration: 1, repeat: 2 } : {}}
              style={{ width: '18px', height: '18px', borderRadius: '50%',
                background: ripe ? themeColor(TH.accentHSL, 0.1, 6) : themeColor(TH.primaryHSL, 0.04, 2),
                transition: 'background 1.5s' }} />
            <div style={{ fontSize: '11px', color: ripe ? themeColor(TH.accentHSL, 0.3, 8) : palette.textFaint }}>
              {ripe ? 'Ripe. Ready.' : 'Not ripe yet...'}
            </div>
            {premature > 0 && !ripe && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontSize: '11px', color: palette.textFaint, fontStyle: 'italic' }}>
                It resists. Not yet. ({premature} attempt{premature > 1 ? 's' : ''})
              </motion.div>
            )}
            <motion.div whileTap={{ scale: 0.9 }} onClick={pick}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Pick</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'harvested' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Harvested. {premature === 0
              ? 'You waited. The fruit fell perfectly into your hand — sweet, ready, complete. Patience is not waiting; it is watching. You watched the color change, the subtle shift, and acted at exactly the right moment.'
              : `You tried ${premature} time${premature > 1 ? 's' : ''} early. The fruit resisted — it wasn't ready. Then it ripened, and it came freely. Patience is not passive. It is active watching. Trust the season.`}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Optimal timing and patience. Walter Mischel{"'"}s marshmallow experiments: the ability to delay gratification at age 4 predicted SAT scores, BMI, substance use, and social competence decades later. But patience is not passive — it is strategic monitoring. Kairos (Greek): the "right moment" as opposed to chronos (sequential time). Expert farmers, comedians, and surgeons all share one skill: timing. Patience is watching with intention, ready to act when the signal arrives.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ripe.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}