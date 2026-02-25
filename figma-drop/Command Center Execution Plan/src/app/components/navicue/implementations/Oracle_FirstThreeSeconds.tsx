/**
 * ORACLE #3 — The First Three Seconds
 * "You have three seconds. After that, they stop listening."
 * ARCHETYPE: Pattern E (Hold) — Press and hold for exactly 3 seconds.
 * A camera shutter opens. At 3s: CLICK — snapshot captures.
 * Thin-Slice Judgment.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ORACLE_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Practice');
const TH = ORACLE_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Oracle_FirstThreeSeconds({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const hold = useHoldInteraction({
    maxDuration: 3000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = hold.tension;
  const shutterOpen = t * 40; // aperture opens
  const seconds = Math.min(3, Math.round(hold.heldDuration / 1000 * 10) / 10);

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            3... 2... 1...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You have three seconds. After that, they stop listening and start confirming what they already decided. Make the first three seconds count.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold for exactly 3 seconds</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, position: 'relative', width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Shutter blades */}
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const innerR = 10 + shutterOpen;
                  const outerR = 85;
                  return (
                    <motion.line key={i}
                      x1={90 + Math.cos(angle) * innerR}
                      y1={90 + Math.sin(angle) * innerR}
                      x2={90 + Math.cos(angle + 0.3) * outerR}
                      y2={90 + Math.sin(angle + 0.3) * outerR}
                      stroke={themeColor(TH.primaryHSL, 0.06 + t * 0.03, 10)}
                      strokeWidth={8 - t * 3}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Aperture circle — opens */}
                <motion.circle cx="90" cy="90" r={shutterOpen}
                  fill={themeColor(TH.accentHSL, t * 0.04, 10)}
                  stroke={themeColor(TH.accentHSL, 0.06 + t * 0.04, 12)}
                  strokeWidth="0.5"
                  animate={{ r: shutterOpen }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Timer display */}
                <text x="90" y="95" textAnchor="middle" fontSize={hold.completed ? '14' : '20'}
                  fontFamily="monospace" fontWeight="bold"
                  fill={themeColor(hold.completed ? TH.accentHSL : TH.primaryHSL, hold.completed ? 0.16 : 0.1 + t * 0.06, 18)}>
                  {hold.completed ? 'CLICK' : hold.isHolding ? seconds.toFixed(1) + 's' : '0.0s'}
                </text>

                {/* Flash effect on complete */}
                {hold.completed && (
                  <motion.rect x="0" y="0" width="180" height="180"
                    fill="hsla(35, 20%, 50%, 0.08)"
                    initial={{ opacity: 0.08 }} animate={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                  />
                )}

                {/* Progress arc */}
                <circle cx="90" cy="90" r="75"
                  fill="none" stroke={themeColor(TH.primaryHSL, 0.03)} strokeWidth="2" />
                <motion.circle cx="90" cy="90" r="75"
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.08 + t * 0.06, 12)}
                  strokeWidth="2" strokeLinecap="round"
                  strokeDasharray={`${t * 471} 471`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px' }}
                />

                <text x="90" y="165" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {hold.completed ? 'CAPTURED. first impression locked' :
                   hold.isHolding ? 'hold steady...' : 'press and hold. 3 seconds'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'Three seconds. The shutter clicked. The impression is locked.' :
                 hold.isHolding ? `${seconds < 1 ? 'One... energy, posture, eyes.' : seconds < 2 ? 'Two... voice, warmth, signal.' : 'Three... CLICK.'}` :
                 'A camera aperture. Three seconds to make the first impression.'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Three seconds. The aperture opened. Energy, posture, eyes: one second. Voice, warmth, signal: two seconds. CLICK, three seconds. The shutter closed. The impression is locked. After that, they stop listening and start confirming what they already decided. Make the first three seconds count.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Thin-slice judgment. Research shows impression formation occurs in under 3 seconds, after which confirmation bias takes over. Front-load your signal.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            One. Two. Click.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}