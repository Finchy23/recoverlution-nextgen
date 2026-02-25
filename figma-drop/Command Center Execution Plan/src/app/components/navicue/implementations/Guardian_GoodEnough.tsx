/**
 * GUARDIAN #3 — The "Good Enough" Standard
 * "Perfect is the enemy of connected."
 * INTERACTION: Draw a circle by dragging (SVG path). The path will
 * be slightly imperfect. Each tap highlights a section of the
 * imperfect circle — 5 highlights. Each section glows gold.
 * At the end: the whole imperfect circle radiates. The imperfection
 * IS the beauty.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const GLOW_STEPS = 5;

// Pre-drawn imperfect circle — hand-drawn wobble
const CIRCLE_PATH = 'M 110,45 C 138,43 160,55 168,72 C 176,89 175,112 165,128 C 155,144 135,155 113,157 C 91,159 68,150 56,136 C 44,122 40,102 45,84 C 50,66 65,51 82,46 C 92,43 102,44 110,45';

// Segments of the path for highlighting (approximate arc sections)
const SEGMENTS = [
  { start: 0, end: 0.2, label: 'wobble here' },
  { start: 0.2, end: 0.4, label: 'a flat edge' },
  { start: 0.4, end: 0.6, label: 'dips low' },
  { start: 0.6, end: 0.8, label: 'gap in the line' },
  { start: 0.8, end: 1.0, label: 'doesn\'t close' },
];

export default function Guardian_GoodEnough({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [glowed, setGlowed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const glow = () => {
    if (stage !== 'active' || glowed >= GLOW_STEPS) return;
    const next = glowed + 1;
    setGlowed(next);
    if (next >= GLOW_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = glowed / GLOW_STEPS;
  const full = t >= 1;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A hand trembles...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Perfect is the enemy of connected. The good enough parent creates a healthier child than the perfect one. Relax.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to find the beauty in imperfection</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={glow}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: glowed >= GLOW_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '200px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(40, ${4 + t * 6}%, ${6 + t * 3}%, 0.85)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Base imperfect circle — hand-drawn stroke */}
                <motion.path d={CIRCLE_PATH}
                  fill="none"
                  stroke={`hsla(0, 0%, ${20 + t * 8}%, ${0.06 + t * 0.03})`}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                />

                {/* Glow segments — each tap lights up a section gold */}
                {SEGMENTS.map((seg, i) => {
                  if (i >= glowed) return null;
                  return (
                    <motion.path key={i} d={CIRCLE_PATH}
                      fill="none"
                      stroke={`hsla(42, ${20 + i * 3}%, ${42 + i * 3}%, ${0.08 + i * 0.02})`}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="1"
                      strokeDashoffset={-seg.start}
                      pathLength={1}
                      style={{
                        strokeDasharray: `${seg.end - seg.start} ${1 - (seg.end - seg.start)}`,
                        strokeDashoffset: `-${seg.start}`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.1 + i * 0.02 }}
                      transition={{ duration: 0.8 }}
                    />
                  );
                })}

                {/* Full glow — entire circle radiates gold */}
                {full && (
                  <motion.path d={CIRCLE_PATH}
                    fill="none"
                    stroke="hsla(42, 25%, 52%, 0.12)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    transition={{ duration: 2 }}
                  />
                )}
                {full && (
                  <motion.path d={CIRCLE_PATH}
                    fill="none"
                    stroke="hsla(42, 20%, 48%, 0.06)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}
                    transition={{ duration: 2.5, delay: 0.5 }}
                  />
                )}

                {/* Imperfection callout — shows which flaw is being embraced */}
                {glowed > 0 && glowed <= GLOW_STEPS && !full && (
                  <motion.text x="110" y="185" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(42, 15%, 42%, 0.1)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}>
                    "{SEGMENTS[glowed - 1].label}" : beautiful
                  </motion.text>
                )}

                {/* GOOD ENOUGH */}
                {full && (
                  <motion.text x="110" y="105" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(42, 22%, 52%, 0.18)" letterSpacing="1.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.5, duration: 2 }}>
                    GOOD ENOUGH
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={glowed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {glowed === 0 ? 'An imperfect circle. Hand-drawn. Wobbly.' : glowed < GLOW_STEPS ? `Flaw ${glowed} glowing gold. Imperfection embraced.` : 'Every wobble glows. The whole circle radiates. Good enough.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: GLOW_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < glowed ? 'hsla(42, 22%, 50%, 0.5)' : palette.primaryFaint, opacity: i < glowed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five flaws lit up gold. The wobble. The flat edge. The gap. None of them made the circle less beautiful. They made it real. Good enough is not settling. Good enough is connecting.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Winnicott's theory. Small failures in empathy, repaired, teach resilience and that the world is survivable. The perfect parent paralyzes. The good enough parent liberates.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Wobble. Glow. Enough.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}