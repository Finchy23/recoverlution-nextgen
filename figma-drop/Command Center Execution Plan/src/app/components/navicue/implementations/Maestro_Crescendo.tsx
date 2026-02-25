/**
 * MAESTRO #1 — The Crescendo
 * "A whisper that builds to a roar is louder than a scream that never stops."
 * ARCHETYPE: Pattern E (Hold) — A single horizontal line at center.
 * Hold: the line thickens, vibrates, splits into an orchestra of waves.
 * Dynamic range.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

export default function Maestro_Crescendo({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 3500);
    },
  });

  const t = hold.tension;
  const lineCount = Math.floor(1 + t * 11);
  const amplitude = t * 25;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A single note...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>A whisper that builds to a roar is louder than a scream that never stops. Start low. Build slowly. Make the crescendo earn the silence that came before.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold to build the crescendo</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 240, 140).base }}>
              <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ position: 'absolute', inset: 0 }}>
                {/* Orchestra lines — multiply with tension */}
                {Array.from({ length: lineCount }, (_, i) => {
                  const offset = (i - lineCount / 2) * (3 + t * 2);
                  const freq = 0.3 + i * 0.15;
                  const amp = amplitude * (0.3 + (i / lineCount) * 0.7);
                  const phase = i * 0.8;
                  return (
                    <motion.path key={i}
                      d={Array.from({ length: 50 }, (_, j) => {
                        const x = j * 4.8;
                        const y = 70 + offset + Math.sin(j * freq + phase) * amp;
                        return `${j === 0 ? 'M' : 'L'} ${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke={themeColor(TH.accentHSL, 0.04 + t * 0.04 - i * 0.002, 10 + i * 1.5)}
                      strokeWidth={0.3 + t * 0.6 - i * 0.02}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* Dynamic marker */}
                <text x="12" y="130" fontSize="11" fontFamily="Georgia, serif" fontStyle="italic"
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.06, 15)}>
                  {t < 0.15 ? 'pp' : t < 0.3 ? 'p' : t < 0.5 ? 'mp' : t < 0.7 ? 'mf' : t < 0.85 ? 'f' : t < 0.95 ? 'ff' : 'fff'}
                </text>

                {/* Crescendo hairpin */}
                <line x1="35" y1="128" x2={35 + t * 180} y2={128 - t * 6}
                  stroke={themeColor(TH.accentHSL, 0.05 + t * 0.04, 12)} strokeWidth="0.5" />
                <line x1="35" y1="132" x2={35 + t * 180} y2={132 + t * 6}
                  stroke={themeColor(TH.accentHSL, 0.05 + t * 0.04, 12)} strokeWidth="0.5" />

                {/* Full orchestra glow */}
                {t >= 0.95 && (
                  <motion.rect x="0" y="0" width="240" height="140"
                    fill={themeColor(TH.accentHSL, 0.03, 15)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    transition={{ duration: 2 }}
                  />
                )}
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'Fortississimo. The full orchestra. The room shakes.' :
                 hold.isHolding ? `${lineCount} voice${lineCount > 1 ? 's' : ''}. ${t < 0.3 ? 'Pianissimo. A whisper.' : t < 0.6 ? 'Building. Mezzo.' : 'Forte. The crescendo crests.'}` :
                 'A flat line. Silence. Press and hold to build.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.25, 0.5, 0.75, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You held. One line became two, four, eight, twelve, each vibrating at its own frequency. Pianissimo to fortississimo. The crescendo built from a whisper to a roar. And the roar was louder because the whisper came first. That is dynamic range. The quiet makes the loud devastating.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Dynamic range in communication. Contrast between quiet and loud moments creates emotional impact. Monotone, whether loud or quiet, is the enemy of influence.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            pp. Build. fff.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}