/**
 * CATALYST #9 — The Question Hook
 * "Statements are walls. Questions are hooks. Pull gently."
 * ARCHETYPE: Pattern A (Tap) — Bend a statement into a question mark
 * ENTRY: Cold open — judgment statement
 * STEALTH KBE: Converting judgment → inquiry = Epistemic Curiosity (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CATALYST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Theater');
type Stage = 'arriving' | 'active' | 'hooked' | 'resonant' | 'afterglow';

export default function Catalyst_QuestionHook({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const bend = () => {
    if (stage !== 'active') return;
    console.log(`[KBE:E] QuestionHook converted=true epistemicCuriosity=confirmed`);
    setStage('hooked');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: 'hsla(0, 25%, 40%, 0.4)', textAlign: 'center', fontWeight: '600' }}>
            "You are wrong."
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Bend the statement. Hook their curiosity.
            </div>
            <div style={{ padding: '12px 18px', borderRadius: radius.sm,
              background: 'hsla(0, 15%, 25%, 0.04)', border: '1px solid hsla(0, 15%, 30%, 0.1)' }}>
              <span style={{ ...navicueType.texture, color: 'hsla(0, 25%, 40%, 0.5)', fontWeight: '600' }}>
                "You are wrong."
              </span>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={bend}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Bend → ?</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'hooked' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              style={{ padding: '12px 18px', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.04, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
              <span style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 12) }}>
                "What led you to that?"
              </span>
            </motion.div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
              <motion.div initial={{ x: 0 }} animate={{ x: -8 }} transition={{ delay: 1, duration: 0.8 }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>leans in...</span>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The wall became a hook. They lean in with curiosity, not defense.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Epistemic curiosity. Statements are walls; questions are hooks. Converting a judgment into an inquiry disarms defense and activates curiosity. Don{"'"}t push — hook their interest and pull gently.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Hooked.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}