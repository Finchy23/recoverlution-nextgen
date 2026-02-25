/**
 * INFINITE PLAYER II #1 — The Horizon Line
 * "There is no finish line. Keep the line in the distance."
 * Pattern A (Drag) — Walk toward horizon; it moves back endlessly
 * STEALTH KBE: Accepting moving goalpost as Opportunity = Infinite Game (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'believing', 'Cosmos');
type Stage = 'arriving' | 'walking' | 'accepted' | 'resonant' | 'afterglow';

export default function Horizon_HorizonLine({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [steps, setSteps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('walking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      if (stage !== 'walking') return;
      const s = steps + 1;
      setSteps(s);
      if (s >= 3) {
        console.log(`[KBE:B] HorizonLine steps=${s} movingGoalpostAccepted=true infiniteGame=true growthMindset=true`);
        setStage('accepted');
        t(() => setStage('resonant'), 5500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
      }
    },
  });

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '60px', height: '1px', background: themeColor(TH.accentHSL, 0.08, 4) }} />
          </motion.div>
        )}
        {stage === 'walking' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '60px' }}>
              <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3 }}
                style={{ position: 'absolute', right: '0', top: '28px', width: '100%', height: '1px',
                  background: `linear-gradient(90deg, transparent, ${themeColor(TH.accentHSL, 0.12, 6)})` }} />
              <div style={{ position: 'absolute', left: '10px', top: '20px', fontSize: '14px' }}>&#x1F6B6;</div>
              <div style={{ position: 'absolute', right: '10px', top: '14px', fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 10) }}>
                horizon &#x2192;
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Walk toward the horizon. It moves back. Keep walking. ({steps}/3 attempts)
            </div>
            <motion.div {...drag.bindDrag()} whileTap={{ scale: 0.95 }}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'grab',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`, touchAction: 'none' }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>
                {drag.progress > 0 ? `Walking... ${Math.round(drag.progress * 100)}%` : 'Drag to walk forward'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'accepted' && (
          <motion.div key="acc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            Infinite. You kept walking even as the horizon receded. That{"'"}s not failure, that{"'"}s the point. There is no finish line. If you reach the horizon, you stopped moving. The moving goalpost is not a bug, it{"'"}s the feature.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Finite and Infinite Games (Carse): a finite game is played for the purpose of winning, an infinite game for the purpose of continuing play. Growth mindset (Dweck): intelligence and ability are not fixed, they expand through effort. The horizon is your friend.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Walking.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}