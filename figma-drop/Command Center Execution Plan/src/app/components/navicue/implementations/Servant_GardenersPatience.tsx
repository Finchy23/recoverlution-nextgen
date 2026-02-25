/**
 * SERVANT #4 — The Gardener's Patience
 * "You plant the seed, but you may not see the tree."
 * ARCHETYPE: Pattern A (Tap) — Tap to water repeatedly, sprout appears on 3rd
 * ENTRY: Scene-first — empty soil
 * STEALTH KBE: Continuing without reward = Altruistic Endurance / Delayed Gratification (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'planting' | 'sprouted' | 'resonant' | 'afterglow';

export default function Servant_GardenersPatience({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [waters, setWaters] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('planting'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const water = () => {
    if (stage !== 'planting') return;
    const next = waters + 1;
    setWaters(next);
    if (next >= 3) {
      console.log(`[KBE:B] GardenersPatience waters=${next} altruisticEndurance=confirmed delayedGratification=true`);
      setStage('sprouted');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '4px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
        )}
        {stage === 'planting' && (
          <motion.div key="pl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Water the soil. Trust the season.
            </div>
            {/* Soil with potential */}
            <div style={{ width: '80px', height: '40px', position: 'relative',
              borderRadius: '0 0 8px 8px',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
              borderTop: 'none' }}>
              {waters > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                  style={{ position: 'absolute', top: '-2px', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '8px', color: themeColor(TH.accentHSL, 0.15, 6) }}>
                  {waters}x watered
                </motion.div>
              )}
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic' }}>
              {waters === 0 ? 'Nothing yet.' : waters === 1 ? 'Still nothing.' : 'Keep going...'}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={water}
              style={{ padding: '10px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Water</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sprouted' && (
          <motion.div key="sp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '80px', height: '50px', position: 'relative',
              borderRadius: '0 0 8px 8px',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
              borderTop: 'none' }}>
              {/* Sprout */}
              <motion.div initial={{ height: 0 }} animate={{ height: 16 }}
                transition={{ duration: 1, type: 'spring' }}
                style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                  width: '2px', background: themeColor(TH.accentHSL, 0.15, 8), borderRadius: '1px' }} />
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                style={{ position: 'absolute', bottom: 'calc(100% + 14px)', left: '50%', transform: 'translateX(-50%)',
                  width: '8px', height: '5px', borderRadius: '4px 4px 0 0',
                  background: themeColor(TH.accentHSL, 0.12, 6) }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              A sprout. You watered without evidence. You trusted the season. Helping others is slow — you plant the seed but may not see the tree. The work is the faith.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Delayed gratification in service. Angela Duckworth{"'"}s grit research shows that sustained effort toward long-term goals — especially when feedback is delayed — is the strongest predictor of meaningful achievement. Altruistic endurance is grit{"'"}s moral cousin: continuing to help when you can{"'"}t see the result. Plant the seed. Trust the season. The tree may shade someone you{"'"}ll never meet.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Growing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}