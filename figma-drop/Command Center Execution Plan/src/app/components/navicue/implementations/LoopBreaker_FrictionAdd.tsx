/**
 * LOOP BREAKER #8 — The Friction Add
 * "If you want to stop the loop, put rocks on the track."
 * ARCHETYPE: Pattern B (Drag) — Drag rocks onto the smooth path
 * ENTRY: Instruction as Poetry — mud thickening, no explanation
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'active' | 'resonant' | 'afterglow';

export default function LoopBreaker_FrictionAdd({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
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
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const progress = drag.progress;
  const rocks = Math.floor(progress * 5);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="220" height="60" viewBox="0 0 220 60">
              <motion.path d="M10,40 Q55,40 110,40 T210,40"
                fill="none" stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="2"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: [0, -20] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                strokeDasharray="8 4" />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.6 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              too smooth
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Make the bad habit hard to do. Put rocks on the track. Add twenty seconds of effort. The brain is lazy. It will stop.
            </div>
            <svg width="220" height="80" viewBox="0 0 220 80">
              <line x1="10" y1="55" x2="210" y2="55"
                stroke={themeColor(TH.primaryHSL, 0.06, 5)} strokeWidth="2" />
              {Array.from({ length: rocks }).map((_, i) => (
                <motion.circle key={i}
                  cx={40 + i * 38} cy="48" r={5 + i % 2 * 2}
                  fill={themeColor(TH.accentHSL, 0.12 + i * 0.03, 8)}
                  initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }} />
              ))}
              {/* Path getting muddier */}
              <motion.rect x="10" y="55" width="200" height={2 + progress * 8} rx="1"
                fill={themeColor(TH.primaryHSL, 0.03 + progress * 0.05, 3)} />
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
            {progress < 0.9 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.35 }}>add friction</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Friction added. The smooth path is now rough. Increasing the interaction cost by even a few seconds dramatically reduces frequency, because the brain optimizes for ease. You don{'\u2019'}t need willpower. You need speed bumps.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rough road.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}