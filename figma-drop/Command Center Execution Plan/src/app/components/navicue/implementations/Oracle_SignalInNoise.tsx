/**
 * ORACLE #5 — The Signal in the Noise
 * "There is only one true signal. The rest is performance."
 * ARCHETYPE: Pattern A (Tap × 5) — Layers of static. Each tap strips a layer.
 * Underneath: one pure waveform. Signal Detection Theory.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ORACLE_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
const TH = ORACLE_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STRIP_STEPS = 5;

export default function Oracle_SignalInNoise({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stripped, setStripped] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const strip = () => {
    if (stage !== 'active' || stripped >= STRIP_STEPS) return;
    const next = stripped + 1;
    setStripped(next);
    if (next >= STRIP_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = stripped / STRIP_STEPS;
  const noiseAmp = (1 - t) * 25;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Static everywhere...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>There is only one true signal. The rest is performance. Strip the layers. Find the waveform underneath.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to strip each noise layer</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={strip}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: stripped >= STRIP_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '240px', height: '130px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 130" style={{ position: 'absolute', inset: 0 }}>
                {/* Centerline */}
                <line x1="10" y1="65" x2="230" y2="65"
                  stroke={themeColor(TH.primaryHSL, 0.02 + t * 0.02)} strokeWidth="0.3" />

                {/* Noise layers — diminish with stripping */}
                {Array.from({ length: 5 - stripped }, (_, layer) => (
                  <motion.path key={`noise-${layer}`}
                    d={Array.from({ length: 45 }, (_, i) => {
                      const x = 10 + i * 5;
                      const noise = Math.sin(i * (1.5 + layer * 0.7) + layer * 2) * noiseAmp * (0.3 + layer * 0.14)
                        + Math.cos(i * (2.3 + layer)) * noiseAmp * 0.2;
                      return `${i === 0 ? 'M' : 'L'} ${x},${65 + noise}`;
                    }).join(' ')}
                    fill="none"
                    stroke={themeColor(TH.primaryHSL, 0.03 + layer * 0.005, 10 + layer * 2)}
                    strokeWidth={0.4 + layer * 0.1}
                    strokeLinecap="round"
                  />
                ))}

                {/* The true signal — pure sine, emerges as noise strips */}
                <motion.path
                  d={Array.from({ length: 45 }, (_, i) => {
                    const x = 10 + i * 5;
                    const signal = Math.sin(i * 0.3) * 18;
                    return `${i === 0 ? 'M' : 'L'} ${x},${65 + signal}`;
                  }).join(' ')}
                  fill="none"
                  stroke={themeColor(TH.accentHSL, t * 0.12, 18)}
                  strokeWidth={0.5 + t * 0.8}
                  strokeLinecap="round"
                />

                {/* Signal label at full clarity */}
                {t >= 1 && (
                  <motion.text x="120" y="18" textAnchor="middle" fontSize="11" fontFamily="monospace" fontWeight="bold"
                    fill={themeColor(TH.accentHSL, 0.12, 18)} letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    transition={{ duration: 1.5 }}>
                    THE SIGNAL
                  </motion.text>
                )}

                <text x="120" y="125" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'PURE. one waveform remains' : `noise layers: ${5 - stripped} remaining`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {stripped === 0 ? 'Five layers of noise. The signal is buried.' : stripped < STRIP_STEPS ? `Layer ${stripped} stripped. ${5 - stripped} remain. Signal emerging.` : 'All noise stripped. One pure waveform. The signal.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: STRIP_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < stripped ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five layers stripped. Each tap removed one noise waveform, jagged, chaotic, random. Underneath: one pure sine wave. Clean, smooth, true. There is only one true signal. The rest is performance. Find the waveform. Ignore the noise.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Signal detection theory. Separating true signal from noise requires both sensitivity and the willingness to tolerate ambiguity. Strip the layers.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Static. Strip. Signal.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}