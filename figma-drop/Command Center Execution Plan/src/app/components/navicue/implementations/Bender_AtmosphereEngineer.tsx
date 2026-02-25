/**
 * BENDER #4 — The Atmosphere Engineer
 * "Do not just enter the room. Happen to the room. You bring the weather."
 * ARCHETYPE: Pattern B (Drag) — Drag thermostat from Cold→Warm.
 * Screen color temperature shifts. Affective presence.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Bender_AtmosphereEngineer({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const drag = useDragInteraction({
    axis: 'y', sticky: true,
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
  // Color shift: cold blue → warm amber
  const hue = 220 - t * 185; // 220→35
  const sat = 6 + t * 18;
  const light = 6 + t * 8;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Reading the room temperature...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Do not just enter the room. Happen to the room. You bring the weather.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag upward to turn the vibe from cold to warm</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
                background: `hsla(${hue}, ${sat}%, ${light}%, 0.95)`,
                transition: 'background 0.3s ease' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Thermostat track */}
                <rect x="160" y="20" width="8" height="140" rx="4"
                  fill={`hsla(${hue}, ${sat * 0.3}%, ${15}%, 0.06)`} />
                {/* Fill level */}
                <motion.rect x="160" y={160 - t * 140} width="8" height={t * 140} rx="4"
                  fill={`hsla(${hue}, ${sat}%, ${25 + t * 15}%, ${0.08 + t * 0.06})`}
                  initial={{ y: 160, height: 0 }}
                  animate={{ y: 160 - t * 140, height: t * 140 }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />
                {/* Thermostat knob */}
                <motion.circle cx="164" cy={160 - t * 140} r="6"
                  fill={`hsla(${hue}, ${sat}%, ${30 + t * 15}%, ${0.12 + t * 0.06})`}
                  stroke={`hsla(${hue}, ${sat}%, ${35 + t * 10}%, ${0.08 + t * 0.04})`}
                  strokeWidth="0.6"
                  initial={{ cy: 160 }}
                  animate={{ cy: 160 - t * 140 }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* COLD label */}
                <text x="164" y="175" textAnchor="middle" fontSize="3" fontFamily="monospace"
                  fill={`hsla(220, 8%, 30%, ${0.06 * (1 - t)})`}>COLD</text>
                {/* WARM label */}
                <text x="164" y="16" textAnchor="middle" fontSize="3" fontFamily="monospace"
                  fill={`hsla(35, 15%, 40%, ${0.06 * t})`}>WARM</text>

                {/* Room visualization */}
                {/* People silhouettes — become warmer */}
                {[50, 80, 110].map((x, i) => (
                  <g key={i}>
                    <circle cx={x} cy={70 + i * 5} r={8}
                      fill={`hsla(${hue}, ${sat * 0.5}%, ${18 + t * 8}%, ${0.03 + t * 0.03})`} />
                    <rect x={x - 5} y={80 + i * 5} width={10} height={15} rx="2"
                      fill={`hsla(${hue}, ${sat * 0.4}%, ${16 + t * 6}%, ${0.03 + t * 0.025})`} />
                  </g>
                ))}

                {/* Connection lines between people — appear as warmth increases */}
                {t > 0.3 && (
                  <>
                    <motion.line x1="50" y1="75" x2="80" y2="80"
                      stroke={`hsla(${hue}, ${sat}%, ${30 + t * 12}%, ${(t - 0.3) * 0.06})`}
                      strokeWidth="0.4" strokeDasharray="2 1"
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.3) * 0.06 }} />
                    <motion.line x1="80" y1="80" x2="110" y2="85"
                      stroke={`hsla(${hue}, ${sat}%, ${30 + t * 12}%, ${(t - 0.3) * 0.06})`}
                      strokeWidth="0.4" strokeDasharray="2 1"
                      initial={{ opacity: 0 }} animate={{ opacity: (t - 0.3) * 0.06 }} />
                  </>
                )}

                {/* Warmth radiance at full */}
                {t > 0.7 && (
                  <motion.circle cx="80" cy="80" r={30 + t * 20}
                    fill={`hsla(${hue}, ${sat}%, ${30 + t * 10}%, ${(t - 0.7) * 0.03})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.7) * 0.03 }}
                  />
                )}

                {/* Vibe readout */}
                <text x="75" y="145" textAnchor="middle" fontSize="5" fontFamily="monospace"
                  fill={`hsla(${hue}, ${sat}%, ${25 + t * 15}%, ${0.06 + t * 0.05})`}>
                  {t < 0.2 ? 'VIBE: COLD' : t < 0.5 ? 'VIBE: COOL' : t < 0.8 ? 'VIBE: WARM' : 'VIBE: ☀ RADIANT'}
                </text>
                <text x="75" y="155" textAnchor="middle" fontSize="3" fontFamily="monospace"
                  fill={`hsla(${hue}, ${sat * 0.5}%, ${22 + t * 8}%, ${0.04 + t * 0.02})`}>
                  {t >= 0.95 ? 'you are the weather' : `temperature: ${Math.round(t * 100)}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'The room is cold. People are distant.' : t < 0.5 ? 'Warming. Colors shifting. Connections forming.' : t < 0.95 ? 'Warm. The room responds to your presence.' : 'Radiant. You are the weather now.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? `hsla(${hue}, ${sat}%, ${40 + i * 3}%, 0.5)` : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You dragged the thermostat from cold to radiant. The screen shifted from blue to amber. Distant silhouettes connected. The room warmed to your presence. You did not just enter the room. You happened to it. You bring the weather.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Affective presence. Humans consistently elicit specific emotional responses in others. You can consciously regulate this signature to alter social dynamics. Emotional contagion.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Cold. Warm. Weather.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}