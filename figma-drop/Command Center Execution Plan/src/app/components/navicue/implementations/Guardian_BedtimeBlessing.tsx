/**
 * GUARDIAN #10 — The Bedtime Blessing
 * "The ritual of closing. Night-time attachment priming."
 * INTERACTION: Stars appear one at a time as user taps.
 * 5 stars form a constellation. Each star carries a closing
 * blessing. A lullaby-slow dimming completes the ritual.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STARS = [
  { x: 55, y: 45, blessing: 'You are safe tonight.' },
  { x: 150, y: 35, blessing: 'Today was enough.' },
  { x: 85, y: 85, blessing: 'You are loved while you sleep.' },
  { x: 170, y: 95, blessing: 'Tomorrow will wait for you.' },
  { x: 110, y: 130, blessing: 'Rest now. Everything holds.' },
];

export default function Guardian_BedtimeBlessing({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lit, setLit] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const lightStar = () => {
    if (stage !== 'active' || lit >= 5) return;
    const next = lit + 1;
    setLit(next);
    if (next >= 5) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = lit / 5;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The sky darkens gently...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The bedtime ritual is the oldest attachment technology. A closing sequence. A signal to the nervous system: you can let go now. Someone is watching over the night.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to light each star</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={lightStar}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: lit >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(230, ${8 + t * 6}%, ${5 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Night sky gradient */}
                <defs>
                  <radialGradient id={`${svgId}-nightGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(230, 15%, ${12 + t * 8}%, ${t * 0.04})`} />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="110" cy="90" r={80} fill={`url(#${svgId}-nightGlow)`} />

                {/* Stars — dim until lit */}
                {STARS.map((star, i) => (
                  <g key={`star-${i}`}>
                    {/* Unlit position marker */}
                    <circle cx={star.x} cy={star.y} r="1.5"
                      fill={`hsla(42, 10%, 30%, ${i < lit ? 0 : 0.03})`} />
                    {/* Lit star */}
                    {i < lit && (
                      <>
                        <motion.circle cx={star.x} cy={star.y} r="2"
                          fill={`hsla(42, ${25 + i * 5}%, ${55 + i * 3}%, ${0.15 + i * 0.03})`}
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ duration: 0.6, type: 'spring' }}
                        />
                        {/* Star glow */}
                        <motion.circle cx={star.x} cy={star.y} r="8"
                          fill={`hsla(42, 20%, 50%, ${0.02 + i * 0.005})`}
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </>
                    )}
                  </g>
                ))}

                {/* Constellation lines — connect lit stars */}
                {lit >= 2 && Array.from({ length: lit - 1 }, (_, i) => (
                  <motion.line key={`line-${i}`}
                    x1={STARS[i].x} y1={STARS[i].y}
                    x2={STARS[i + 1].x} y2={STARS[i + 1].y}
                    stroke={`hsla(42, 15%, 45%, ${0.03 + t * 0.02})`}
                    strokeWidth="0.4"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                ))}
              </svg>
            </div>
            <motion.div key={lit} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center', maxWidth: '260px' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {lit === 0 ? 'Five stars to light. A constellation of safety.' : STARS[lit - 1].blessing}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < lit ? 'hsla(42, 30%, 55%, 0.5)' : palette.primaryFaint,
                  opacity: i < lit ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five stars lit. A constellation formed. The bedtime blessing is ancient attachment technology, a predictable, warm closing that tells the nervous system: the vigil is kept. You can let go.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Sleep research: consistent bedtime rituals reduce cortisol, increase melatonin onset by 30 minutes, and strengthen attachment security. The ritual is the message: someone watches while you rest.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Stars lit. Vigil kept. Rest.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}