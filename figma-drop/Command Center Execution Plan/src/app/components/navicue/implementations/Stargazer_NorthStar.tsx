/**
 * STARGAZER #1 — The North Star
 * "You cannot navigate by a map that changes. You need a star that stays."
 * ARCHETYPE: Pattern A (Tap × 5) — A spinning star field.
 * All stars rotate except one fixed point at center. Each tap sharpens focus on it.
 * Teleological focus. Superordinate goal.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FOCUS_STEPS = 5;
const FIELD_STARS = Array.from({ length: 30 }, (_, i) => ({
  angle: (i / 30) * Math.PI * 2,
  r: 20 + (i * 37 % 55),
  size: 0.5 + (i % 4) * 0.3,
  speed: 0.8 + (i % 3) * 0.4,
}));

export default function Stargazer_NorthStar({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [focus, setFocus] = useState(0);
  const [rotation, setRotation] = useState(0);
  const timersRef = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setRotation(r => r + dt * 0.3);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage]);

  const lock = () => {
    if (stage !== 'active' || focus >= FOCUS_STEPS) return;
    const next = focus + 1;
    setFocus(next);
    if (next >= FOCUS_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = focus / FOCUS_STEPS;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The sky is spinning...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You cannot navigate by a map that changes. You need a star that stays. Find your fixed point. What is the one thing you will not compromise?</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to sharpen your focus on the fixed star</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={lock}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: focus >= FOCUS_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.97, t * 2) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Rotating star field */}
                <g style={{ transformOrigin: '100px 100px', transform: `rotate(${rotation * 57.3}rad)` }}>
                  {FIELD_STARS.map((s, i) => {
                    const x = 100 + Math.cos(s.angle) * s.r;
                    const y = 100 + Math.sin(s.angle) * s.r;
                    const dimming = t * 0.6; // other stars dim as focus sharpens
                    return (
                      <circle key={i} cx={x} cy={y} r={s.size}
                        fill={themeColor(TH.primaryHSL, Math.max(0.01, 0.04 - dimming * 0.03), 15 + i % 10)}
                      />
                    );
                  })}
                </g>

                {/* Star trails at higher focus */}
                {t > 0.3 && FIELD_STARS.filter((_, i) => i % 4 === 0).map((s, i) => {
                  const x = 100 + Math.cos(s.angle + rotation) * s.r;
                  const y = 100 + Math.sin(s.angle + rotation) * s.r;
                  const x2 = 100 + Math.cos(s.angle + rotation - 0.15 * t) * s.r;
                  const y2 = 100 + Math.sin(s.angle + rotation - 0.15 * t) * s.r;
                  return (
                    <line key={`trail-${i}`} x1={x} y1={y} x2={x2} y2={y2}
                      stroke={themeColor(TH.primaryHSL, 0.02, 12)}
                      strokeWidth="0.3" strokeLinecap="round"
                    />
                  );
                })}

                {/* THE NORTH STAR — fixed, does not rotate */}
                <motion.circle cx="100" cy="100" r={2 + t * 4}
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.12, 20 + t * 15)}
                  animate={{ r: [2 + t * 4, 3 + t * 4, 2 + t * 4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* North star glow rings */}
                {[1, 2, 3].map(ring => (
                  <circle key={ring} cx="100" cy="100" r={(2 + t * 4) + ring * (3 + t * 2)}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, Math.max(0.005, 0.03 - ring * 0.008) + t * 0.02, 18)}
                    strokeWidth="0.3"
                  />
                ))}
                {/* Cross hairs at higher focus */}
                {t > 0.4 && (
                  <>
                    <line x1="100" y1={100 - 12 - t * 8} x2="100" y2={100 - 5}
                      stroke={themeColor(TH.accentHSL, 0.04 + t * 0.02, 18)} strokeWidth="0.3" />
                    <line x1="100" y1={100 + 5} x2="100" y2={100 + 12 + t * 8}
                      stroke={themeColor(TH.accentHSL, 0.04 + t * 0.02, 18)} strokeWidth="0.3" />
                    <line x1={100 - 12 - t * 8} y1="100" x2={100 - 5} y2="100"
                      stroke={themeColor(TH.accentHSL, 0.04 + t * 0.02, 18)} strokeWidth="0.3" />
                    <line x1={100 + 5} y1="100" x2={100 + 12 + t * 8} y2="100"
                      stroke={themeColor(TH.accentHSL, 0.04 + t * 0.02, 18)} strokeWidth="0.3" />
                  </>
                )}

                <text x="100" y="190" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {t >= 1 ? 'LOCKED. your fixed point holds' : `focus: ${focus}/${FOCUS_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {focus === 0 ? 'The sky spins. Thirty stars wheeling. One stays fixed.' : focus < FOCUS_STEPS ? `Focus ${focus}. The field dims. The fixed point sharpens.` : 'Locked. Everything moves. Your star holds.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: FOCUS_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < focus ? themeColor(TH.accentHSL, 0.5, 18) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five taps. The spinning field dimmed. Star trails blurred. But one point held. Still, bright, unmoved. Your North Star. You cannot navigate by a map that changes. You need a star that stays. What is the one thing you will not compromise? Steer by that.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Teleological focus. A superordinate goal, a fixed purpose, organizes all sub-goals and reduces decision fatigue in chaotic environments.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Spin. Fix. Navigate.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}