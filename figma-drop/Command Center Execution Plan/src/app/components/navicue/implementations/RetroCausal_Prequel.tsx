/**
 * RETRO-CAUSAL #3 — The Prequel
 * "They were not reacting to you. See the prequel."
 * ARCHETYPE: Pattern B (Drag) — Drag the camera left to see the context before
 * ENTRY: Reverse Reveal — "It wasn't about you" → then pan to prequel
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function RetroCausal_Prequel({ onComplete }: { data?: any; onComplete?: () => void }) {
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

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, fontSize: '16px', fontFamily: 'serif' }}>
              It wasn{'\u2019'}t about you.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>
              pan left to see the prequel
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              What happened before they yelled at you? Pan the camera left. They were not reacting to you. They were reacting to their bad morning, their fear, their childhood. See the prequel. The scene changes everything.
            </div>
            <div style={{ width: '240px', height: '80px', borderRadius: radius.sm, overflow: 'hidden', position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3) }}>
              {/* Sliding viewport */}
              <motion.div style={{
                position: 'absolute', top: 0, left: `${-progress * 240}px`,
                width: '480px', height: '80px', display: 'flex',
              }}>
                {/* Prequel frame */}
                <div style={{ width: '240px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: themeColor(TH.accentHSL, 0.04, 5) }}>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint,
                    opacity: 0.3 + progress * 0.4, textAlign: 'center', padding: '8px' }}>
                    their bad morning {'\u00B7'} the email {'\u00B7'} the fear
                  </div>
                </div>
                {/* Original frame */}
                <div style={{ width: '240px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.4 }}>
                    the explosion
                  </div>
                </div>
              </motion.div>
            </div>
            <div {...drag.dragProps} style={{ ...drag.dragProps.style, width: '200px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3) }}>
              <motion.div
                style={{
                  position: 'absolute', top: '3px', left: `${160 - progress * 150}px`,
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + progress * 0.15, 8),
                  pointerEvents: 'none',
                }} />
              <div style={{ position: 'absolute', left: '12px', top: '12px', fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>
                \u25C0 before
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The prequel revealed. The attribution shifted from internal and stable to external and unstable. It was their bad morning, not your character. This is attributional retraining: changing the perceived cause changes the shame, the helplessness, the story.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Wider frame.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}