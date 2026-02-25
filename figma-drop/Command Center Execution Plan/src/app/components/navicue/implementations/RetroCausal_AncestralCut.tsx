/**
 * RETRO-CAUSAL #9 — The Ancestral Cut
 * "This is a sequel. You can choose to end the franchise here."
 * ARCHETYPE: Pattern C (Draw) — Draw a line to cut the red thread of inherited trauma
 * ENTRY: Instruction as Poetry — red thread visible, no explanation needed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'resonant' | 'afterglow';

export default function RetroCausal_AncestralCut({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.2,
    minStrokes: 1,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const coverage = draw.coverage;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="220" height="100" viewBox="0 0 220 100">
              {/* Red thread going back generations */}
              <motion.path d="M10,50 Q55,30 80,50 T150,50 T220,50"
                fill="none" stroke="hsla(0, 25%, 30%, 0.2)" strokeWidth="1.5"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 2 }} />
              {/* Generation markers */}
              {['great\u2011grand', 'grand', 'parent', 'you'].map((gen, i) => (
                <motion.g key={i}>
                  <circle cx={30 + i * 55} cy="50" r="3" fill="hsla(0, 20%, 30%, 0.15)" />
                  <text x={30 + i * 55} y="68" fontSize="11" fontFamily="monospace" textAnchor="middle"
                    fill={palette.textFaint} opacity={0.3}>{gen}</text>
                </motion.g>
              ))}
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              the thread is old
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              A red thread goes back generations. Anger that became silence, silence that became distance. The movie didn{'\u2019'}t start with you. This is a sequel. Cut the thread at your name. End the franchise here.
            </div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '220px', height: '140px', borderRadius: radius.sm, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.03, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.05, 5)}`,
              overflow: 'hidden',
            }}>
              <svg width="220" height="140" viewBox="0 0 220 140" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                {/* Red thread */}
                <path d="M0,70 Q55,50 110,70 T220,70"
                  fill="none" stroke={`hsla(0, 25%, 30%, ${0.15 - coverage * 0.1})`} strokeWidth="1.5" />
                {/* Your position marker */}
                <circle cx="165" cy="70" r="4" fill="hsla(0, 20%, 30%, 0.15)" />
                <text x="165" y="85" fontSize="11" fontFamily="monospace" textAnchor="middle"
                  fill={palette.textFaint} opacity={0.3}>you</text>
                {/* Draw strokes as the cut */}
                {draw.strokes.map((s, si) => (
                  <polyline key={si} fill="none"
                    stroke={themeColor(TH.accentHSL, 0.2, 12)}
                    strokeWidth="2" strokeLinecap="round"
                    points={s.points.map(p => `${p.x * 220},${p.y * 140}`).join(' ')} />
                ))}
                {draw.currentStroke.length > 1 && (
                  <polyline fill="none"
                    stroke={themeColor(TH.accentHSL, 0.25, 15)}
                    strokeWidth="2.5" strokeLinecap="round"
                    points={draw.currentStroke.map(p => `${p.x * 220},${p.y * 140}`).join(' ')} />
                )}
              </svg>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Cut. The thread ends at your name. Intergenerational differentiation: recognizing that certain patterns are inherited scripts allows you to stop running someone else{'\u2019'}s program. The sequel is cancelled. Your story starts now, on a clean reel.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Severed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}