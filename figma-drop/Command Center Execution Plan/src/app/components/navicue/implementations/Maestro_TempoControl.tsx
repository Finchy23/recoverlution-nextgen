/**
 * MAESTRO #5 — The Tempo Control
 * "Speed is the language of anxiety. Slowness is the language of mastery."
 * ARCHETYPE: Pattern B (Drag) — A metronome. Drag to slow the tick.
 * Fast/anxious → slow/sovereign. Temporal discounting.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

export default function Maestro_TempoControl({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [tick, setTick] = useState(0);
  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  // Metronome tick
  useEffect(() => {
    if (stage !== 'active') return;
    const bpm = 180 - drag.progress * 140; // 180bpm→40bpm
    const interval = (60 / bpm) * 1000;
    const id = setInterval(() => setTick(t => t + 1), interval);
    return () => clearInterval(id);
  }, [stage, drag.progress]);

  const t = drag.progress;
  const bpm = Math.round(180 - t * 140);
  const pendulumAngle = Math.sin(tick * Math.PI) * (25 - t * 15);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Tick, tick, tick...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Speed is the language of anxiety. Slowness is the language of mastery. Slow down. Every movement, every word, every breath: decelerate. Gravity.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag right to decelerate the metronome</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '280px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '160px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 160 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Metronome body */}
                <polygon points="55,165 105,165 90,45 70,45"
                  fill={themeColor(TH.primaryHSL, 0.04 + t * 0.02, 8)}
                  stroke={themeColor(TH.primaryHSL, 0.05, 10)} strokeWidth="0.3" />

                {/* Pendulum arm */}
                <motion.line
                  x1="80" y1="145" x2={80 + Math.sin(pendulumAngle * Math.PI / 180) * 60} y2={145 - Math.cos(pendulumAngle * Math.PI / 180) * 60}
                  stroke={themeColor(TH.accentHSL, 0.1 + t * 0.06, 15)}
                  strokeWidth={1.5 + t * 0.5}
                  strokeLinecap="round"
                />
                {/* Pendulum weight */}
                <motion.circle
                  cx={80 + Math.sin(pendulumAngle * Math.PI / 180) * 60}
                  cy={145 - Math.cos(pendulumAngle * Math.PI / 180) * 60}
                  r={4 + t * 2}
                  fill={themeColor(TH.accentHSL, 0.1 + t * 0.05, 18)}
                />
                {/* Pivot */}
                <circle cx="80" cy="145" r="2.5"
                  fill={themeColor(TH.primaryHSL, 0.06, 12)} />

                {/* BPM display */}
                <text x="80" y="35" textAnchor="middle" fontSize="14" fontFamily="monospace" fontWeight="bold"
                  fill={themeColor(TH.accentHSL, 0.08 + t * 0.06, 18)}>
                  {bpm}
                </text>
                <text x="80" y="43" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05, 10)}>
                  BPM
                </text>

                {/* Tempo marking */}
                <text x="80" y="175" textAnchor="middle" fontSize="11" fontFamily="Georgia, serif" fontStyle="italic"
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.04, 12)}>
                  {bpm > 140 ? 'Presto, anxious' : bpm > 100 ? 'Allegro, hurried' : bpm > 70 ? 'Andante, walking' : 'Largo, sovereign'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {t < 0.1 ? 'Presto. 180 BPM. Frantic, anxious, small.' : t < 0.5 ? `Slowing. ${bpm} BPM. Breath deepening.` : t < 0.95 ? `${bpm} BPM. The swagger of slowness.` : 'Largo. 40 BPM. Sovereign. Gravity.'}
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
            <div style={{ ...navicueType.prompt, color: palette.text }}>You dragged from presto to largo. 180 BPM → 40 BPM. The pendulum swung frantic, then slowed to a sovereign sweep. Each tick became wider, heavier, more deliberate. Speed is the language of anxiety. Slowness is the language of mastery. Gravity.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Temporal discounting. Slower movements and speech pace signal a long time horizon, which is an evolutionary indicator of high status and low threat.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Fast. Slow. Gravity.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}