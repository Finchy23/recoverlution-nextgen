/**
 * INTERPRETER #5 — The Translation Ear (Reframing)
 * "They are shouting 'You are lazy.' They mean 'I am afraid we will fail.'"
 * ARCHETYPE: Pattern B (Drag) — Turn dial to morph criticism into concern
 * ENTRY: Instruction-as-poetry — voice line guides the translation
 * STEALTH KBE: Saving the translated version = accepting benign intent (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'active' | 'translated' | 'resonant' | 'afterglow';

export default function Interpreter_TranslationEar({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      console.log(`[KBE:B] TranslationEar translationAccepted=true`);
      setStage('translated');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const progress = drag.progress;
  const criticismOpacity = 1 - progress;
  const concernOpacity = progress;

  // Waveform bars that morph
  const barCount = 12;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              They are shouting. But what are they really saying?
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Translate the fear. Turn the dial.
            </div>
            {/* Waveform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '60px' }}>
              {Array.from({ length: barCount }).map((_, i) => {
                const baseHeight = 10 + Math.sin(i * 0.8) * 15 + Math.random() * 5;
                const morphedHeight = baseHeight * (1 - progress * 0.4);
                return (
                  <motion.div key={i}
                    animate={{ height: morphedHeight,
                      background: progress < 0.5
                        ? themeColor(TH.primaryHSL, 0.2 + (1 - progress) * 0.1, 4)
                        : themeColor(TH.accentHSL, 0.15 + progress * 0.1, 6) }}
                    style={{ width: '6px', borderRadius: '3px' }} />
                );
              })}
            </div>
            {/* Text morphing */}
            <div style={{ position: 'relative', minHeight: '44px', width: '100%', textAlign: 'center' }}>
              <motion.div animate={{ opacity: criticismOpacity }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...navicueType.texture, color: themeColor(TH.primaryHSL, 0.4, 10) }}>
                "You are lazy."
              </motion.div>
              <motion.div animate={{ opacity: concernOpacity }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...navicueType.texture, color: themeColor(TH.accentHSL, 0.4, 10) }}>
                "I am afraid we will fail."
              </motion.div>
            </div>
            {/* Dial */}
            <div {...drag.dragProps}
              style={{ width: '180px', height: '30px', borderRadius: radius.full, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.05, 3), touchAction: 'none', cursor: 'grab' }}>
              <motion.div animate={{ width: `${progress * 100}%` }}
                style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: radius.full,
                  background: `linear-gradient(90deg, ${themeColor(TH.primaryHSL, 0.08, 4)}, ${themeColor(TH.accentHSL, 0.12, 8)})` }} />
              <motion.div animate={{ left: `${progress * 100}%` }}
                style={{ position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.25, 8),
                  border: `2px solid ${themeColor(TH.accentHSL, 0.15, 12)}` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '180px' }}>
              <div style={{ ...navicueType.hint, fontSize: '11px', color: themeColor(TH.primaryHSL, 0.2, 8) }}>criticism</div>
              <div style={{ ...navicueType.hint, fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8) }}>concern</div>
            </div>
          </motion.div>
        )}
        {stage === 'translated' && (
          <motion.div key="tr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.45, 12), textAlign: 'center', maxWidth: '280px' }}>
              "I am afraid we will fail."
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the real message, translated</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Reframing. Behind every criticism is an unmet need. Translating the surface attack into the underlying fear is the core skill of Non-Violent Communication. The intent was never malice {'\u2014'} it was fear.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Translated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}