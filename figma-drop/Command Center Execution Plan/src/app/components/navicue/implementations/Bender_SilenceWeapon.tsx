/**
 * BENDER #7 — The Silence as Weapon
 * "The loudest thing in the room is your silence."
 * ARCHETYPE: Pattern E (Hold) — Long-press and hold silence.
 * A decibel meter drops to zero. The longer you hold, the more power builds.
 * Release too early = noise returns. Hold to completion = absolute zero.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Bender_SilenceWeapon({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [thresholdHit, setThresholdHit] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onThreshold: (tension) => setThresholdHit(Math.floor(tension * 4)),
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = hold.tension;
  const db = Math.round(85 * (1 - t)); // 85dB → 0dB

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Listen...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The loudest thing in the room is your silence. Do not explain. Do not justify. Power does not babble. Let the silence do the heavy lifting.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold to maintain the silence</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 200, 180).base }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Decibel meter arc */}
                <path d="M 40,140 A 60,60 0 0,1 160,140" fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.04)} strokeWidth="8" strokeLinecap="round" />
                {/* Meter fill — drops as silence builds */}
                <motion.path
                  d={`M 40,140 A 60,60 0 0,1 ${40 + 120 * (1 - t)},${140 - Math.sin(Math.acos((1 - t) - 0.5) * 2) * 60 * (1 - t < 0.5 ? 1 : -1)}`}
                  fill="none"
                  stroke={`hsla(${t < 0.5 ? 0 : 220}, ${12 - t * 8}%, ${25 + t * 10}%, ${0.06 + t * 0.04})`}
                  strokeWidth="8" strokeLinecap="round"
                />

                {/* Noise bars — shrink with silence */}
                {Array.from({ length: 12 }, (_, i) => {
                  const barH = (1 - t) * (10 + Math.sin(i * 1.5) * 8);
                  return (
                    <motion.rect key={i} x={45 + i * 9} y={50 - barH / 2} width="6" height={Math.max(0.5, barH)} rx="1"
                      fill={`hsla(${t < 0.3 ? 0 : 220}, ${10 * (1 - t)}%, ${22 + t * 8}%, ${0.04 * (1 - t * 0.7)})`}
                      initial={{
                        height: Math.max(0.5, barH),
                        y: 50 - barH / 2,
                      }}
                      animate={{
                        height: hold.isHolding ? Math.max(0.5, barH) : 10 + Math.sin(i * 1.5) * 8,
                        y: hold.isHolding ? 50 - barH / 2 : 45,
                      }}
                      transition={{ type: 'spring', stiffness: 30 }}
                    />
                  );
                })}

                {/* dB readout */}
                <text x="100" y="108" textAnchor="middle" fontSize="18" fontFamily="monospace" fontWeight="bold"
                  fill={themeColor(TH.primaryHSL, 0.08 + t * 0.06, 15 + t * 15)}>
                  {hold.completed ? '0' : db}
                </text>
                <text x="100" y="118" textAnchor="middle" fontSize="4" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.03, 10)}>
                  dB
                </text>

                {/* Status */}
                <text x="100" y="165" textAnchor="middle" fontSize="4" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {hold.completed ? 'ABSOLUTE ZERO. pure power' :
                   hold.isHolding ? `holding silence... ${Math.round(t * 100)}%` :
                   'press and hold'}
                </text>

                {/* Power glow at completion */}
                {hold.completed && (
                  <motion.circle cx="100" cy="90" r="60"
                    fill={themeColor(TH.accentHSL, 0.03, 10)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    transition={{ duration: 3 }}
                  />
                )}
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'Absolute silence. Maximum power. The room bends to you.' :
                 hold.isHolding ? `${db}dB. ${t < 0.3 ? 'Noise fading.' : t < 0.7 ? 'The room is quieting.' : 'Almost there. Hold.'}` :
                 'The noise is at 85dB. Press and hold to command silence.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.25, 0.5, 0.75, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You held. The noise dropped: 85, 60, 40, 20, 0. The bars shrank to nothing. The decibel meter hit absolute zero. In that silence: pure power. The loudest thing in the room was your refusal to fill it. Do not explain. Do not justify. Let the silence do the heavy lifting.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Status signaling. In ethology, silence and stillness signal high status (predator). Noise and fidgeting signal low status (prey). Power does not babble.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Noise. Hold. Zero.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}