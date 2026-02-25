/**
 * DREAMWALKER #3 — The Night Terrain
 * "Your unconscious is not a void. It is a landscape."
 * ARCHETYPE: Pattern A (Tap ×5) — Navigate nocturnal terrains.
 * Each tap reveals: phosphor forest, dark ocean, obsidian desert,
 * aurora field, the infinite corridor. Exploring the unconscious.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TERRAINS = [
  { name: 'PHOSPHOR FOREST', hue: 140, sat: 20, light: 12, desc: 'things that glow without source' },
  { name: 'DARK OCEAN', hue: 210, sat: 25, light: 8, desc: 'depth you cannot see the bottom of' },
  { name: 'OBSIDIAN DESERT', hue: 30, sat: 10, light: 6, desc: 'vast silence with a pulse' },
  { name: 'AURORA FIELD', hue: 280, sat: 22, light: 15, desc: 'the sky remembers everything' },
  { name: 'INFINITE CORRIDOR', hue: 245, sat: 18, light: 10, desc: 'the door at the end is you' },
];

export default function DreamWalker_NightTerrain({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const traverse = () => {
    if (stage !== 'active' || taps >= TERRAINS.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= TERRAINS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const terrain = TERRAINS[Math.min(taps, TERRAINS.length - 1)];
  const tc = (a: number, lo = 0) => `hsla(${terrain.hue}, ${terrain.sat}%, ${Math.min(100, terrain.light + lo)}%, ${a})`;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Terrain shifts underfoot...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Your unconscious is not a void. It is a landscape with forests and oceans, deserts and corridors. You walk it every night. Walk it awake.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to traverse each terrain</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={traverse}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= TERRAINS.length ? 'default' : 'pointer' }}>

            <AnimatePresence mode="wait">
              <motion.div key={taps}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8 }}
                style={{ position: 'relative', width: '220px', height: '140px', borderRadius: radius.sm, overflow: 'hidden' }}>
                <svg width="100%" height="100%" viewBox="0 0 220 140">
                  {/* Sky gradient */}
                  <defs>
                    <linearGradient id={`sky-${taps}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tc(0.95)} />
                      <stop offset="100%" stopColor={tc(0.6, 4)} />
                    </linearGradient>
                  </defs>
                  <rect width="220" height="140" fill={`url(#sky-${taps})`} />

                  {/* Terrain-specific features */}
                  {taps === 0 && /* Forest */ Array.from({ length: 7 }, (_, i) => (
                    <g key={i}>
                      <line x1={20 + i * 30} y1="140" x2={20 + i * 30} y2={80 - (i % 3) * 10}
                        stroke={tc(0.08, 10)} strokeWidth="1.5" />
                      <circle cx={20 + i * 30} cy={75 - (i % 3) * 10} r={5 + (i % 2) * 3}
                        fill={tc(0.06, 15)} />
                      {/* Phosphor dots */}
                      <motion.circle cx={15 + i * 30} cy={90 + (i % 3) * 8} r="1"
                        fill={tc(0.12, 25)}
                        initial={{ opacity: 0.05 }}
                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }} />
                    </g>
                  ))}
                  {taps === 1 && /* Ocean */ <>
                    {Array.from({ length: 4 }, (_, i) => (
                      <motion.path key={i}
                        d={`M 0 ${80 + i * 15} Q 55 ${75 + i * 15} 110 ${80 + i * 15} Q 165 ${85 + i * 15} 220 ${80 + i * 15}`}
                        fill="none" stroke={tc(0.06 + i * 0.01, 10)} strokeWidth="0.5"
                        initial={{ d: `M 0 ${80 + i * 15} Q 55 ${75 + i * 15} 110 ${80 + i * 15} Q 165 ${85 + i * 15} 220 ${80 + i * 15}` }}
                        animate={{ d: [
                          `M 0 ${80 + i * 15} Q 55 ${75 + i * 15} 110 ${80 + i * 15} Q 165 ${85 + i * 15} 220 ${80 + i * 15}`,
                          `M 0 ${80 + i * 15} Q 55 ${85 + i * 15} 110 ${80 + i * 15} Q 165 ${75 + i * 15} 220 ${80 + i * 15}`,
                        ] }}
                        transition={{ duration: 3 + i * 0.5, repeat: Infinity, repeatType: 'reverse' }} />
                    ))}
                  </>}
                  {taps === 2 && /* Desert */ <>
                    <path d="M 0 110 Q 50 95 110 100 Q 170 105 220 95 L 220 140 L 0 140 Z"
                      fill={tc(0.06, 6)} />
                    {/* Heat shimmer lines */}
                    {Array.from({ length: 5 }, (_, i) => (
                      <motion.line key={i}
                        x1={30 + i * 40} y1={60 + (i % 2) * 10} x2={30 + i * 40} y2={65 + (i % 2) * 10}
                        stroke={tc(0.04, 10)} strokeWidth={safeSvgStroke(0.3)}
                        initial={{ opacity: 0.02 }}
                        animate={{ opacity: [0.02, 0.06, 0.02] }}
                        transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }} />
                    ))}
                  </>}
                  {taps === 3 && /* Aurora */ <>
                    {Array.from({ length: 5 }, (_, i) => (
                      <motion.path key={i}
                        d={`M ${i * 50} 20 Q ${i * 50 + 25} ${15 + (i % 2) * 20} ${(i + 1) * 50} 25`}
                        fill="none" stroke={`hsla(${280 + i * 20}, 20%, ${20 + i * 3}%, 0.06)`}
                        strokeWidth={2 + i * 0.3}
                        initial={{ opacity: 0.03 }}
                        animate={{ opacity: [0.03, 0.08, 0.03] }}
                        transition={{ duration: 2 + i * 0.4, repeat: Infinity }} />
                    ))}
                  </>}
                  {taps >= 4 && /* Corridor */ <>
                    {/* Perspective lines converging */}
                    <line x1="0" y1="0" x2="110" y2="70" stroke={tc(0.05, 10)} strokeWidth={safeSvgStroke(0.3)} />
                    <line x1="220" y1="0" x2="110" y2="70" stroke={tc(0.05, 10)} strokeWidth={safeSvgStroke(0.3)} />
                    <line x1="0" y1="140" x2="110" y2="70" stroke={tc(0.05, 10)} strokeWidth={safeSvgStroke(0.3)} />
                    <line x1="220" y1="140" x2="110" y2="70" stroke={tc(0.05, 10)} strokeWidth={safeSvgStroke(0.3)} />
                    {/* Door at vanishing point */}
                    <rect x="102" y="58" width="16" height="24" rx="1"
                      fill={tc(0.04, 15)} stroke={tc(0.1, 20)} strokeWidth="0.5" />
                    <circle cx="115" cy="70" r="1" fill={tc(0.15, 25)} />
                  </>}

                  {/* Terrain label */}
                  <text x="110" y="135" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={tc(0.12, 20)} letterSpacing="0.1em">
                    {terrain.name}
                  </text>
                </svg>
              </motion.div>
            </AnimatePresence>

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.div key={`d-${taps}`} initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
                style={{ fontSize: '11px', fontFamily: 'serif', fontStyle: 'italic',
                  color: themeColor(TH.accentHSL, 0.15, 12) }}>
                {terrain.desc}
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '6px' }}>
              {TERRAINS.map((_, i) => (
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
              Five terrains. All inside you. The unconscious is not dark — it is simply unlit. Bring your attention, and the landscape reveals itself.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>attention is the lantern</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The landscape reveals itself.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}