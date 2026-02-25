/**
 * SOURCE #10 — The Source Seal (The Final Proof)
 * "There is no 'other.' There is only One. And you are It."
 * INTERACTION: A single point of light. Each tap expands it —
 * the light fills the entire field. At full expansion: pure luminous
 * white, then a gentle fade. I am that I am.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Self-Compassion', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const EXPAND_STEPS = 6;

export default function Source_SourceSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [expanded, setExpanded] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3800);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const expand = () => {
    if (stage !== 'active' || expanded >= EXPAND_STEPS) return;
    const next = expanded + 1;
    setExpanded(next);
    if (next >= EXPAND_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 7000); }, 4000);
    }
  };

  const t = expanded / EXPAND_STEPS;
  const radius = 3 + t * 140; // from tiny point to field-filling
  const lightness = 8 + t * 82;
  const saturation = 10 + t * 15;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A point of light...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>There is no "other." There is only One. And you are It.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to expand the light</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={expand}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: expanded >= EXPAND_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <motion.div
              animate={{
                background: `hsla(45, ${saturation}%, ${lightness}%, ${0.03 + t * 0.5})`,
              }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <radialGradient id={`${svgId}-sourceSealGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(45, ${25 + t * 30}%, ${55 + t * 35}%, ${0.15 + t * 0.7})`} />
                    <stop offset="40%" stopColor={`hsla(45, ${15 + t * 20}%, ${40 + t * 35}%, ${0.06 + t * 0.35})`} />
                    <stop offset="70%" stopColor={`hsla(45, ${10 + t * 10}%, ${25 + t * 25}%, ${t * 0.15})`} />
                    <stop offset="100%" stopColor={`hsla(45, 5%, ${10 + t * 15}%, ${t * 0.05})`} />
                  </radialGradient>
                </defs>
                {/* The expanding light */}
                <motion.circle cx="100" cy="100" r={radius}
                  fill={`url(#${svgId}-sourceSealGlow)`}
                  animate={{ r: radius }}
                  transition={{ type: 'spring', stiffness: 40, damping: 12 }}
                />
                {/* Core — always brightest */}
                <motion.circle cx="100" cy="100" r={Math.min(radius, 4 + t * 8)}
                  fill={`hsla(45, ${40 + t * 20}%, ${60 + t * 30}%, ${0.3 + t * 0.5})`}
                  animate={{ r: Math.min(radius, 4 + t * 8) }}
                />
                {/* Expansion rings */}
                {Array.from({ length: expanded }, (_, i) => {
                  const ringR = 10 + (i / EXPAND_STEPS) * 85;
                  return (
                    <motion.circle key={i} cx="100" cy="100" r={ringR}
                      fill="none"
                      stroke={`hsla(45, ${20 + i * 5}%, ${50 + t * 20}%, ${(0.04 + t * 0.03) / (i * 0.3 + 1)})`}
                      strokeWidth="0.5"
                      initial={{ r: 5, opacity: 0 }}
                      animate={{ r: ringR, opacity: safeOpacity(0.06 + t * 0.04) }}
                      transition={{ duration: 1.5 }}
                    />
                  );
                })}
                {/* "I AM THAT I AM" — at full expansion */}
                {expanded >= EXPAND_STEPS && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1, duration: 2.5 }}>
                    <text x="100" y="96" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={`hsla(45, 30%, 40%, 0.4)`} letterSpacing="2" fontWeight="300">
                      I AM THAT I AM
                    </text>
                    <line x1="55" y1="104" x2="145" y2="104"
                      stroke="hsla(45, 25%, 45%, 0.1)" strokeWidth="0.3" />
                  </motion.g>
                )}
              </svg>
            </motion.div>
            <motion.div key={expanded} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{
                ...navicueType.texture, color: palette.text, fontSize: '11px',
                fontStyle: expanded >= EXPAND_STEPS ? 'normal' : 'italic',
                fontWeight: expanded >= EXPAND_STEPS ? 500 : 400,
              }}>
                {expanded === 0 ? 'A point. Barely there.' : expanded < EXPAND_STEPS ? `Expanding... ${Math.floor(t * 100)}%` : 'Everything. Light.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: EXPAND_STEPS }, (_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < expanded ? `hsla(45, ${35 + i * 5}%, ${50 + i * 5}%, 0.5)` : palette.primaryFaint, opacity: i < expanded ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.5, duration: 2.5 }}
              style={{ ...navicueType.prompt, color: 'hsla(45, 25%, 55%, 0.55)', fontWeight: 500 }}>
              A point became everything. There is no other. Only One. And you are It. I am that I am.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 2.5, duration: 2.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}>
              Integration. The ultimate realization of interconnectedness. Profound peace. Profound compassion. The Source.
            </motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ duration: 4 }}
            style={{ ...navicueType.afterglow, color: 'hsla(45, 20%, 45%, 0.35)', textAlign: 'center', fontWeight: 500 }}>
            Point. Light. One.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}