/**
 * ATHLETE #2 -- The Fascia Release
 * "You are holding energy you don't need."
 * INTERACTION: A tight rubber band vibrates at center. Each tap
 * loosens a tension zone: jaw, shoulders, fists, belly, spine.
 * The band stretches, slackens, finally snaps loose. Silence.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ZONES = ['jaw', 'shoulders', 'fists', 'belly', 'spine'];
const ZONE_COUNT = ZONES.length;

export default function Athlete_FasciaRelease({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [released, setReleased] = useState(0);
  const [vibePhase, setVibePhase] = useState(0);
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
    const tick = () => { setVibePhase(p => p + 0.08); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const release = () => {
    if (stage !== 'active' || released >= ZONE_COUNT) return;
    const next = released + 1;
    setReleased(next);
    if (next >= ZONE_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = released / ZONE_COUNT;
  const snapped = t >= 1;
  const tension = 1 - t;
  const vibeAmp = tension * 3;
  const vibeX = Math.sin(vibePhase * 8) * vibeAmp;

  // Band endpoints -- stretches slack as released
  const bandY1 = 80;
  const bandY2 = 120;
  const bandSag = t * 25;
  const bandMidY = (bandY1 + bandY2) / 2 + bandSag;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Tension hums...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Where is the tension? Jaw? Shoulders? Drop it. You are holding energy you don't need. It costs battery life.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to release each zone</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={release}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: released >= ZONE_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(0, ${8 + tension * 8}%, ${7 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Band -- tight to slack to snapped */}
                {!snapped ? (
                  <motion.path
                    d={`M 30 ${bandY1} Q ${100 + vibeX} ${bandMidY}, 170 ${bandY2}`}
                    fill="none"
                    stroke={`hsla(0, ${15 + tension * 15}%, ${30 + t * 12}%, ${0.15 + tension * 0.1})`}
                    strokeWidth={1.5 + tension * 1.5}
                    strokeLinecap="round"
                  />
                ) : (
                  /* Snapped -- two loose ends */
                  <motion.g initial={{ opacity: 0.3 }} animate={{ opacity: 0.08 }} transition={{ duration: 1.5 }}>
                    <path d={`M 30 80 Q 55 95, 70 ${100 + 20}`}
                      fill="none" stroke="hsla(0, 8%, 28%, 0.08)" strokeWidth="0.8" strokeLinecap="round" />
                    <path d={`M 170 120 Q 145 105, 130 ${100 + 20}`}
                      fill="none" stroke="hsla(0, 8%, 28%, 0.08)" strokeWidth="0.8" strokeLinecap="round" />
                  </motion.g>
                )}

                {/* Anchor points */}
                <circle cx="30" cy={bandY1} r="3" fill={`hsla(0, 10%, 25%, ${0.08 + tension * 0.04})`} />
                <circle cx="170" cy={bandY2} r="3" fill={`hsla(0, 10%, 25%, ${0.08 + tension * 0.04})`} />

                {/* Tension zone markers -- released ones fade */}
                {ZONES.map((zone, i) => {
                  const zx = 50 + i * 25;
                  const zy = 145;
                  const isReleased = i < released;
                  return (
                    <g key={zone}>
                      <rect x={zx - 8} y={zy - 5} width="16" height="10" rx="2"
                        fill={isReleased ? `hsla(150, 15%, 30%, 0.06)` : `hsla(0, ${12 + (ZONE_COUNT - i) * 3}%, 28%, 0.08)`} />
                      <text x={zx} y={zy + 2} textAnchor="middle" fontSize="4" fontFamily="monospace"
                        fill={isReleased ? 'hsla(150, 12%, 38%, 0.12)' : `hsla(0, 8%, 32%, 0.1)`}>
                        {zone}
                      </text>
                    </g>
                  );
                })}

                {/* Vibration particles -- decrease with releases */}
                {!snapped && Array.from({ length: Math.floor(tension * 8) }, (_, i) => {
                  const px = 60 + i * 12 + Math.sin(vibePhase * 4 + i * 1.5) * vibeAmp;
                  const py = bandMidY + Math.cos(vibePhase * 3 + i * 2) * vibeAmp * 0.8;
                  return (
                    <circle key={i} cx={px} cy={py} r={0.5 + tension * 0.3}
                      fill={`hsla(0, 12%, 40%, ${tension * 0.06})`} />
                  );
                })}

                {/* Snapped label */}
                {snapped && (
                  <motion.text x="100" y="100" textAnchor="middle" dominantBaseline="middle"
                    fontSize="7" fontFamily="monospace" fill="hsla(150, 12%, 42%, 0.18)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    RELEASED
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={released} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {released === 0 ? 'Tight. Vibrating. Where?' : released < ZONE_COUNT ? `${ZONES[released - 1]} released. Feel it drop.` : 'Snapped loose. Silence.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ZONE_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < released ? 'hsla(150, 20%, 45%, 0.5)' : palette.primaryFaint, opacity: i < released ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Jaw. Shoulders. Fists. Belly. Spine. Each one dropped. The rubber band snapped loose. You were holding energy you didn't need.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Progressive muscle relaxation. Lowering muscle tone signals safety to the brainstem via gamma motor neuron feedback loops. Battery life restored.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Tight. Drop. Silence.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}