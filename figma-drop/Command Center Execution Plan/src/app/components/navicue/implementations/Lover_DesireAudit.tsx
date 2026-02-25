/**
 * LOVER #3 — The Desire Audit
 * "Let yourself be silently drawn by the strange pull of what you really love."
 * INTERACTION: A flame at center. Each tap shifts the flame's color —
 * from fearful blue (avoidance) through uncertain violet to
 * desire-amber to bright joy-gold. What feeds the fire?
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const COLOR_STEPS = 5;
const COLOR_DATA = [
  { hue: 210, sat: 20, label: 'fear-blue', desc: 'What you should want.' },
  { hue: 260, sat: 22, label: 'uncertain-violet', desc: 'Closer. What pulls you?' },
  { hue: 330, sat: 25, label: 'desire-rose', desc: 'Warmer. The pull strengthens.' },
  { hue: 30, sat: 35, label: 'desire-amber', desc: 'The strange pull. Follow it.' },
  { hue: 42, sat: 45, label: 'joy-gold', desc: 'What you really love.' },
];

export default function Lover_DesireAudit({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [colorIdx, setColorIdx] = useState(0);
  const [flamePhase, setFlamePhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setFlamePhase(p => p + 0.05); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const shift = () => {
    if (stage !== 'active' || colorIdx >= COLOR_STEPS) return;
    const next = colorIdx + 1;
    setColorIdx(next);
    if (next >= COLOR_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = colorIdx / COLOR_STEPS;
  const c = COLOR_DATA[Math.min(colorIdx, COLOR_DATA.length - 1)];

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A flame flickers...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>What do you actually want? Not what you should want. What feeds the fire?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to shift the flame closer to truth</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={shift}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: colorIdx >= COLOR_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '180px', height: '190px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(${c.hue}, ${c.sat * 0.3}%, ${6 + t * 2}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 180 190" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <radialGradient id={`${svgId}-desireGlow`} cx="50%" cy="65%">
                    <stop offset="0%" stopColor={`hsla(${c.hue}, ${c.sat}%, 45%, ${0.08 + t * 0.1})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="180" height="190" fill={`url(#${svgId}-desireGlow)`} />

                {/* Flame tongues */}
                {Array.from({ length: 4 + Math.floor(t * 3) }, (_, i) => {
                  const cx = 90 + (i - 2) * (8 + t * 4);
                  const baseY = 150;
                  const h = (40 + t * 30) * (i === 2 ? 1 : 0.5 + Math.random() * 0.3) + Math.sin(flamePhase * (1.2 + i * 0.25) + i) * 6;
                  const w = 8 + t * 4 + Math.sin(flamePhase + i * 0.8) * 2;
                  return (
                    <path key={i}
                      d={`M ${cx - w} ${baseY} Q ${cx - w * 0.4} ${baseY - h * 0.6}, ${cx} ${baseY - h} Q ${cx + w * 0.4} ${baseY - h * 0.6}, ${cx + w} ${baseY}`}
                      fill={`hsla(${c.hue + (i * 8 - 10)}, ${c.sat + 5}%, ${40 + t * 12 + i * 2}%, ${(0.08 + t * 0.06) / (i * 0.15 + 1)})`}
                    />
                  );
                })}

                {/* Color label */}
                <text x="90" y="175" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${c.hue}, ${c.sat}%, 48%, ${0.12 + t * 0.08})`}>
                  {c.label}
                </text>

                {/* Question */}
                <text x="90" y="25" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(${c.hue}, ${c.sat * 0.6}%, 40%, 0.12)`}>
                  what feeds the fire?
                </text>
              </svg>
            </div>
            <motion.div key={colorIdx} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {c.desc}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: COLOR_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%',
                  background: i < colorIdx ? `hsla(${COLOR_DATA[i].hue}, ${COLOR_DATA[i].sat}%, 48%, 0.5)` : palette.primaryFaint,
                  opacity: i < colorIdx ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The flame turned gold. Not what you should want, but what you really love. Let yourself be silently drawn by the strange pull. It will not lead you astray.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Approach motivation. Shifting from avoidance (fear of rejection) to approach (pursuit of joy). The neural driver changes. The flame finds its true color.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Fear. Desire. Gold.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}