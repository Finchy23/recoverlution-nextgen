/**
 * GUARDIAN #5 — The Transition Buffer
 * "Transitions are hard. Don't rush the switch."
 * INTERACTION: A slow-moving progress bar between two states
 * (PLAY → DINNER). Each tap advances the bar one stage — 5
 * stages. Between stages: gentle warning text. The bar moves
 * deliberately. No rushing. The prefrontal cortex gets time
 * to switch.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BUFFER_STEPS = 5;
const WARNINGS = [
  'five minutes left to play',
  'wrapping up soon',
  'last thing. Then we switch.',
  'almost time to change',
  'gentle landing',
];
const FROM_STATE = 'PLAY';
const TO_STATE = 'DINNER';

export default function Guardian_TransitionBuffer({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const advance = () => {
    if (stage !== 'active' || progress >= BUFFER_STEPS) return;
    const next = progress + 1;
    setProgress(next);
    if (next >= BUFFER_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = progress / BUFFER_STEPS;
  const complete = t >= 1;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Between two worlds...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Transitions are hard. Do not rush the switch. The space between play and dinner is a canyon. Build a bridge. Give warnings. Go slow.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to give each warning</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={advance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: progress >= BUFFER_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(260, ${4 + t * 5}%, ${6 + t * 3}%, 0.85)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* State labels */}
                <text x="25" y="42" fontSize="11" fontFamily="monospace" fontWeight="300"
                  fill={`hsla(180, ${10 + (1 - t) * 8}%, ${30 + (1 - t) * 10}%, ${0.1 + (1 - t) * 0.06})`}>
                  {FROM_STATE}
                </text>
                <text x="195" y="42" textAnchor="end" fontSize="11" fontFamily="monospace" fontWeight="300"
                  fill={`hsla(42, ${10 + t * 8}%, ${30 + t * 10}%, ${0.06 + t * 0.06})`}>
                  {TO_STATE}
                </text>

                {/* Bridge — the transition bar */}
                <g>
                  {/* Track */}
                  <rect x="25" y="58" width="170" height="6" rx="3"
                    fill="hsla(0, 0%, 12%, 0.04)" />
                  {/* Fill */}
                  <motion.rect x="25" y="58" width={170 * t} height="6" rx="3"
                    fill={`hsla(${180 + t * 40}, ${10 + t * 10}%, ${28 + t * 10}%, ${0.06 + t * 0.06})`}
                    initial={{ width: 0 }}
                    animate={{ width: 170 * t }}
                    transition={{ type: 'spring', stiffness: 30, damping: 15 }}
                  />
                  {/* Marker */}
                  <motion.circle cx={25 + 170 * t} cy="61" r="4.5"
                    fill={`hsla(${180 + t * 40}, ${12 + t * 8}%, ${32 + t * 10}%, ${0.08 + t * 0.06})`}
                    stroke={`hsla(${180 + t * 40}, 10%, 25%, ${0.04 + t * 0.03})`}
                    strokeWidth="0.4"
                    initial={{ cx: 25 }}
                    animate={{ cx: 25 + 170 * t }}
                    transition={{ type: 'spring', stiffness: 30, damping: 15 }}
                  />
                </g>

                {/* Step markers on track */}
                {Array.from({ length: BUFFER_STEPS + 1 }, (_, i) => {
                  const px = 25 + (170 / BUFFER_STEPS) * i;
                  return (
                    <circle key={i} cx={px} cy="61" r="1.2"
                      fill={i <= progress
                        ? `hsla(${180 + (i / BUFFER_STEPS) * 40}, 12%, 38%, 0.08)`
                        : 'hsla(0, 0%, 15%, 0.03)'
                      } />
                  );
                })}

                {/* Warning text — current stage */}
                {progress > 0 && progress <= BUFFER_STEPS && (
                  <motion.text x="110" y="95" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(${180 + t * 40}, ${10 + t * 6}%, ${32 + t * 8}%, ${0.08 + t * 0.04})`}
                    key={progress}
                    initial={{ opacity: 0, y: 2 }} animate={{ opacity: 0.1, y: 0 }}
                    transition={{ duration: 1 }}>
                    "{WARNINGS[progress - 1]}"
                  </motion.text>
                )}

                {/* Canyon metaphor — depth lines below bar */}
                <g opacity={0.03 + (1 - t) * 0.03}>
                  {Array.from({ length: 4 }, (_, i) => {
                    const y = 72 + i * 8;
                    const indent = i * 8;
                    return (
                      <line key={i}
                        x1={25 + indent} y1={y}
                        x2={195 - indent} y2={y}
                        stroke="hsla(0, 0%, 20%, 0.03)"
                        strokeWidth="0.3" strokeDasharray="3 4" />
                    );
                  })}
                </g>

                {/* Cognitive load indicator */}
                <text x="25" y="145" fontSize="11" fontFamily="monospace"
                  fill={`hsla(260, 8%, 28%, ${0.04 + t * 0.03})`}>
                  cognitive load: {Math.round((1 - t) * 100)}%
                </text>

                {/* BRIDGED */}
                {complete && (
                  <motion.text x="110" y="130" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(42, 18%, 48%, 0.15)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    BRIDGED
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={progress} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {progress === 0 ? 'Play on one side. Dinner on the other. A canyon between.' : progress < BUFFER_STEPS ? `Warning ${progress}. Bridge building. Go slow.` : 'Five warnings. Smooth landing. The switch happened without a fight.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BUFFER_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < progress ? 'hsla(210, 15%, 45%, 0.5)' : palette.primaryFaint, opacity: i < progress ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five gentle warnings. The bridge built itself one plank at a time. Play ended. Dinner began. No meltdown in the canyon. The cognitive load dropped to zero because you gave the prefrontal cortex time to switch gears.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Executive function support. The prefrontal cortex, responsible for task-switching, is the last part of the brain to develop. Externalizing the transition reduces cognitive load. Build the bridge.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Canyon. Bridge. Crossed.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}