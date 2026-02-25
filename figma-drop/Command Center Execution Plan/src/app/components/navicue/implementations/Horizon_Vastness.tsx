/**
 * INFINITE PLAYER II #8 — The Vastness (The Star)
 * "The universe is getting bigger. Why are you trying to stay the same?"
 * Pattern A (Drag) — Drag outward to "expand" zoom; universe grows
 * STEALTH KBE: Interaction signals belief in Personal Expansion (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'believing', 'Cosmos');
type Stage = 'arriving' | 'zooming' | 'expanded' | 'resonant' | 'afterglow';

export default function Horizon_Vastness({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('zooming'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const drag = useDragInteraction({
    axis: 'y',
    onComplete: () => {
      if (stage !== 'zooming') return;
      console.log(`[KBE:B] Vastness expanded=true personalExpansion=true beliefInGrowth=true`);
      setStage('expanded');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.1, 5) }} />
          </motion.div>
        )}
        {stage === 'zooming' && (
          <motion.div key="z" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <motion.div animate={{ scale: 1 + drag.progress * 0.5 }}
              style={{ position: 'relative', width: '120px', height: '120px' }}>
              {/* Stars */}
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div key={i}
                  style={{ position: 'absolute',
                    left: `${20 + Math.random() * 60}%`, top: `${20 + Math.random() * 60}%`,
                    width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`,
                    borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.1 + Math.random() * 0.15, 6 + Math.random() * 6) }} />
              ))}
              {/* Earth */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                width: `${8 - drag.progress * 4}px`, height: `${8 - drag.progress * 4}px`,
                borderRadius: '50%', background: themeColor(TH.accentHSL, 0.2, 8), transition: 'all 0.3s' }} />
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You zoom out from Earth. The universe is expanding. Drag to expand with it.
            </div>
            <motion.div {...drag.bindDrag()} whileTap={{ scale: 0.95 }}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'grab',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`, touchAction: 'none' }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>
                {drag.progress > 0 ? `Expanding... ${Math.round(drag.progress * 100)}%` : 'Drag to expand'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'expanded' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            The universe is getting bigger every second. Why are you trying to stay the same? Expand. Hubble proved the universe is expanding. The cosmic microwave background is the echo of the Big Bang. Everything is moving outward. So should you.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The Overview Effect (White): astronauts who see Earth from space report a cognitive shift — a sense of interconnectedness and expansion. You don{"'"}t need a spaceship. You need a perspective shift. Zoom out. Expand. The universe is inviting you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Expanding.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}