/**
 * INFINITE PLAYER #8 — The Unplanned Hour
 * "Efficiency is for robots. Humans are for wandering. Get lost."
 * INTERACTION: A clock with hands. Each tap removes a hand or a number —
 * 5 taps. Hour hand → minute hand → 12 → 3,6,9 → all numbers.
 * At the end: blank circle. No time. Follow the drift.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STRIP_STEPS = 5;
const LABELS_REMOVED = ['hour hand', 'minute hand', '12 o\'clock', 'quarter marks', 'all numbers'];

export default function Infinite_UnplannedHour({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stripped, setStripped] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const strip = () => {
    if (stage !== 'active' || stripped >= STRIP_STEPS) return;
    const next = stripped + 1;
    setStripped(next);
    if (next >= STRIP_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = stripped / STRIP_STEPS;
  const showHourHand = stripped < 1;
  const showMinuteHand = stripped < 2;
  const show12 = stripped < 3;
  const showQuarters = stripped < 4;
  const showNumbers = stripped < 5;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Time... dissolving...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>No agenda. No goals. Follow the drift. Efficiency is for robots. Humans are for wandering. Get lost.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to strip the clock</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={strip}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: stripped >= STRIP_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '260px' }}>
            <div style={{ position: 'relative', width: '170px', height: '170px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(0, 0%, ${4 + t * 4}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 170 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Clock face circle */}
                <circle cx="85" cy="85" r="65"
                  fill="none" stroke={`hsla(0, 0%, ${15 + t * 5}%, ${0.05 - t * 0.02})`}
                  strokeWidth="0.5" />

                {/* Numbers around the dial */}
                {showNumbers && [1,2,3,4,5,6,7,8,9,10,11,12].map(n => {
                  if (!show12 && n === 12) return null;
                  if (!showQuarters && [3,6,9].includes(n)) return null;
                  const angle = ((n - 3) / 12) * Math.PI * 2;
                  const nx = 85 + Math.cos(angle) * 52;
                  const ny = 85 + Math.sin(angle) * 52 + 2;
                  return (
                    <text key={n} x={nx} y={ny} textAnchor="middle" fontSize="5" fontFamily="monospace"
                      fill={`hsla(0, 0%, 22%, 0.06)`}>
                      {n}
                    </text>
                  );
                })}

                {/* Tick marks */}
                {showNumbers && Array.from({ length: 12 }, (_, i) => {
                  if (!show12 && i === 0) return null;
                  if (!showQuarters && [3,6,9].includes(i)) return null;
                  const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
                  const x1 = 85 + Math.cos(angle) * 58;
                  const y1 = 85 + Math.sin(angle) * 58;
                  const x2 = 85 + Math.cos(angle) * 62;
                  const y2 = 85 + Math.sin(angle) * 62;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={`hsla(0, 0%, 20%, 0.04)`} strokeWidth="0.4" />
                  );
                })}

                {/* Hour hand */}
                {showHourHand && (
                  <line x1="85" y1="85" x2="85" y2="55"
                    stroke="hsla(0, 0%, 22%, 0.08)" strokeWidth="1.2" strokeLinecap="round" />
                )}

                {/* Minute hand */}
                {showMinuteHand && (
                  <line x1="85" y1="85" x2="105" y2="48"
                    stroke="hsla(0, 0%, 22%, 0.06)" strokeWidth="0.6" strokeLinecap="round" />
                )}

                {/* Center dot */}
                <circle cx="85" cy="85" r={1.5 - t * 0.8}
                  fill={`hsla(0, 0%, ${20 + t * 10}%, ${0.06 - t * 0.03})`} />

                {/* Empty glow at full strip */}
                {t >= 1 && (
                  <>
                    <motion.circle cx="85" cy="85" r="50"
                      fill="hsla(0, 0%, 25%, 0.02)"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                      transition={{ duration: 3 }}
                    />
                    <motion.text x="85" y="88" textAnchor="middle" fontSize="6" fontFamily="Georgia, serif"
                      fill="hsla(0, 0%, 35%, 0.12)" letterSpacing="1"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.1 }}
                      transition={{ delay: 0.5, duration: 2 }}>
                      drift
                    </motion.text>
                  </>
                )}

                <text x="85" y="160" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(0, 0%, ${20 + t * 10}%, ${0.04 + t * 0.03})`}>
                  {t >= 1 ? 'no time. follow the drift.' : `removed: ${LABELS_REMOVED[stripped - 1] || '...'}`}
                </text>
              </svg>
            </div>
            <motion.div key={stripped} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {stripped === 0 ? 'A clock. Hands pointing. Numbers circling. Time pressing.' : stripped < STRIP_STEPS ? `Removed: ${LABELS_REMOVED[stripped - 1]}. The clock loosens.` : 'Empty circle. No hands. No numbers. No time. Drift.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: STRIP_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < stripped ? 'hsla(0, 0%, 45%, 0.4)' : palette.primaryFaint, opacity: i < stripped ? 0.5 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five removals. Hour hand, gone. Minute hand, gone. The 12, the quarters, all the numbers, gone. An empty circle. No agenda. No goals. No time. Follow the drift. Efficiency is for robots. Humans are for wandering.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Non-teleological action. Doing things for no purpose, autotelic activity, restores cognitive resources depleted by constant goal-directed striving. Get lost.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Clock. Strip. Drift.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}