/**
 * GUARDIAN #8 — The Safe Container
 * "Create the holding environment. Winnicott's container."
 * INTERACTION: A protective circle builds piece by piece.
 * 5 taps each add a wall segment. The interior warms.
 * Safety cues accumulate inside. The container holds.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SEGMENTS = 5;
const CUES = [
  'You are held.',
  'Nothing is required.',
  'This space is yours.',
  'You are enough here.',
  'Safe to feel.',
];

export default function Guardian_SafeContainer({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [walls, setWalls] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const build = () => {
    if (stage !== 'active' || walls >= SEGMENTS) return;
    const next = walls + 1;
    setWalls(next);
    if (next >= SEGMENTS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
    }
  };

  const t = walls / SEGMENTS;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Building a place to land...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Winnicott called it the holding environment. A space where feelings can exist without being fixed. Build the container first. Then the feelings know where to go.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to build each wall</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={build}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: walls >= SEGMENTS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(42, ${6 + t * 8}%, ${6 + t * 3}%, 0.85)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Interior warmth */}
                <defs>
                  <radialGradient id={`${svgId}-warmCore`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(42, ${20 + t * 15}%, ${30 + t * 15}%, ${t * 0.06})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="110" cy="90" r={50 + t * 20} fill={`url(#${svgId}-warmCore)`} />

                {/* Container wall arcs */}
                {Array.from({ length: walls }, (_, i) => {
                  const startAngle = (i / SEGMENTS) * 360 - 90;
                  const endAngle = ((i + 1) / SEGMENTS) * 360 - 90;
                  const r = 55;
                  const x1 = 110 + r * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 90 + r * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 110 + r * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 90 + r * Math.sin((endAngle * Math.PI) / 180);
                  return (
                    <motion.path key={`wall-${i}`}
                      d={`M ${x1},${y1} A ${r},${r} 0 0,1 ${x2},${y2}`}
                      fill="none"
                      stroke={`hsla(42, ${18 + i * 4}%, ${35 + i * 3}%, ${0.1 + i * 0.02})`}
                      strokeWidth={1.5 + i * 0.2}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  );
                })}

                {/* Safety cue text — appears inside container */}
                {walls > 0 && (
                  <motion.text x="110" y={92} textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="300"
                    fill={`hsla(42, ${15 + t * 10}%, ${40 + t * 15}%, ${0.06 + t * 0.06})`}
                    initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.08 + t * 0.06) }} transition={{ duration: 1 }}>
                    {CUES[walls - 1]}
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={walls} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center', maxWidth: '260px' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {walls === 0 ? 'The container needs building. Five walls.' : walls < SEGMENTS ? CUES[walls - 1] : 'The container is complete. Everything can be held here.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < walls ? 'hsla(42, 25%, 55%, 0.5)' : palette.primaryFaint,
                  opacity: i < walls ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five walls. A complete container. Winnicott's holding environment is the foundation of emotional safety: not fixing, not solving, just containing. The feeling can exist because the space can hold it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Attachment research: children who had "good enough" containers develop the capacity to self-contain. The external holding becomes internal architecture. Build the container. The contents will follow.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Held. Contained. Safe.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}