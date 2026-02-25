/**
 * OMEGA POINT #4 — The Synthesis
 * "Conflict is the engine of creation. Look for the third way."
 * INTERACTION: A red thesis and blue antithesis orbit each other.
 * Each tap brings them closer until they collide — the collision
 * produces a brighter, golden synthesis object. The third way.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const APPROACH_STEPS = 5;

export default function OmegaPoint_Synthesis({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [approached, setApproached] = useState(0);
  const [phase, setPhase] = useState(0);
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
    const tick = () => { setPhase(p => p + 0.025); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const approach = () => {
    if (stage !== 'active' || approached >= APPROACH_STEPS) return;
    const next = approached + 1;
    setApproached(next);
    if (next >= APPROACH_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = approached / APPROACH_STEPS;
  const orbitRadius = 55 * (1 - t * 0.85);
  const thesisX = 95 + Math.cos(phase) * orbitRadius;
  const thesisY = 80 + Math.sin(phase) * orbitRadius * 0.6;
  const antiX = 95 + Math.cos(phase + Math.PI) * orbitRadius;
  const antiY = 80 + Math.sin(phase + Math.PI) * orbitRadius * 0.6;
  const merged = t >= 1;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two forces orbit...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Conflict is the engine of creation. Do not fear the clash. Look for the third way.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to draw them closer</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={approach}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: approached >= APPROACH_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(260, 10%, 7%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 190 160" style={{ position: 'absolute', inset: 0 }}>
                {!merged ? (
                  <>
                    {/* Orbit trail */}
                    <ellipse cx="95" cy="80" rx={orbitRadius} ry={orbitRadius * 0.6}
                      fill="none" stroke={`hsla(270, 15%, 30%, ${0.06 + t * 0.04})`} strokeWidth="0.5" strokeDasharray="2 6" />
                    {/* Thesis — red */}
                    <circle cx={thesisX} cy={thesisY} r={10 + t * 2}
                      fill={`hsla(0, 50%, 45%, ${0.25 + t * 0.1})`} />
                    <circle cx={thesisX} cy={thesisY} r={16 + t * 4}
                      fill={`hsla(0, 40%, 40%, ${0.04 + t * 0.02})`} />
                    {/* Antithesis — blue */}
                    <circle cx={antiX} cy={antiY} r={10 + t * 2}
                      fill={`hsla(220, 50%, 45%, ${0.25 + t * 0.1})`} />
                    <circle cx={antiX} cy={antiY} r={16 + t * 4}
                      fill={`hsla(220, 40%, 40%, ${0.04 + t * 0.02})`} />
                    {/* Labels */}
                    <text x={thesisX} y={thesisY + 22} textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(0, 30%, 45%, ${0.25 * (1 - t)})`}>THESIS</text>
                    <text x={antiX} y={antiY + 22} textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(220, 30%, 45%, ${0.25 * (1 - t)})`}>ANTITHESIS</text>
                  </>
                ) : (
                  <>
                    {/* Collision burst */}
                    {[20, 35, 50].map((r, i) => (
                      <motion.circle key={i} cx="95" cy="80" r={r}
                        fill="none" stroke={`hsla(45, 40%, 55%, ${0.06 - i * 0.015})`} strokeWidth="0.5"
                        initial={{ r: 5, opacity: 0 }} animate={{ r, opacity: 0.08 }}
                        transition={{ delay: i * 0.2, duration: 1.5 }}
                      />
                    ))}
                    {/* Synthesis — golden */}
                    <motion.circle cx="95" cy="80" r="16"
                      fill="hsla(45, 55%, 52%, 0.35)"
                      initial={{ r: 5, opacity: 0 }} animate={{ r: 16, opacity: 0.4 }}
                      transition={{ type: 'spring', stiffness: 80 }}
                    />
                    <motion.circle cx="95" cy="80" r="8"
                      fill="hsla(45, 60%, 58%, 0.25)"
                      initial={{ r: 0 }} animate={{ r: 8 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                    />
                    <motion.text x="95" y="108" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(45, 40%, 55%, 0.35)"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.35 }}
                      transition={{ delay: 0.8, duration: 1 }}>
                      SYNTHESIS
                    </motion.text>
                  </>
                )}
              </svg>
            </div>
            <motion.div key={approached} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {approached === 0 ? 'Thesis and antithesis. Orbiting.' : approached < APPROACH_STEPS ? `Closer... ${Math.floor(t * 100)}%` : 'Collision. The third way.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: APPROACH_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < approached ? 'hsla(45, 45%, 55%, 0.5)' : palette.primaryFaint, opacity: i < approached ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Red and blue collided. Neither survived. Gold emerged. The third way.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cognitive resolution. The dopamine release of a paradox resolved. Thesis. Antithesis. Synthesis.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Clash. Merge. Transcend.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}