/**
 * INFINITE PLAYER #1 — The Cosmic Joke
 * "Man suffers because he takes seriously what the gods made for fun."
 * INTERACTION: A stern face at center. Each tap curves the mouth
 * upward — 5 taps. Frown → neutral → hint → grin → full laugh.
 * Facial feedback hypothesis. Forcing a smile triggers dopamine.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SMILE_STEPS = 5;
const LABELS = ['frowning', 'neutral', 'hint of smile', 'grinning', 'laughing'];

export default function Infinite_CosmicJoke({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [smiled, setSmiled] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const smile = () => {
    if (stage !== 'active' || smiled >= SMILE_STEPS) return;
    const next = smiled + 1;
    setSmiled(next);
    if (next >= SMILE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = smiled / SMILE_STEPS;
  // Mouth curve: negative (frown) → positive (smile)
  const curve = -8 + t * 20; // -8 → +12
  const eyeSquint = t * 3; // eyes squint with smile

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something absurd approaches...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Smile. It is not that serious. Man suffers only because he takes seriously what the gods made for fun.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to curve the frown upward</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={smile}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: smiled >= SMILE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '260px' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(45, ${4 + t * 10}%, ${5 + t * 6}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 160 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Face circle */}
                <circle cx="80" cy="80" r="55"
                  fill="none" stroke={`hsla(45, ${6 + t * 8}%, ${18 + t * 8}%, ${0.05 + t * 0.03})`}
                  strokeWidth="0.4" />

                {/* Eyes — squint as smile grows */}
                <motion.ellipse cx="60" cy={68 + eyeSquint * 0.3} rx="6" ry={4 - eyeSquint * 0.5}
                  fill="none" stroke={`hsla(45, ${8 + t * 8}%, ${22 + t * 10}%, ${0.08 + t * 0.04})`}
                  strokeWidth="0.5"
                  initial={{ ry: 4 }}
                  animate={{ ry: 4 - eyeSquint * 0.5 }}
                />
                <motion.ellipse cx="100" cy={68 + eyeSquint * 0.3} rx="6" ry={4 - eyeSquint * 0.5}
                  fill="none" stroke={`hsla(45, ${8 + t * 8}%, ${22 + t * 10}%, ${0.08 + t * 0.04})`}
                  strokeWidth="0.5"
                  initial={{ ry: 4 }}
                  animate={{ ry: 4 - eyeSquint * 0.5 }}
                />

                {/* Pupils — shrink with laugh lines */}
                <circle cx="60" cy={68 + eyeSquint * 0.3} r={2 - t * 0.5}
                  fill={`hsla(45, ${8 + t * 8}%, ${22 + t * 10}%, ${0.06 + t * 0.03})`} />
                <circle cx="100" cy={68 + eyeSquint * 0.3} r={2 - t * 0.5}
                  fill={`hsla(45, ${8 + t * 8}%, ${22 + t * 10}%, ${0.06 + t * 0.03})`} />

                {/* Crow's feet — appear with smile */}
                {t > 0.4 && (
                  <>
                    <line x1="48" y1="66" x2="44" y2="62" stroke={`hsla(45, 6%, 22%, ${(t - 0.4) * 0.06})`} strokeWidth="0.3" />
                    <line x1="48" y1="68" x2="43" y2="68" stroke={`hsla(45, 6%, 22%, ${(t - 0.4) * 0.06})`} strokeWidth="0.3" />
                    <line x1="112" y1="66" x2="116" y2="62" stroke={`hsla(45, 6%, 22%, ${(t - 0.4) * 0.06})`} strokeWidth="0.3" />
                    <line x1="112" y1="68" x2="117" y2="68" stroke={`hsla(45, 6%, 22%, ${(t - 0.4) * 0.06})`} strokeWidth="0.3" />
                  </>
                )}

                {/* Mouth — curves from frown to laugh */}
                <motion.path
                  d={`M 60,95 Q 80,${95 + curve} 100,95`}
                  fill="none"
                  stroke={`hsla(${t > 0.5 ? 45 : 220}, ${8 + t * 12}%, ${22 + t * 12}%, ${0.08 + t * 0.05})`}
                  strokeWidth={0.5 + t * 0.3}
                  strokeLinecap="round"
                  animate={{
                    d: `M 60,95 Q 80,${95 + curve} 100,95`,
                  }}
                  transition={{ type: 'spring', stiffness: 60 }}
                />

                {/* Cheek bumps — appear with full grin */}
                {t > 0.6 && (
                  <>
                    <ellipse cx="52" cy="82" rx={3 * (t - 0.6) * 2.5} ry={2 * (t - 0.6) * 2.5}
                      fill={`hsla(15, 12%, 28%, ${(t - 0.6) * 0.04})`} />
                    <ellipse cx="108" cy="82" rx={3 * (t - 0.6) * 2.5} ry={2 * (t - 0.6) * 2.5}
                      fill={`hsla(15, 12%, 28%, ${(t - 0.6) * 0.04})`} />
                  </>
                )}

                {/* Joy glow at full smile */}
                {t >= 1 && (
                  <motion.circle cx="80" cy="80" r="60"
                    fill="hsla(45, 18%, 35%, 0.03)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    transition={{ duration: 2 }}
                  />
                )}

                {/* Label */}
                <text x="80" y="145" textAnchor="middle" fontSize="4" fontFamily="monospace"
                  fill={`hsla(45, ${6 + t * 8}%, ${20 + t * 10}%, ${0.05 + t * 0.03})`}>
                  {t >= 1 ? 'the cosmic joke' : LABELS[smiled] || 'frowning'}
                </text>
              </svg>
            </div>
            <motion.div key={smiled} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {smiled === 0 ? 'A stern face. Frowning. Taking everything seriously.' : smiled < SMILE_STEPS ? `Tap ${smiled}. The mouth curves upward. ${LABELS[smiled - 1]}.` : 'Full laugh. Eyes squinting. Crow\'s feet. The gods are amused.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SMILE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < smiled ? 'hsla(45, 22%, 52%, 0.5)' : palette.primaryFaint, opacity: i < smiled ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five taps. The frown inverted. Neutral. Hint of smile. Grin. Full laugh, crow's feet, squinting eyes, cheeks lifted. The cosmic joke: you were taking seriously what the gods made for fun.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Facial feedback hypothesis. Curving the mouth upward actually releases dopamine and serotonin. The smile was never fake. It was a key.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Frown. Curve. Laugh.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}