/**
 * STOIC #2 — The Voluntary Discomfort
 * "By choosing a small pain, you inoculate yourself against the big pains."
 * INTERACTION: A cold-blue temperature dial. Each tap turns it colder.
 * The field contracts, gets crisper. At minimum temperature a callus
 * texture hardens over the surface. You chose the hard thing.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('science_x_soul', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const COLD_STEPS = 5;
const TEMP_LABELS = ['warm', 'cool', 'cold', 'colder', 'frigid'];

export default function Stoic_VoluntaryDiscomfort({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [coldLevel, setColdLevel] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const chill = () => {
    if (stage !== 'active' || coldLevel >= COLD_STEPS) return;
    const next = coldLevel + 1;
    setColdLevel(next);
    if (next >= COLD_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = coldLevel / COLD_STEPS;
  const hue = 30 - t * 30 + 200 * t; // warm(30) → cold-blue(200)
  const dialAngle = -135 + t * 270; // sweep from -135° to +135°

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A dial appears...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Choose a small pain. Inoculate yourself against the big pains. Build the callus.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to turn the dial colder</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={chill}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: coldLevel >= COLD_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                {/* Dial background — color-shifting */}
                <circle cx="95" cy="95" r="88"
                  fill={`hsla(${hue}, ${12 + t * 15}%, ${10 + t * 5}%, ${0.08 + t * 0.08})`} />
                {/* Tick marks */}
                {Array.from({ length: 11 }, (_, i) => {
                  const a = (-135 + i * 27) * (Math.PI / 180);
                  const inner = 68;
                  const outer = 78;
                  const x1 = 95 + Math.cos(a) * inner;
                  const y1 = 95 + Math.sin(a) * inner;
                  const x2 = 95 + Math.cos(a) * outer;
                  const y2 = 95 + Math.sin(a) * outer;
                  const active = (i / 10) <= t;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={`hsla(${active ? hue : 0}, ${active ? 25 : 0}%, ${active ? 45 : 20}%, ${active ? 0.35 : 0.1})`}
                      strokeWidth={active ? 1.5 : 0.8} strokeLinecap="round" />
                  );
                })}
                {/* Dial arc — swept portion */}
                {t > 0 && (() => {
                  const startA = -135 * (Math.PI / 180);
                  const endA = dialAngle * (Math.PI / 180);
                  const r = 73;
                  const sx = 95 + Math.cos(startA) * r;
                  const sy = 95 + Math.sin(startA) * r;
                  const ex = 95 + Math.cos(endA) * r;
                  const ey = 95 + Math.sin(endA) * r;
                  const largeArc = (dialAngle - (-135)) > 180 ? 1 : 0;
                  return (
                    <motion.path
                      d={`M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`}
                      fill="none"
                      stroke={`hsla(${hue}, 30%, 45%, ${0.15 + t * 0.2})`}
                      strokeWidth="3" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6 }}
                    />
                  );
                })()}
                {/* Needle */}
                {(() => {
                  const a = dialAngle * (Math.PI / 180);
                  const nx = 95 + Math.cos(a) * 55;
                  const ny = 95 + Math.sin(a) * 55;
                  return (
                    <motion.line x1="95" y1="95" x2={nx} y2={ny}
                      stroke={`hsla(${hue}, 25%, 50%, ${0.25 + t * 0.2})`}
                      strokeWidth="1.5" strokeLinecap="round"
                      animate={{ x2: nx, y2: ny }}
                      transition={{ type: 'spring', stiffness: 80 }}
                    />
                  );
                })()}
                {/* Center hub */}
                <circle cx="95" cy="95" r="5" fill={`hsla(${hue}, 20%, 35%, ${0.2 + t * 0.15})`} />
                {/* Temperature label */}
                <text x="95" y="130" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${hue}, 20%, 45%, ${0.2 + t * 0.15})`}>
                  {TEMP_LABELS[Math.min(coldLevel, TEMP_LABELS.length - 1)]}
                </text>
                {/* Callus texture — appears at full cold */}
                {t >= 1 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ duration: 2 }}>
                    {Array.from({ length: 30 }, (_, i) => (
                      <circle key={i}
                        cx={30 + (i * 43 % 130)} cy={30 + (i * 31 % 130)}
                        r={1 + (i % 3) * 0.5}
                        fill="hsla(200, 12%, 35%, 0.06)" />
                    ))}
                  </motion.g>
                )}
              </svg>
            </div>
            <motion.div key={coldLevel} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {coldLevel === 0 ? 'Comfortable. Warm.' : coldLevel < COLD_STEPS ? `Colder. The callus builds.` : 'Frigid. Hardened. Inoculated.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: COLD_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < coldLevel ? `hsla(${200 + i * 5}, 25%, 45%, 0.5)` : palette.primaryFaint, opacity: i < coldLevel ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The dial at frigid. You chose the hard thing. Small pains, willingly borne, build armor against the large.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Hormesis. Controlled mild stressors strengthen cellular resilience. The stress response recalibrates. You chose the callus.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Warm. Cold. Hardened.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}