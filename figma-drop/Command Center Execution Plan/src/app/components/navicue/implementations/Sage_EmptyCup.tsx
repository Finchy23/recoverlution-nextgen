/**
 * SAGE #1 — The Empty Cup
 * "If your mind is full, nothing new can enter."
 * Pattern B (Drag) — Tilt/drag to pour out certainty until cup is empty
 * WEB ADAPT: tilt → drag slider downward
 * STEALTH KBE: Willingness to empty = Intellectual Humility / Growth Mindset (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'believing', 'Practice');
type Stage = 'arriving' | 'overflowing' | 'emptied' | 'resonant' | 'afterglow';

export default function Sage_EmptyCup({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] EmptyCup intellectualHumility=confirmed growthMindset=true`);
      setStage('emptied');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('overflowing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const fillLevel = 1 - drag.progress;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '18px', borderRadius: '0 0 4px 4px',
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 2)}`, borderTop: 'none' }} />
          </motion.div>
        )}
        {stage === 'overflowing' && (
          <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your cup is overflowing with opinions. You are too full. Drag down to pour it out.
            </div>
            {/* Cup */}
            <div style={{ width: '50px', height: '40px', borderRadius: '0 0 6px 6px',
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}`, borderTop: 'none',
              overflow: 'hidden', position: 'relative' }}>
              <motion.div animate={{ height: `${fillLevel * 100}%` }}
                style={{ position: 'absolute', bottom: 0, width: '100%',
                  background: themeColor(TH.accentHSL, 0.04 + fillLevel * 0.04, 2),
                  transition: 'height 0.15s' }} />
              {fillLevel > 0.8 && (
                <motion.div animate={{ opacity: [0.04, 0.06, 0.04] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ position: 'absolute', top: '-4px', width: '100%', height: '8px',
                    background: themeColor(TH.accentHSL, 0.03, 1) }} />
              )}
            </div>
            <div ref={drag.containerRef} style={{ width: '12px', height: '80px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.08 + drag.progress * 0.04, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                  position: 'absolute', left: '-12px', top: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Pour out ↓</div>
          </motion.div>
        )}
        {stage === 'emptied' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Empty. If your mind is full, nothing new can enter. Pour out the certainty. Pour out the judgment. Now: taste the tea. The Zen master pours tea for the visiting professor until it overflows: "Like this cup, you are full of your own opinions. How can I show you Zen unless you first empty your cup?"
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Intellectual humility. Mark Leary{"'"}s research: people with higher intellectual humility, the recognition that one{"'"}s beliefs might be wrong, show better learning, better decision-making, and stronger relationships. The "empty cup" (Shoshin, beginner{"'"}s mind) is not ignorance. It{"'"}s the deliberate suspension of expertise to create space for new information. Knowledge adds. Wisdom subtracts.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Emptied.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}