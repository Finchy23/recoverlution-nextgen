/**
 * STOIC #7 — The Memento Mori
 * "You will leave this life. Let that determine what you do and say and think."
 * INTERACTION: A skull silhouette. Each tap fades a feature — first
 * the jaw, then the cheekbones, until only a clock face remains where
 * the skull was. Ticking. Mortality clarifies.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FADE_STEPS = 5;
const FADE_LABELS = ['jaw dissolves', 'cheekbones fade', 'eye sockets darken', 'cranium thins', 'only time remains'];

export default function Stoic_MementoMori({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [faded, setFaded] = useState(0);
  const [tickPhase, setTickPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setTickPhase(p => p + 0.015); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const fade = () => {
    if (stage !== 'active' || faded >= FADE_STEPS) return;
    const next = faded + 1;
    setFaded(next);
    if (next >= FADE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = faded / FADE_STEPS;
  const skullOpacity = Math.max(0, 0.2 - t * 0.2);
  const clockOpacity = t;
  // Clock hand angles
  const hourAngle = tickPhase * 0.3;
  const minuteAngle = tickPhase * 3;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A shape forms...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You will leave this life. Let that determine what you do and say and think.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to let the skull dissolve</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={fade}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: faded >= FADE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '180px', height: '190px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 8%, 6%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 180 190" style={{ position: 'absolute', inset: 0 }}>
                {/* Skull silhouette — dissolving */}
                <motion.g initial={{ opacity: 1 }} animate={{ opacity: skullOpacity }} transition={{ duration: 1 }}>
                  {/* Cranium */}
                  <ellipse cx="90" cy="70" rx="38" ry="42"
                    fill="hsla(30, 6%, 22%, 0.35)" stroke="hsla(30, 6%, 28%, 0.2)" strokeWidth="0.5" />
                  {/* Eye sockets */}
                  {t < 0.7 && (
                    <>
                      <ellipse cx="75" cy="68" rx="9" ry="8" fill="hsla(0, 0%, 8%, 0.25)" />
                      <ellipse cx="105" cy="68" rx="9" ry="8" fill="hsla(0, 0%, 8%, 0.25)" />
                    </>
                  )}
                  {/* Nasal cavity */}
                  {t < 0.5 && (
                    <path d="M 87 80 L 90 88 L 93 80 Z" fill="hsla(0, 0%, 10%, 0.2)" />
                  )}
                  {/* Jaw */}
                  {t < 0.3 && (
                    <path d="M 60 90 Q 65 120, 90 125 Q 115 120, 120 90"
                      fill="none" stroke="hsla(30, 6%, 25%, 0.2)" strokeWidth="0.5" />
                  )}
                  {/* Cheekbones */}
                  {t < 0.5 && (
                    <>
                      <line x1="55" y1="75" x2="68" y2="82" stroke="hsla(30, 6%, 25%, 0.15)" strokeWidth="0.3" />
                      <line x1="125" y1="75" x2="112" y2="82" stroke="hsla(30, 6%, 25%, 0.15)" strokeWidth="0.3" />
                    </>
                  )}
                </motion.g>

                {/* Clock face — emerging */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: clockOpacity * 0.4 }} transition={{ duration: 1.5 }}>
                  {/* Clock circle */}
                  <circle cx="90" cy="80" r="35" fill="none"
                    stroke={`hsla(30, 8%, 35%, ${clockOpacity * 0.15})`} strokeWidth="0.8" />
                  {/* Hour marks */}
                  {Array.from({ length: 12 }, (_, i) => {
                    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
                    const inner = 29;
                    const outer = 33;
                    return (
                      <line key={i}
                        x1={90 + Math.cos(a) * inner} y1={80 + Math.sin(a) * inner}
                        x2={90 + Math.cos(a) * outer} y2={80 + Math.sin(a) * outer}
                        stroke={`hsla(30, 8%, 38%, ${clockOpacity * 0.12})`} strokeWidth="0.5" />
                    );
                  })}
                  {/* Hour hand */}
                  <line x1="90" y1="80"
                    x2={90 + Math.cos(hourAngle - Math.PI / 2) * 18}
                    y2={80 + Math.sin(hourAngle - Math.PI / 2) * 18}
                    stroke={`hsla(30, 10%, 40%, ${clockOpacity * 0.2})`} strokeWidth="1" strokeLinecap="round" />
                  {/* Minute hand */}
                  <line x1="90" y1="80"
                    x2={90 + Math.cos(minuteAngle - Math.PI / 2) * 25}
                    y2={80 + Math.sin(minuteAngle - Math.PI / 2) * 25}
                    stroke={`hsla(30, 8%, 38%, ${clockOpacity * 0.15})`} strokeWidth="0.6" strokeLinecap="round" />
                  {/* Center dot */}
                  <circle cx="90" cy="80" r="1.5" fill={`hsla(30, 10%, 40%, ${clockOpacity * 0.2})`} />
                </motion.g>

                {/* MEMENTO MORI */}
                {faded >= FADE_STEPS && (
                  <motion.text x="90" y="140" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(30, 10%, 38%, 0.2)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                    transition={{ delay: 0.5, duration: 1.5 }}>
                    MEMENTO MORI
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={faded} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {faded === 0 ? 'A skull. Watching.' : FADE_LABELS[faded - 1]}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: FADE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < faded ? 'hsla(30, 10%, 38%, 0.45)' : palette.primaryFaint, opacity: i < faded ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The skull dissolved. A clock remains. Ticking. Death clears out the old. Let mortality determine what you do and say and think.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Terror management. Mortality salience, properly framed, clarifies intrinsic values. Trivial anxieties fall away. What remains matters.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Skull. Clock. Clarity.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}