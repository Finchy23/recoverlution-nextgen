/**
 * STARGAZER #9 — The Light Speed (Relativity)
 * "Time is relative to your velocity. Fill the moment with density."
 * ARCHETYPE: Pattern E (Hold) — A clock at center. Press and hold.
 * The clock slows, hands crawling. The moment stretches. Time becomes dense.
 * Time perception (density). The Oddball Effect.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Stargazer_LightSpeed({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [clockAngle, setClockAngle] = useState(0);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); cancelAnimationFrame(rafRef.current); };
  }, []);

  // Clock ticks — slower as hold progresses
  useEffect(() => {
    if (stage !== 'active') return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const speed = Math.max(0.02, 1 - hold.tension * 0.95);
      setClockAngle(a => a + dt * speed * 60);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage, hold.tension]);

  const t = hold.tension;
  const secAngle = clockAngle * 6;
  const minAngle = clockAngle * 0.1;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Time passes...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Time is relative to your velocity. The faster you move, the slower time gets. If you want to live longer, live faster. Fill the moment with density.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold to accelerate until time itself slows</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, position: 'relative', width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.97, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Clock face */}
                <circle cx="90" cy="90" r="60"
                  fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.05, 12)}
                  strokeWidth="0.6" />

                {/* Hour markers */}
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
                  const inner = 53;
                  const outer = 58;
                  return (
                    <line key={i}
                      x1={90 + Math.cos(angle) * inner} y1={90 + Math.sin(angle) * inner}
                      x2={90 + Math.cos(angle) * outer} y2={90 + Math.sin(angle) * outer}
                      stroke={themeColor(TH.primaryHSL, 0.06, 14)}
                      strokeWidth={i % 3 === 0 ? '1' : '0.4'} />
                  );
                })}

                {/* Minute hand */}
                <line x1="90" y1="90"
                  x2={90 + Math.cos((minAngle - 90) * Math.PI / 180) * 40}
                  y2={90 + Math.sin((minAngle - 90) * Math.PI / 180) * 40}
                  stroke={themeColor(TH.primaryHSL, 0.08, 15)}
                  strokeWidth="1" strokeLinecap="round" />

                {/* Second hand */}
                <line x1="90" y1="90"
                  x2={90 + Math.cos((secAngle - 90) * Math.PI / 180) * 48}
                  y2={90 + Math.sin((secAngle - 90) * Math.PI / 180) * 48}
                  stroke={themeColor(TH.accentHSL, 0.08 + t * 0.04, 18)}
                  strokeWidth="0.5" strokeLinecap="round" />

                {/* Center pin */}
                <circle cx="90" cy="90" r="2"
                  fill={themeColor(TH.accentHSL, 0.1, 18)} />

                {/* Time dilation effect — concentric ripples as time slows */}
                {t > 0.3 && [1, 2, 3].map(ring => (
                  <motion.circle key={`dil-${ring}`} cx="90" cy="90" r={60 + ring * 8}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.02 + (t - 0.3) * 0.02, 12)}
                    strokeWidth="0.3"
                    animate={{ r: [60 + ring * 8, 62 + ring * 8, 60 + ring * 8] }}
                    transition={{ duration: 3, repeat: Infinity, delay: ring * 0.5 }}
                  />
                ))}

                {/* Velocity bar */}
                <rect x="15" y="155" width="50" height="3" rx="1.5"
                  fill={themeColor(TH.primaryHSL, 0.03)} />
                <motion.rect x="15" y="155" width={50 * t} height="3" rx="1.5"
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.04, 15)}
                  animate={{ width: 50 * t }}
                  transition={{ type: 'spring', stiffness: 20 }}
                />
                <text x="40" y="165" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.04, 14)}>
                  velocity
                </text>

                <text x="130" y="162" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {hold.completed ? 'TIME STOPPED' :
                   hold.isHolding ? `time: ×${(1 - t * 0.95).toFixed(2)}` :
                   'press and hold'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'Time nearly stopped. The moment became infinite.' :
                 hold.isHolding ? `${t < 0.3 ? 'Accelerating. The clock slows slightly.' : t < 0.6 ? 'The second hand crawls. Time dilates.' : t < 0.9 ? 'Near light speed. Time almost stops.' : 'The moment stretches toward infinity.'}` :
                 'A clock ticking normally. Press and hold to accelerate.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.25, 0.5, 0.75, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 18) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You held. Velocity increased. The clock slowed, the second hand crawling, then nearly stopping. The moment stretched toward infinity. Time is relative to your velocity. The faster you live, the more novelty, intensity, presence you bring, the denser time becomes. Dense time is long time. Fill the moment.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Time perception (density). Novelty and high-intensity experiences create dense memories, making life feel longer and richer in retrospect. This is the Oddball Effect: unusual experiences stretch subjective time.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Accelerate. Dilate. Eternity.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}