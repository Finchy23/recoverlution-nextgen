/**
 * OMEGA #3 — The Golden Ratio (The Spiral)
 * "Growth is a spiral. You are not circling. You are ascending."
 * STEALTH KBE: Smoothness of spiral trace = Psychological Flow (E)
 * Web: Drag interaction to trace the spiral inward
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Flow', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'trace' | 'singularity' | 'resonant' | 'afterglow';

export default function Unity_GoldenRatio({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      console.log(`[KBE:E] GoldenRatio traceComplete=true psychologicalFlow=true`);
      setStage('singularity');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
    },
  });

  useEffect(() => { t(() => setStage('trace'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Flow" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
          </motion.div>
        )}
        {stage === 'trace' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div {...drag.bind()} style={{ position: 'relative', width: '140px', height: '140px', cursor: 'grab' }}>
              {/* Golden spiral SVG */}
              <svg viewBox="0 0 100 100" width="140" height="140">
                <motion.path
                  d="M 50 10 A 40 40 0 0 1 90 50 A 30 30 0 0 1 60 80 A 20 20 0 0 1 40 60 A 12 12 0 0 1 52 48 A 7 7 0 0 1 59 55 A 4 4 0 0 1 55 59 A 2 2 0 0 1 53 57"
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.08, 4)}
                  strokeWidth="1" />
                <motion.path
                  d="M 50 10 A 40 40 0 0 1 90 50 A 30 30 0 0 1 60 80 A 20 20 0 0 1 40 60 A 12 12 0 0 1 52 48 A 7 7 0 0 1 59 55 A 4 4 0 0 1 55 59 A 2 2 0 0 1 53 57"
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.25, 10)}
                  strokeWidth="1.5"
                  strokeDasharray="300"
                  strokeDashoffset={300 - drag.progress * 300} />
                {/* Center singularity */}
                <circle cx="53" cy="57" r={2 + drag.progress * 3}
                  fill={themeColor(TH.accentHSL, 0.05 + drag.progress * 0.15, 8)} />
              </svg>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Trace the spiral inward. It gets tighter until it hits the singularity.
            </div>
            <div style={{ width: '80px', height: '3px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.04, 1) }}>
              <motion.div style={{ width: `${drag.progress * 100}%`, height: '100%', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.15, 5) }} />
            </div>
          </motion.div>
        )}
        {stage === 'singularity' && (
          <motion.div key="sg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div initial={{ scale: 3 }} animate={{ scale: 0.5 }} transition={{ duration: 3 }}
              style={{ width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.3, 12),
                boxShadow: `0 0 30px ${themeColor(TH.accentHSL, 0.1, 8)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>You are ascending.</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The golden ratio ({'\u03C6'} = 1.618) appears in nautilus shells, sunflower seeds, galaxy arms, and DNA helices. Growth is not linear; it spirals. You come back to the same point, but higher up. The spiral is not a circle. It is an ascending helix.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>{'\u03C6'}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}