/**
 * MYSTIC #8 — The Maya Veil
 * "This screen is a game. Do not get lost in the simulation."
 * INTERACTION: Interface elements (buttons, text blocks) ripple
 * like a curtain. Each tap lifts one edge — 5 taps. Behind the
 * curtain: light. At full lift: the interface is revealed as illusion.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LIFT_STEPS = 5;

// Fake UI elements on the curtain
const UI_ELEMENTS = [
  { type: 'btn', x: 30, y: 25, w: 50, h: 14, label: 'Like' },
  { type: 'btn', x: 120, y: 25, w: 50, h: 14, label: 'Share' },
  { type: 'text', x: 20, y: 55, w: 160, h: 4, label: '' },
  { type: 'text', x: 20, y: 65, w: 130, h: 4, label: '' },
  { type: 'text', x: 20, y: 75, w: 145, h: 4, label: '' },
  { type: 'btn', x: 60, y: 95, w: 80, h: 16, label: 'Subscribe' },
  { type: 'text', x: 20, y: 120, w: 160, h: 4, label: '' },
  { type: 'text', x: 20, y: 130, w: 100, h: 4, label: '' },
];

export default function Mystic_MayaVeil({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lifted, setLifted] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const lift = () => {
    if (stage !== 'active' || lifted >= LIFT_STEPS) return;
    const next = lifted + 1;
    setLifted(next);
    if (next >= LIFT_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = lifted / LIFT_STEPS;
  const curtainY = t * 100; // lifts from bottom

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            An interface... or a curtain...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>This screen is a game. Your status is a game. Do not get lost in the simulation. Remember who is holding the controller.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to lift the veil</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={lift}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: lifted >= LIFT_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(45, ${t * 12}%, ${5 + t * 10}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Light behind the veil — revealed progressively */}
                <motion.rect x="0" y={160 - curtainY} width="200" height={curtainY}
                  fill={`hsla(45, ${8 + t * 15}%, ${15 + t * 25}%, ${0.03 + t * 0.04})`}
                  animate={{ y: 160 - curtainY, height: curtainY }}
                  transition={{ type: 'spring', stiffness: 30 }}
                />
                {/* Light rays behind */}
                {t > 0.2 && Array.from({ length: 5 }, (_, i) => (
                  <motion.line key={`ray-${i}`}
                    x1={100} y1={160}
                    x2={40 + i * 30} y2={160 - curtainY - 10}
                    stroke={`hsla(45, ${10 + t * 15}%, ${30 + t * 20}%, ${t * 0.025})`}
                    strokeWidth="0.3"
                    initial={{ opacity: 0 }} animate={{ opacity: t * 0.025 }}
                  />
                ))}

                {/* The curtain — UI elements that ripple */}
                <motion.g
                  animate={{ y: -curtainY * 0.6 }}
                  transition={{ type: 'spring', stiffness: 30 }}>
                  {UI_ELEMENTS.map((el, i) => {
                    const ripple = Math.sin(Date.now() * 0.001 + i) * 2 * (1 - t);
                    return (
                      <motion.g key={i} initial={{ opacity: 1 }} animate={{ opacity: 1 - t * 0.7, x: ripple }}>
                        {el.type === 'btn' ? (
                          <>
                            <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="3"
                              fill={`hsla(220, 6%, 14%, ${0.05 * (1 - t)})`}
                              stroke={`hsla(220, 6%, 20%, ${0.04 * (1 - t)})`}
                              strokeWidth="0.3" />
                            <text x={el.x + el.w / 2} y={el.y + el.h / 2 + 2} textAnchor="middle"
                              fontSize="11" fontFamily="monospace"
                              fill={`hsla(220, 6%, 28%, ${0.08 * (1 - t)})`}>
                              {el.label}
                            </text>
                          </>
                        ) : (
                          <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="1.5"
                            fill={`hsla(220, 4%, 16%, ${0.04 * (1 - t)})`} />
                        )}
                      </motion.g>
                    );
                  })}
                  {/* Curtain fold lines */}
                  {Array.from({ length: 3 }, (_, i) => (
                    <motion.path key={`fold-${i}`}
                      d={`M 0,${40 + i * 40} Q ${50 + i * 20},${38 + i * 40 + Math.sin(i) * 3} ${100},${40 + i * 40} Q ${150 + i * 10},${42 + i * 40} 200,${40 + i * 40}`}
                      fill="none"
                      stroke={`hsla(220, 4%, 18%, ${0.02 * (1 - t)})`}
                      strokeWidth="0.2"
                      animate={{ opacity: 1 - t }}
                    />
                  ))}
                </motion.g>

                {/* "SIMULATION" watermark — revealed behind */}
                {t >= 1 && (
                  <motion.text x="100" y="80" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(45, 18%, 45%, 0.12)" letterSpacing="3"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    transition={{ delay: 0.5, duration: 2 }}>
                    REMEMBER
                  </motion.text>
                )}

                <text x="100" y="155" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${t >= 1 ? 45 : 220}, ${6 + t * 8}%, ${22 + t * 10}%, ${0.05 + t * 0.03})`}>
                  {t >= 1 ? 'veil lifted. light behind.' : `lift ${lifted}/${LIFT_STEPS}`}
                </text>
              </svg>
            </div>
            <motion.div key={lifted} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {lifted === 0 ? 'Buttons. Text. Subscribe. The interface ripples like cloth.' : lifted < LIFT_STEPS ? `Edge ${lifted} lifted. Light visible behind.` : 'The veil is gone. Only light. The interface was always a curtain.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: LIFT_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < lifted ? 'hsla(45, 18%, 48%, 0.5)' : palette.primaryFaint, opacity: i < lifted ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five lifts. The buttons rippled like cloth. The text lines swayed. The Subscribe button, a curtain fold. Behind it all: warm, quiet light. The interface was maya, illusion. The screen is a game. Remember who is holding the controller.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>De-reification. Recognizing thoughts and social constructs as mental events rather than solid facts reduces their emotional impact. The simulation is not you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Curtain. Light. Remember.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}