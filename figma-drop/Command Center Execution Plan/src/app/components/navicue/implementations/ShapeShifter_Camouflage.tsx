/**
 * SHAPESHIFTER #3 — The Camouflage
 * "You are not the chameleon. You are the spectrum."
 * ARCHETYPE: Pattern A (Tap ×5) — A figure against shifting backgrounds.
 * Each tap changes the environment AND the figure adapts.
 * Contextual Identity — you contain all environments.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ENVS = [
  { name: 'FOREST', hue: 140, sat: 12, light: 8, figureAdj: 'grounded' },
  { name: 'OCEAN', hue: 210, sat: 15, light: 10, figureAdj: 'fluid' },
  { name: 'DESERT', hue: 35, sat: 18, light: 12, figureAdj: 'resilient' },
  { name: 'CITY', hue: 0, sat: 0, light: 8, figureAdj: 'electric' },
  { name: 'COSMOS', hue: 260, sat: 20, light: 5, figureAdj: 'infinite' },
];

export default function ShapeShifter_Camouflage({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const adapt = () => {
    if (stage !== 'active' || taps >= ENVS.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= ENVS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const env = ENVS[Math.min(taps, ENVS.length - 1)];
  const envColor = (a: number, lo = 0) => `hsla(${env.hue}, ${env.sat}%, ${Math.min(100, env.light + lo)}%, ${a})`;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The environment shifts...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The chameleon does not lose itself when it changes color. It contains every color. You are not adapting. You are selecting from the spectrum.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to shift environment</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={adapt}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= ENVS.length ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '220px', height: '160px', borderRadius: radius.sm, overflow: 'hidden' }}>
              {/* Environment background — crossfades */}
              <AnimatePresence mode="wait">
                <motion.div key={taps}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{ position: 'absolute', inset: 0 }}>
                  <svg width="100%" height="100%" viewBox="0 0 220 160">
                    <rect width="220" height="160" fill={envColor(0.95, 0)} />
                    {/* Environment texture */}
                    {taps > 0 && Array.from({ length: 8 }, (_, i) => (
                      <circle key={i}
                        cx={30 + (i * 27) % 200}
                        cy={20 + (i * 19) % 130}
                        r={3 + (i % 3) * 2}
                        fill={envColor(0.04, 10 + i * 2)} />
                    ))}
                    {/* Horizon line */}
                    <line x1="0" y1="110" x2="220" y2="110"
                      stroke={envColor(0.06, 15)} strokeWidth="0.5" />
                    {/* Env label */}
                    <text x="15" y="15" fontSize="11" fontFamily="monospace"
                      fill={envColor(0.1, 20)} letterSpacing="0.15em">
                      {env.name}
                    </text>
                  </svg>
                </motion.div>
              </AnimatePresence>

              {/* The figure — adapts color to environment */}
              <AnimatePresence mode="wait">
                <motion.div key={`f-${taps}`}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="80" height="120" viewBox="0 0 80 120">
                    {/* Figure silhouette — color matches environment */}
                    <ellipse cx="40" cy="35" rx="12" ry="14" fill={envColor(0.12, 20)} />
                    <rect x="30" y="50" width="20" height="35" rx="6" fill={envColor(0.1, 18)} />
                    <rect x="25" y="85" width="10" height="20" rx="3" fill={envColor(0.08, 15)} />
                    <rect x="45" y="85" width="10" height="20" rx="3" fill={envColor(0.08, 15)} />
                    {/* Adaptation descriptor */}
                    <text x="40" y="115" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic"
                      fill={envColor(0.2, 25)}>
                      {env.figureAdj}
                    </text>
                  </svg>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Environment dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {ENVS.map((_, i) => (
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
              Five environments. One figure. You adapted to all of them without losing yourself. You are not the chameleon. You are the spectrum.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>adaptability is not weakness, it is range</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>You are the spectrum.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}