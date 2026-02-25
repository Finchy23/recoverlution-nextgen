/**
 * THRESHOLD #6 — The Tidal Zone
 * "Neither land nor sea. You belong to both."
 * ARCHETYPE: Pattern B (Drag) — Drag between land and sea
 * ENTRY: Ambient Fade — a gradient shore slowly appears
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Threshold_TidalZone({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const p = drag.progress;
  const landHue = 35;
  const seaHue = 210;
  const blendHue = landHue + p * (seaHue - landHue);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 4, repeat: Infinity }}
              style={{ width: '220px', height: '60px', borderRadius: radius.sm,
                background: 'linear-gradient(to right, hsla(35, 15%, 18%, 0.08), hsla(210, 12%, 18%, 0.06))' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.6 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>shoreline</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Neither land nor sea. You belong to both. Drag yourself between the shore and the deep. Find where you stop being one thing and start being another.
            </div>
            <div style={{
              width: '240px', height: '60px', borderRadius: radius.sm, position: 'relative',
              background: `linear-gradient(to right, hsla(${landHue}, 15%, 18%, 0.1), hsla(${blendHue}, 12%, 16%, 0.08), hsla(${seaHue}, 15%, 18%, 0.1))`,
              transition: 'background 0.3s',
            }}>
              <div style={{
                position: 'absolute', left: `${p * 100}%`, top: 0, width: '2px', height: '100%',
                background: themeColor(TH.accentHSL, 0.1 + p * 0.08, 6), transition: 'left 0.2s',
              }} />
            </div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '200px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3),
            }}>
              <motion.div style={{
                position: 'absolute', left: `${10 + p * 150}px`, top: '4px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: `hsla(${blendHue}, 14%, 28%, ${0.1 + p * 0.08})`,
                pointerEvents: 'none',
              }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The intertidal zone. Ecologists call it the richest ecosystem on Earth {':'} more species per square meter than either the ocean or the shore. Identity works the same way. The richest version of you lives in the overlap.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Overlap.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}