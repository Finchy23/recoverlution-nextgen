/**
 * OPTICIAN #5 — The Focus Pull (Selective Attention)
 * "You choose the subject. Pull focus to the growth. Let the pain be the bokeh."
 * ARCHETYPE: Pattern A (Tap) — Tap background "Lesson" to shift focus
 * ENTRY: Scene-first — foreground "Pain" dominates, background "Lesson" blurred
 * STEALTH KBE: Selection bias — does user voluntarily tap "Lesson"? (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Probe');
type Stage = 'scene' | 'active' | 'focused' | 'resonant' | 'afterglow';

export default function Optician_FocusPull({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [focusTarget, setFocusTarget] = useState<'pain' | 'lesson'>('pain');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const kbe = useRef({ promptShown: 0 });

  useEffect(() => {
    t(() => { setStage('active'); kbe.current.promptShown = Date.now(); }, 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const selectFocus = (target: 'pain' | 'lesson') => {
    const reactionMs = Date.now() - kbe.current.promptShown;
    console.log(`[KBE:B] FocusPull target=${target} reactionMs=${reactionMs}`);
    setFocusTarget(target);
    setStage('focused');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const painBlur = focusTarget === 'lesson' ? 4 : 0;
  const lessonBlur = focusTarget === 'pain' ? 4 : 0;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontSize: 'clamp(24px, 5vw, 34px)' }}>
              My Pain
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', filter: 'blur(3px)' }}>
              My Lesson
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>
              You choose the subject. The camera is yours.
            </div>
            <motion.div
              animate={{ filter: `blur(${painBlur}px)` }}
              transition={{ duration: 0.6 }}
              onClick={() => selectFocus('pain')}
              whileTap={{ scale: 0.97 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center',
                fontSize: 'clamp(24px, 5vw, 34px)', cursor: 'pointer',
                padding: '12px 18px', borderRadius: radius.sm }}>
              My Pain
            </motion.div>
            <motion.div
              animate={{ filter: `blur(${lessonBlur}px)` }}
              transition={{ duration: 0.6 }}
              onClick={() => selectFocus('lesson')}
              whileTap={{ scale: 0.97 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center',
                cursor: 'pointer', padding: '12px 18px', borderRadius: radius.sm,
                filter: 'blur(3px)' }}>
              My Lesson
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.5 }}>tap to pull focus</div>
          </motion.div>
        )}
        {stage === 'focused' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <motion.div animate={{ filter: `blur(${focusTarget === 'lesson' ? 6 : 0}px)`, opacity: focusTarget === 'lesson' ? 0.3 : 1 }}
              transition={{ duration: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontSize: 'clamp(24px, 5vw, 34px)' }}>
              My Pain
            </motion.div>
            <motion.div animate={{ filter: `blur(${focusTarget === 'pain' ? 4 : 0}px)`, opacity: focusTarget === 'pain' ? 0.3 : 1 }}
              transition={{ duration: 1 }}
              style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.5, 15), textAlign: 'center', fontSize: 'clamp(24px, 5vw, 34px)' }}>
              My Lesson
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>
              {focusTarget === 'lesson' ? 'the pain becomes bokeh' : 'the pain stays sharp'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Selective attention. The reticular activating system amplifies what you focus on. Choosing the lesson over the pain is not denial {'\u2014'} it is directorial control of your own perception.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Focus pulled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}