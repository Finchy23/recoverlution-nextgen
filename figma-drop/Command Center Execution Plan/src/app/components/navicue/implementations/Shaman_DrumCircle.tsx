/**
 * SHAMAN #3 — The Drum Circle
 * "One drum is a heartbeat. Five drums are a ceremony."
 * ARCHETYPE: Pattern A (Tap × 5) — A single drum at center.
 * Each tap: another drum joins. Concentric pulse rings sync into rhythm.
 * Rhythmic entrainment. Neural synchrony.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { SHAMAN_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ember');
const TH = SHAMAN_THEME;

const DRUM_STEPS = 5;
const DRUMS = [
  { x: 100, y: 80, r: 16, label: 'heartbeat' },
  { x: 55, y: 65, r: 12, label: 'pulse' },
  { x: 145, y: 65, r: 12, label: 'breath' },
  { x: 65, y: 105, r: 11, label: 'step' },
  { x: 135, y: 105, r: 11, label: 'ceremony' },
];

export default function Shaman_DrumCircle({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [drums, setDrums] = useState(0);

  const beat = () => {
    if (stage !== 'active' || drums >= DRUM_STEPS) return;
    const next = drums + 1;
    setDrums(next);
    if (next >= DRUM_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = drums / DRUM_STEPS;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A single heartbeat...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>One drum is a heartbeat. Five drums are a ceremony. The rhythm finds the rhythm. The bodies synchronize.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to add each drum to the circle</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={beat}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: drums >= DRUM_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: '50%', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Drums + pulse rings */}
                {DRUMS.map((drum, i) => {
                  if (i >= drums) return null;
                  const speed = 1.5 - i * 0.15;
                  return (
                    <motion.g key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 60 }}>
                      {/* Pulse rings — radiate outward */}
                      {[1, 2, 3].map(ring => (
                        <motion.circle key={`ring-${ring}`}
                          cx={drum.x} cy={drum.y} r={drum.r}
                          fill="none"
                          stroke={themeColor(TH.primaryHSL, 0.03 - ring * 0.008, 8)}
                          strokeWidth="0.4"
                          initial={{ r: drum.r, opacity: 0.03 }}
                          animate={{ r: [drum.r, drum.r + ring * 12 + t * 5], opacity: [0.03, 0] }}
                          transition={{ duration: speed + ring * 0.3, repeat: Infinity, delay: ring * 0.2 }}
                        />
                      ))}
                      {/* Drum body */}
                      <circle cx={drum.x} cy={drum.y} r={drum.r}
                        fill={themeColor(TH.primaryHSL, 0.04 + i * 0.005, 8 + i * 2)}
                        stroke={themeColor(TH.accentHSL, 0.06 + i * 0.008, 12)}
                        strokeWidth="0.5"
                      />
                      {/* Drum skin pattern */}
                      <circle cx={drum.x} cy={drum.y} r={drum.r * 0.65}
                        fill="none"
                        stroke={themeColor(TH.accentHSL, 0.04, 10)}
                        strokeWidth="0.3"
                      />
                      {/* Beat animation */}
                      <motion.circle cx={drum.x} cy={drum.y} r={drum.r * 0.3}
                        fill={themeColor(TH.accentHSL, 0.06, 15)}
                        animate={{ r: [drum.r * 0.3, drum.r * 0.4, drum.r * 0.3] }}
                        transition={{ duration: speed, repeat: Infinity }}
                      />
                      {/* Label */}
                      <text x={drum.x} y={drum.y + drum.r + 10} textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={themeColor(TH.accentHSL, 0.05, 10)}>
                        {drum.label}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Sync lines between drums */}
                {drums >= 2 && DRUMS.slice(0, drums).map((d1, i) => {
                  const d2 = DRUMS[(i + 1) % drums];
                  if (!d2 || i >= drums - 1) return null;
                  return (
                    <motion.line key={`sync-${i}`}
                      x1={d1.x} y1={d1.y} x2={d2.x} y2={d2.y}
                      stroke={themeColor(TH.accentHSL, 0.02 + t * 0.01, 8)}
                      strokeWidth="0.3" strokeDasharray="2 3"
                      initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.02 + t * 0.01) }}
                    />
                  );
                })}

                <text x="100" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'CEREMONY. all drums synchronized' : `drums: ${drums}/${DRUM_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {drums === 0 ? 'Silence. The circle is empty.' : drums < DRUM_STEPS ? `${drums} drum${drums > 1 ? 's' : ''}. "${DRUMS[drums - 1].label}" joined the rhythm.` : 'Five drums. One ceremony. The rhythm is whole.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: DRUM_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < drums ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five taps. Five drums. Heartbeat, pulse, breath, step, ceremony. The pulse rings radiated outward, overlapping, synchronizing. One drum is a heartbeat. Five drums are a ceremony. The rhythm found the rhythm. The bodies synchronized.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Rhythmic entrainment. Shared rhythmic patterns synchronize neural oscillations across individuals, creating group cohesion and reducing the boundary between self and other.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Beat. Sync. Ceremony.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}