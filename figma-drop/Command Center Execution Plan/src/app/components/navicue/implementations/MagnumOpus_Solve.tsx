/**
 * MAGNUMOPUS #5 — Solve
 * "First, dissolve. The old form must break before the new can coalesce."
 * ARCHETYPE: Pattern A (Tap ×5) — Solve et Coagula, part one.
 * Each tap dissolves a structure into particles: walls, floor,
 * ceiling, self, finally thought itself.
 * Cognitive Flexibility — letting go of rigid structures.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNUMOPUS_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Ember');
const TH = MAGNUMOPUS_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DISSOLVES = [
  { label: 'WALLS', desc: 'the boundary loosens' },
  { label: 'FLOOR', desc: 'the ground gives way' },
  { label: 'CEILING', desc: 'no limit above' },
  { label: 'SELF', desc: 'the outline blurs' },
  { label: 'THOUGHT', desc: 'even meaning dissolves' },
];

export default function MagnumOpus_Solve({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const dissolve = () => {
    if (stage !== 'active' || taps >= DISSOLVES.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= DISSOLVES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const d = taps / DISSOLVES.length; // dissolution fraction
  const item = DISSOLVES[Math.min(taps, DISSOLVES.length - 1)];

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Structures tremble...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Solve et Coagula: dissolve and recombine. The first half is the hardest. You must unmake before you can remake. Tap to dissolve each structure.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to dissolve</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={dissolve}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= DISSOLVES.length ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '200px', height: '170px' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170">
                {/* Room structure — dissolving */}
                {/* Walls */}
                {taps < 1 && <>
                  <line x1="40" y1="30" x2="40" y2="140" stroke={themeColor(TH.primaryHSL, 0.08, 10)} strokeWidth="0.5" />
                  <line x1="160" y1="30" x2="160" y2="140" stroke={themeColor(TH.primaryHSL, 0.08, 10)} strokeWidth="0.5" />
                </>}
                {/* Floor */}
                {taps < 2 && (
                  <line x1="40" y1="140" x2="160" y2="140" stroke={themeColor(TH.primaryHSL, 0.08, 10)} strokeWidth="0.5" />
                )}
                {/* Ceiling */}
                {taps < 3 && (
                  <line x1="40" y1="30" x2="160" y2="30" stroke={themeColor(TH.primaryHSL, 0.08, 10)} strokeWidth="0.5" />
                )}
                {/* Self — figure in center */}
                {taps < 4 && (
                  <g>
                    <ellipse cx="100" cy="75" rx="10" ry="12" fill="none"
                      stroke={themeColor(TH.accentHSL, 0.08, 12)} strokeWidth="0.5" />
                    <rect x="90" y="88" width="20" height="28" rx="5" fill="none"
                      stroke={themeColor(TH.accentHSL, 0.06, 10)} strokeWidth="0.4" />
                  </g>
                )}
                {/* Thought — text fragments */}
                {taps < 5 && (
                  <g>
                    <text x="70" y="50" fontSize="4" fontFamily="serif" fill={themeColor(TH.primaryHSL, 0.04, 8)}>I think therefore</text>
                    <text x="100" y="135" fontSize="4" fontFamily="serif" fill={themeColor(TH.primaryHSL, 0.04, 8)}>I am</text>
                  </g>
                )}

                {/* Dissolution particles — grow with each tap */}
                {Array.from({ length: taps * 8 }, (_, i) => {
                  const seed = (i * 37 + taps * 13) % 100;
                  const px = 30 + (seed * 1.4) % 140;
                  const py = 20 + ((seed * 1.7 + i * 23) % 130);
                  return (
                    <motion.circle key={`p-${taps}-${i}`}
                      cx={px} cy={py}
                      r={0.8 + (i % 3) * 0.4}
                      fill={themeColor(TH.accentHSL, 0.04 + d * 0.04, 15)}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 0.08, 0.04],
                        scale: [0, 1, 0.8],
                        x: [(i % 2 ? -5 : 5), 0],
                        y: [-3, 3],
                      }}
                      transition={{ duration: 3 + i * 0.2, repeat: Infinity, delay: i * 0.05 }} />
                  );
                })}

                {/* Current dissolution label */}
                <AnimatePresence mode="wait">
                  <motion.g key={taps}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <text x="100" y="158" textAnchor="middle" fontSize="6" fontFamily="monospace"
                      fill={themeColor(TH.accentHSL, 0.12, 12)} letterSpacing="0.1em">
                      {item.label}
                    </text>
                    <text x="100" y="168" textAnchor="middle" fontSize="5" fontFamily="serif" fontStyle="italic"
                      fill={themeColor(TH.accentHSL, 0.08, 10)}>
                      {item.desc}
                    </text>
                  </motion.g>
                </AnimatePresence>
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {DISSOLVES.map((_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.2, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Everything dissolved. Walls, floor, ceiling, self, even thought. And yet, you are still here, reading this. What remains after everything is removed? That{'\u2019'}s the material for the next creation.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>what remains is the material</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Solve.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}