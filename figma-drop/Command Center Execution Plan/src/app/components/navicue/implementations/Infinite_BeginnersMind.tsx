/**
 * INFINITE PLAYER #5 — The Beginner's Mind
 * "The expert knows what is possible. The beginner sees the infinite."
 * INTERACTION: A canvas filled with labels, categories, judgments.
 * Each tap erases one layer — 5 taps. Labels vanish.
 * At the end: blank white canvas. Shoshin. Dopamine of novelty.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ERASE_STEPS = 5;

const LABELS = [
  // Layer 0 — categories
  [{ x: 30, y: 25, t: 'good' }, { x: 120, y: 30, t: 'bad' }, { x: 70, y: 18, t: 'right' }, { x: 150, y: 22, t: 'wrong' }],
  // Layer 1 — judgments
  [{ x: 40, y: 50, t: 'should' }, { x: 130, y: 55, t: 'must' }, { x: 85, y: 45, t: 'always' }],
  // Layer 2 — assumptions
  [{ x: 25, y: 75, t: 'impossible' }, { x: 110, y: 80, t: 'obvious' }, { x: 160, y: 72, t: 'known' }],
  // Layer 3 — identities
  [{ x: 50, y: 100, t: 'expert' }, { x: 140, y: 95, t: 'failure' }, { x: 90, y: 105, t: 'fixed' }],
  // Layer 4 — last traces
  [{ x: 70, y: 120, t: 'certain' }, { x: 130, y: 125, t: 'done' }],
];

export default function Infinite_BeginnersMind({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [erased, setErased] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const erase = () => {
    if (stage !== 'active' || erased >= ERASE_STEPS) return;
    const next = erased + 1;
    setErased(next);
    if (next >= ERASE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = erased / ERASE_STEPS;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            So much you think you know...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Forget everything you know. Look at this moment like you just arrived on Earth. The expert knows what is possible. The beginner sees the infinite. Be a beginner.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to erase what you think you know</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={erase}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: erased >= ERASE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(0, 0%, ${5 + t * 12}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Label layers — disappear as erased */}
                {LABELS.map((layer, li) => (
                  li >= erased ? (
                    <g key={li}>
                      {layer.map((label, wi) => (
                        <motion.text key={`${li}-${wi}`}
                          x={label.x} y={label.y}
                          fontSize={4 + (li === 0 ? 1 : 0)} fontFamily="monospace"
                          fill={`hsla(220, ${6 - li}%, ${18 + li * 3}%, ${0.06 - li * 0.005})`}
                          animate={{ opacity: 1 }}>
                          {label.t}
                        </motion.text>
                      ))}
                    </g>
                  ) : null
                ))}

                {/* Canvas texture — gets cleaner */}
                {erased < ERASE_STEPS && (
                  <rect x="0" y="0" width="200" height="160"
                    fill={`hsla(220, 3%, 10%, ${0.02 * (1 - t)})`} />
                )}

                {/* Blank glow at full erase */}
                {t >= 1 && (
                  <>
                    <motion.rect x="0" y="0" width="200" height="160"
                      fill="hsla(0, 0%, 100%, 0.02)"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                      transition={{ duration: 3 }}
                    />
                    <motion.text x="100" y="85" textAnchor="middle" fontSize="5.5" fontFamily="Georgia, serif"
                      fill="hsla(0, 0%, 40%, 0.1)" letterSpacing="2"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                      transition={{ delay: 0.5, duration: 2 }}>
                      ∅
                    </motion.text>
                  </>
                )}

                <text x="100" y="152" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(0, 0%, ${20 + t * 12}%, ${0.04 + t * 0.03})`}>
                  {t >= 1 ? 'empty canvas. beginner.' : `labels remaining: ${ERASE_STEPS - erased}`}
                </text>
              </svg>
            </div>
            <motion.div key={erased} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {erased === 0 ? 'Good/bad, right/wrong, should/must, expert/failure. All labeled.' : erased < ERASE_STEPS ? `Layer ${erased} erased. Labels dissolving.` : 'Blank canvas. No labels. No assumptions. Beginner.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ERASE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < erased ? 'hsla(0, 0%, 50%, 0.4)' : palette.primaryFaint, opacity: i < erased ? 0.5 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five erasures. Good/bad, gone. Should/must, gone. Impossible/obvious, gone. Expert/failure, gone. Certain/done, gone. A blank white canvas. No labels. No categories. You just arrived on Earth. Everything is new. Be a beginner.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Shoshin. Releasing cognitive biases allows perception of novelty, which triggers dopamine release. Curiosity is the beginner's superpower.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Labels. Erase. Begin.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}