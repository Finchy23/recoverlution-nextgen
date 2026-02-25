/**
 * ATHLETE #4 -- The Sleep Gate
 * "Sleep is not a pause. It is the cleaning crew."
 * INTERACTION: A heavy velvet curtain at top, partly drawn. Each tap
 * draws it further closed. 5 draws. The room dims progressively.
 * At final draw: complete darkness. The glymphatic system washes.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DRAW_STEPS = 5;

export default function Athlete_SleepGate({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [drawn, setDrawn] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const draw = () => {
    if (stage !== 'active' || drawn >= DRAW_STEPS) return;
    const next = drawn + 1;
    setDrawn(next);
    if (next >= DRAW_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = drawn / DRAW_STEPS;
  const closed = t >= 1;
  const curtainWidth = 15 + t * 85; // 15% → 100% coverage
  const roomLight = 1 - t * 0.9;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A curtain waits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Adenosine is high. The window is open. Sleep is not a pause; it is the cleaning crew. Let the glymphatic system wash the brain.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to draw the curtain</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={draw}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: drawn >= DRAW_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(250, ${6 + t * 4}%, ${5 + roomLight * 4}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Room light -- fading window */}
                <rect x="70" y="30" width="60" height="80" rx="2"
                  fill={`hsla(220, ${12 * roomLight}%, ${18 + roomLight * 15}%, ${roomLight * 0.06})`}
                  stroke={`hsla(220, 8%, 22%, ${roomLight * 0.05})`} strokeWidth="0.5" />
                <rect x="30" y="20" width="180" height="160" rx="5" fill="none"
                  stroke={`hsla(220, 8%, 22%, ${roomLight * 0.04})`} strokeWidth={safeSvgStroke(0.3)} />
                {/* Window pane cross */}
                <line x1="100" y1="30" x2="100" y2="110"
                  stroke={`hsla(220, 8%, 22%, ${roomLight * 0.04})`} strokeWidth={safeSvgStroke(0.3)} />
                <line x1="70" y1="70" x2="130" y2="70"
                  stroke={`hsla(220, 8%, 22%, ${roomLight * 0.04})`} strokeWidth={safeSvgStroke(0.3)} />

                {/* Curtain -- drawing from left */}
                <motion.rect
                  x="0" y="0" width={curtainWidth * 2} height="170" rx="0"
                  fill={`hsla(270, 12%, ${10 + t * 3}%, ${0.08 + t * 0.15})`}
                  initial={{ width: 0 }}
                  animate={{ width: curtainWidth * 2 }}
                  transition={{ type: 'spring', stiffness: 60 }}
                />
                {/* Curtain folds */}
                {Array.from({ length: Math.floor(curtainWidth / 12) }, (_, i) => (
                  <line key={i} x1={i * 12 + 6} y1="0" x2={i * 12 + 6} y2="170"
                    stroke={`hsla(270, 8%, 14%, ${0.02 + t * 0.02})`} strokeWidth={safeSvgStroke(0.3)} />
                ))}
                {/* Curtain rod */}
                <line x1="0" y1="5" x2="200" y2="5"
                  stroke="hsla(30, 8%, 20%, 0.06)" strokeWidth="1.5" />

                {/* Adenosine meter */}
                <g>
                  <rect x="175" y="30" width="6" height="60" rx="2"
                    fill="hsla(250, 6%, 12%, 0.04)" />
                  <rect x="175" y={30 + (1 - t) * 60} width="6" height={t * 60} rx="2"
                    fill={`hsla(250, 15%, 35%, ${0.06 + t * 0.06})`} />
                  <text x="178" y="25" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                    fill="hsla(250, 10%, 30%, 0.08)">ADE</text>
                </g>

                {/* Glymphatic wash -- tiny flowing particles in darkness */}
                {closed && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ duration: 2 }}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <motion.circle key={i}
                        cx={30 + i * 14} cy={60 + (i % 3) * 20}
                        r="1" fill="hsla(200, 20%, 45%, 0.08)"
                        initial={{ cy: 60 + (i % 3) * 20 }}
                        animate={{ cy: [60 + (i % 3) * 20, 60 + (i % 3) * 20 + 30] }}
                        transition={{ duration: 3 + i * 0.2, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    ))}
                  </motion.g>
                )}

                {/* Darkness label */}
                {closed && (
                  <motion.text x="100" y="140" textAnchor="middle" fontSize="6" fontFamily="monospace"
                    fill="hsla(250, 12%, 35%, 0.1)" letterSpacing="3"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ delay: 1, duration: 2 }}>
                    washing
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={drawn} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {drawn === 0 ? 'The curtain. Partly open. Light leaking.' : drawn < DRAW_STEPS ? `Draw ${drawn}. Room dimming.` : 'Dark. The cleaning crew arrives.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: DRAW_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < drawn ? 'hsla(250, 15%, 40%, 0.5)' : palette.primaryFaint, opacity: i < drawn ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Curtain drawn. Complete darkness. Adenosine respected. The cleaning crew goes to work, and the brain washes itself.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Glymphatic clearance. During deep sleep, the brain flushes neurotoxins. Sleep pressure must be honored. It is not a pause; it is maintenance.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Curtain. Dark. Clean.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}