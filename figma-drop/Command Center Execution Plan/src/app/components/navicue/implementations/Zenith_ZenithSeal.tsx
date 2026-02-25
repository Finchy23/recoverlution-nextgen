/**
 * ZENITH #10 — The Zenith Seal (Peak Experience)
 * "You have seen the view. You can never un-see it."
 * ARCHETYPE: Pattern A (Tap) — Flag planted on peak
 * ENTRY: Cold open — wind-whipped flag
 * STEALTH KBE: Completion = Peak Experience (Maslow)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Identity Koan');
type Stage = 'arriving' | 'flag' | 'seen' | 'resonant' | 'afterglow';

export default function Zenith_ZenithSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('flag'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const plant = () => {
    if (stage !== 'flag') return;
    console.log(`[KBE:K] ZenithSeal peakExperience=confirmed maslow=true`);
    setStage('seen');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ position: 'relative', width: '20px', height: '30px' }}>
              <div style={{ width: '2px', height: '30px', background: themeColor(TH.primaryHSL, 0.06, 3), position: 'absolute', left: '2px' }} />
              <motion.div animate={{ scaleX: [1, 0.9, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                style={{ width: '12px', height: '8px', position: 'absolute', top: '2px', left: '4px',
                  background: themeColor(TH.accentHSL, 0.04, 2), borderRadius: '1px' }} />
            </motion.div>
        )}
        {stage === 'flag' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Flag on peak */}
            <div style={{ position: 'relative', width: '40px', height: '50px' }}>
              <div style={{ position: 'absolute', bottom: 0, left: '18px',
                width: '3px', height: '40px', borderRadius: '1px',
                background: themeColor(TH.primaryHSL, 0.08, 4) }} />
              <motion.div animate={{ scaleX: [1, 0.85, 1.05, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ position: 'absolute', top: '4px', left: '21px',
                  width: '16px', height: '10px', borderRadius: '1px',
                  background: themeColor(TH.accentHSL, 0.08, 5),
                  transformOrigin: 'left center' }} />
              {/* Peak triangle */}
              <div style={{ position: 'absolute', bottom: 0, left: '5px', right: '5px',
                height: '12px', background: themeColor(TH.primaryHSL, 0.04, 2),
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              A flag on the peak. The wind whips it. It does not tear.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={plant}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Plant</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'seen' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Planted. You have seen the view. You can never un-see it. The wind tested the flag. It held. The summit is not a destination; it{"'"}s a vantage point. What you saw from up there changes everything down below.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Peak experience. Abraham Maslow: "The peak experience is a moment of highest happiness and fulfillment," characterized by feelings of ecstasy, unity, and interconnectedness. These moments are not the reward for climbing; they are the purpose. Once you{"'"}ve seen the view from the summit, you carry it back down. The altitude becomes internal. You can never un-see it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Zenith.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}