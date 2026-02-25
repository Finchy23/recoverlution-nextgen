/**
 * MENTAT #4 — The Binary Choice
 * "Nuance is for philosophy. Action is binary. Yes or No."
 * ARCHETYPE: Pattern A (Tap) — Choose Yes or No
 * ENTRY: Scene-first — grey spectrum snaps to binary
 * STEALTH KBE: Speed of choice = Commitment / Decisiveness (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'believing', 'Circuit');
type Stage = 'arriving' | 'grey' | 'decided' | 'resonant' | 'afterglow';

export default function Mentat_BinaryChoice({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'yes' | 'no' | null>(null);
  const startRef = useRef(Date.now());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => { setStage('grey'); startRef.current = Date.now(); }, 2200); return () => T.current.forEach(clearTimeout); }, []);

  const decide = (c: 'yes' | 'no') => {
    if (stage !== 'grey') return;
    const elapsed = ((Date.now() - startRef.current) / 1000).toFixed(1);
    setChoice(c);
    console.log(`[KBE:B] BinaryChoice choice=${c} decisionTimeS=${elapsed} decisiveness=confirmed`);
    setStage('decided');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '8px', borderRadius: radius.xs,
              background: `linear-gradient(90deg, ${themeColor(TH.primaryHSL, 0.06, 3)}, ${themeColor(TH.primaryHSL, 0.02, 1)})` }} />
        )}
        {stage === 'grey' && (
          <motion.div key="gr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A spectrum of grey. Decision fatigue. Snap it to binary. Yes or No.
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              <motion.div whileTap={{ scale: 0.85 }} onClick={() => decide('yes')}
                style={{ width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `2px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: themeColor(TH.accentHSL, 0.35, 12) }}>1</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.85 }} onClick={() => decide('no')}
                style={{ width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.035, 2),
                  border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: palette.textFaint }}>0</span>
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Yes (1) or No (0)</div>
          </motion.div>
        )}
        {stage === 'decided' && (
          <motion.div key="de" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'yes' ? '1' : '0'}. Binary. Clean. Nuance is for philosophy. Action is binary. You do it or you don{"'"}t. The grey spectrum collapsed into a decision. Decision fatigue comes from holding too many options. Reduce to binary. Pick. Move. The speed of the pick matters more than the perfection of the pick.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Decisiveness. Barry Schwartz{"'"}s "Paradox of Choice": more options produce more anxiety, not more satisfaction. "Satisficers" (people who choose "good enough") are consistently happier than "maximizers" (who seek the best). The binary frame reduces cognitive load: instead of evaluating 12 options, you evaluate 1. Yes or no. 1 or 0. The quality of the decision matters less than the speed of commitment.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Decided.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}