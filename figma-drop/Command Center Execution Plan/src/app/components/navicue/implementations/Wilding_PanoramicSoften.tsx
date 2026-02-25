/**
 * WILDING #3 — The Panoramic Soften
 * "Focal vision is for fighting. Panoramic vision is for safety."
 * INTERACTION: A tunnel-vision circle at center. Each tap widens
 * the view — 5 expansions. Edges blur into periphery. The visual
 * field opens from 30° to 180°. The brainstem signals safety.
 * Relaxation response activates.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const EXPAND_STEPS = 5;
const ANGLE_LABELS = ['30°', '60°', '90°', '135°', '180°'];

export default function Wilding_PanoramicSoften({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [expanded, setExpanded] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const expand = () => {
    if (stage !== 'active' || expanded >= EXPAND_STEPS) return;
    const next = expanded + 1;
    setExpanded(next);
    if (next >= EXPAND_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = expanded / EXPAND_STEPS;
  const full = t >= 1;
  // Vignette radius: starts small (tunnel vision), expands
  const vigRadius = 20 + t * 80;
  // Edge blur: reduces as field opens
  const blurAmount = (1 - t) * 6;

  const svgId = useId();

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The lens narrows...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stop staring. Soften your eyes. See the edges of the room. Focal vision is for fighting. Panoramic vision is for safety. Open the lens.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to widen the field</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={expand}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: expanded >= EXPAND_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(180, ${4 + t * 6}%, ${6 + t * 4}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  {/* Vignette mask — expands with each tap */}
                  <radialGradient id={`${svgId}-vigMask`} cx="50%" cy="50%">
                    <stop offset={`${vigRadius - 10}%`} stopColor="white" />
                    <stop offset={`${vigRadius}%`} stopColor="white" stopOpacity="0.5" />
                    <stop offset={`${vigRadius + 15}%`} stopColor="white" stopOpacity="0" />
                  </radialGradient>
                  <mask id={`${svgId}-fieldMask`}>
                    <rect x="0" y="0" width="220" height="170" fill={`url(#${svgId}-vigMask)`} />
                  </mask>
                  <filter id={`${svgId}-edgeBlur`}>
                    <feGaussianBlur stdDeviation={blurAmount} />
                  </filter>
                </defs>

                {/* Scene content — landscape elements revealed as field widens */}
                <g mask={`url(#${svgId}-fieldMask)`}>
                  {/* Horizon line */}
                  <line x1="0" y1="95" x2="220" y2="95"
                    stroke={`hsla(180, 8%, 22%, ${0.05 + t * 0.03})`} strokeWidth="0.3" />

                  {/* Trees at varying distances */}
                  {[30, 55, 80, 110, 140, 165, 190].map((x, i) => {
                    const h = 15 + (i % 3) * 8;
                    return (
                      <g key={i}>
                        <line x1={x} y1={95} x2={x} y2={95 - h}
                          stroke={`hsla(140, ${8 + i * 2}%, ${22 + i * 2}%, ${0.04 + t * 0.03})`}
                          strokeWidth="0.8" />
                        <circle cx={x} cy={95 - h - 4} r={3 + i % 2}
                          fill={`hsla(140, ${10 + i * 2}%, ${25 + i * 2}%, ${0.04 + t * 0.02})`} />
                      </g>
                    );
                  })}

                  {/* Ground texture */}
                  {Array.from({ length: 12 }, (_, i) => (
                    <line key={`g-${i}`}
                      x1={10 + i * 18} y1={100 + (i % 3) * 5}
                      x2={10 + i * 18 + 8} y2={100 + (i % 3) * 5}
                      stroke="hsla(30, 8%, 20%, 0.03)" strokeWidth="0.3" />
                  ))}

                  {/* Sky dots — stars or birds */}
                  {Array.from({ length: 8 }, (_, i) => (
                    <circle key={`s-${i}`}
                      cx={20 + i * 25} cy={20 + (i % 4) * 12}
                      r="0.8"
                      fill={`hsla(200, 10%, 35%, ${0.03 + t * 0.02})`} />
                  ))}
                </g>

                {/* Peripheral boundary indicators */}
                {expanded > 0 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}>
                    {/* Arc showing visual field angle */}
                    <path d={`M ${110 - t * 90} 140 Q 110 ${140 - t * 20} ${110 + t * 90} 140`}
                      fill="none"
                      stroke={`hsla(180, ${12 + t * 8}%, ${35 + t * 10}%, ${0.06 + t * 0.04})`}
                      strokeWidth="0.4" strokeDasharray="2 2" />
                  </motion.g>
                )}

                {/* Eye icon at center */}
                <ellipse cx="110" cy="85" rx={6 + t * 2} ry={3 + t}
                  fill="none" stroke={`hsla(180, ${10 + t * 10}%, ${30 + t * 10}%, ${0.08 + t * 0.04})`}
                  strokeWidth="0.5" />
                <circle cx="110" cy="85" r={1.5 + t}
                  fill={`hsla(180, ${15 + t * 10}%, ${35 + t * 10}%, ${0.08 + t * 0.04})`} />

                {/* Angle readout */}
                <text x="110" y="160" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(180, ${10 + t * 10}%, ${30 + t * 10}%, ${0.08 + t * 0.06})`}>
                  field: {ANGLE_LABELS[Math.min(expanded, EXPAND_STEPS) - 1] || '30°'}
                </text>

                {/* SAFE label */}
                {full && (
                  <motion.text x="110" y="22" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(180, 18%, 48%, 0.18)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    SAFE
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={expanded} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {expanded === 0 ? 'Tunnel vision. Thirty degrees. Threat mode.' : expanded < EXPAND_STEPS ? `Field widened to ${ANGLE_LABELS[expanded - 1]}. Edges appearing.` : 'Full panoramic. One-eighty degrees. The brainstem says safe.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: EXPAND_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < expanded ? 'hsla(180, 18%, 45%, 0.5)' : palette.primaryFaint, opacity: i < expanded ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five expansions. From thirty degrees to one-eighty. The tunnel cracked open. The edges of the room appeared. The brainstem stopped scanning for threats. You are safe.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Peripheral vision. Expanding the visual field to 180 degrees mechanically signals the brainstem that there is no immediate threat, activating the relaxation response. Open the lens. Find safety.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Tunnel. Widen. Safe.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}