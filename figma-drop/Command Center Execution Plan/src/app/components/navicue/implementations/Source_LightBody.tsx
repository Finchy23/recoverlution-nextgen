/**
 * SOURCE #8 — The Light Body
 * "The body is heavy. The spirit is light. Let go of the weight."
 * INTERACTION: A human silhouette — dim, heavy. Each tap illuminates
 * a section from within — feet, legs, torso, arms, head — until the
 * entire form glows. You are made of light.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Self-Compassion', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LIGHT_ZONES = [
  { label: 'feet', cy: 148, rx: 12, ry: 8, hue: 30 },
  { label: 'legs', cy: 125, rx: 14, ry: 14, hue: 35 },
  { label: 'torso', cy: 92, rx: 18, ry: 22, hue: 40 },
  { label: 'arms', cy: 85, rx: 30, ry: 10, hue: 42 },
  { label: 'head', cy: 50, rx: 12, ry: 14, hue: 45 },
];

export default function Source_LightBody({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lit, setLit] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const illuminate = () => {
    if (stage !== 'active' || lit >= LIGHT_ZONES.length) return;
    const next = lit + 1;
    setLit(next);
    if (next >= LIGHT_ZONES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = lit / LIGHT_ZONES.length;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Self-Compassion" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A silhouette stands...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The body is heavy. The spirit is light. Let go of the weight.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to illuminate from within</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={illuminate}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: lit >= LIGHT_ZONES.length ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '160px', height: '185px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(240, 10%, 6%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 160 185" style={{ position: 'absolute', inset: 0 }}>
                {/* Body silhouette — simple human form */}
                <g opacity={0.12 + (1 - t) * 0.08}>
                  {/* Head */}
                  <ellipse cx="80" cy="48" rx="11" ry="13" fill="hsla(0, 0%, 20%, 0.2)" />
                  {/* Neck */}
                  <rect x="76" y="60" width="8" height="8" rx="2" fill="hsla(0, 0%, 20%, 0.15)" />
                  {/* Torso */}
                  <path d="M 62 68 L 60 120 L 100 120 L 98 68 Z" fill="hsla(0, 0%, 20%, 0.15)" rx="4" />
                  {/* Arms */}
                  <path d="M 62 72 L 42 100 L 46 102 L 64 80" fill="hsla(0, 0%, 20%, 0.12)" />
                  <path d="M 98 72 L 118 100 L 114 102 L 96 80" fill="hsla(0, 0%, 20%, 0.12)" />
                  {/* Legs */}
                  <path d="M 65 120 L 60 155 L 68 155 L 75 120" fill="hsla(0, 0%, 20%, 0.12)" />
                  <path d="M 85 120 L 92 155 L 100 155 L 95 120" fill="hsla(0, 0%, 20%, 0.12)" />
                </g>
                {/* Light zones — illuminated progressively */}
                {LIGHT_ZONES.slice(0, lit).map((zone, i) => (
                  <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ duration: 1.2 }}>
                    {/* Outer glow */}
                    <ellipse cx="80" cy={zone.cy} rx={zone.rx * 1.6} ry={zone.ry * 1.6}
                      fill={`hsla(${zone.hue}, 30%, 50%, 0.08)`} />
                    {/* Inner light */}
                    <ellipse cx="80" cy={zone.cy} rx={zone.rx} ry={zone.ry}
                      fill={`hsla(${zone.hue}, ${35 + i * 5}%, ${45 + i * 5}%, ${0.15 + i * 0.04})`} />
                    {/* Core */}
                    <ellipse cx="80" cy={zone.cy} rx={zone.rx * 0.4} ry={zone.ry * 0.4}
                      fill={`hsla(${zone.hue}, ${40 + i * 5}%, ${55 + i * 5}%, ${0.2 + i * 0.05})`} />
                  </motion.g>
                ))}
                {/* Full body glow — when all lit */}
                {lit >= LIGHT_ZONES.length && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ duration: 2 }}>
                    <ellipse cx="80" cy="95" rx="45" ry="65"
                      fill="hsla(45, 35%, 55%, 0.1)" />
                    <ellipse cx="80" cy="95" rx="30" ry="50"
                      fill="hsla(45, 40%, 58%, 0.1)" />
                  </motion.g>
                )}
                {/* Zone label */}
                {lit > 0 && lit <= LIGHT_ZONES.length && (
                  <text x="80" y="178" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(${LIGHT_ZONES[Math.min(lit - 1, LIGHT_ZONES.length - 1)].hue}, 25%, 48%, 0.25)`}>
                    {lit >= LIGHT_ZONES.length ? 'light' : LIGHT_ZONES[lit - 1].label}
                  </text>
                )}
              </svg>
            </div>
            <motion.div key={lit} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {lit === 0 ? 'Dark. Heavy. Solid.' : lit < LIGHT_ZONES.length ? `${LIGHT_ZONES[lit - 1].label} illuminated.` : 'You are made of light.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {LIGHT_ZONES.map((_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < lit ? `hsla(${35 + i * 3}, 40%, ${50 + i * 4}%, 0.5)` : palette.primaryFaint, opacity: i < lit ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Feet. Legs. Torso. Arms. Head. All light. The body is heavy. The spirit is light. You are the light.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Visualization. Imagining the body as light reduces physical pain and heaviness. Somatic symptoms release.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Heavy. Light. Free.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}