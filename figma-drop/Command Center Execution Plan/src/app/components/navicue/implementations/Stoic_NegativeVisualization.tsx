/**
 * STOIC #4 — The Negative Visualization (Pre-Mortem)
 * "Rehearse the worst. If you have already faced it in your mind,
 *  it cannot hurt you in reality."
 * INTERACTION: A horizontal timeline. A red "FAILURE" marker ahead.
 * Each tap moves the playhead forward toward the failure, then past it.
 * Beyond the failure: clarity. You already survived it.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ADVANCE_STEPS = 5;

export default function Stoic_NegativeVisualization({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [advanced, setAdvanced] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const advance = () => {
    if (stage !== 'active' || advanced >= ADVANCE_STEPS) return;
    const next = advanced + 1;
    setAdvanced(next);
    if (next >= ADVANCE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = advanced / ADVANCE_STEPS;
  const playheadX = 20 + t * 170; // 20 to 190
  const failureX = 120;
  const pastFailure = playheadX > failureX;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A timeline appears...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Rehearse the worst. If you have already faced it in your mind, it cannot hurt you in reality.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to advance through the failure</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={advance}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: advanced >= ADVANCE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '120px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 8%, 7%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 120" style={{ position: 'absolute', inset: 0 }}>
                {/* Timeline base */}
                <line x1="15" y1="60" x2="205" y2="60"
                  stroke="hsla(0, 0%, 25%, 0.12)" strokeWidth="1" strokeLinecap="round" />
                {/* Tick marks */}
                {Array.from({ length: 7 }, (_, i) => {
                  const x = 20 + i * 30;
                  return (
                    <line key={i} x1={x} y1="55" x2={x} y2="65"
                      stroke="hsla(0, 0%, 25%, 0.08)" strokeWidth="0.5" />
                  );
                })}
                {/* Failure marker */}
                <motion.g initial={{ opacity: 0.4 }} animate={{ opacity: pastFailure ? 0.15 : 0.4 }} transition={{ duration: 0.8 }}>
                  <line x1={failureX} y1="38" x2={failureX} y2="82"
                    stroke={`hsla(0, ${pastFailure ? 10 : 35}%, ${pastFailure ? 30 : 40}%, ${pastFailure ? 0.12 : 0.3})`}
                    strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x={failureX} y="32" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(0, ${pastFailure ? 8 : 25}%, ${pastFailure ? 28 : 38}%, ${pastFailure ? 0.12 : 0.25})`}>
                    FAILURE
                  </text>
                  {/* Red zone around failure */}
                  <rect x={failureX - 12} y="50" width="24" height="20" rx="3"
                    fill={`hsla(0, ${pastFailure ? 8 : 20}%, ${pastFailure ? 15 : 20}%, ${pastFailure ? 0.02 : 0.06})`} />
                </motion.g>
                {/* Traversed path — colored */}
                {t > 0 && (
                  <motion.line x1="20" y1="60" x2={playheadX} y2="60"
                    stroke={pastFailure ? 'hsla(140, 18%, 35%, 0.2)' : 'hsla(30, 15%, 35%, 0.15)'}
                    strokeWidth="2" strokeLinecap="round"
                    animate={{ x2: playheadX }}
                    transition={{ type: 'spring', stiffness: 60 }}
                  />
                )}
                {/* Playhead */}
                <motion.g initial={{ x: 0 }} animate={{ x: playheadX - 20 }} transition={{ type: 'spring', stiffness: 60 }}>
                  <circle cx="20" cy="60" r="5"
                    fill={pastFailure ? 'hsla(140, 20%, 38%, 0.3)' : `hsla(30, 15%, 40%, ${0.2 + t * 0.1})`} />
                  <circle cx="20" cy="60" r="2"
                    fill={pastFailure ? 'hsla(140, 25%, 45%, 0.35)' : `hsla(30, 20%, 45%, ${0.25 + t * 0.1})`} />
                </motion.g>
                {/* Beyond failure — clarity zone */}
                {pastFailure && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ duration: 1.5 }}>
                    <rect x={failureX + 15} y="48" width={190 - failureX} height="24" rx="4"
                      fill="hsla(140, 15%, 25%, 0.05)" />
                    <text x={failureX + 45} y="63" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(140, 15%, 40%, 0.18)">
                      clarity
                    </text>
                  </motion.g>
                )}
                {/* "now" label under playhead */}
                <motion.text x={playheadX} y="78" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill="hsla(0, 0%, 35%, 0.15)"
                  animate={{ x: playheadX }}>
                  now
                </motion.text>
                {/* Post-mortem stamp */}
                {advanced >= ADVANCE_STEPS && (
                  <motion.text x="110" y="105" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(140, 15%, 38%, 0.2)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                    transition={{ delay: 0.5, duration: 1 }}>
                    SURVIVED
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={advanced} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {advanced === 0 ? 'The timeline. Failure ahead.' : !pastFailure ? 'Approaching the worst...' : advanced < ADVANCE_STEPS ? 'Past the failure. Still here.' : 'Survived. It was a rehearsal.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ADVANCE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < advanced ? 'hsla(30, 12%, 40%, 0.5)' : palette.primaryFaint, opacity: i < advanced ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You advanced through the failure. Past it. Clarity beyond. If you already faced it in your mind, reality cannot surprise you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Stress inoculation. Simulating adversity in safety reduces the shock response. Faster recovery. The rehearsal is the armor.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Failure. Through. Clarity.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}