/**
 * GUARDIAN #4 — The Repair Ritual
 * "The magic is not in avoiding the conflict. It is in the repair."
 * INTERACTION: A thread snaps in the middle — two frayed ends.
 * Each tap draws one end closer. 5 taps to close the gap.
 * At contact: a knot ties itself. The knot glows into a bead
 * of strength. The bond is stronger at the break.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const REPAIR_STEPS = 5;

export default function Guardian_RepairRitual({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [repaired, setRepaired] = useState(0);
  const [knotted, setKnotted] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const repair = () => {
    if (stage !== 'active' || repaired >= REPAIR_STEPS || knotted) return;
    const next = repaired + 1;
    setRepaired(next);
    if (next >= REPAIR_STEPS) {
      addTimer(() => {
        setKnotted(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
      }, 1000);
    }
  };

  const t = repaired / REPAIR_STEPS;
  // Gap between thread ends: starts at 80px, closes to 0
  const gap = (1 - t) * 80;
  const leftEnd = 110 - gap / 2;
  const rightEnd = 110 + gap / 2;

  // Fray amplitude — decreases as repair progresses
  const fray = (1 - t) * 4;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something broke...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The magic is not in avoiding the conflict. It is in the repair. Go back. Say sorry. Reconnect.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to draw the ends together</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={repair}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: repaired >= REPAIR_STEPS || knotted ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(25, ${5 + t * 5}%, ${6 + t * 3}%, 0.25)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Left thread — from edge to break point */}
                <motion.path
                  d={`M 20,80 C 40,${80 + Math.sin(1) * 2} 60,${80 - Math.sin(2) * 2} ${leftEnd},80`}
                  fill="none"
                  stroke={`hsla(25, ${10 + t * 8}%, ${28 + t * 8}%, ${0.25 + t * 0.15})`}
                  strokeWidth="1.2" strokeLinecap="round"
                  initial={{ d: `M 20,80 C 40,${80 + Math.sin(1) * 2} 60,${80 - Math.sin(2) * 2} ${leftEnd},80` }}
                  animate={{ d: `M 20,80 C 40,${80 + Math.sin(1) * 2} 60,${80 - Math.sin(2) * 2} ${leftEnd},80` }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                {/* Left frayed ends */}
                {!knotted && Array.from({ length: 3 }, (_, i) => (
                  <motion.line key={`lf-${i}`}
                    x1={leftEnd} y1={80}
                    x2={leftEnd + 2 + i} y2={80 + (i - 1) * fray}
                    stroke={`hsla(25, 8%, 25%, ${0.15 * (1 - t)})`}
                    strokeWidth="0.4" strokeLinecap="round"
                    initial={{ x2: leftEnd + 2 + i, y2: 80 + (i - 1) * fray }}
                    animate={{ x2: leftEnd + 2 + i, y2: 80 + (i - 1) * fray }}
                    transition={{ type: 'spring', stiffness: 40 }}
                  />
                ))}

                {/* Right thread — from break point to edge */}
                <motion.path
                  d={`M ${rightEnd},80 C ${rightEnd + 20},${80 + Math.sin(3) * 2} 180,${80 - Math.sin(1) * 2} 200,80`}
                  fill="none"
                  stroke={`hsla(25, ${10 + t * 8}%, ${28 + t * 8}%, ${0.25 + t * 0.15})`}
                  strokeWidth="1.2" strokeLinecap="round"
                  initial={{ d: `M ${rightEnd},80 C ${rightEnd + 20},${80 + Math.sin(3) * 2} 180,${80 - Math.sin(1) * 2} 200,80` }}
                  animate={{ d: `M ${rightEnd},80 C ${rightEnd + 20},${80 + Math.sin(3) * 2} 180,${80 - Math.sin(1) * 2} 200,80` }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                {/* Right frayed ends */}
                {!knotted && Array.from({ length: 3 }, (_, i) => (
                  <motion.line key={`rf-${i}`}
                    x1={rightEnd} y1={80}
                    x2={rightEnd - 2 - i} y2={80 + (i - 1) * fray}
                    stroke={`hsla(25, 8%, 25%, ${0.15 * (1 - t)})`}
                    strokeWidth="0.4" strokeLinecap="round"
                    initial={{ x2: rightEnd - 2 - i, y2: 80 + (i - 1) * fray }}
                    animate={{ x2: rightEnd - 2 - i, y2: 80 + (i - 1) * fray }}
                    transition={{ type: 'spring', stiffness: 40 }}
                  />
                ))}

                {/* Knot — appears when fully repaired */}
                {knotted && (
                  <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 120 }}>
                    {/* Knot crossings */}
                    <path d="M 106,77 C 108,74 112,74 114,77 C 116,80 116,83 114,85 C 112,87 108,87 106,85 C 104,83 104,80 106,77"
                      fill="none"
                      stroke="hsla(42, 18%, 42%, 0.3)"
                      strokeWidth="1.5" strokeLinecap="round" />
                    {/* Inner loop */}
                    <ellipse cx="110" cy="80.5" rx="3" ry="3.5"
                      fill="none"
                      stroke="hsla(42, 15%, 38%, 0.2)"
                      strokeWidth="0.8" />
                  </motion.g>
                )}

                {/* Bead glow — knot becomes strength */}
                {knotted && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8, duration: 2 }}>
                    <circle cx="110" cy="80.5" r="5"
                      fill="hsla(42, 22%, 48%, 0.25)" />
                    <circle cx="110" cy="80.5" r="10"
                      fill="hsla(42, 18%, 45%, 0.12)" />
                    <circle cx="110" cy="80.5" r="16"
                      fill="hsla(42, 14%, 42%, 0.06)" />
                  </motion.g>
                )}

                {/* Gap distance */}
                {!knotted && (
                  <text x="110" y="100" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(25, 8%, 28%, ${0.15 + t * 0.1})`}>
                    {gap > 0 ? `gap: ${Math.round(gap)}` : 'contact'}
                  </text>
                )}

                {/* Step counter */}
                <text x="110" y="148" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${knotted ? 42 : 25}, ${8 + t * 8}%, ${25 + t * 10}%, ${0.2 + t * 0.15})`}>
                  {knotted ? 'repaired. stronger at the break.' : `repair ${repaired}/${REPAIR_STEPS}`}
                </text>
              </svg>
            </div>
            <motion.div key={`${repaired}-${knotted}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {repaired === 0 ? 'Broken thread. Two frayed ends. The gap is wide.' : !knotted && repaired < REPAIR_STEPS ? `Closer. Gap narrowing. Repair ${repaired}.` : knotted ? 'Knotted. The bead glows. Stronger at the break.' : 'Ends touching. The knot is forming.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: REPAIR_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < repaired ? 'hsla(42, 20%, 48%, 0.5)' : palette.primaryFaint, opacity: i < repaired ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five steps back to each other. The frayed ends met. A knot tied itself. And the knot became a bead of gold. Stronger at the break. The magic was never in avoiding the rupture. It was in the repair.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Rupture and repair. The strength of an attachment bond is determined not by the absence of conflict, but by the reliability of the repair. Go back. Say sorry. Reconnect.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Break. Knot. Bead.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}