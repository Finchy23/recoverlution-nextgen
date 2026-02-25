/**
 * STRATEGIST #2 — The Essentialism Filter
 * "To do less is to do better."
 * INTERACTION: A document shredder at center. 5 floating task cards
 * orbit it — each labeled noise (emails, meetings, scrolling,
 * committees, notifications). Drag/tap each into the shredder.
 * Paper strips fly. Signal emerges from silence.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const NOISE_ITEMS = ['emails', 'meetings', 'scrolling', 'committees', 'notifications'];
const SHRED_COUNT = NOISE_ITEMS.length;

export default function Strategist_EssentialismFilter({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [shredded, setShredded] = useState(0);
  const [strips, setStrips] = useState<{ id: number; x: number; h: number }[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const shred = () => {
    if (stage !== 'active' || shredded >= SHRED_COUNT) return;
    const next = shredded + 1;
    setShredded(next);
    const newStrips = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: 85 + Math.random() * 50,
      h: 8 + Math.random() * 12,
    }));
    setStrips(prev => [...prev, ...newStrips]);
    if (next >= SHRED_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = shredded / SHRED_COUNT;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Noise accumulates...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>What is on your list that doesn't matter? Shred it. To do less is to do better. Cut the noise so you can hear the signal.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to shred the noise</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={shred}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: shredded >= SHRED_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(220, ${5 + t * 4}%, ${7 + t * 2}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Shredder body */}
                <rect x="85" y="85" width="50" height="30" rx="3"
                  fill={`hsla(220, ${8 + t * 6}%, ${15 + t * 5}%, ${0.08 + t * 0.04})`}
                  stroke={`hsla(220, 8%, 22%, ${0.06 + t * 0.02})`} strokeWidth="0.5" />
                {/* Shredder slot */}
                <rect x="92" y="84" width="36" height="3" rx="1"
                  fill={`hsla(0, 0%, ${10 + t * 5}%, ${0.1 + t * 0.04})`} />
                {/* Shredder teeth */}
                {Array.from({ length: 6 }, (_, i) => (
                  <line key={i} x1={95 + i * 5.5} y1="84" x2={95 + i * 5.5} y2="87"
                    stroke="hsla(0, 0%, 18%, 0.06)" strokeWidth="0.4" />
                ))}

                {/* Floating noise cards — remaining ones */}
                {NOISE_ITEMS.map((item, i) => {
                  if (i < shredded) return null;
                  const angle = ((i - shredded) / (SHRED_COUNT - shredded || 1)) * Math.PI * 0.8 - Math.PI * 0.4;
                  const cx = 110 + Math.cos(angle) * 55;
                  const cy = 50 + Math.sin(angle) * 18;
                  return (
                    <motion.g key={item}
                      animate={{ x: 0, y: 0, opacity: 0.12 }}
                      transition={{ type: 'spring', stiffness: 60 }}>
                      <rect x={cx - 18} y={cy - 8} width="36" height="16" rx="2"
                        fill={`hsla(0, ${6 + i * 2}%, ${18 + i * 2}%, 0.06)`}
                        stroke={`hsla(0, 5%, 20%, 0.04)`} strokeWidth="0.3" />
                      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={`hsla(0, 8%, 32%, 0.1)`}>
                        {item}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Shredded strips — fall below */}
                {strips.map((s, i) => (
                  <motion.rect key={s.id}
                    x={s.x} y={115} width="2" height={s.h} rx="0.5"
                    fill={`hsla(220, 6%, 22%, ${0.04})`}
                    initial={{ y: 115, opacity: 0.06 }}
                    animate={{ y: 115 + 15 + (i % 5) * 4, opacity: 0.03 }}
                    transition={{ duration: 1.2 }}
                  />
                ))}

                {/* Signal emerging */}
                {t > 0.4 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: t * 0.15 }} transition={{ duration: 1 }}>
                    <circle cx="110" cy="55" r={3 + t * 6}
                      fill={`hsla(160, ${15 + t * 10}%, ${38 + t * 10}%, ${t * 0.06})`} />
                    <text x="110" y="57" textAnchor="middle" fontSize={4 + t * 2} fontFamily="monospace"
                      fill={`hsla(160, 15%, 45%, ${t * 0.12})`}>
                      signal
                    </text>
                  </motion.g>
                )}

                {/* Cognitive load meter */}
                <g>
                  <rect x="195" y="35" width="5" height="50" rx="1.5"
                    fill="hsla(0, 0%, 12%, 0.03)" />
                  <rect x="195" y={35 + t * 50} width="5" height={(1 - t) * 50} rx="1.5"
                    fill={`hsla(0, ${10 - t * 8}%, ${25 + t * 8}%, ${0.06 - t * 0.03})`} />
                  <text x="197.5" y="30" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(0, 6%, 28%, 0.07)">load</text>
                </g>

                {/* Clear label */}
                {t >= 1 && (
                  <motion.text x="110" y="165" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(160, 15%, 45%, 0.15)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.4, duration: 1.5 }}>
                    ESSENTIAL
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={shredded} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {shredded === 0 ? 'Five noise cards. Orbiting. Consuming load.' : shredded < SHRED_COUNT ? `"${NOISE_ITEMS[shredded - 1]}" shredded. ${SHRED_COUNT - shredded} remain.` : 'All noise shredded. Signal clear.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SHRED_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < shredded ? 'hsla(160, 18%, 45%, 0.5)' : palette.primaryFaint, opacity: i < shredded ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five noise cards fed to the shredder. Emails, meetings, scrolling, committees, notifications, strips on the floor. The signal emerged from the silence.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cognitive load theory. Decision quality improves when decision quantity drops. Decision fatigue is real. Shred the noise to hear the signal.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Noise. Shred. Signal.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}