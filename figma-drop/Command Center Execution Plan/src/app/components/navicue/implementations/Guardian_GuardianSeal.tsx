/**
 * GUARDIAN #7 — The Guardian Seal (The Proof)
 * "You are the one you have been waiting for."
 * INTERACTION: An empty chest. Each tap builds a heartbeat pulse
 * from center — 5 pulses layering into concentric rings. At the
 * final pulse: a hand silhouette materializes over the heart.
 * "I have you. You are safe." Internal secure base built.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PULSE_COUNT = 5;

export default function Guardian_GuardianSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pulses, setPulses] = useState(0);
  const [handVisible, setHandVisible] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const pulse = () => {
    if (stage !== 'active' || pulses >= PULSE_COUNT || handVisible) return;
    const next = pulses + 1;
    setPulses(next);
    if (next >= PULSE_COUNT) {
      addTimer(() => {
        setHandVisible(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
      }, 1500);
    }
  };

  const t = pulses / PULSE_COUNT;
  const complete = t >= 1;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A heartbeat...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>I have you. You are safe. You are the one you have been waiting for.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to pulse, hand over heart</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={pulse}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: pulses >= PULSE_COUNT || handVisible ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '200px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(340, ${4 + t * 5}%, ${5 + t * 3}%, 0.85)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Heartbeat center point */}
                <circle cx="110" cy="95" r="3"
                  fill={`hsla(340, ${15 + t * 10}%, ${35 + t * 10}%, ${0.08 + t * 0.06})`} />

                {/* Concentric pulse rings — one per tap */}
                {Array.from({ length: pulses }, (_, i) => {
                  const r = 10 + i * 12;
                  const age = (pulses - i) / PULSE_COUNT;
                  return (
                    <motion.circle key={i}
                      cx="110" cy="95" r={r}
                      fill="none"
                      stroke={`hsla(340, ${12 + i * 3}%, ${30 + i * 4}%, ${0.04 + age * 0.04})`}
                      strokeWidth={1.5 - i * 0.15}
                      initial={{ r: 3, opacity: 0.12 }}
                      animate={{ r, opacity: 0.12 + age * 0.04 }}
                      transition={{ type: 'spring', stiffness: 40, damping: 10 }}
                    />
                  );
                })}

                {/* Ambient warmth — grows with pulses */}
                <defs>
                  <radialGradient id={`${svgId}-heartWarmth`} cx="50%" cy="47.5%">
                    <stop offset="0%" stopColor={`hsla(340, ${15 + t * 10}%, ${35 + t * 10}%, ${t * 0.05})`} />
                    <stop offset="60%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="220" height="200" fill={`url(#${svgId}-heartWarmth)`} />

                {/* Hand silhouette — materializes when complete */}
                {handVisible && (
                  <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.12, scale: 1 }}
                    transition={{ duration: 2.5 }}
                    style={{ transformOrigin: '110px 95px' }}>
                    {/* Simplified hand shape over heart */}
                    <path d="M 92,80 C 90,72 94,66 100,66 C 103,66 105,68 106,70
                             C 107,66 110,64 114,64 C 118,64 121,67 121,71
                             C 122,67 126,65 130,66 C 134,67 136,71 135,75
                             C 137,73 140,74 141,77 C 142,80 141,84 139,86
                             L 130,100 C 126,106 120,110 112,112
                             C 104,110 98,106 94,100 L 92,96 C 90,92 90,86 92,80 Z"
                      fill={`hsla(340, ${15 + t * 8}%, ${32 + t * 8}%, 0.08)`}
                      stroke={`hsla(340, 12%, 35%, 0.06)`}
                      strokeWidth="0.4"
                    />
                  </motion.g>
                )}

                {/* Heartbeat line — appears after first pulse */}
                {pulses > 0 && !handVisible && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}>
                    <polyline
                      points="60,160 75,160 80,155 85,165 90,155 95,160 110,160 115,150 120,170 125,145 130,160 145,160 160,160"
                      fill="none"
                      stroke={`hsla(340, ${12 + t * 8}%, ${32 + t * 8}%, ${0.06 + t * 0.03})`}
                      strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </motion.g>
                )}

                {/* Pulse counter */}
                <text x="110" y="185" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(340, ${8 + t * 8}%, ${25 + t * 10}%, ${0.06 + t * 0.04})`}>
                  {handVisible ? 'I have you. You are safe.' : `pulse ${pulses}/${PULSE_COUNT}`}
                </text>

                {/* SAFE */}
                {handVisible && (
                  <motion.text x="110" y="25" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(340, 18%, 48%, 0.15)" letterSpacing="2" fontWeight="500"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 1, duration: 2 }}>
                    GUARDIAN
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={`${pulses}-${handVisible}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {pulses === 0 ? 'Empty chest. Waiting for the heartbeat.' : !handVisible && pulses < PULSE_COUNT ? `Pulse ${pulses}. Rings expanding. Building safety.` : handVisible ? 'Hand over heart. You are the one you were waiting for.' : 'Five pulses. The hand is coming.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: PULSE_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < pulses ? 'hsla(340, 18%, 45%, 0.5)' : palette.primaryFaint, opacity: i < pulses ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Five heartbeats rippled outward. Concentric rings of safety. Then the hand appeared, your hand, over your own heart. I have you. You are safe. You are the one you have been waiting for. Be the parent you needed.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Secure attachment priming. Repeatedly creating experiences of safety and protection builds an internal secure base that persists into adulthood. You were always the guardian.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Pulse. Hand. Safe.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}