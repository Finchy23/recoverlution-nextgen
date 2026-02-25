/**
 * THRESHOLD #7 — The Question Mark
 * "Ask something you refuse to answer. Yet."
 * ARCHETYPE: Pattern D (Type) — Type a question you won't resolve
 * ENTRY: Cold Open — a blinking cursor appears with no explanation
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { THRESHOLD_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Threshold_QuestionMark({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const [showPrompt, setShowPrompt] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typer = useTypeInteraction({
    minLength: 5,
    onAccept: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setShowPrompt(true), 1500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '320px' }}>
            {showPrompt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 1 }}
                style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
                Ask something you refuse to answer. Yet. Type the question. Do not type the answer.
              </motion.div>
            )}
            <div style={{
              width: '100%', position: 'relative',
              borderBottom: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
              padding: '8px 0',
            }}>
              <input
                type="text"
                value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                placeholder="?"
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  ...navicueType.texture, color: palette.text, textAlign: 'center',
                }}
              />
              {!typer.value && (
                <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1, repeat: Infinity }}
                  style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '1px', height: '20px', background: themeColor(TH.accentHSL, 0.2, 8),
                    pointerEvents: 'none',
                  }} />
              )}
            </div>
            {typer.value.length >= 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.96 }}
                onClick={typer.submit}
                style={{
                  padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.05, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
                }}>
                <div style={{ ...navicueType.hint, color: palette.textFaint }}>leave it unanswered</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Negative capability. Keats called it the ability to remain in uncertainty without reaching for fact or reason. The unanswered question is not incomplete {';'} it is a living thing. It does its best work while you carry it.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Unresolved.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}