/**
 * ETHICIST #6 — The Whisper (Conscience)
 * "The conscience does not shout. It whispers."
 * ARCHETYPE: Pattern B (Drag) — Slider to quiet UI noise and hear whisper
 * ENTRY: Scene-first — loud room
 * STEALTH KBE: Finding silence = Introspective Attunement / Inner Listening (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'loud' | 'quiet' | 'resonant' | 'afterglow';

export default function Ethicist_Whisper({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] Whisper introspectiveAttunement=confirmed innerListening=true`);
      setStage('quiet');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('loud'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const noise = 1 - drag.progress;
  const whisperOpacity = drag.progress * 0.3;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <span style={{ fontSize: '14px', color: palette.textFaint }}>◎</span>
          </motion.div>
        )}
        {stage === 'loud' && (
          <motion.div key="lo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A loud room. A tiny whisper is barely audible. Turn down the volume.
            </div>
            {/* Noise bars */}
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <motion.div key={i}
                  animate={{ scaleY: noise > 0.3 ? [0.6, 1.3, 0.6] : 0.3, opacity: noise * 0.3 }}
                  transition={{ duration: 0.3 + i * 0.05, repeat: noise > 0.3 ? Infinity : 0 }}
                  style={{ width: '4px', height: `${8 + noise * 12}px`, borderRadius: '2px',
                    background: themeColor(TH.primaryHSL, noise * 0.08, 3) }} />
              ))}
            </div>
            {/* Whisper text */}
            <motion.div animate={{ opacity: whisperOpacity }}
              style={{ padding: '6px 12px', borderRadius: '6px',
                background: themeColor(TH.accentHSL, whisperOpacity * 0.15, 3),
                border: `1px solid ${themeColor(TH.accentHSL, whisperOpacity * 0.2, 5)}` }}>
              <span style={{ fontSize: '11px', fontStyle: 'italic',
                color: themeColor(TH.accentHSL, whisperOpacity + 0.05, 8) }}>
                {drag.progress > 0.5 ? '...follow your conscience...' : '...'}
              </span>
            </motion.div>
            {/* Volume slider */}
            <div ref={drag.containerRef} style={{ width: '12px', height: '70px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', left: '-6px', top: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Quiet the noise ↓</div>
          </motion.div>
        )}
        {stage === 'quiet' && (
          <motion.div key="qu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Hush. The room is silent. The whisper is clear: "Follow your conscience." It was always speaking. You just couldn{"'"}t hear it over the noise. The conscience does not shout. It whispers. If the world is too loud, you will miss the guidance.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Introspective attunement. The "still, small voice" of conscience operates via the insula cortex — which monitors internal body states and generates gut feelings. In noisy environments (literal or metaphorical), interoceptive signals are drowned out. Contemplative practices that reduce external stimulation amplify the signal-to-noise ratio of conscience. Hush the room to hear the whisper.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Hushed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}