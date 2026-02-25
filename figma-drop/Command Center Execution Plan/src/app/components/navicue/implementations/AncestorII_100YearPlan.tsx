/**
 * ANCESTOR II #1 -- The 100-Year Plan
 * "You are building a cathedral. You will not see the spire."
 * Pattern B (Drag) -- Timeline; drag "Your Impact" line far beyond "Your Life" segment
 * STEALTH KBE: Committing to long-term payoff = Cathedral Thinking / Legacy over Instant Gratification (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Transgenerational Meaning', 'believing', 'Ember');
type Stage = 'arriving' | 'timeline' | 'cathedral' | 'resonant' | 'afterglow';

export default function AncestorII_100YearPlan({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'x', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] 100YearPlan cathedralThinking=confirmed legacyOrientation=true`);
      setStage('cathedral');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('timeline'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '1px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'timeline' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A timeline. Your life is a small segment. Drag your impact line far beyond it.
            </div>
            {/* Timeline visualization */}
            <div style={{ width: '160px', position: 'relative' }}>
              <div style={{ width: '100%', height: '1px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              <div style={{ position: 'absolute', left: '20%', top: '-10px', width: '15%', height: '8px',
                background: themeColor(TH.accentHSL, 0.06, 3), borderRadius: '2px' }} />
              <span style={{ position: 'absolute', left: '22%', top: '-18px', fontSize: '11px', color: palette.textFaint }}>Your Life</span>
              <div style={{ position: 'absolute', left: '20%', top: '4px',
                width: `${15 + drag.progress * 65}%`, height: '4px',
                background: themeColor(TH.accentHSL, 0.04 + drag.progress * 0.05, 4),
                borderRadius: '2px', transition: 'width 0.05s' }} />
              <span style={{ position: 'absolute', left: '22%', top: '12px', fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6) }}>Your Impact →</span>
            </div>
            <div ref={drag.containerRef} style={{ width: '120px', height: '12px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              touchAction: 'none', position: 'relative', marginTop: '8px' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.08 + drag.progress * 0.04, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                  position: 'absolute', top: '-6px', left: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Extend →</div>
          </motion.div>
        )}
        {stage === 'cathedral' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Cathedral. Your impact stretches far beyond your life. You are building a cathedral. You will not see the spire. Build the foundation anyway. Stone by stone. The medieval cathedral builders knew they would never see the finished work. They built it anyway, not for themselves but for the idea that something worth building is worth building beyond the span of a single life.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Cathedral thinking. Sagrada Familia (Barcelona): begun in 1882, estimated completion 2026, 144 years of construction across multiple generations of architects. Roman Krznaric{"'"}s "The Good Ancestor": long-term thinking as a moral obligation. Research on temporal discounting (Frederick, 2002): humans systematically undervalue future rewards. Cathedral thinking is the antidote: deliberately extending your planning horizon beyond your lifespan. The foundation matters more than the spire because it must bear the weight of everything that comes after.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Building.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}