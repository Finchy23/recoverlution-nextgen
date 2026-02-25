/**
 * OPTICIAN #1 — The Prescription Check (The Blur)
 * "Certainty is often just a dirty lens. Doubt clears the vision."
 * ARCHETYPE: Pattern A (Tap) — Two-button choice with stealth reaction-time KBE
 * ENTRY: Cold open — blurry text appears immediately
 * STEALTH KBE: Reaction time. Hesitation + "Maybe" = Cognitive Flexibility (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Probe');
type Stage = 'blur' | 'active' | 'result' | 'resonant' | 'afterglow';

export default function Optician_PrescriptionCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('blur');
  const [clarity, setClarity] = useState(0); // 0 = blurry, 1 = sharp
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const kbe = useRef({ promptShown: 0 });

  useEffect(() => {
    t(() => { setStage('active'); kbe.current.promptShown = Date.now(); }, 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const choose = (choice: 'yes' | 'maybe') => {
    const reactionMs = Date.now() - kbe.current.promptShown;
    // Stealth KBE: log reaction time + choice silently
    console.log(`[KBE:K] PrescriptionCheck reactionMs=${reactionMs} choice=${choice}`);
    if (choice === 'maybe') {
      setClarity(1);
    }
    setStage('result');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const blurAmount = clarity === 0 ? 4 : 0;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'blur' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center',
              filter: 'blur(4px)', maxWidth: '280px' }}>
              You already know what you need to do.
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <motion.div
              animate={{ filter: `blur(${blurAmount}px)` }}
              transition={{ duration: 0.6 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You already know what you need to do.
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>
              Is this true?
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => choose('yes')}
                style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.12, 10)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.4, 15) }}>Yes</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => choose('maybe')}
                style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 10)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Maybe</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'result' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <motion.div
              animate={{ filter: `blur(${clarity === 1 ? 0 : 4}px)` }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You already know what you need to do.
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              {clarity === 1
                ? 'Doubt cleared the lens. The text sharpens.'
                : 'Certainty kept the blur. The text remains unreadable.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Certainty is often just a dirty lens. Doubt clears the vision. Admit you might be wrong to see it sharp. Cognitive flexibility begins with "maybe."
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>20/maybe.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}