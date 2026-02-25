/**
 * GAIA #8 — The Ocean Depth
 * "The storm is only on the surface. Dive deep."
 * Pattern C (Hold) — Hold to dive; surface chaos fades to deep silence
 * STEALTH KBE: Sustaining depth = Depth Regulation / Calm (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Systems Thinking', 'embodying', 'Canopy');
type Stage = 'arriving' | 'surface' | 'deep' | 'resonant' | 'afterglow';

export default function Gaia_OceanDepth({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] OceanDepth depthRegulation=confirmed calm=true`);
      setStage('deep');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('surface'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const depth = Math.round(hold.progress * 1000);
  const chaos = 1 - hold.progress;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity }}>
              <div style={{ width: '30px', height: '3px', borderRadius: '1px',
                background: themeColor(TH.accentHSL, 0.04, 2) }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'surface' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The surface: waves, chaos, noise. Hold to dive. The deep water does not move.
            </div>
            {/* Ocean visualization */}
            <div style={{ width: '120px', height: '60px', borderRadius: '10px', overflow: 'hidden',
              background: `linear-gradient(180deg,
                hsla(200, ${15 + chaos * 10}%, ${25 + chaos * 8}%, ${0.04 + chaos * 0.04}),
                hsla(210, 15%, 14%, ${0.03 + hold.progress * 0.03}))`,
              position: 'relative' }}>
              {/* Surface waves */}
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ x: [-10, 10, -10], y: [0, -2 * chaos, 0] }}
                  transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }}
                  style={{ position: 'absolute', top: `${2 + i * 3}px`, left: `${10 + i * 20}px`,
                    width: '30px', height: '2px', borderRadius: '1px',
                    background: `hsla(200, 15%, 35%, ${0.04 * chaos})`,
                    opacity: chaos }} />
              ))}
              {/* Depth indicator */}
              <span style={{ position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)',
                fontSize: '11px', color: themeColor(TH.accentHSL, 0.15 + hold.progress * 0.1, 6) }}>
                {depth}m
              </span>
            </div>
            <motion.div {...hold.holdProps}
              style={immersiveHoldPillThemed(TH.accentHSL).container(hold.progress)}>
              <div style={immersiveHoldPillThemed(TH.accentHSL).label(hold.progress)}>
                {hold.isHolding ? `Diving... ${depth}m` : 'Hold to Dive'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'deep' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            1,000 meters. Silence. The storm is only on the surface. If you live on the surface, you get seasick. Dive deep. The bottom is steady. The ocean{"'"}s depth doesn{"'"}t move — only the surface reacts to wind. Your mind works the same way. Below the reactive thoughts is a stillness that never shakes. Find the depth. Stay there.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Depth regulation. Below 200m (the "aphotic zone"), ocean currents slow to near-stillness. This maps to psychological depth: surface emotions (reactive, weather-dependent) vs. deep values (stable, current-independent). Mindfulness traditions call this "the ocean floor" — awareness that doesn{"'"}t fluctuate with surface events. Heart rate variability (HRV) research: sustained slow breathing at depth produces parasympathetic dominance and reduced cortisol. The calm is physiological, not just metaphorical.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Deep.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}