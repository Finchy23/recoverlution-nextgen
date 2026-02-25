/**
 * INFINITE PLAYER II #2 — The New Map (Terra Incognita)
 * "Step off the paper. Draw the new land."
 * Pattern A (Tap) — Step into the blank edge of the known map
 * STEALTH KBE: Willingness to explore = Openness to Experience (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'map' | 'stepped' | 'resonant' | 'afterglow';

export default function Horizon_NewMap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('map'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const stepInto = () => {
    if (stage !== 'map') return;
    console.log(`[KBE:K] NewMap steppedIntoUnknown=true opennessToExperience=true novelty=true`);
    setStage('stepped');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '20px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.05, 3) }} />
          </motion.div>
        )}
        {stage === 'map' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '160px', height: '100px' }}>
              {/* Known area */}
              <div style={{ position: 'absolute', left: 0, top: 0, width: '60%', height: '100%',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
                borderRadius: '3px 0 0 3px',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Known World</span>
              </div>
              {/* Blank edge */}
              <div style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%',
                borderRadius: '0 3px 3px 0',
                border: `1px dashed ${themeColor(TH.accentHSL, 0.08, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8), fontStyle: 'italic' }}>Here be dragons</span>
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The edges of your map are blank. Step into the unknown.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={stepInto}
              style={{ padding: '14px 22px', borderRadius: '18px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Step off the map</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'stepped' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            You stepped into the blank. Comfort is the known map. Growth is the blank edge. The medieval "Here be dragons" warned sailors from the unknown. But every coastline you know was once a dragon{"'"}s den someone dared to map.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Openness to Experience (Big Five): the trait most correlated with creativity, curiosity, and psychological flexibility. People high in Openness seek novelty, tolerate ambiguity, and find beauty in the unfamiliar. Step off the paper. Draw the new land.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Exploring.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}