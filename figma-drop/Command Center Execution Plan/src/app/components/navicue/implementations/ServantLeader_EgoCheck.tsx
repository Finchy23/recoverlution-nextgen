/**
 * SERVANT LEADER #1 — The Ego Check
 * "Are you trying to be right? Or are you trying to be free?"
 * INTERACTION: A mirror surface with your reflection (abstract face).
 * Each tap fades the mirror — the reflection dissolves — until it
 * becomes a clear window looking through to light beyond. From
 * looking AT yourself to looking THROUGH yourself.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FADE_STEPS = 5;

export default function ServantLeader_EgoCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [faded, setFaded] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const fade = () => {
    if (stage !== 'active' || faded >= FADE_STEPS) return;
    const next = faded + 1;
    setFaded(next);
    if (next >= FADE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = faded / FADE_STEPS; // 0=mirror, 1=window
  const mirrorOpacity = 1 - t;
  const windowLight = t;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A mirror appears...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Are you trying to be right? Or are you trying to be free? You cannot be both.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to let the mirror fade</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={fade}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: faded >= FADE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '180px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(220, 10%, ${8 + windowLight * 8}%, 0.25)` }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Mirror frame */}
                <rect x="20" y="15" width="140" height="150" rx="8"
                  fill="none" stroke={`hsla(220, 15%, ${30 + windowLight * 20}%, ${0.3 - windowLight * 0.1})`}
                  strokeWidth="2" />
                {/* Mirror surface — silvery reflection */}
                <motion.rect x="22" y="17" width="136" height="146" rx="6"
                  fill={`hsla(220, 8%, 25%, ${mirrorOpacity * 0.3})`}
                  initial={{ opacity: 0.35 }}
                  animate={{ opacity: mirrorOpacity * 0.35 }}
                  transition={{ duration: 0.8 }}
                />
                {/* Abstract face/reflection — dissolving */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: mirrorOpacity * 0.5 }} transition={{ duration: 1 }}>
                  {/* Head shape */}
                  <ellipse cx="90" cy="70" rx="25" ry="30"
                    fill={`hsla(220, 8%, 30%, ${mirrorOpacity * 0.2})`} />
                  {/* Eyes */}
                  <ellipse cx="80" cy="65" rx="4" ry="2.5"
                    fill={`hsla(220, 10%, 40%, ${mirrorOpacity * 0.25})`} />
                  <ellipse cx="100" cy="65" rx="4" ry="2.5"
                    fill={`hsla(220, 10%, 40%, ${mirrorOpacity * 0.25})`} />
                  {/* Mouth line */}
                  <line x1="82" y1="82" x2="98" y2="82"
                    stroke={`hsla(220, 8%, 35%, ${mirrorOpacity * 0.15})`} strokeWidth="1" strokeLinecap="round" />
                  {/* Shoulders */}
                  <path d="M 55 130 Q 90 100, 125 130"
                    fill={`hsla(220, 8%, 28%, ${mirrorOpacity * 0.15})`} />
                </motion.g>
                {/* Window light — what lies beyond */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: windowLight }} transition={{ duration: 1 }}>
                  {/* Warm light through window */}
                  <radialGradient id={`${svgId}-windowGlow`} cx="50%" cy="45%">
                    <stop offset="0%" stopColor={`hsla(45, 40%, 65%, ${windowLight * 0.12})`} />
                    <stop offset="60%" stopColor={`hsla(45, 30%, 55%, ${windowLight * 0.04})`} />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                  <rect x="22" y="17" width="136" height="146" rx="6" fill={`url(#${svgId}-windowGlow)`} />
                  {/* Horizon line — depth beyond self */}
                  <line x1="35" y1="95" x2="145" y2="95"
                    stroke={`hsla(45, 25%, 55%, ${windowLight * 0.15})`}
                    strokeWidth="0.5" />
                  {/* Distant light points */}
                  {[
                    { cx: 70, cy: 55 }, { cx: 110, cy: 60 }, { cx: 90, cy: 45 },
                    { cx: 60, cy: 75 }, { cx: 120, cy: 80 },
                  ].map((pt, i) => (
                    <circle key={i} cx={pt.cx} cy={pt.cy} r={1.5}
                      fill={`hsla(45, 35%, 65%, ${windowLight * 0.2})`} />
                  ))}
                </motion.g>
                {/* Transition shimmer along edges */}
                {t > 0.3 && t < 0.9 && (
                  <motion.rect x="22" y="17" width="136" height="146" rx="6"
                    fill="none"
                    stroke={`hsla(220, 15%, 50%, ${(1 - Math.abs(t - 0.6) * 3) * 0.1})`}
                    strokeWidth="0.5"
                    animate={{ opacity: [0.05, 0.12, 0.05] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </svg>
              {/* Label */}
              <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, textAlign: 'center', fontFamily: 'monospace', fontSize: '11px', color: `hsla(220, 15%, 50%, ${0.2 + t * 0.15})` }}>
                {t < 0.5 ? 'mirror' : t < 1 ? 'fading...' : 'window'}
              </div>
            </div>
            <motion.div key={faded} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {faded === 0 ? 'Look at yourself.' : faded < FADE_STEPS ? 'The reflection fades...' : 'Now look through yourself.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: FADE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < faded ? 'hsla(45, 30%, 55%, 0.5)' : palette.primaryFaint, opacity: i < faded ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The mirror became a window. You stopped looking at yourself and started seeing through.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Intellectual humility. Knowledge is limited. The ego fades. The view opens.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Mirror. Window. Free.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}