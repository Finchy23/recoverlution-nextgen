/**
 * STARGAZER #7 — The Supernova
 * "Destruction is the engine of creation."
 * ARCHETYPE: Pattern E (Hold) — A star pulsing.
 * Hold: it compresses, then explodes in blinding radiance. From the debris: new elements.
 * Post-traumatic growth. Breakdown as forge.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { STARGAZER_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Stellar');
const TH = STARGAZER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Stargazer_Supernova({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [exploded, setExploded] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setExploded(true);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 4000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = hold.tension;
  const starR = exploded ? 3 : 18 - t * 12; // compresses then explodes small
  const phase = t < 0.4 ? 'compress' : t < 0.8 ? 'critical' : 'collapse';

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A star, burning...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The gold in your ring was forged in an exploding star. Your breakdown is just the forge. Destruction is the engine of creation. Let it blow.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold, compress the star until it detonates</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.97, exploded ? t * 5 : 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Background stars */}
                {Array.from({ length: 15 }, (_, i) => (
                  <circle key={i}
                    cx={10 + (i * 41) % 180} cy={10 + (i * 33) % 180}
                    r={0.3 + (i % 3) * 0.15}
                    fill={themeColor(TH.primaryHSL, exploded ? 0.04 : 0.02, 14 + (i % 5))} />
                ))}

                {/* Star — compressing */}
                {!exploded && (
                  <motion.g>
                    <motion.circle cx="100" cy="100" r={starR}
                      fill={`hsla(${30 + t * 20}, ${20 + t * 15}%, ${20 + t * 10}%, ${0.06 + t * 0.06})`}
                      animate={{ r: phase === 'critical' ? [starR, starR + 1, starR - 1, starR] : starR }}
                      transition={{ duration: 0.2, repeat: phase === 'critical' ? Infinity : 0 }}
                    />
                    {/* Pressure waves */}
                    {t > 0.3 && [1, 2].map(ring => (
                      <motion.circle key={ring} cx="100" cy="100" r={starR + ring * 5}
                        fill="none"
                        stroke={`hsla(${20 + t * 25}, ${25}%, ${25}%, ${0.03})`}
                        strokeWidth="0.3"
                        animate={{ r: [starR + ring * 5, starR + 2, starR + ring * 5] }}
                        transition={{ duration: 1 - t * 0.5, repeat: Infinity, delay: ring * 0.15 }}
                      />
                    ))}
                    {/* Core getting brighter */}
                    <circle cx="100" cy="100" r={starR * 0.4}
                      fill={`hsla(${45}, ${30}%, ${30 + t * 15}%, ${0.08 + t * 0.08})`} />
                  </motion.g>
                )}

                {/* SUPERNOVA EXPLOSION */}
                {exploded && (
                  <motion.g>
                    {/* Shockwave rings */}
                    {[1, 2, 3, 4].map(ring => (
                      <motion.circle key={`shock-${ring}`} cx="100" cy="100"
                        fill="none"
                        stroke={`hsla(${280 + ring * 15}, ${18 + ring * 3}%, ${30 + ring * 5}%, ${0.06 - ring * 0.01})`}
                        strokeWidth={1.5 - ring * 0.3}
                        initial={{ r: 5 }}
                        animate={{ r: [5, 70 + ring * 10], opacity: [0.06, 0] }}
                        transition={{ duration: 2 + ring * 0.5, delay: ring * 0.2 }}
                      />
                    ))}
                    {/* Debris / new elements ejected */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const angle = (i / 12) * Math.PI * 2;
                      return (
                        <motion.circle key={`debris-${i}`}
                          cx="100" cy="100" r={1 + (i % 3) * 0.5}
                          fill={`hsla(${i * 30}, ${15}%, ${30 + i * 2}%, ${0.06})`}
                          initial={{ cx: 100, cy: 100 }}
                          animate={{
                            cx: 100 + Math.cos(angle) * (40 + i * 5),
                            cy: 100 + Math.sin(angle) * (40 + i * 5),
                            opacity: [0.06, 0.08, 0.03],
                          }}
                          transition={{ duration: 3, delay: i * 0.05 }}
                        />
                      );
                    })}
                    {/* Remnant core */}
                    <motion.circle cx="100" cy="100" r="3"
                      fill={themeColor(TH.accentHSL, 0.15, 25)}
                      initial={{ r: 15 }}
                      animate={{ r: 3 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                    {/* Nebula cloud */}
                    <motion.circle cx="100" cy="100" r="50"
                      fill={themeColor(TH.accentHSL, 0.02, 12)}
                      initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                      transition={{ duration: 3 }}
                    />
                  </motion.g>
                )}

                <text x="100" y="190" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 18)}>
                  {exploded ? 'SUPERNOVA. destruction became creation' :
                   hold.isHolding ? `${phase === 'compress' ? 'compressing...' : phase === 'critical' ? 'CRITICAL. about to blow' : 'COLLAPSING'}` :
                   'press and hold. compress the star'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {exploded ? 'It blew. Debris scattered. New elements born from the forge.' :
                 hold.isHolding ? `${phase === 'compress' ? 'The star compresses. Getting smaller. Hotter.' : phase === 'critical' ? 'Vibrating. The core is unstable. Critical mass approaches.' : 'Collapse imminent. Let it blow.'}` :
                 'A massive star. Burning. Press and hold.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You compressed the star. It shrank, vibrated, went critical, and detonated. Shockwaves. Debris. New elements scattered across space. From the destruction: iron, gold, carbon. The ingredients of life. The gold in your ring was forged in an exploding star. Your breakdown is just the forge. Destruction is the engine of creation.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Post-traumatic growth. Significant character development often follows the destruction of a previous identity. The supernova is not the end. It is the forge.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Compress. Explode. Create.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}