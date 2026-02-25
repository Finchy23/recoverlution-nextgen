/**
 * DREAMWALKER #1 — The Lucid Entry
 * "You are not in the dream. The dream is in you."
 * ARCHETYPE: Pattern A (Tap ×5) — Each tap peels back a layer of
 * the dreamscape: mist → water → stars → geometry → the watcher.
 * Lucid Dreaming as metacognitive awareness.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LAYERS = [
  { label: 'MIST', desc: 'the veil thins', fill: [245, 20, 18] },
  { label: 'WATER', desc: 'depth below depth', fill: [200, 25, 15] },
  { label: 'STARS', desc: 'the inner sky', fill: [260, 18, 12] },
  { label: 'GEOMETRY', desc: 'the architecture beneath', fill: [185, 22, 18] },
  { label: 'THE WATCHER', desc: 'you, aware inside the dream', fill: [245, 15, 25] },
];

export default function DreamWalker_LucidEntry({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const descend = () => {
    if (stage !== 'active' || taps >= LAYERS.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= LAYERS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const layer = LAYERS[Math.min(taps, LAYERS.length - 1)];
  const layerColor = (a: number, lo = 0) => `hsla(${layer.fill[0]}, ${layer.fill[1]}%, ${Math.min(100, layer.fill[2] + lo)}%, ${a})`;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The dream begins...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Every night you travel to a country where the laws of physics are suggestions. Most people forget the journey. Tonight, stay awake inside the dream.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to descend deeper</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={descend}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= LAYERS.length ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden' }}>
              {/* Concentric dream layers */}
              <AnimatePresence mode="wait">
                <motion.svg key={taps} width="100%" height="100%" viewBox="0 0 200 200"
                  initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8 }}>
                  {/* Outer layer — current environment */}
                  <circle cx="100" cy="100" r="98" fill={layerColor(0.95)} />

                  {/* Concentric rings — past layers */}
                  {LAYERS.slice(0, taps).map((l, i) => {
                    const r = 90 - i * 15;
                    return (
                      <motion.circle key={i} cx="100" cy="100" r={r}
                        fill="none" stroke={`hsla(${l.fill[0]}, ${l.fill[1]}%, ${l.fill[2] + 10}%, 0.06)`}
                        strokeWidth="0.5"
                        initial={{ r: r + 10, opacity: 0 }} animate={{ r, opacity: 1 }} />
                    );
                  })}

                  {/* Dream particles — float upward */}
                  {Array.from({ length: 6 + taps * 2 }, (_, i) => (
                    <motion.circle key={`p-${i}`}
                      cx={40 + (i * 23) % 130} cy={30 + (i * 31) % 140}
                      r={1 + (i % 2)}
                      fill={layerColor(0.08 + taps * 0.02, 15)}
                      initial={{ cy: 30 + (i * 31) % 140, opacity: 0.08 }}
                      animate={{ cy: [30 + (i * 31) % 140, 20 + (i * 31) % 140], opacity: [0.08, 0.02] }}
                      transition={{ duration: 3 + i * 0.3, repeat: Infinity }} />
                  ))}

                  {/* Center eye — the watcher */}
                  {taps >= 4 && (
                    <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1.5 }} style={{ transformOrigin: '100px 100px' }}>
                      <ellipse cx="100" cy="100" rx="12" ry="8"
                        fill="none" stroke={themeColor(TH.accentHSL, 0.2, 20)} strokeWidth="0.5" />
                      <circle cx="100" cy="100" r="3"
                        fill={themeColor(TH.accentHSL, 0.15, 25)} />
                    </motion.g>
                  )}

                  {/* Layer label */}
                  <text x="100" y="175" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={layerColor(0.15, 20)} letterSpacing="0.1em">
                    {layer.label}
                  </text>
                  <text x="100" y="188" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic"
                    fill={layerColor(0.1, 15)}>
                    {layer.desc}
                  </text>
                </motion.svg>
              </AnimatePresence>
            </div>

            {/* Depth dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {LAYERS.map((_, i) => (
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
              Five layers deep. And at the center — you, watching. You are not in the dream. The dream is in you. Lucidity is not about control. It is about awareness.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the watcher is always awake</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Awake inside the dream.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}