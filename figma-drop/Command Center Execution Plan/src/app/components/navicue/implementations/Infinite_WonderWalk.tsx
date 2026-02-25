/**
 * INFINITE PLAYER #7 — The Wonder Walk
 * "Walk as if you are kissing the earth with your feet."
 * INTERACTION: A treasure map with fog. Each tap clears fog from
 * one region — 5 taps. Hidden wonders are revealed: a star, a spiral,
 * a feather, a drop, a question mark. "Go find your wow."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DISCOVER_STEPS = 5;
const WONDERS = [
  { cx: 50, cy: 45, glyph: '★', label: 'a star' },
  { cx: 150, cy: 40, glyph: '◎', label: 'a spiral' },
  { cx: 40, cy: 100, glyph: '𖤐', label: 'a feather' },
  { cx: 160, cy: 105, glyph: '◇', label: 'a drop' },
  { cx: 100, cy: 75, glyph: '?', label: 'the question' },
];

export default function Infinite_WonderWalk({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [discovered, setDiscovered] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const discover = () => {
    if (stage !== 'active' || discovered >= DISCOVER_STEPS) return;
    const next = discovered + 1;
    setDiscovered(next);
    if (next >= DISCOVER_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = discovered / DISCOVER_STEPS;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A map in the fog...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Go outside. Find something that makes you say "Wow." Walk as if you are kissing the earth with your feet.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to clear the fog and find hidden wonders</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={discover}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: discovered >= DISCOVER_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '150px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(35, ${5 + t * 6}%, ${5 + t * 4}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Map trail lines */}
                <path d="M 20,130 Q 50,110 80,100 Q 110,90 100,75 Q 90,60 120,45 Q 140,35 170,25"
                  fill="none" stroke={`hsla(35, ${6 + t * 8}%, ${15 + t * 8}%, ${0.03 + t * 0.03})`}
                  strokeWidth="0.5" strokeDasharray="3 2" />
                {/* Branch trails */}
                <path d="M 80,100 Q 50,80 40,60" fill="none"
                  stroke={`hsla(35, 6%, 15%, ${0.02 + t * 0.015})`} strokeWidth="0.3" strokeDasharray="2 2" />
                <path d="M 120,45 Q 145,70 160,100" fill="none"
                  stroke={`hsla(35, 6%, 15%, ${0.02 + t * 0.015})`} strokeWidth="0.3" strokeDasharray="2 2" />

                {/* Fog overlay — fades as discoveries increase */}
                <rect x="0" y="0" width="200" height="150"
                  fill={`hsla(220, 5%, 8%, ${0.05 * (1 - t)})`} />

                {/* Hidden wonders — revealed sequentially */}
                {WONDERS.map((w, i) => (
                  i < discovered ? (
                    <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.15, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 120 }}>
                      <circle cx={w.cx} cy={w.cy} r="12"
                        fill={`hsla(${35 + i * 30}, ${10 + i * 3}%, ${18 + i * 4}%, 0.03)`} />
                      <text x={w.cx} y={w.cy + 4} textAnchor="middle" fontSize="10"
                        fill={`hsla(${35 + i * 30}, ${15 + i * 3}%, ${30 + i * 5}%, 0.12)`}>
                        {w.glyph}
                      </text>
                      <text x={w.cx} y={w.cy + 18} textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                        fill={`hsla(${35 + i * 30}, 8%, 25%, 0.06)`}>
                        {w.label}
                      </text>
                    </motion.g>
                  ) : (
                    /* Fog circle covering undiscovered */
                    <circle key={i} cx={w.cx} cy={w.cy} r="15"
                      fill={`hsla(220, 4%, 10%, ${0.03})`} />
                  )
                ))}

                {/* Compass rose */}
                <g>
                  <text x="190" y="140" textAnchor="end" fontSize="5" fontFamily="Georgia, serif"
                    fill={`hsla(35, ${8 + t * 8}%, ${20 + t * 8}%, ${0.05 + t * 0.03})`}>
                    N
                  </text>
                  <line x1="188" y1="142" x2="188" y2="148"
                    stroke={`hsla(35, 6%, 18%, ${0.04 + t * 0.02})`} strokeWidth="0.3" />
                </g>

                <text x="100" y="145" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(35, ${6 + t * 8}%, ${20 + t * 10}%, ${0.04 + t * 0.03})`}>
                  {t >= 1 ? 'all wonders found. go outside.' : `wonders: ${discovered}/${DISCOVER_STEPS}`}
                </text>
              </svg>
            </div>
            <motion.div key={discovered} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {discovered === 0 ? 'A treasure map. Fog everywhere. Wonders hidden.' : discovered < DISCOVER_STEPS ? `Found: ${WONDERS[discovered - 1].label}. More in the fog.` : 'All five wonders revealed. Now go find your own.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: DISCOVER_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < discovered ? 'hsla(35, 20%, 45%, 0.5)' : palette.primaryFaint, opacity: i < discovered ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five discoveries. The fog lifted. A star, a spiral, a feather, a drop, a question mark. Hidden wonders on a treasure map. But this is not the map that matters. Go outside. Walk as if you are kissing the earth with your feet. Find something that makes you say "Wow."</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Awe creates a "small self" effect, increasing pro-social behavior and reducing self-critical rumination. The wonder is outside. Go find it.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Map. Fog. Wow.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}