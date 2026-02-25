/**
 * SURFER #6 — The Current Check
 * "You cannot change the wind. Adjust the sail."
 * ARCHETYPE: Pattern B (Drag) — Drag sail to align with wind direction
 * ENTRY: Scene-first — boat with wind
 * STEALTH KBE: Aligning with wind = Radical Acceptance (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'sailing' | 'aligned' | 'resonant' | 'afterglow';

export default function Surfer_CurrentCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] CurrentCheck alignment=confirmed radicalAcceptance=true`);
      setStage('aligned');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('sailing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const sailAngle = -30 + drag.progress * 60; // from fighting to aligned
  const speed = drag.progress;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="40" height="50" viewBox="0 0 40 50">
              <path d="M20,45 L20,10 L30,25 Z" fill={themeColor(TH.primaryHSL, 0.04, 2)}
                stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="1" />
              <line x1="10" y1="45" x2="30" y2="45" stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="2" />
            </svg>
          </motion.div>
        )}
        {stage === 'sailing' && (
          <motion.div key="sa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The wind blows north. Adjust your sail.
            </div>
            {/* Boat + sail + wind */}
            <div style={{ position: 'relative', width: '120px', height: '80px' }}>
              {/* Wind arrows */}
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [-2, 2, -2], opacity: [0.08, 0.15, 0.08] }}
                  transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                  style={{ position: 'absolute', left: `${20 + i * 35}px`, top: '5px',
                    fontSize: '11px', color: themeColor(TH.accentHSL, 0.15, 8) }}>
                  ↑
                </motion.div>
              ))}
              {/* Boat hull */}
              <svg style={{ position: 'absolute', bottom: 0, left: '30px' }} width="60" height="20" viewBox="0 0 60 20">
                <path d="M5,5 Q30,18 55,5" fill={themeColor(TH.primaryHSL, 0.05, 3)}
                  stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="1" />
              </svg>
              {/* Mast + Sail */}
              <div style={{ position: 'absolute', bottom: '18px', left: '58px',
                width: '2px', height: '40px', background: themeColor(TH.primaryHSL, 0.08, 5) }} />
              <div style={{ position: 'absolute', bottom: '20px', left: '59px',
                width: '0', height: '0',
                borderLeft: `18px solid ${themeColor(TH.accentHSL, 0.06 + speed * 0.06, 3 + speed * 3)}`,
                borderTop: '20px solid transparent',
                borderBottom: '15px solid transparent',
                transformOrigin: 'left center',
                transform: `rotate(${sailAngle}deg)`,
                transition: 'border-left-color 0.3s' }} />
              {/* Speed indicator */}
              {speed > 0.3 && (
                <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ position: 'absolute', bottom: '12px', left: '5px',
                    width: `${speed * 20}px`, height: '1px',
                    background: themeColor(TH.accentHSL, 0.1, 6) }} />
              )}
            </div>
            <div style={{ ...navicueType.hint, color: speed < 0.3 ? 'hsla(0, 15%, 35%, 0.25)' : themeColor(TH.accentHSL, 0.25, 8) }}>
              {speed < 0.3 ? 'stalled: fighting the wind' : speed < 0.7 ? 'catching...' : 'full speed'}
            </div>
            <div ref={drag.containerRef} style={{ width: '12px', height: '100px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', left: '-6px', top: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'aligned' && (
          <motion.div key="al" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Full speed. You stopped fighting the wind and used it instead. You can{"'"}t change the wind, but you can adjust the sail. That{"'"}s not surrender. That{"'"}s wisdom.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Radical acceptance. ACT (Acceptance and Commitment Therapy) shows that fighting reality wastes more energy than any problem could. The wind is the wind; it doesn{"'"}t care about your plans. Alignment isn{"'"}t passivity; it{"'"}s the highest form of strategic intelligence. Adjust the sail. Harness what{"'"}s already there.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Aligned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}