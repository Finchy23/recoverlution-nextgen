/**
 * STARGAZER #6 — The Event Horizon
 * "There is a line where the gravity becomes too strong to escape. Good."
 * ARCHETYPE: Pattern B (Drag) — A swirling black hole. A line marked "Point of No Return."
 * Drag to approach and cross. Commit. Make retreat impossible.
 * Commitment devices. Burning the boats.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Stargazer_EventHorizon({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = drag.progress;
  const crossed = t > 0.65;
  const swirlSpeed = 1 + t * 3;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A singularity ahead...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>There is a line where the gravity becomes too strong to escape. Good. Throw your hat over the wall. Make retreat impossible. Cross it. Commit.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag toward the event horizon, cross the point of no return</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, crossed ? t * 3 : 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Stars being pulled toward black hole */}
                {Array.from({ length: 18 }, (_, i) => {
                  const baseX = 20 + (i * 37) % 180;
                  const baseY = 15 + (i * 29) % 140;
                  const pull = t * (1 - Math.abs(baseX - 140) / 200) * 25;
                  return (
                    <circle key={i}
                      cx={baseX + pull} cy={baseY}
                      r={0.4 + (i % 3) * 0.2}
                      fill={themeColor(TH.primaryHSL, 0.03 - t * 0.01, 14 + (i % 6))} />
                  );
                })}

                {/* Accretion disk — swirling rings */}
                {[35, 28, 22].map((r, i) => (
                  <motion.ellipse key={`disk-${i}`} cx="155" cy="85" rx={r} ry={r * 0.3}
                    fill="none"
                    stroke={themeColor(TH.accentHSL, 0.03 + t * 0.02 - i * 0.005, 15 + i * 3)}
                    strokeWidth={0.4 + t * 0.3}
                    initial={{ ry: r * 0.3 }}
                    animate={{ ry: [r * 0.3, r * 0.35, r * 0.3] }}
                    transition={{ duration: 2 / swirlSpeed, repeat: Infinity }}
                    transform={`rotate(${15 + i * 8}, 155, 85)`}
                  />
                ))}

                {/* Black hole center */}
                <circle cx="155" cy="85" r="14"
                  fill={themeColor(TH.voidHSL, 0.98, 0)} />
                <circle cx="155" cy="85" r="14"
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.04 + t * 0.02, 12)}
                  strokeWidth="0.5" />

                {/* Event horizon line */}
                <line x1="115" y1="20" x2="115" y2="150"
                  stroke={crossed ? themeColor(TH.accentHSL, 0.08, 18) : themeColor(TH.primaryHSL, 0.04, 12)}
                  strokeWidth={crossed ? '1' : '0.5'}
                  strokeDasharray={crossed ? 'none' : '3 3'} />
                <text x="115" y="15" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(crossed ? TH.accentHSL : TH.primaryHSL, crossed ? 0.08 : 0.04, crossed ? 18 : 12)}>
                  POINT OF NO RETURN
                </text>

                {/* Your position — moving toward the horizon */}
                <motion.g initial={{ x: 0 }} animate={{ x: t * 90 }} transition={{ type: 'spring', stiffness: 15 }}>
                  <circle cx="30" cy="85" r="3"
                    fill={themeColor(TH.accentHSL, 0.1 + t * 0.06, 20 + t * 8)} />
                  {/* Elongation effect near horizon */}
                  {t > 0.5 && (
                    <ellipse cx="30" cy="85" rx={3 + (t - 0.5) * 6} ry={3 - (t - 0.5) * 1}
                      fill={themeColor(TH.accentHSL, 0.06, 18)} />
                  )}
                </motion.g>

                {/* Post-crossing glow */}
                {crossed && (
                  <motion.circle cx="155" cy="85" r={14 + (t - 0.65) * 30}
                    fill={themeColor(TH.accentHSL, 0.02, 12)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                    transition={{ duration: 1.5 }}
                  />
                )}

                <text x="110" y="162" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {t >= 0.95 ? 'COMMITTED. no retreat possible' : crossed ? 'CROSSED. there is no going back' : `approach: ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.15 ? 'A black hole ahead. The accretion disk swirls. A line marked.' : t < 0.5 ? 'Approaching. The gravity pulls. Stars distort.' : !crossed ? 'Almost at the line. The pull is strong.' : t < 0.95 ? 'Crossed. No retreat. You are committed.' : 'Fully committed. The gravity carries you now.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 18) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You crossed the line. The gravity took hold. There is no going back. Good. There is a line where the gravity becomes too strong to escape. That is the commitment point. Throw your hat over the wall. Make retreat impossible. When you cannot go back, every resource in your brain allocates forward.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Commitment devices. Creating a situation where backing out is impossible forces the brain to fully allocate resources to success rather than maintaining escape routes.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Approach. Cross. Commit.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}