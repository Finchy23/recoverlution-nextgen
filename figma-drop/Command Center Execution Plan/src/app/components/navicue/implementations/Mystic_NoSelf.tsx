/**
 * MYSTIC #1 — The No-Self
 * "You are not the thinker. You are the space in which the thought appears."
 * INTERACTION: A face outline at center. Each tap dissolves one feature
 * into stars — 5 taps. Eyes → nose → mouth → jaw → outline.
 * Face becomes starfield. Who is listening?
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DISSOLVE_STEPS = 5;
const FEATURES = ['eyes', 'nose', 'mouth', 'jaw', 'outline'];

// Stars that replace each feature
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: 90 + Math.cos(i * 2.39) * (15 + (i % 8) * 6),
  y: 60 + Math.sin(i * 1.73) * (12 + (i % 6) * 5),
  r: 0.3 + Math.random() * 0.6,
  wave: Math.floor(i / 12),
  delay: Math.random() * 0.8,
}));

export default function Mystic_NoSelf({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [dissolved, setDissolved] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const dissolve = () => {
    if (stage !== 'active' || dissolved >= DISSOLVE_STEPS) return;
    const next = dissolved + 1;
    setDissolved(next);
    if (next >= DISSOLVE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = dissolved / DISSOLVE_STEPS;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Who is looking...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are not the thinker. You are the space in which the thought appears. Who is listening to this thought?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to dissolve each feature into stars</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={dissolve}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: dissolved >= DISSOLVE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(260, ${6 + t * 4}%, ${3 + t * 2}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Face outline — dissolves last */}
                {dissolved < 5 && (
                  <motion.ellipse cx="90" cy="75" rx="35" ry="42"
                    fill="none" stroke={`hsla(260, 8%, ${22 - t * 8}%, ${0.08 - t * 0.05})`}
                    strokeWidth="0.5"
                    animate={{ opacity: dissolved < 5 ? 1 : 0 }}
                  />
                )}
                {/* Eyes */}
                {dissolved < 1 && (
                  <g>
                    <ellipse cx="77" cy="65" rx="5" ry="3" fill="none" stroke="hsla(260, 8%, 25%, 0.08)" strokeWidth="0.4" />
                    <ellipse cx="103" cy="65" rx="5" ry="3" fill="none" stroke="hsla(260, 8%, 25%, 0.08)" strokeWidth="0.4" />
                    <circle cx="77" cy="65" r="1.5" fill="hsla(260, 10%, 28%, 0.06)" />
                    <circle cx="103" cy="65" r="1.5" fill="hsla(260, 10%, 28%, 0.06)" />
                  </g>
                )}
                {/* Nose */}
                {dissolved < 2 && (
                  <path d="M 88,68 L 85,82 Q 90,85 95,82 L 92,68" fill="none"
                    stroke="hsla(260, 8%, 24%, 0.06)" strokeWidth="0.4" />
                )}
                {/* Mouth */}
                {dissolved < 3 && (
                  <path d="M 80,92 Q 90,98 100,92" fill="none"
                    stroke="hsla(260, 8%, 24%, 0.07)" strokeWidth="0.4" />
                )}
                {/* Jaw */}
                {dissolved < 4 && (
                  <path d="M 58,60 Q 55,90 75,108 Q 90,115 105,108 Q 125,90 122,60" fill="none"
                    stroke="hsla(260, 6%, 20%, 0.05)" strokeWidth="0.3" />
                )}

                {/* Stars replacing features */}
                {STARS.map((s, i) => {
                  const visible = s.wave < dissolved;
                  return visible ? (
                    <motion.circle key={i} cx={s.x} cy={s.y} r={s.r}
                      fill={`hsla(${240 + (i % 40) * 3}, ${15 + i % 10}%, ${50 + i % 20}%, ${0.15 + Math.random() * 0.1})`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 0.2 + Math.random() * 0.15, scale: 1 }}
                      transition={{ duration: 1.5, delay: s.delay }}
                    />
                  ) : null;
                })}

                {/* Deep space glow at full dissolve */}
                {dissolved >= DISSOLVE_STEPS && (
                  <motion.circle cx="90" cy="75" r="45"
                    fill="hsla(260, 20%, 30%, 0.04)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.04 }}
                    transition={{ duration: 3 }}
                  />
                )}

                {/* Question */}
                <motion.text x="90" y="145" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(260, ${8 + t * 10}%, ${25 + t * 15}%, ${0.05 + t * 0.06})`}
                  animate={{ opacity: safeOpacity(0.05 + t * 0.06) }}>
                  {dissolved >= DISSOLVE_STEPS ? 'who is listening?' : `${FEATURES[dissolved]} remaining`}
                </motion.text>

                <text x="90" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(260, 6%, 22%, ${0.04 + t * 0.02})`}>
                  dissolve {dissolved}/{DISSOLVE_STEPS}
                </text>
              </svg>
            </div>
            <motion.div key={dissolved} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {dissolved === 0 ? 'A face. Your face. But who is behind it?' : dissolved < DISSOLVE_STEPS ? `${FEATURES[dissolved - 1]} dissolved into starlight.` : 'No face. Only stars. The space remains.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: DISSOLVE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < dissolved ? 'hsla(260, 18%, 50%, 0.5)' : palette.primaryFaint, opacity: i < dissolved ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Eyes. Nose. Mouth. Jaw. Outline. Each dissolved into starlight. Where a face once was, a constellation breathes. You are not the thinker. You are the space in which thought appears. Who is listening?</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Self-referential deactivation. Quieting the default mode network reduces ego-centric suffering. The face was never you. The space was always you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Face. Stars. Space.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}