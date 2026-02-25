/**
 * MYSTIC #2 — The Now Point
 * "Be here. Now."
 * INTERACTION: A timeline stretches left (past) and right (future).
 * Each tap contracts the timeline — 5 taps. Past and future shrink.
 * At the end: a single pixel remains at center. Only this is real.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CONTRACT_STEPS = 5;

export default function Mystic_NowPoint({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [contracted, setContracted] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const contract = () => {
    if (stage !== 'active' || contracted >= CONTRACT_STEPS) return;
    const next = contracted + 1;
    setContracted(next);
    if (next >= CONTRACT_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = contracted / CONTRACT_STEPS;
  const span = 80 * (1 - t); // timeline width shrinks 80→0

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Past... future...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The past is memory. The future is imagination. Only this pixel is real. Be here. Now.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to contract the timeline</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={contract}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: contracted >= CONTRACT_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(0, 0%, ${3 + t * 2}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Past line — left */}
                <motion.line x1={110 - span} y1="70" x2="108" y2="70"
                  stroke={`hsla(220, ${8 * (1 - t)}%, ${20 * (1 - t)}%, ${0.06 * (1 - t)})`}
                  strokeWidth="0.5"
                  animate={{ x1: 110 - span }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                {/* Future line — right */}
                <motion.line x1="112" y1="70" x2={110 + span} y2="70"
                  stroke={`hsla(220, ${8 * (1 - t)}%, ${20 * (1 - t)}%, ${0.06 * (1 - t)})`}
                  strokeWidth="0.5"
                  animate={{ x2: 110 + span }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                {/* Past ticks */}
                {Array.from({ length: Math.max(0, Math.floor(span / 10)) }, (_, i) => (
                  <motion.line key={`pt-${i}`}
                    x1={105 - i * 10} y1="66" x2={105 - i * 10} y2="74"
                    stroke={`hsla(220, 6%, 18%, ${0.04 * (1 - t)})`}
                    strokeWidth="0.3"
                    animate={{ opacity: 1 - t }}
                  />
                ))}
                {/* Future ticks */}
                {Array.from({ length: Math.max(0, Math.floor(span / 10)) }, (_, i) => (
                  <motion.line key={`ft-${i}`}
                    x1={115 + i * 10} y1="66" x2={115 + i * 10} y2="74"
                    stroke={`hsla(220, 6%, 18%, ${0.04 * (1 - t)})`}
                    strokeWidth="0.3"
                    animate={{ opacity: 1 - t }}
                  />
                ))}
                {/* Labels */}
                {span > 20 && (
                  <>
                    <motion.text x={110 - span + 5} y="60" fontSize="11" fontFamily="monospace"
                      fill={`hsla(220, 6%, 22%, ${0.06 * (1 - t)})`} animate={{ opacity: 1 - t }}>
                      past
                    </motion.text>
                    <motion.text x={110 + span - 20} y="60" fontSize="11" fontFamily="monospace"
                      fill={`hsla(220, 6%, 22%, ${0.06 * (1 - t)})`} animate={{ opacity: 1 - t }}>
                      future
                    </motion.text>
                  </>
                )}
                {/* THE PIXEL — center point, grows in brightness */}
                <motion.circle cx="110" cy="70" r={t >= 1 ? 2 : 1.2}
                  fill={`hsla(45, ${15 + t * 25}%, ${30 + t * 25}%, ${0.1 + t * 0.2})`}
                  animate={{ r: t >= 1 ? 2 : 1.2 }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                {/* Glow around pixel */}
                {t > 0.4 && (
                  <motion.circle cx="110" cy="70" r={4 + t * 6}
                    fill={`hsla(45, ${t * 20}%, ${30 + t * 10}%, ${t * 0.03})`}
                    initial={{ opacity: 0 }} animate={{ opacity: t * 0.03 }}
                  />
                )}
                {/* NOW label */}
                {t >= 1 && (
                  <motion.text x="110" y="90" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(45, 20%, 50%, 0.15)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                    transition={{ delay: 0.5, duration: 2 }}>
                    NOW
                  </motion.text>
                )}
                <text x="110" y="130" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(0, 0%, ${20 + t * 10}%, ${0.04 + t * 0.03})`}>
                  {t >= 1 ? 'only this pixel is real' : `span: ${Math.round((1 - t) * 100)}%`}
                </text>
              </svg>
            </div>
            <motion.div key={contracted} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {contracted === 0 ? 'A timeline. Past stretching left. Future stretching right.' : contracted < CONTRACT_STEPS ? `Timeline contracted. ${Math.round((1 - t) * 100)}% span remaining.` : 'One pixel. No past. No future. Now.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: CONTRACT_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < contracted ? 'hsla(45, 20%, 50%, 0.5)' : palette.primaryFaint, opacity: i < contracted ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five contractions. The timeline collapsed. Past: memory. Future: imagination. Both dissolved. One pixel remains, glowing gold at center. This is the only moment that has ever existed. Be here. Now.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Present moment awareness. The core mechanism of mindfulness. Reduces anxiety about the future and depression about the past. Only now is real.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Timeline. Pixel. Now.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}