/**
 * SERVANT LEADER #2 — The Power Transfer
 * "Empowerment is better than control. Give away the decision."
 * INTERACTION: A glowing key sits on your side. Each tap pushes it
 * across the divide toward "Other." As it crosses, the glow
 * intensifies — trust released. The key unlocks from your side.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PUSH_STEPS = 5;

export default function ServantLeader_PowerTransfer({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pushed, setPushed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const push = () => {
    if (stage !== 'active' || pushed >= PUSH_STEPS) return;
    const next = pushed + 1;
    setPushed(next);
    if (next >= PUSH_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const t = pushed / PUSH_STEPS;
  const keyX = 40 + t * 120; // travels from left (40) to right (160)
  const glowIntensity = 0.1 + t * 0.3;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A key glows...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Empowerment is better than control. Give away the decision. Trust the team.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to transfer the key</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={push}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: pushed >= PUSH_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(250, 10%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Dividing line */}
                <line x1="110" y1="20" x2="110" y2="120" stroke="hsla(0, 0%, 25%, 0.15)" strokeWidth="0.5" strokeDasharray="3 6" />
                {/* "You" label */}
                <text x="55" y="125" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(220, 15%, 45%, ${0.25 - t * 0.1})`}>YOU</text>
                {/* "Other" label */}
                <text x="165" y="125" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(45, 25%, 50%, ${0.15 + t * 0.2})`}>OTHER</text>
                {/* Key glow trail */}
                {t > 0 && (
                  <motion.line x1="40" y1="70" x2={keyX} y2="70"
                    stroke={`hsla(45, 40%, 55%, ${t * 0.08})`} strokeWidth="2" strokeLinecap="round"
                    initial={{ opacity: 0 }} animate={{ opacity: t * 0.1 }}
                  />
                )}
                {/* Key glow halo */}
                <motion.circle cx={keyX} cy="70" r={12 + t * 8}
                  fill={`hsla(45, 45%, 60%, ${glowIntensity * 0.15})`}
                  animate={{ cx: keyX, r: 12 + t * 8 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                />
                {/* The Key */}
                <motion.g initial={{ x: 0 }} animate={{ x: keyX - 40 }} transition={{ type: 'spring', stiffness: 80, damping: 15 }}>
                  {/* Key head — circle */}
                  <circle cx="40" cy="70" r="8"
                    fill="none" stroke={`hsla(45, 50%, 55%, ${0.4 + t * 0.3})`} strokeWidth="1.5" />
                  <circle cx="40" cy="70" r="3"
                    fill={`hsla(45, 50%, 55%, ${0.2 + t * 0.2})`} />
                  {/* Key shaft */}
                  <line x1="48" y1="70" x2="62" y2="70"
                    stroke={`hsla(45, 50%, 55%, ${0.4 + t * 0.3})`} strokeWidth="1.5" strokeLinecap="round" />
                  {/* Key teeth */}
                  <line x1="56" y1="70" x2="56" y2="75"
                    stroke={`hsla(45, 50%, 55%, ${0.3 + t * 0.2})`} strokeWidth="1" />
                  <line x1="60" y1="70" x2="60" y2="74"
                    stroke={`hsla(45, 50%, 55%, ${0.3 + t * 0.2})`} strokeWidth="1" />
                </motion.g>
                {/* Receiving hands — appear as key approaches */}
                {t > 0.4 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: (t - 0.4) * 0.4 }} transition={{ duration: 0.8 }}>
                    <path d="M 155 60 Q 165 55, 170 62 L 170 78 Q 165 85, 155 80 Z"
                      fill="none" stroke={`hsla(45, 20%, 45%, ${(t - 0.4) * 0.2})`} strokeWidth="0.8" />
                  </motion.g>
                )}
                {/* Trust ripples at transfer */}
                {pushed >= PUSH_STEPS && [18, 28, 38].map((r, i) => (
                  <motion.circle key={i} cx="160" cy="70" r={r}
                    fill="none" stroke={`hsla(45, 35%, 55%, 0.06)`} strokeWidth="0.5"
                    initial={{ r: 5, opacity: 0 }} animate={{ r, opacity: 0.08 }}
                    transition={{ delay: i * 0.3, duration: 1.5 }}
                  />
                ))}
              </svg>
            </div>
            <motion.div key={pushed} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {pushed === 0 ? 'The key is yours. Hold or give.' : pushed < PUSH_STEPS ? `Transferring... ${Math.floor(t * 100)}%` : 'Transferred. Trust given.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: PUSH_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < pushed ? 'hsla(45, 45%, 55%, 0.5)' : palette.primaryFaint, opacity: i < pushed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The key crossed over. Control released. Trust transferred. Power multiplied.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Oxytocin released. Trust given becomes trust earned. The virtuous cycle begins.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Held. Released. Trusted.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}