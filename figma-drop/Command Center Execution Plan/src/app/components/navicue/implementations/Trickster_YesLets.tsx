/**
 * TRICKSTER #8 — The "Yes, Let's"
 * "You are so disciplined. You are boring yourself to death. Rebel."
 * ARCHETYPE: Pattern A (Tap) — Choose rebel or compliance
 * ENTRY: Ambient fade — outrageous suggestion
 * STEALTH KBE: Choosing "Yes, Let's!" = Play over Optimisation (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'active' | 'decided' | 'resonant' | 'afterglow';

const SUGGESTIONS = [
  'Eat dessert first.',
  'Take a nap instead of answering that email.',
  'Skip the gym. Go for a wander.',
  'Say no to the meeting. Say yes to the sky.',
  'Cancel the plan. Do absolutely nothing.',
];

export default function Trickster_YesLets({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [suggestion] = useState(() => SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)]);
  const [choice, setChoice] = useState<'no' | 'yes' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const decide = (c: 'no' | 'yes') => {
    if (stage !== 'active') return;
    setChoice(c);
    console.log(`[KBE:B] YesLets choice=${c} playOverOptimisation=${c === 'yes'} spontaneity=${c === 'yes'}`);
    setStage('decided');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.1, 5), fontStyle: 'italic' }}>
            a suggestion...
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontStyle: 'italic' }}>
              "{suggestion}"
            </motion.div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide('no')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>No</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9, rotate: 5 }} onClick={() => decide('yes')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.04, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.55, 16), fontSize: '11px', fontWeight: 600 }}>
                  Yes, let{"'"}s!
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'decided' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: choice === 'yes' ? themeColor(TH.accentHSL, 0.4, 12) : palette.textFaint,
              textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'yes'
              ? 'Rebel. Discipline is a tool, not an identity. Sometimes the most productive thing you can do is nothing at all.'
              : 'Disciplined. Safe. But the offer stands. The exit from routine is always one "yes" away.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Spontaneity. You are so disciplined that you{"'"}ve optimized the joy out of living. Play is not the opposite of productivity. It{"'"}s the fuel. Saying "yes, let{"'"}s" to one small rebellion per day rewires the brain{"'"}s reward circuitry and combats hedonic adaptation.
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