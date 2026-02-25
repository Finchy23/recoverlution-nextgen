/**
 * STARGAZER #4 — The Eclipse
 * "The shadow is temporary. The sun is permanent."
 * ARCHETYPE: Pattern E (Hold) — The sun at center. Hold: the moon slides across.
 * Total eclipse. The corona reveals itself. Then: the light returns.
 * Object permanence (emotional). The light exists even when blocked.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Stargazer_Eclipse({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
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
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = hold.tension;
  // Moon slides across: 0→0.4 approaching, 0.4→0.7 total eclipse, 0.7→1.0 departing
  const moonOffset = t < 0.4 ? (1 - t / 0.4) * 50 : t < 0.7 ? 0 : ((t - 0.7) / 0.3) * 50;
  const isTotality = t >= 0.35 && t <= 0.75;
  const coronaOpacity = isTotality ? 0.06 + (1 - Math.abs((t - 0.55) / 0.2)) * 0.06 : 0.01;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The light dims...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The shadow is temporary. The sun is permanent. Do not make permanent decisions in the dark. The light is not gone. It is just blocked. Wait.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold, watch the eclipse unfold</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.97, isTotality ? 0 : t > 0.7 ? (t - 0.7) * 8 : (1 - t * 2) * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Stars visible during totality */}
                {isTotality && Array.from({ length: 12 }, (_, i) => (
                  <motion.circle key={i}
                    cx={20 + (i * 43) % 160} cy={20 + (i * 37) % 160}
                    r={0.5 + (i % 3) * 0.3}
                    fill={themeColor(TH.primaryHSL, 0.04, 20)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.04 }}
                    transition={{ delay: i * 0.1 }}
                  />
                ))}

                {/* Sun */}
                <circle cx="100" cy="100" r="25"
                  fill={`hsla(45, 30%, ${isTotality ? 5 : 25 + (t > 0.7 ? (t - 0.7) * 40 : (1 - t) * 10)}%, ${isTotality ? 0.02 : 0.06 + (t > 0.7 ? (t - 0.7) * 0.06 : 0)})`}
                />

                {/* Corona — visible during eclipse */}
                {t > 0.2 && (
                  <>
                    {Array.from({ length: 16 }, (_, i) => {
                      const angle = (i / 16) * Math.PI * 2;
                      const len = 15 + (i % 3) * 8;
                      return (
                        <motion.line key={`corona-${i}`}
                          x1={100 + Math.cos(angle) * 26} y1={100 + Math.sin(angle) * 26}
                          x2={100 + Math.cos(angle) * (26 + len)} y2={100 + Math.sin(angle) * (26 + len)}
                          stroke={`hsla(45, 25%, 40%, ${coronaOpacity})`}
                          strokeWidth={0.6 + (i % 2) * 0.3}
                          strokeLinecap="round"
                          animate={{ opacity: [coronaOpacity, coronaOpacity * 1.3, coronaOpacity] }}
                          transition={{ duration: 2 + i * 0.2, repeat: Infinity }}
                        />
                      );
                    })}
                    <circle cx="100" cy="100" r="30"
                      fill="none"
                      stroke={`hsla(45, 20%, 35%, ${coronaOpacity * 0.6})`}
                      strokeWidth="0.4" />
                  </>
                )}

                {/* Moon — slides across */}
                <motion.circle cx={100 - moonOffset} cy="100" r="25"
                  fill={themeColor(TH.voidHSL, 0.95, 0)}
                  stroke={isTotality ? `hsla(45, 15%, 25%, 0.03)` : 'none'}
                  strokeWidth="0.3"
                  animate={{ cx: 100 - moonOffset }}
                  transition={{ type: 'spring', stiffness: 15 }}
                />

                <text x="100" y="185" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {hold.completed ? 'THE LIGHT RETURNS' :
                   isTotality ? 'TOTALITY. the corona reveals itself' :
                   t > 0 && t < 0.35 ? 'approaching eclipse...' :
                   t > 0.75 ? 'the shadow passes...' :
                   'press and hold'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'The moon passed. The sun returned. It was always there.' :
                 hold.isHolding ? `${isTotality ? 'Total eclipse. Stars appear. The corona blazes. The sun is still there, behind the shadow.' : t < 0.35 ? 'The moon approaches. Light dims.' : 'The shadow passes. Light returning.'}` :
                 'A bright sun. Press and hold to begin.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>The moon slid across the sun. Darkness. Stars appeared. The corona, invisible in daylight, blazed around the shadow. Then: the moon passed. The light returned. It was always there. The shadow is temporary. The sun is permanent. Do not make permanent decisions in the dark.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Emotional object permanence. Remembering that positive affect exists even when it cannot currently be felt prevents catastrophic thinking during depression or burnout.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Shadow. Corona. Light.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}