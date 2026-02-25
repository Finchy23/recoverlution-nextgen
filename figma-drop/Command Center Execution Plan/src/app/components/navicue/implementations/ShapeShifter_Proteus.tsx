/**
 * SHAPESHIFTER #8 — The Proteus
 * "Water does not fight the container. It becomes the container."
 * ARCHETYPE: Pattern A (Tap ×5) — A fluid blob cycling through
 * geometric containers: circle → triangle → square → star → free-form.
 * The fluid adapts perfectly to each. Protean Self — adaptive identity.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CONTAINERS = [
  { shape: 'circle', label: 'CIRCLE', desc: 'wholeness' },
  { shape: 'triangle', label: 'TRIANGLE', desc: 'direction' },
  { shape: 'square', label: 'SQUARE', desc: 'stability' },
  { shape: 'star', label: 'STAR', desc: 'radiance' },
  { shape: 'free', label: 'FREE-FORM', desc: 'limitless' },
];

function getShapePath(shape: string, cx: number, cy: number, r: number): string {
  switch (shape) {
    case 'circle': return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
    case 'triangle': return `M ${cx} ${cy - r} L ${cx + r} ${cy + r * 0.7} L ${cx - r} ${cy + r * 0.7} Z`;
    case 'square': return `M ${cx - r} ${cy - r} L ${cx + r} ${cy - r} L ${cx + r} ${cy + r} L ${cx - r} ${cy + r} Z`;
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rd = i % 2 === 0 ? r : r * 0.5;
        return `${cx + Math.cos(a) * rd},${cy + Math.sin(a) * rd}`;
      });
      return `M ${pts.join(' L ')} Z`;
    }
    case 'free': return `M ${cx - r} ${cy - r * 0.5} Q ${cx - r * 0.3} ${cy - r * 1.2} ${cx + r * 0.3} ${cy - r * 0.8} Q ${cx + r * 1.1} ${cy - r * 0.3} ${cx + r * 0.8} ${cy + r * 0.3} Q ${cx + r * 0.5} ${cy + r} ${cx - r * 0.2} ${cy + r * 0.8} Q ${cx - r * 1.1} ${cy + r * 0.5} ${cx - r} ${cy - r * 0.5}`;
    default: return '';
  }
}

export default function ShapeShifter_Proteus({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const morph = () => {
    if (stage !== 'active' || taps >= CONTAINERS.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= CONTAINERS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const container = CONTAINERS[Math.min(taps, CONTAINERS.length - 1)];
  const filled = taps >= CONTAINERS.length;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A fluid stirs...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Water does not fight the container. It becomes the container. And when the container breaks, the water remains. Be water.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to change containers</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={morph}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '300px',
              cursor: filled ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
              <AnimatePresence mode="wait">
                <motion.svg key={taps} width="100%" height="100%" viewBox="0 0 180 180"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.6 }}>
                  {/* Container outline */}
                  <motion.path
                    d={getShapePath(container.shape, 90, 85, 50)}
                    fill="none"
                    stroke={themeColor(TH.primaryHSL, 0.08, 10)}
                    strokeWidth="0.5"
                    strokeDasharray={container.shape === 'free' ? '3 2' : 'none'} />

                  {/* The fluid — fills the container shape */}
                  <motion.path
                    d={getShapePath(container.shape, 90, 85, 45)}
                    fill={themeColor(TH.accentHSL, 0.06, 12)}
                    stroke={themeColor(TH.accentHSL, 0.1, 15)}
                    strokeWidth="0.3"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }} />

                  {/* Surface shimmer */}
                  <motion.path
                    d={getShapePath(container.shape, 90, 85, 35)}
                    fill={themeColor(TH.accentHSL, 0.03, 18)}
                    stroke="none"
                    animate={{ opacity: [0.03, 0.06, 0.03] }}
                    transition={{ duration: 2, repeat: Infinity }} />

                  {/* Container label */}
                  <text x="90" y="155" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.15, 12)} letterSpacing="0.12em">
                    {container.label}
                  </text>
                  <text x="90" y="168" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic"
                    fill={themeColor(TH.accentHSL, 0.1, 10)}>
                    {container.desc}
                  </text>
                </motion.svg>
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {CONTAINERS.map((_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.2, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Five containers. One water. The shape changed every time. The water never did. You are the water.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the protean self adapts without losing essence</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Be water.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}