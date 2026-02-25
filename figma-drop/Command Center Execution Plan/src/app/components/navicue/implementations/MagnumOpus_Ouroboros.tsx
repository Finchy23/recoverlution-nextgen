/**
 * MAGNUMOPUS #9 — The Ouroboros
 * "The serpent eats its tail. The end is always the beginning."
 * ARCHETYPE: Pattern A (Tap ×5) — Each tap reveals a phase of
 * the cycle: birth → growth → decay → death → rebirth.
 * The serpent completes its circle. Cyclical Thinking / Acceptance.
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

const CYCLES = [
  { label: 'BIRTH', desc: 'something emerges from nothing', angle: 0 },
  { label: 'GROWTH', desc: 'expansion into the unknown', angle: 72 },
  { label: 'DECAY', desc: 'the loosening of form', angle: 144 },
  { label: 'DEATH', desc: 'the return to stillness', angle: 216 },
  { label: 'REBIRTH', desc: 'and again, from the ashes', angle: 288 },
];

export default function MagnumOpus_Ouroboros({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const cycle = () => {
    if (stage !== 'active' || taps >= CYCLES.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= CYCLES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const progress = taps / CYCLES.length;
  const item = CYCLES[Math.min(taps, CYCLES.length - 1)];
  const cx = 90, cy = 85, R = 55;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The serpent stirs...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The ouroboros — the serpent eating its own tail. The oldest symbol in alchemy. Not a circle of futility, but a circle of completion. Every ending feeds the next beginning.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to reveal each phase</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={cycle}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= CYCLES.length ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180">
                {/* Serpent body — circular arc growing with taps */}
                {(() => {
                  const arcAngle = progress * 360;
                  const startAngle = -90; // top
                  const endAngle = startAngle + arcAngle;
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  const x1 = cx + R * Math.cos(startRad);
                  const y1 = cy + R * Math.sin(startRad);
                  const x2 = cx + R * Math.cos(endRad);
                  const y2 = cy + R * Math.sin(endRad);
                  const largeArc = arcAngle > 180 ? 1 : 0;
                  if (arcAngle <= 0) return null;
                  return (
                    <motion.path
                      d={`M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`}
                      fill="none"
                      stroke={themeColor(TH.accentHSL, 0.12 + progress * 0.08, 15)}
                      strokeWidth={2 + progress}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6 }} />
                  );
                })()}

                {/* Serpent head — at leading edge */}
                {taps > 0 && (() => {
                  const headAngle = (-90 + progress * 360) * Math.PI / 180;
                  const hx = cx + R * Math.cos(headAngle);
                  const hy = cy + R * Math.sin(headAngle);
                  return (
                    <motion.circle cx={hx} cy={hy} r="5"
                      fill={themeColor(TH.accentHSL, 0.15 + progress * 0.1, 20)}
                      initial={{ cx: hx, cy: hy }}
                      animate={{ cx: hx, cy: hy }}
                      transition={{ type: 'spring', stiffness: 60 }} />
                  );
                })()}

                {/* Serpent tail — at start (top) */}
                {taps > 0 && (
                  <circle cx={cx} cy={cy - R} r="3"
                    fill={themeColor(TH.primaryHSL, 0.08, 10)} />
                )}

                {/* Phase markers on the circle */}
                {CYCLES.map((c, i) => {
                  const a = (-90 + c.angle) * Math.PI / 180;
                  const mx = cx + (R + 15) * Math.cos(a);
                  const my = cy + (R + 15) * Math.sin(a);
                  const active = i < taps;
                  return (
                    <motion.g key={i} initial={{ opacity: 0.3 }} animate={{ opacity: active ? 1 : 0.3 }}>
                      <circle cx={cx + R * Math.cos(a)} cy={cy + R * Math.sin(a)} r="2"
                        fill={themeColor(TH.accentHSL, active ? 0.2 : 0.04, 15)} />
                    </motion.g>
                  );
                })}

                {/* Center text */}
                <AnimatePresence mode="wait">
                  <motion.g key={taps}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <text x={cx} y={cy - 3} textAnchor="middle" fontSize="6" fontFamily="monospace"
                      fill={themeColor(TH.accentHSL, 0.15, 15)} letterSpacing="0.1em">
                      {item.label}
                    </text>
                    <text x={cx} y={cy + 10} textAnchor="middle" fontSize="4.5" fontFamily="serif" fontStyle="italic"
                      fill={themeColor(TH.accentHSL, 0.1, 10)}>
                      {item.desc}
                    </text>
                  </motion.g>
                </AnimatePresence>

                {/* Complete circle indicator */}
                {taps >= CYCLES.length && (
                  <motion.circle cx={cx} cy={cy} r={R}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.04, 18)}
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                )}
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {CYCLES.map((_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.25, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Birth, growth, decay, death, rebirth. The serpent{'\u2019'}s mouth meets its tail. This is not repetition. It is renewal. Every ending you{'\u2019'}ve survived was just the beginning you hadn{'\u2019'}t recognized yet.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the end feeds the beginning</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>And again.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}