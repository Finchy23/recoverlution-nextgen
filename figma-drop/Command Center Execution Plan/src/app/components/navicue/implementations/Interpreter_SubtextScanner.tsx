/**
 * INTERPRETER #1 — The Subtext Scanner (Emotional Intelligence)
 * "Surface language is defense. Heat is truth. Read the temperature."
 * ARCHETYPE: Pattern B (Drag) — Drag scanner over "I'm fine" to reveal subtext
 * ENTRY: Cold open — text bubble appears immediately
 * STEALTH KBE: Acceptance of hidden interpretation = Emotional Intelligence (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'bubble' | 'active' | 'scanned' | 'resonant' | 'afterglow';

export default function Interpreter_SubtextScanner({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('bubble');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      console.log(`[KBE:K] SubtextScanner scanComplete=true`);
      setStage('scanned');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const scanProgress = drag.progress;
  const surfaceOpacity = 1 - scanProgress;
  const subtextOpacity = scanProgress;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'bubble' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '16px 28px', borderRadius: radius.xl,
              background: themeColor(TH.primaryHSL, 0.08, 6),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.prompt, color: palette.text }}>I{'\u2019'}m fine.</div>
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              Surface language is defense. Heat is truth. Don{'\u2019'}t listen to the word. Read the temperature.
            </div>
            {/* Text bubble with scan overlay */}
            <div style={{ position: 'relative', padding: '20px 32px', borderRadius: radius.xl,
              background: themeColor(TH.primaryHSL, 0.06, 4),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 6)}`, overflow: 'hidden' }}>
              <motion.div animate={{ opacity: surfaceOpacity }}
                style={{ ...navicueType.prompt, color: palette.text }}>
                I{'\u2019'}m fine.
              </motion.div>
              <motion.div animate={{ opacity: subtextOpacity }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '20px 32px' }}>
                <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.5, 12) }}>
                  I am lonely.
                </div>
              </motion.div>
              {/* Heat map gradient */}
              <motion.div animate={{ opacity: scanProgress * 0.15 }}
                style={{ position: 'absolute', inset: 0, borderRadius: radius.xl,
                  background: `radial-gradient(circle at ${30 + scanProgress * 40}% 50%, ${themeColor(TH.accentHSL, 0.2, 5)}, transparent 70%)` }} />
            </div>
            {/* Scanner drag area */}
            <div {...drag.dragProps}
              style={{ width: '200px', height: '28px', borderRadius: radius.full, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.05, 3), touchAction: 'none', cursor: 'grab' }}>
              <motion.div animate={{ width: `${scanProgress * 100}%` }}
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: radius.full,
                  background: themeColor(TH.accentHSL, 0.1, 6) }} />
              <motion.div animate={{ left: `${scanProgress * 100}%` }}
                style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.25, 8) }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to scan the subtext</div>
          </motion.div>
        )}
        {stage === 'scanned' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '20px 32px', borderRadius: radius.xl,
              background: themeColor(TH.accentHSL, 0.06, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.5, 12) }}>
                I am lonely.
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the real message</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Emotional intelligence is subtext literacy. What people say and what they mean are different data streams. Scanning for the hidden signal is the first act of empathy.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Scanned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}