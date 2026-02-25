/**
 * MYTHMAKER #4 — The Villain's Mask
 * "No one is a villain in their own story."
 * ARCHETYPE: Pattern B (Drag) — A scary mask. Drag downward to pull it off.
 * Behind it is a scared child. Perspective Taking / Theory of Mind.
 * The mask dissolves; the face beneath is fragile.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYTHMAKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MYTHMAKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function MythMaker_VillainsMask({ onComplete }: Props) {
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
  const maskOff = t > 0.7;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A face in the dark...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              They are not evil. They are the hero of a different movie that conflicts with yours. See their movie.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag down to remove the mask</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '180px', height: '220px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.9, 2) }}>

              {/* The child face beneath — revealed as mask comes off */}
              <motion.div
                animate={{ opacity: t * 0.8 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="80" height="100" viewBox="0 0 80 100">
                  {/* Small face — innocent, round */}
                  <ellipse cx="40" cy="42" rx="22" ry="26" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.12, 15)} strokeWidth="0.5" />
                  {/* Eyes — wide, fearful */}
                  <circle cx="32" cy="38" r="3" fill={themeColor(TH.accentHSL, 0.15, 20)} />
                  <circle cx="48" cy="38" r="3" fill={themeColor(TH.accentHSL, 0.15, 20)} />
                  {/* Tiny mouth — worried */}
                  <path d="M 35 52 Q 40 48 45 52" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.1, 15)} strokeWidth="0.5" />
                  {/* Single tear */}
                  {t > 0.5 && (
                    <motion.ellipse cx="50" cy="44" rx="1" ry="1.5"
                      fill={themeColor(TH.accentHSL, 0.15, 25)}
                      initial={{ opacity: 0 }} animate={{ opacity: 0.6, cy: 50 }}
                      transition={{ duration: 2, ease: 'easeOut' }} />
                  )}
                  {/* "scared child" label */}
                  {maskOff && (
                    <motion.text x="40" y="80" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic"
                      fill={themeColor(TH.accentHSL, 0.2, 15)}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}>
                      just a scared child
                    </motion.text>
                  )}
                </svg>
              </motion.div>

              {/* The scary mask — slides down with drag */}
              <motion.div
                animate={{ y: t * 180, opacity: 1 - t * 0.8 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="120" height="140" viewBox="0 0 120 140">
                  {/* Angular, threatening mask */}
                  <path d="M 30 30 L 20 70 L 35 110 L 60 120 L 85 110 L 100 70 L 90 30 L 60 15 Z"
                    fill={themeColor(TH.primaryHSL, 0.1, 3)}
                    stroke={themeColor(TH.primaryHSL, 0.15, 8)} strokeWidth="0.5" />
                  {/* Angry eyes */}
                  <path d="M 38 55 L 50 50 L 50 60 Z" fill={themeColor(TH.primaryHSL, 0.2, 5)} />
                  <path d="M 82 55 L 70 50 L 70 60 Z" fill={themeColor(TH.primaryHSL, 0.2, 5)} />
                  {/* Snarling mouth */}
                  <path d="M 40 85 L 50 80 L 60 88 L 70 80 L 80 85" fill="none"
                    stroke={themeColor(TH.primaryHSL, 0.18, 5)} strokeWidth="0.8" />
                  {/* Horns */}
                  <path d="M 35 30 L 25 10" stroke={themeColor(TH.primaryHSL, 0.12, 5)} strokeWidth="1" fill="none" />
                  <path d="M 85 30 L 95 10" stroke={themeColor(TH.primaryHSL, 0.12, 5)} strokeWidth="1" fill="none" />
                </svg>
              </motion.div>
            </div>

            {/* Progress */}
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.15 + t * 0.15, 10), letterSpacing: '0.1em' }}>
              {maskOff ? 'MASK REMOVED' : `${Math.round(t * 100)}% REVEALED`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              No one is a villain in their own story. Behind the mask is always a wound. Radical empathy dissolves the anger.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>perspective shifts the chemistry</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>See their movie.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}