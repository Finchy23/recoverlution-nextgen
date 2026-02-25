/**
 * OMEGA #6 — The Event Horizon (The Leap)
 * "The next step is off the map. Trust your feet. Step."
 * STEALTH KBE: Stepping through the door = Initiation (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Courage', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'edge' | 'flash' | 'resonant' | 'afterglow';

export default function Unity_EventHorizon({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('edge'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const step = () => {
    if (stage !== 'edge') return;
    console.log(`[KBE:E] EventHorizon stepped=true initiation=true courage=true`);
    setStage('flash');
    t(() => setStage('resonant'), 4000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Courage" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '2px', height: '30px', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'edge' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            {/* Door at the edge */}
            <div style={{ position: 'relative', width: '50px', height: '80px', borderRadius: '25px 25px 0 0',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}` }}>
              <div style={{ position: 'absolute', right: '8px', top: '40px', width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.2, 8) }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You have walked 1,000 steps. The next step is off the map.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={step}
              style={{ padding: '8px 20px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}` }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: palette.text }}>STEP</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'flash' && (
          <motion.div key="f"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.2, 0.6, 0.1] }}
            transition={{ duration: 3 }}
            style={{ width: '200px', height: '200px', borderRadius: '50%',
              background: `radial-gradient(circle, hsla(0, 0%, 95%, 0.15), transparent)` }} />
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The event horizon is the point of no return around a black hole. But in mythology, it is the threshold: the moment the hero crosses from the known world into the unknown (Campbell, 1949). Every true transformation requires a step beyond the map. Trust your feet.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Beyond.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}