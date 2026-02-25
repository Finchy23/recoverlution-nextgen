/**
 * LOOP BREAKER #2 — The Trigger Map
 * "The bomb didn't go off when it exploded. The fuse was lit 10 minutes ago."
 * ARCHETYPE: Pattern B (Drag) — Drag the rewind slider back through time
 * ENTRY: Reverse Reveal — "The explosion happened" → then rewind
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

const TIMELINE = [
  { time: '5:00', event: 'the explosion' },
  { time: '4:55', event: 'the sarcasm' },
  { time: '4:50', event: 'the hunger' },
  { time: '4:40', event: 'the bad sleep' },
];

export default function LoopBreaker_TriggerMap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
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

  const progress = drag.progress;
  const visibleEvents = Math.floor(progress * TIMELINE.length);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
              style={{ ...navicueType.prompt, color: palette.text, fontSize: '16px' }}>
              The explosion happened at 5:00.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>
              but when was the fuse lit?
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Rewind. The bomb didn{'\u2019'}t go off when it exploded. The fuse was lit ten minutes ago. Find the match. Drag backward through the timeline.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '220px' }}>
              {TIMELINE.map((ev, i) => (
                <motion.div key={i} style={{
                  display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 18px', borderRadius: radius.sm,
                  background: i < visibleEvents ? themeColor(TH.accentHSL, 0.06, 5) : 'transparent',
                  opacity: i < visibleEvents ? 1 : 0.2,
                }}>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, width: '32px' }}>{ev.time}</div>
                  <div style={{ fontSize: '12px', color: palette.text }}>{ev.event}</div>
                </motion.div>
              ))}
            </div>
            <div {...drag.dragProps} style={{ ...drag.dragProps.style, width: '220px', height: '40px', position: 'relative', borderRadius: radius.xl,
              background: themeColor(TH.primaryHSL, 0.04, 3) }}>
              <motion.div
                style={{
                  position: 'absolute', top: '5px',
                  left: `${180 - progress * 160}px`,
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.12 + progress * 0.15, 8),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}`,
                  pointerEvents: 'none',
                }} />
              <div style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>
                \u25C0 rewind
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              There it is. The match. It wasn{'\u2019'}t the argument, it was the hunger, the bad sleep, the slow accumulation of small friction. The explosion was inevitable once the fuse was lit. Next time, find the match before it strikes.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Traced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}