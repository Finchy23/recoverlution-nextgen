/**
 * GRAVITON #2 — Escape Velocity
 * "Thrust is 90%. Burn."
 * ARCHETYPE: Pattern B (Drag up) — Drag upward to break orbit
 * ENTRY: Scene First — planet and rocket already visible, text fades in
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'scene' | 'resonant' | 'afterglow';

export default function Graviton_EscapeVelocity({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [textIn, setTextIn] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const drag = useDragInteraction({
    axis: 'y', sticky: true,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setTextIn(true), 1200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const d = drag.progress;
  const rocketY = 130 - d * 90;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, width: '180px', height: '180px', borderRadius: radius.sm, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0) }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180">
                {/* Planet at bottom */}
                <circle cx="90" cy="200" r="70" fill={themeColor(TH.primaryHSL, 0.15, 5)}
                  stroke={themeColor(TH.primaryHSL, 0.08, 12)} strokeWidth="0.5" />
                {/* Gravity field lines */}
                {Array.from({ length: 4 }, (_, i) => (
                  <circle key={i} cx="90" cy="200" r={80 + i * 15} fill="none"
                    stroke={themeColor(TH.primaryHSL, 0.03, 5)} strokeWidth="0.3" strokeDasharray="2 3" />
                ))}
                {/* Rocket */}
                <motion.g initial={{ y: 0 }} animate={{ y: -d * 90 }} transition={{ type: 'spring', stiffness: 40 }}>
                  <polygon points="90,120 84,135 96,135" fill={themeColor(TH.accentHSL, 0.3 + d * 0.3, 15)} />
                  {/* Thrust flame */}
                  {d > 0 && (
                    <motion.line x1="90" y1="135" x2="90" y2={135 + d * 20}
                      stroke={`hsla(30, 50%, ${40 + d * 20}%, ${d * 0.3})`} strokeWidth={2 + d * 2}
                      initial={{ y2: 135 + d * 18 }}
                      animate={{ y2: [135 + d * 18, 135 + d * 22] }}
                      transition={{ duration: 0.15, repeat: Infinity, repeatType: 'reverse' }} />
                  )}
                </motion.g>
                {/* Escape velocity marker */}
                {d > 0.7 && (
                  <motion.text x="90" y="25" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.15, 15)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    letterSpacing="0.1em">
                    ESCAPE VELOCITY
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div animate={{ opacity: textIn ? 1 : 0 }} transition={{ duration: 1.2 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Leaving a toxic orbit requires massive energy. You cannot drift away. You must burn the engines. It is hard because gravity wants you back. Push.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Activation energy. The initial energy to break free is significantly higher than staying. Homeostatic resistance pulls you back. But you burned through it. You are in open space now.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Free of orbit.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}