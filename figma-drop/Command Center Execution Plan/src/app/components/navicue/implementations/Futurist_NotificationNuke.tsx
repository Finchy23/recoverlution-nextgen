/**
 * FUTURIST #1 — The Notification Nuke
 * "Your attention is the product. Stop selling it."
 * INTERACTION: A pulsing red button at center. Notification badges
 * swarm around it — 5 taps, each silences a wave of badges.
 * Final tap: the button detonates — everything goes silent.
 * Do Not Disturb. Attentional sovereignty reclaimed.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const NUKE_STEPS = 5;

// Badge positions — scattered around center
const BADGES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: 110 + Math.cos(i * 0.87 + i) * (25 + (i % 5) * 14),
  y: 90 + Math.sin(i * 1.1 + i) * (20 + (i % 4) * 12),
  wave: Math.floor(i / 5), // which tap silences this badge
  count: Math.floor(Math.random() * 40) + 1,
  size: 3 + Math.random() * 2.5,
}));

export default function Futurist_NotificationNuke({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [silenced, setSilenced] = useState(0);
  const [detonated, setDetonated] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const nuke = () => {
    if (stage !== 'active' || silenced >= NUKE_STEPS || detonated) return;
    const next = silenced + 1;
    setSilenced(next);
    if (next >= NUKE_STEPS) {
      addTimer(() => {
        setDetonated(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
      }, 800);
    }
  };

  const t = silenced / NUKE_STEPS;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Noise everywhere...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your attention is the product. Stop selling it. Silence the world. Do Not Disturb. Now.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the button to silence each wave</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={nuke}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: silenced >= NUKE_STEPS || detonated ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: detonated ? 'hsla(0, 0%, 3%, 0.95)' : `hsla(0, ${4 + (1 - t) * 4}%, ${5 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Notification badges — disappear wave by wave */}
                {!detonated && BADGES.map(b => {
                  const alive = b.wave >= silenced;
                  if (!alive) return null;
                  return (
                    <motion.g key={b.id}
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ opacity: alive ? 0.7 : 0, scale: alive ? 1 : 0 }}
                      transition={{ duration: 0.4 }}>
                      <circle cx={b.x} cy={b.y} r={b.size}
                        fill={`hsla(0, ${55 + b.count}%, ${42 + b.count * 0.2}%, ${0.12 + b.count * 0.002})`} />
                      <text x={b.x} y={b.y + 1.2} textAnchor="middle" fontSize="2.8" fontFamily="monospace" fontWeight="600"
                        fill="hsla(0, 0%, 85%, 0.5)">
                        {b.count}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Central red button */}
                {!detonated && (
                  <g>
                    <motion.circle cx="110" cy="90" r={16}
                      fill={`hsla(0, ${50 + t * 15}%, ${30 + t * 10}%, ${0.15 + t * 0.08})`}
                      initial={{ r: 16 }}
                      animate={{ r: [16, 17, 16] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.circle cx="110" cy="90" r={12}
                      fill={`hsla(0, ${55 + t * 15}%, ${35 + t * 10}%, ${0.2 + t * 0.1})`}
                    />
                    <circle cx="110" cy="90" r={8}
                      fill={`hsla(0, ${60 + t * 10}%, ${40 + t * 8}%, ${0.25 + t * 0.1})`} />
                    {/* Button glyph */}
                    <text x="110" y="93" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="700"
                      fill={`hsla(0, 0%, ${75 + t * 15}%, ${0.4 + t * 0.2})`}>⊘</text>
                  </g>
                )}

                {/* Detonation — shockwave ring */}
                {detonated && (
                  <>
                    <motion.circle cx="110" cy="90" r={10}
                      fill="none" stroke="hsla(0, 0%, 20%, 0.08)" strokeWidth="0.5"
                      initial={{ r: 10, opacity: 0.1 }}
                      animate={{ r: 100, opacity: 0 }}
                      transition={{ duration: 2 }}
                    />
                    <motion.text x="110" y="93" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(0, 0%, 35%, 0.15)" letterSpacing="3"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                      transition={{ delay: 0.8, duration: 2 }}>
                      SILENT
                    </motion.text>
                    {/* DND crescent */}
                    <motion.path d="M 104,83 A 8,8 0 1,1 104,97 A 5,5 0 1,0 104,83"
                      fill="hsla(265, 12%, 35%, 0.08)"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}
                      transition={{ delay: 1.5, duration: 1.5 }}
                    />
                  </>
                )}

                {/* Badge counter */}
                {!detonated && (
                  <text x="110" y="170" textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                    fill={`hsla(0, ${8 + t * 10}%, ${25 + t * 10}%, ${0.06 + t * 0.04})`}>
                    {silenced === 0 ? '25 notifications screaming' : `${25 - silenced * 5} remaining. wave ${silenced}/${NUKE_STEPS}`}
                  </text>
                )}
              </svg>
            </div>
            <motion.div key={`${silenced}-${detonated}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {silenced === 0 ? 'Twenty-five badges. Each screaming for attention. You are the product.' : !detonated && silenced < NUKE_STEPS ? `Wave ${silenced} silenced. ${25 - silenced * 5} badges remain.` : detonated ? 'Detonated. Total silence. Do Not Disturb.' : 'Final wave. One more tap to detonate.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: NUKE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < silenced ? 'hsla(0, 45%, 45%, 0.5)' : palette.primaryFaint, opacity: i < silenced ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Twenty-five notifications. Five waves. One button. All gone. The screen went black. The silence is not empty. It is full of everything you were missing while they were screaming.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Attentional sovereignty. Reducing external triggers reclaims executive function. Your attention is not their product anymore. It is yours.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Noise. Button. Silent.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}