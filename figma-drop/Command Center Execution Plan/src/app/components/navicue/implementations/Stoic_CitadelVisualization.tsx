/**
 * STOIC #1 — The Citadel Visualization
 * "Retreat into your own little territory of silence."
 * INTERACTION: Fortress wall rises brick by brick. Each tap lays another
 * course. Outside: noise particles buffet the wall. Inside: a silent
 * green garden emerges. At completion, the noise is fully muffled.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BRICK_STEPS = 5;

export default function Stoic_CitadelVisualization({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [courses, setCourses] = useState(0);
  const [noisePhase, setNoisePhase] = useState(0);
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
    const tick = () => { setNoisePhase(p => p + 0.03); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const layBricks = () => {
    if (stage !== 'active' || courses >= BRICK_STEPS) return;
    const next = courses + 1;
    setCourses(next);
    if (next >= BRICK_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = courses / BRICK_STEPS;
  const wallHeight = t * 110;
  const gardenOpacity = t * 0.6;
  const noiseStrength = 1 - t;

  // Seeded noise particles (outside the wall)
  const noiseParticles = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      baseX: 10 + (i * 41 % 80),
      baseY: 20 + (i * 29 % 120),
      dx: ((i * 53) % 7 - 3) * 2,
      dy: ((i * 37) % 5 - 2) * 1.5,
      size: 1 + (i * 19 % 4) * 0.5,
    }))
  ).current;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Foundation stones appear...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Retreat into your own little territory of silence. Nothing outside can harm what is inside unless you let it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to lay each course of stone</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={layBricks}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: courses >= BRICK_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 8%, 8%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Noise particles — outside, dimming with wall growth */}
                {noiseParticles.map((p, i) => {
                  const x = p.baseX + Math.sin(noisePhase + i * 0.7) * p.dx * noiseStrength;
                  const y = p.baseY + Math.cos(noisePhase + i * 0.5) * p.dy * noiseStrength;
                  return (
                    <circle key={`n${i}`} cx={x} cy={y} r={p.size * noiseStrength}
                      fill={`hsla(0, 0%, 35%, ${0.12 * noiseStrength})`} />
                  );
                })}

                {/* Wall — left side, rising from bottom */}
                <motion.rect x="95" y={160 - wallHeight} width="12" height={wallHeight}
                  fill={`hsla(30, 8%, 28%, ${0.15 + t * 0.2})`}
                  rx="1"
                  animate={{ height: wallHeight, y: 160 - wallHeight }}
                  transition={{ type: 'spring', stiffness: 60 }}
                />
                {/* Brick courses */}
                {Array.from({ length: courses }, (_, i) => {
                  const y = 160 - (i + 1) * (110 / BRICK_STEPS);
                  const offset = i % 2 === 0 ? 0 : 3;
                  return (
                    <motion.g key={`b${i}`} initial={{ opacity: 0, y: y + 5 }} animate={{ opacity: 1, y }} transition={{ duration: 0.6 }}>
                      <rect x={95 + offset} y={y} width="5" height={110 / BRICK_STEPS - 1} rx="0.5"
                        fill={`hsla(25, ${8 + i * 2}%, ${25 + i * 3}%, ${0.2 + i * 0.04})`}
                        stroke="hsla(25, 5%, 20%, 0.15)" strokeWidth="0.3" />
                      <rect x={101 + offset} y={y} width="5" height={110 / BRICK_STEPS - 1} rx="0.5"
                        fill={`hsla(25, ${6 + i * 2}%, ${23 + i * 3}%, ${0.18 + i * 0.04})`}
                        stroke="hsla(25, 5%, 20%, 0.15)" strokeWidth="0.3" />
                    </motion.g>
                  );
                })}
                {/* Crenellations at full height */}
                {t >= 1 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ duration: 1 }}>
                    {[96, 100, 104].map((x, i) => (
                      <rect key={i} x={x} y={160 - wallHeight - 6} width="3" height="6" rx="0.5"
                        fill="hsla(25, 8%, 30%, 0.2)" />
                    ))}
                  </motion.g>
                )}

                {/* Garden — inside (right of wall), growing with t */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: gardenOpacity }} transition={{ duration: 1 }}>
                  {/* Garden ground */}
                  <rect x="115" y="140" width="90" height="25" rx="3"
                    fill={`hsla(140, 20%, 18%, ${gardenOpacity * 0.5})`} />
                  {/* Garden elements — small plant shapes */}
                  {t > 0.2 && <circle cx="135" cy="135" r="4" fill={`hsla(140, 30%, 30%, ${(t - 0.2) * 0.25})`} />}
                  {t > 0.4 && <circle cx="155" cy="130" r="5" fill={`hsla(145, 25%, 28%, ${(t - 0.4) * 0.25})`} />}
                  {t > 0.4 && <rect x="154" y="135" width="1.5" height="8" rx="0.5" fill={`hsla(140, 15%, 22%, ${(t - 0.4) * 0.2})`} />}
                  {t > 0.6 && <circle cx="175" cy="133" r="3.5" fill={`hsla(135, 28%, 32%, ${(t - 0.6) * 0.25})`} />}
                  {t > 0.8 && <circle cx="145" cy="128" r="6" fill={`hsla(148, 22%, 26%, ${(t - 0.8) * 0.3})`} />}
                  {t > 0.8 && <rect x="144" y="134" width="1.5" height="10" rx="0.5" fill={`hsla(140, 12%, 20%, ${(t - 0.8) * 0.2})`} />}
                  {/* Silence indicator */}
                  {t >= 1 && (
                    <motion.text x="160" y="115" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(140, 15%, 35%, 0.2)" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                      transition={{ delay: 0.5, duration: 1.5 }}>
                      silence
                    </motion.text>
                  )}
                </motion.g>

                {/* Labels */}
                {t > 0 && (
                  <>
                    <text x="50" y="165" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(0, 0%, 30%, ${0.12 * noiseStrength})`}>noise</text>
                    <text x="160" y="165" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(140, 15%, 30%, ${gardenOpacity * 0.3})`}>garden</text>
                  </>
                )}
              </svg>
            </div>
            <motion.div key={courses} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {courses === 0 ? 'The foundation. Noise everywhere.' : courses < BRICK_STEPS ? `Course ${courses}. The garden grows quieter.` : 'Walled. Silent. Green inside.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: BRICK_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < courses ? 'hsla(30, 12%, 40%, 0.5)' : palette.primaryFaint, opacity: i < courses ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The wall stands. Noise outside. Green silence within. Nothing can harm what is inside unless you let it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cognitive sanctuary. Safe-place visualization lowers cortisol by activating the parasympathetic system. A fortress you carry with you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Stone. Silence. Garden.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}