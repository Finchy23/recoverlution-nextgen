/**
 * MAGNET #3 — The Whisper Frequency
 * "Shouting is for the desperate. Whispering is for the confident."
 * ARCHETYPE: Pattern B (Drag) — An audio waveform. Drag to lower volume.
 * Red (loud, chaotic) → Blue (low, smooth). Vocal prosody.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Magnet_WhisperFrequency({ onComplete }: Props) {
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
  // Red (loud) → Blue (whisper)
  const hue = 0 + t * 220; // 0→220
  const amplitude = 1 - t; // 1→0 (shrinks)

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Too loud...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Shouting is for the desperate. Whispering is for the confident. Make them lean in to catch the gold. Lower the pitch. Lower the volume.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag upward to lower the frequency to a whisper</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '240px', height: '140px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Centerline */}
                <line x1="10" y1="70" x2="230" y2="70"
                  stroke={themeColor(TH.primaryHSL, 0.03)} strokeWidth="0.3" />

                {/* Waveform — amplitude shrinks with drag */}
                <motion.path
                  d={Array.from({ length: 50 }, (_, i) => {
                    const x = 10 + i * 4.4;
                    const wave = Math.sin(i * 0.6 + t * 2) * (30 * amplitude + 3)
                      + Math.sin(i * 1.2) * (12 * amplitude)
                      + (amplitude > 0.3 ? Math.sin(i * 3.1) * 8 * amplitude : 0);
                    return `${i === 0 ? 'M' : 'L'} ${x},${70 + wave}`;
                  }).join(' ')}
                  fill="none"
                  stroke={`hsla(${hue}, ${15 + t * 10}%, ${30 + t * 12}%, ${0.1 + t * 0.05})`}
                  strokeWidth={1.2 - t * 0.5}
                  strokeLinecap="round"
                />

                {/* Chaos indicators at high volume */}
                {amplitude > 0.5 && (
                  <>
                    <text x="20" y="20" fontSize="4" fontFamily="monospace"
                      fill={`hsla(0, 15%, 30%, ${0.06 * amplitude})`}>LOUD</text>
                    <text x="180" y="20" fontSize="4" fontFamily="monospace"
                      fill={`hsla(0, 15%, 30%, ${0.06 * amplitude})`}>CHAOTIC</text>
                  </>
                )}

                {/* Calm indicators at low volume */}
                {t > 0.6 && (
                  <motion.text x="120" y="20" textAnchor="middle" fontSize="4" fontFamily="monospace"
                    fill={`hsla(220, 12%, 35%, ${(t - 0.6) * 0.1})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.6) * 0.1 }}>
                    WHISPER
                  </motion.text>
                )}

                {/* Volume meter on right */}
                <rect x="232" y="15" width="5" height="110" rx="2"
                  fill={themeColor(TH.primaryHSL, 0.03)} />
                <motion.rect x="232" y={15 + t * 110} width="5" height={110 * (1 - t)} rx="2"
                  fill={`hsla(${hue}, ${12 + t * 8}%, ${22 + t * 12}%, ${0.06 + t * 0.04})`}
                  initial={{ y: 15, height: 110 }}
                  animate={{ y: 15 + t * 110, height: 110 * (1 - t) }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Lean-in figures — appear as whisper increases */}
                {t > 0.4 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: (t - 0.4) * 0.08 }}>
                    <circle cx="60" cy="110" r="4" fill={`hsla(${hue}, 8%, 22%, 0.04)`} />
                    <line x1="60" y1="114" x2="68" y2="108"
                      stroke={`hsla(${hue}, 8%, 22%, 0.03)`} strokeWidth="0.5" />
                    <circle cx="180" cy="110" r="4" fill={`hsla(${hue}, 8%, 22%, 0.04)`} />
                    <line x1="180" y1="114" x2="172" y2="108"
                      stroke={`hsla(${hue}, 8%, 22%, 0.03)`} strokeWidth="0.5" />
                  </motion.g>
                )}

                <text x="120" y="135" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 0.95 ? 'WHISPER MODE. they lean in' : `volume: ${Math.round(100 * (1 - t))}%`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'The waveform is loud. Red. Chaotic. Desperate.' : t < 0.5 ? 'Lowering. The chaos is smoothing.' : t < 0.95 ? 'Quiet. Blue. Figures are leaning in.' : 'A whisper. Maximum power. They lean in.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You dragged the frequency down. Red, loud, chaotic → blue, low, smooth. The waveform flattened to a whisper. And then: figures appeared, leaning in. That is the physics of attraction. Shouting pushes. Whispering pulls. Make them lean in to catch the gold.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Vocal prosody. Lower frequency and slower tempo are evolutionary signals of high status and relaxation, calming the listener's nervous system through co-regulation.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Loud. Quiet. Lean in.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}