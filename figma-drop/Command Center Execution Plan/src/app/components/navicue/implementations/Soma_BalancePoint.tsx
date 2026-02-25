/**
 * SOMA #8 — The Balance Point
 * "Find your center. It's not where you think."
 * ARCHETYPE: Pattern B (Drag) — Drag to find your center of gravity
 * ENTRY: Scene-first — a dot drifts, user discovers they can stabilize it
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Soma_BalancePoint({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'both',
    sticky: true,
    snapPoints: [0.5],
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const p = drag.progress;
  const centerDist = Math.abs(p - 0.5) * 2;
  const stability = 1 - centerDist;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '12px', height: '12px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1, 6) }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>drifting</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Find your center. It{'\u2019'}s not where you think. Drag until everything settles. You{'\u2019'}ll feel it.
            </div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '180px', height: '180px', borderRadius: '50%', position: 'relative',
              background: `radial-gradient(circle, ${themeColor(TH.accentHSL, stability * 0.08, 5)}, ${themeColor(TH.voidHSL, 0.03, 0)})`,
              border: `1px solid ${themeColor(TH.accentHSL, 0.04 + stability * 0.06, 4)}`,
            }}>
              <motion.div
                animate={{ scale: stability > 0.85 ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  left: `${50 + (p - 0.5) * 60}%`, top: `${50 - (p - 0.5) * 60}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${14 + stability * 10}px`, height: `${14 + stability * 10}px`, borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + stability * 0.1, 6),
                  transition: 'left 0.2s, top 0.2s',
                  pointerEvents: 'none',
                }} />
              {/* Center target */}
              <div style={{
                position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.06, 4),
              }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {stability > 0.85 ? 'centered' : stability > 0.5 ? 'closer\u2026' : 'find it'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Proprioceptive centering. Your center of gravity sits 2cm below your navel: not in your head where you think from. Martial artists, dancers, and meditators all train to drop awareness here. You just relocated your sense of self.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Centered.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}