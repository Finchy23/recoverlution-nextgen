/**
 * ELEMENTALIST #1 — The Earth Drop (Grounding)
 * "Let the earth carry it. Gravity is free energy."
 * ARCHETYPE: Pattern A (Tap) — Tap "Gravity" to slam jittery rock into dirt
 * ENTRY: Scene-first — floating jittery rock
 * STEALTH KBE: Haptic tap impact = Somatic Grounding (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Canopy');
type Stage = 'arriving' | 'floating' | 'grounded' | 'resonant' | 'afterglow';

export default function Elementalist_EarthDrop({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [dust, setDust] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('floating'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const dropIt = () => {
    if (stage !== 'floating') return;
    setDust(true);
    console.log(`[KBE:E] EarthDrop somaticGrounding=confirmed hapticImpact=true`);
    setStage('grounded');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '18px', height: '18px', borderRadius: radius.xs, background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'floating' && (
          <motion.div key="fl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A floating, jittery rock. Anxiety given form. Tap to apply gravity.
            </div>
            {/* Jittery floating rock */}
            <div style={{ position: 'relative', height: '80px', width: '60px' }}>
              <motion.div animate={{ y: [-4, 4, -4], x: [-2, 2, -2], rotate: [-2, 2, -2] }}
                transition={{ duration: 0.3, repeat: Infinity }}
                style={{ width: '30px', height: '24px', borderRadius: '6px',
                  background: themeColor(TH.primaryHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 6)}`,
                  position: 'absolute', top: '10px', left: '15px' }} />
              {/* Ground line */}
              <div style={{ position: 'absolute', bottom: '0', width: '60px', height: '2px',
                background: themeColor(TH.accentHSL, 0.05, 3), borderRadius: '1px' }} />
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={dropIt}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Gravity ↓</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'grounded' && (
          <motion.div key="gr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', height: '50px', width: '60px' }}>
              <motion.div initial={{ y: -40 }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 8, stiffness: 300 }}
                style={{ width: '30px', height: '24px', borderRadius: '6px',
                  background: themeColor(TH.primaryHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 6)}`,
                  position: 'absolute', bottom: '2px', left: '15px' }} />
              <div style={{ position: 'absolute', bottom: '0', width: '60px', height: '2px',
                background: themeColor(TH.accentHSL, 0.06, 3), borderRadius: '1px' }} />
              {dust && [0, 1, 2, 3].map(i => (
                <motion.div key={i} initial={{ opacity: 0.2, scale: 0.3, x: 30, y: 40 }}
                  animate={{ opacity: 0, scale: 1, x: 30 + (i - 1.5) * 15, y: 30 }}
                  transition={{ duration: 0.8 }}
                  style={{ width: '6px', height: '6px', borderRadius: '50%', position: 'absolute',
                    background: themeColor(TH.accentHSL, 0.04, 2) }} />
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Thud. The rock hits dirt. Dust rises. Your head was in the clouds — your feet needed the earth. Drop the weight. Let the ground carry it. Gravity is free energy.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Somatic grounding. Anxiety lives in the upper body (shallow breath, racing mind). Grounding techniques shift attention downward — to feet on floor, weight on chair, gravity. The 5-4-3-2-1 sensory technique works because it redirects neural processing from the prefrontal cortex (worry) to the somatosensory cortex (physical sensation). The earth has always been carrying you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Grounded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}