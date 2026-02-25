/**
 * DREAMWALKER #7 — The Somnambulant
 * "The body knows the way. Trust the dark."
 * ARCHETYPE: Pattern B (Drag) — Sleepwalking through darkness.
 * Drag horizontally to guide a figure along an invisible path.
 * Footprints glow briefly behind. Body Wisdom / Embodied Cognition.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function DreamWalker_Somnambulant({ onComplete }: Props) {
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
  const figX = 20 + t * 170;
  const footprintCount = Math.floor(t * 10);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Footsteps in the dark...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The sleepwalker navigates in total darkness and never falls. The body knows pathways the mind has forgotten. Trust the dark. Your feet remember.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to guide the walker</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '220px', height: '140px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 140">
                {/* Pure darkness */}
                <rect width="220" height="140" fill={themeColor(TH.voidHSL, 0.98, 0)} />

                {/* Faint ground line */}
                <line x1="0" y1="115" x2="220" y2="115"
                  stroke={themeColor(TH.primaryHSL, 0.03, 5)} strokeWidth={safeSvgStroke(0.3)} />

                {/* Glowing footprints behind */}
                {Array.from({ length: footprintCount }, (_, i) => {
                  const fx = 20 + (i / 10) * 170;
                  const age = (t * 10 - i) / 10; // newer = brighter
                  const brightness = Math.max(0, 0.1 - age * 0.08);
                  return (
                    <g key={i}>
                      <ellipse cx={fx} cy="118" rx="3" ry="1.5"
                        fill={themeColor(TH.accentHSL, brightness, 18)} />
                      <ellipse cx={fx + 5} cy="119" rx="2.5" ry="1.2"
                        fill={themeColor(TH.accentHSL, brightness * 0.8, 15)} />
                    </g>
                  );
                })}

                {/* The walker — simple silhouette */}
                <motion.g initial={{ x: 0 }} animate={{ x: figX - 20 }} transition={{ type: 'spring', stiffness: 50, damping: 15 }}>
                  {/* Ambient glow around walker */}
                  <circle cx="20" cy="90" r="20"
                    fill={themeColor(TH.accentHSL, 0.02 + t * 0.02, 15)} />
                  {/* Head */}
                  <ellipse cx="20" cy="78" rx="6" ry="7"
                    fill={themeColor(TH.accentHSL, 0.08, 15)} />
                  {/* Body */}
                  <rect x="15" y="86" width="10" height="18" rx="3"
                    fill={themeColor(TH.accentHSL, 0.06, 12)} />
                  {/* Legs — slight walking motion */}
                  <motion.rect x="14" y="104" width="5" height="11" rx="2"
                    fill={themeColor(TH.accentHSL, 0.05, 10)}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    style={{ transformOrigin: '16.5px 104px' }} />
                  <motion.rect x="21" y="104" width="5" height="11" rx="2"
                    fill={themeColor(TH.accentHSL, 0.05, 10)}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [5, -5, 5] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    style={{ transformOrigin: '23.5px 104px' }} />
                  {/* Closed eyes — sleepwalking */}
                  <line x1="18" y1="76" x2="22" y2="76"
                    stroke={themeColor(TH.accentHSL, 0.12, 20)} strokeWidth="0.5" />
                </motion.g>

                {/* Destination glow */}
                <motion.circle cx="200" cy="95" r="8"
                  fill={themeColor(TH.accentHSL, 0.03 + t * 0.04, 18)}
                  initial={{ r: 8, opacity: 0.12 }}
                  animate={{ r: [8, 10, 8], opacity: [0.03, 0.06, 0.03] }}
                  transition={{ duration: 2.5, repeat: Infinity }} />
              </svg>
            </div>

            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
              color: themeColor(TH.accentHSL, 0.1 + t * 0.1, 12) }}>
              {t > 0.9 ? 'ARRIVED' : `WALKING ${Math.round(t * 100)}%`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The walker arrived. Eyes closed the entire time. Your body carries wisdom your mind has not yet learned to read. Sometimes the right path is walked in the dark.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the body knows the way</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Trust the dark.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}