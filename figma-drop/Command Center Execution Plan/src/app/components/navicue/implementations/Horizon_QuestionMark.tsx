/**
 * INFINITE PLAYER II #9 — The Question Mark
 * "Certainty is a stop. Wonder is a go."
 * Pattern A (Tap) — Period becomes question mark; choosing wonder over certainty
 * STEALTH KBE: Choosing the Question Mark = Epistemic Humility / Wisdom (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'period' | 'question' | 'resonant' | 'afterglow';

export default function Horizon_QuestionMark({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('period'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const transform = () => {
    if (stage !== 'period') return;
    console.log(`[KBE:E] QuestionMark transformed=true epistemicHumility=true wonderOverCertainty=true`);
    setStage('question');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.08, 4) }} />
          </motion.div>
        )}
        {stage === 'period' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: '48px', color: themeColor(TH.primaryHSL, 0.15, 8), fontWeight: 'bold' }}>
              .
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A period. Certainty. Finality. Tap it to transform.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={transform}
              style={{ padding: '14px 22px', borderRadius: '18px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Transform</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'question' && (
          <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <motion.div initial={{ rotate: 0 }} animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.5, delay: 0.5 }}
              style={{ fontSize: '48px', color: themeColor(TH.accentHSL, 0.35, 12) }}>
              ?
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The period curled into a question mark. Certainty is a stop. Wonder is a go. The only true wisdom is in knowing you know nothing. Turn the period into a question. Keep the conversation alive.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Intellectual Humility (Leary et al.): recognizing that one{"'"}s beliefs may be wrong. People high in intellectual humility learn faster, build better relationships, and are more open to diverse perspectives. Socrates: "I know that I know nothing." The question mark is the wisest punctuation.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Wondering.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}