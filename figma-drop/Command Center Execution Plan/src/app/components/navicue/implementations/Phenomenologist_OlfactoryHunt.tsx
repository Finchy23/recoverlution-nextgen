/**
 * PHENOMENOLOGIST #8 — The Olfactory Hunt
 * "The nose remembers deeper than the mind."
 * INTERACTION: A drifting smoke/scent trail rendered as particle paths.
 * Follow the trail — each section reveals a memory association. Smell
 * bypasses the thalamus to the amygdala. Direct route to the past.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Somatic Regulation', 'embodying', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SCENT_PHASES = [
  { label: 'Find one smell nearby.', reveal: 'What is it? Don\'t name it. Just follow the thread.', depth: 0.2 },
  { label: 'Follow it deeper.', reveal: 'Where does it take you? What time? What place?', depth: 0.5 },
  { label: 'Let the memory arrive.', reveal: 'The nose remembers deeper than the mind.', depth: 0.8 },
  { label: 'Let it go.', reveal: 'Processed. Released. The scent fades.', depth: 1 },
];

export default function Phenomenologist_OlfactoryHunt({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);
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
    const tick = () => { setAnimPhase(p => p + 0.02); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const followScent = () => {
    if (stage !== 'active' || phaseIdx >= SCENT_PHASES.length - 1) return;
    const next = phaseIdx + 1;
    setPhaseIdx(next);
    if (next >= SCENT_PHASES.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 4000);
    }
  };

  const current = SCENT_PHASES[phaseIdx];
  const depth = current.depth;

  // Build smoke trail
  const smokeParticles = Array.from({ length: 20 }, (_, i) => {
    const t = (animPhase * 0.5 + i * 0.3) % 8;
    const x = 30 + Math.sin(t * 0.8 + i * 0.5) * 40 + t * 15;
    const y = 140 - t * 16;
    const size = (2 + i * 0.3) * (1 - (t / 8) * 0.6);
    const opacity = (1 - t / 8) * 0.12 * (0.5 + depth);
    return { x, y, size, opacity, key: i };
  });

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Somatic Regulation" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A scent drifts in...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Find one smell. Follow it like a thread. The nose remembers deeper than the mind.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to follow the scent</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={followScent}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: phaseIdx >= SCENT_PHASES.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Smoke trail field */}
            <div style={{ position: 'relative', width: '210px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(30, 10%, 10%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 210 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Smoke particles */}
                {smokeParticles.map(p => (
                  <circle key={p.key} cx={p.x} cy={p.y} r={p.size}
                    fill={`hsla(30, 15%, 55%, ${p.opacity})`}
                  />
                ))}
                {/* Trail path — a gentle curve */}
                <motion.path
                  d={`M 30 145 Q ${60 + Math.sin(animPhase) * 10} 110, ${90 + Math.sin(animPhase * 0.7) * 8} 85 Q ${120 + Math.cos(animPhase * 0.5) * 12} 60, ${150 + Math.sin(animPhase * 0.3) * 6} 35`}
                  fill="none"
                  stroke={`hsla(30, 20%, 50%, ${0.05 + depth * 0.08})`}
                  strokeWidth="1"
                  strokeDasharray="4 8"
                />
                {/* Memory glow — grows with depth */}
                {depth > 0.4 && (
                  <motion.ellipse cx={150 + Math.sin(animPhase * 0.3) * 6} cy="35" rx={10 + depth * 8} ry={8 + depth * 6}
                    fill={`hsla(30, 25%, 50%, ${depth * 0.08})`}
                    animate={{ opacity: [depth * 0.06, depth * 0.1, depth * 0.06] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
              </svg>
            </div>
            {/* Phase text */}
            <motion.div key={phaseIdx} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>{current.label}</div>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginTop: '4px', opacity: 0.35 }}>{current.reveal}</div>
            </motion.div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SCENT_PHASES.map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= phaseIdx ? 'hsla(30, 25%, 50%, 0.5)' : palette.primaryFaint, opacity: i <= phaseIdx ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The nose remembered deeper than the mind. The thread was followed. Released.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Straight to the amygdala. Emotional memory processed. The scent fades.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Followed. Remembered. Released.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}