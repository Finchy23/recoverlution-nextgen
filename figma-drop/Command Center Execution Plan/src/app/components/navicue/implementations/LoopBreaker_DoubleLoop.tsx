/**
 * LOOP BREAKER #6 — The Double Loop
 * "Single loop learning fixes the leak. Double loop asks why the pipes are old."
 * ARCHETYPE: Pattern B (Drag) — Drag to engage the big gear (belief level)
 * ENTRY: Scene First — gears already turning, text emerges between them
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function LoopBreaker_DoubleLoop({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [rotation, setRotation] = useState(0);
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
    const animate = () => { setRotation(r => r + 0.5); animRef.current = requestAnimationFrame(animate); };
    animRef.current = requestAnimationFrame(animate);
    return () => { T.current.forEach(clearTimeout); cancelAnimationFrame(animRef.current); };
  }, []);

  const progress = drag.progress;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="200" height="120" viewBox="0 0 200 120">
              {/* Small gear (action) */}
              <motion.circle cx="70" cy="60" r="18" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.1, 8)} strokeWidth="1"
                style={{ transformOrigin: '70px 60px', rotate: rotation }} />
              {[0, 1, 2, 3, 4, 5].map(i => (
                <motion.line key={i}
                  x1={70 + 15 * Math.cos((i / 6) * Math.PI * 2 + rotation * Math.PI / 180)}
                  y1={60 + 15 * Math.sin((i / 6) * Math.PI * 2 + rotation * Math.PI / 180)}
                  x2={70 + 22 * Math.cos((i / 6) * Math.PI * 2 + rotation * Math.PI / 180)}
                  y2={60 + 22 * Math.sin((i / 6) * Math.PI * 2 + rotation * Math.PI / 180)}
                  stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="2" />
              ))}
              {/* Big gear (belief) */}
              <motion.circle cx="140" cy="60" r="35" fill="none"
                stroke={themeColor(TH.accentHSL, 0.06, 5)} strokeWidth="1"
                style={{ transformOrigin: '140px 60px', rotate: -rotation * 0.5 }} />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>two gears, one question</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              You changed the action, but not the belief. The small gear spins, but the big gear slips back. Single loop learning fixes the leak. Double loop learning asks why the pipes are old. Engage the big gear.
            </div>
            <svg width="200" height="100" viewBox="0 0 200 100">
              <circle cx="60" cy="50" r="16" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="1" />
              <text x="60" y="54" fontSize="11" fontFamily="monospace" textAnchor="middle"
                fill={palette.textFaint} opacity={0.4}>action</text>
              <motion.circle cx="145" cy="50" r={25 + progress * 10} fill="none"
                stroke={themeColor(TH.accentHSL, 0.08 + progress * 0.15, 8)} strokeWidth={1 + progress * 1} />
              <text x="145" y="54" fontSize="11" fontFamily="monospace" textAnchor="middle"
                fill={palette.textFaint} opacity={0.3 + progress * 0.3}>belief</text>
            </svg>
            <div {...drag.dragProps} style={{ ...drag.dragProps.style, width: '200px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3) }}>
              <motion.div
                style={{
                  position: 'absolute', top: '3px', left: `${5 + progress * 155}px`,
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + progress * 0.15, 8),
                  pointerEvents: 'none',
                }} />
            </div>
            {progress < 0.9 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.35 }}>drag to engage</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Both gears engaged. You went beneath the strategy to the governing variable, the assumption, the identity, the story underneath the story. Change that, and every small gear above it recalibrates automatically. This is double-loop learning.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Deeper.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}