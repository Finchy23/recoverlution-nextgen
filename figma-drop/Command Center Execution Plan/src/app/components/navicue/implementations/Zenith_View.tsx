/**
 * ZENITH #5 — The View (Perspective)
 * "The weather is real, but you are not in it. Rise above."
 * ARCHETYPE: Pattern A (Tap) — 360 pan at summit
 * ENTRY: Scene-first — panoramic vista
 * STEALTH KBE: Identifying storm as external = Meta-Cognition / Observer Self (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'summit' | 'above' | 'resonant' | 'afterglow';

export default function Zenith_View({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('summit'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const see = () => {
    if (stage !== 'summit') return;
    console.log(`[KBE:K] View metaCognition=confirmed observerSelf=true`);
    setStage('above');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '1px', background: themeColor(TH.accentHSL, 0.06, 3) }} />
        )}
        {stage === 'summit' && (
          <motion.div key="su" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            {/* Panoramic */}
            <div style={{ width: '180px', height: '60px', borderRadius: radius.xs, position: 'relative', overflow: 'hidden',
              background: `linear-gradient(180deg, ${themeColor(TH.accentHSL, 0.03, 1)} 40%, ${themeColor(TH.primaryHSL, 0.02, 1)} 100%)` }}>
              {/* Horizon */}
              <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: '1px',
                background: themeColor(TH.accentHSL, 0.06, 4) }} />
              {/* Storm below */}
              <div style={{ position: 'absolute', bottom: '5px', left: '20px', right: '20px', height: '12px',
                borderRadius: '6px', background: themeColor(TH.primaryHSL, 0.03, 2) }} />
              {/* Sun above */}
              <div style={{ position: 'absolute', top: '8px', right: '20px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 6),
                boxShadow: `0 0 8px ${themeColor(TH.accentHSL, 0.04, 4)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Top of the world. The storm below is just a tiny grey carpet. You are above the weather.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={see}
              style={{ padding: '14px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>See</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'above' && (
          <motion.div key="ab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Above the weather. The storm is real, but you{"'"}re not in it anymore. From up here, the problems that consumed you are just a grey carpet far below. The sun is always shining above the clouds. Rise above. Perspective is altitude.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Meta-cognition. The "Observer Self" (ACT therapy): the capacity to observe your own thoughts and emotions without being consumed by them. From the summit, the weather is visible but not immersive. This psychological distance (Kross & Ayduk{"'"}s research) reduces emotional reactivity by up to 50%. You are not the storm. You are the witness above it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Above.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}