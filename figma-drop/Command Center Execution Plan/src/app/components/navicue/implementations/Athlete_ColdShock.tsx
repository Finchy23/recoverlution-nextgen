/**
 * ATHLETE #5 -- The Cold Shock
 * "Comfort is the killer. Shock the system."
 * INTERACTION: The screen is warm amber. Each tap freezes a section --
 * ice crystals spread from the tap point. 5 taps → fully frozen.
 * At completion: a blue flash, then calm. Heart rate drops.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Self-Compassion', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FREEZE_STEPS = 5;

export default function Athlete_ColdShock({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [frozen, setFrozen] = useState(0);
  const [flashActive, setFlashActive] = useState(false);
  const [crystals, setCrystals] = useState<{ cx: number; cy: number; r: number; angle: number }[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const freeze = () => {
    if (stage !== 'active' || frozen >= FREEZE_STEPS) return;
    const next = frozen + 1;
    setFrozen(next);
    // Add crystal cluster
    const newCrystals = Array.from({ length: 6 }, (_, i) => ({
      cx: 40 + Math.random() * 120,
      cy: 30 + Math.random() * 110,
      r: 5 + Math.random() * 10,
      angle: Math.random() * 360,
    }));
    setCrystals(prev => [...prev, ...newCrystals]);

    if (next >= FREEZE_STEPS) {
      setFlashActive(true);
      addTimer(() => setFlashActive(false), 400);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = frozen / FREEZE_STEPS;
  const warmHue = 30 - t * 180; // 30 (warm) → -150 (mapped to 210 blue)
  const mappedHue = warmHue < 0 ? warmHue + 360 : warmHue;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Self-Compassion" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Warmth fades...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Cold water on the face. Ten seconds. Comfort is the killer. Shock the system. Wake up.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to freeze</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={freeze}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: frozen >= FREEZE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '170px', borderRadius: radius.md, overflow: 'hidden' }}>
              {/* Blue flash overlay */}
              {flashActive && (
                <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }}
                  style={{ position: 'absolute', inset: 0, background: 'hsla(200, 40%, 55%, 0.25)', zIndex: 10, borderRadius: radius.md }} />
              )}
              <svg width="100%" height="100%" viewBox="0 0 200 170"
                style={{ position: 'absolute', inset: 0, background: `hsla(${mappedHue}, ${10 + t * 10}%, ${7 + t * 3}%, 0.3)` }}>
                {/* Temperature gradient */}
                <defs>
                  <radialGradient id={`${svgId}-tempGrad`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(${mappedHue}, ${15 + t * 15}%, ${30 + t * 12}%, ${0.06 + t * 0.06})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="200" height="170" fill={`url(#${svgId}-tempGrad)`} />

                {/* Ice crystals -- six-pointed stars */}
                {crystals.map((c, i) => (
                  <motion.g key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.12, scale: 1 }}
                    transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                    style={{ transformOrigin: `${c.cx}px ${c.cy}px` }}>
                    {Array.from({ length: 6 }, (_, j) => {
                      const a = ((j / 6) * 360 + c.angle) * (Math.PI / 180);
                      return (
                        <line key={j}
                          x1={c.cx} y1={c.cy}
                          x2={c.cx + Math.cos(a) * c.r} y2={c.cy + Math.sin(a) * c.r}
                          stroke={`hsla(200, 25%, 55%, 0.1)`} strokeWidth="0.4" strokeLinecap="round"
                        />
                      );
                    })}
                  </motion.g>
                ))}

                {/* Face silhouette -- freezing */}
                <ellipse cx="100" cy="75" rx={28} ry={35}
                  fill="none"
                  stroke={`hsla(${mappedHue}, ${10 + t * 8}%, ${25 + t * 10}%, ${0.06 + t * 0.04})`}
                  strokeWidth="0.5" />
                {/* Trigeminal nerve markers */}
                {t > 0.3 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}>
                    <circle cx="88" cy="68" r="2" fill="hsla(200, 20%, 50%, 0.06)" />
                    <circle cx="112" cy="68" r="2" fill="hsla(200, 20%, 50%, 0.06)" />
                    <circle cx="100" cy="82" r="1.5" fill="hsla(200, 20%, 50%, 0.06)" />
                  </motion.g>
                )}

                {/* Heart rate indicator -- drops */}
                <g>
                  <text x="100" y="145" textAnchor="middle" fontSize="6" fontFamily="monospace"
                    fill={`hsla(${mappedHue}, ${12 + t * 8}%, ${32 + t * 10}%, ${0.1 + t * 0.05})`}>
                    HR: {Math.round(80 - t * 20)} bpm
                  </text>
                </g>

                {/* Frozen label */}
                {t >= 1 && (
                  <motion.text x="100" y="162" textAnchor="middle" fontSize="5.5" fontFamily="monospace"
                    fill="hsla(200, 20%, 50%, 0.15)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.5, duration: 1.5 }}>
                    DIVE REFLEX ACTIVATED
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={frozen} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {frozen === 0 ? 'Warm. Comfortable. Dangerous.' : frozen < FREEZE_STEPS ? `Freezing... ${Math.round(t * 100)}% crystallized.` : 'Frozen. Blue flash. Heart rate dropped.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: FREEZE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < frozen ? 'hsla(200, 25%, 50%, 0.5)' : palette.primaryFaint, opacity: i < frozen ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The screen froze. Blue flash. Heart rate dropped. The shock woke you up. Comfort was the killer.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Mammalian dive reflex. Cold water on the face activates the trigeminal nerve, instantly lowering heart rate and engaging the parasympathetic system. Ancient override.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Warm. Shock. Awake.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}