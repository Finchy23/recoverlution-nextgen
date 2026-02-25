/**
 * TIME CAPSULE #2 — The Drift Bottle
 * "Surprise yourself. Send a truth to the stranger you will become."
 * ARCHETYPE: Pattern B (Drag) — Drag the bottle into the ocean
 * ENTRY: Scene First — ocean waves already moving, text emerges
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function TimeCapsule_DriftBottle({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [wavePhase, setWavePhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const animRef = useRef<number>(0);

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    const animate = () => { setWavePhase(p => p + 0.02); animRef.current = requestAnimationFrame(animate); };
    animRef.current = requestAnimationFrame(animate);
    return () => { T.current.forEach(clearTimeout); cancelAnimationFrame(animRef.current); };
  }, []);

  const progress = drag.progress;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <svg width="260" height="120" viewBox="0 0 260 120">
              {[0, 1, 2].map(i => (
                <motion.path key={i}
                  d={`M0,${60 + i * 20} Q65,${45 + i * 20 + Math.sin(wavePhase + i) * 8} 130,${60 + i * 20} T260,${60 + i * 20}`}
                  fill="none" stroke={themeColor(TH.accentHSL, 0.06 - i * 0.015, 8)} strokeWidth="1" />
              ))}
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the ocean is listening</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Write a joke, a hope, or a truth. Throw it into the sea. It will wash up on your shore at a random interval: one month, one year. Surprise yourself.
            </div>
            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, width: '240px', height: '80px', position: 'relative', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 5), overflow: 'hidden' }}>
              <svg width="240" height="80" viewBox="0 0 240 80" style={{ position: 'absolute', top: 0, left: 0 }}>
                {[0, 1].map(i => (
                  <path key={i}
                    d={`M0,${40 + i * 15} Q60,${30 + i * 15 + Math.sin(wavePhase + i) * 6} 120,${40 + i * 15} T240,${40 + i * 15}`}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.06, 8)} strokeWidth="0.5" />
                ))}
              </svg>
              <motion.div
                style={{
                  position: 'absolute', top: '20px', left: `${10 + progress * 180}px`,
                  width: '32px', height: '40px', borderRadius: `${radius.xs} ${radius.xs} ${radius.md} ${radius.md}`,
                  background: themeColor(TH.accentHSL, 0.12 + progress * 0.2, 8),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}`,
                  opacity: 1 - progress * 0.3, pointerEvents: 'none',
                }} />
            </div>
            {progress < 0.9 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>drag to release</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Gone. Drifting now toward a version of you that doesn{'\u2019'}t exist yet. When it arrives, it will feel like mail from a ghost: a ghost who was once you, on a Tuesday, feeling exactly this.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Adrift.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}