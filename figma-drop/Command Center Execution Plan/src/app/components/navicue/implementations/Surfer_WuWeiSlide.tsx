/**
 * SURFER #1 — The Wu Wei Slide
 * "Effort is interference. The current knows where to go."
 * ARCHETYPE: Pattern A (Tap) — Choose "Swim Upstream" or "Float"
 * ENTRY: Scene-first — river flowing
 * STEALTH KBE: Choosing Float = Trust in Process / Surrender (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'river' | 'chose' | 'resonant' | 'afterglow';

export default function Surfer_WuWeiSlide({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'swim' | 'float' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('river'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const decide = (c: 'swim' | 'float') => {
    if (stage !== 'river') return;
    setChoice(c);
    console.log(`[KBE:B] WuWeiSlide choice=${c} trustInProcess=${c === 'float'} surrender=${c === 'float'}`);
    setStage('chose');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="80" height="20" viewBox="0 0 80 20">
              <motion.path d="M0,10 Q10,5 20,10 Q30,15 40,10 Q50,5 60,10 Q70,15 80,10"
                fill="none" stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="1.5"
                initial={{ d: 'M0,10 Q10,5 20,10 Q30,15 40,10 Q50,5 60,10 Q70,15 80,10' }}
                animate={{ d: ['M0,10 Q10,5 20,10 Q30,15 40,10 Q50,5 60,10 Q70,15 80,10',
                  'M0,10 Q10,15 20,10 Q30,5 40,10 Q50,15 60,10 Q70,5 80,10'] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }} />
            </svg>
          </motion.div>
        )}
        {stage === 'river' && (
          <motion.div key="ri" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>the river</div>
            {/* River visualization */}
            <svg width="180" height="40" viewBox="0 0 180 40">
              {[0, 1, 2].map(i => (
                <motion.path key={i}
                  d={`M0,${12 + i * 8} Q30,${6 + i * 8} 60,${12 + i * 8} Q90,${18 + i * 8} 120,${12 + i * 8} Q150,${6 + i * 8} 180,${12 + i * 8}`}
                  fill="none" stroke={themeColor(TH.accentHSL, 0.05 + i * 0.02, 4 + i * 2)} strokeWidth="1"
                  initial={{ d: `M0,${12 + i * 8} Q30,${6 + i * 8} 60,${12 + i * 8} Q90,${18 + i * 8} 120,${12 + i * 8} Q150,${6 + i * 8} 180,${12 + i * 8}` }}
                  animate={{ d: [
                    `M0,${12 + i * 8} Q30,${6 + i * 8} 60,${12 + i * 8} Q90,${18 + i * 8} 120,${12 + i * 8} Q150,${6 + i * 8} 180,${12 + i * 8}`,
                    `M0,${12 + i * 8} Q30,${18 + i * 8} 60,${12 + i * 8} Q90,${6 + i * 8} 120,${12 + i * 8} Q150,${18 + i * 8} 180,${12 + i * 8}`,
                  ] }}
                  transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, repeatType: 'reverse' }} />
              ))}
              {/* Leaf */}
              <motion.circle cx="90" cy="20" r="3" fill={themeColor(TH.accentHSL, 0.12, 8)}
                animate={{ x: [-2, 2, -2], y: [-1, 1, -1] }}
                transition={{ duration: 1.5, repeat: Infinity }} />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are a leaf. The river is fast.
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide('swim')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>Swim upstream</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.92 }} onClick={() => decide('float')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14), fontSize: '11px' }}>Float</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'chose' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            {choice === 'float' ? (
              <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
                Smooth. The current carries you. Effort is interference: the water knows where to go. Wu wei. Effortless action. Float.
              </div>
            ) : (
              <motion.div animate={{ x: [-2, 2, -3, 3, 0] }} transition={{ duration: 0.4, repeat: 2 }}
                style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
                Turbulence. The river pushes back. Fighting the current costs energy that the flow would give for free. Next time, consider floating.
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Wu wei: effortless action. The Taoist principle that the most effective action often feels like non-action. Not passivity, but alignment. The river isn{"'"}t lazy; it{"'"}s efficient. It finds the path of least resistance because that{"'"}s where the energy flows. Lift your feet. Let the water carry you. The current knows where to go.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Flowing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}