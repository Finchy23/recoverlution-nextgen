/**
 * SERVANT LEADER #4 — The Praise Laser
 * "What you praise, grows. Be a gardener of talent."
 * INTERACTION: A dark scene with silhouette figures. A spotlight
 * you direct — each tap illuminates one person doing one thing
 * right. The illuminated figure grows slightly. Light = growth.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FIGURES = [
  { x: 35, label: 'listening', baseH: 35 },
  { x: 75, label: 'building', baseH: 38 },
  { x: 110, label: 'helping', baseH: 32 },
  { x: 150, label: 'persisting', baseH: 36 },
  { x: 185, label: 'caring', baseH: 34 },
];

export default function ServantLeader_PraiseLaser({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lit, setLit] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const illuminate = (idx: number) => {
    if (stage !== 'active' || lit.includes(idx)) return;
    const next = [...lit, idx];
    setLit(next);
    if (next.length >= FIGURES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const growth = lit.length / FIGURES.length;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A spotlight warms...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Find one person doing one thing right. Shine the light. What you praise, grows.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each figure to praise them</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(30, 8%, 7%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Spotlight source at top */}
                <circle cx="110" cy="5" r="4" fill={`hsla(45, 50%, 60%, ${0.1 + growth * 0.15})`} />
                {FIGURES.map((fig, i) => {
                  const isLit = lit.includes(i);
                  const growthBonus = isLit ? 6 : 0;
                  const figH = fig.baseH + growthBonus;
                  const bodyY = 120 - figH;
                  return (
                    <g key={i} onClick={() => illuminate(i)} style={{ cursor: isLit ? 'default' : 'pointer' }}>
                      {/* Spotlight cone */}
                      {isLit && (
                        <motion.polygon
                          points={`110,8 ${fig.x - 12},${bodyY - 5} ${fig.x + 12},${bodyY - 5}`}
                          fill={`hsla(45, 40%, 60%, 0.03)`}
                          initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}
                          transition={{ duration: 0.8 }}
                        />
                      )}
                      {/* Figure body */}
                      <motion.rect
                        x={fig.x - 6} y={bodyY} width="12" height={figH} rx="3"
                        fill={isLit ? `hsla(45, 35%, 50%, 0.35)` : `hsla(0, 0%, 18%, 0.25)`}
                        animate={{
                          height: figH,
                          y: bodyY,
                          fill: isLit ? `hsla(45, 35%, 50%, 0.35)` : `hsla(0, 0%, 18%, 0.25)`,
                        }}
                        transition={{ type: 'spring', stiffness: 120 }}
                      />
                      {/* Figure head */}
                      <motion.circle cx={fig.x} cy={bodyY - 5} r="5"
                        fill={isLit ? `hsla(45, 35%, 50%, 0.3)` : `hsla(0, 0%, 18%, 0.2)`}
                        initial={{ cy: bodyY - 5 }}
                        animate={{ cy: bodyY - 5 }}
                        transition={{ type: 'spring', stiffness: 120 }}
                      />
                      {/* Praise glow */}
                      {isLit && (
                        <motion.circle cx={fig.x} cy={bodyY + figH / 2} r="18"
                          fill={`hsla(45, 40%, 60%, 0.04)`}
                          initial={{ r: 5, opacity: 0 }} animate={{ r: 18, opacity: 0.06 }}
                          transition={{ duration: 1 }}
                        />
                      )}
                      {/* Label */}
                      <text x={fig.x} y="135" textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={isLit ? `hsla(45, 30%, 55%, 0.4)` : `hsla(0, 0%, 30%, 0.15)`}>
                        {fig.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3 }}>
              {lit.length}/{FIGURES.length} illuminated
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Every light you shone made someone grow. Be a gardener of talent. Praise is sunlight.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Positive reinforcement. Dopamine-driven learning outperforms fear. What you praise, grows.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Seen. Praised. Growing.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}