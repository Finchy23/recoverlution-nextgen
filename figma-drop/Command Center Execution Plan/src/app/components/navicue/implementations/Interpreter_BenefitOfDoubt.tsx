/**
 * INTERPRETER #4 — The Benefit of the Doubt (The Coin)
 * "You have no evidence. Why choose the story that hurts you? Choose the generous story."
 * ARCHETYPE: Pattern A (Tap) — Coin flip, choose the generous interpretation
 * ENTRY: Scene-first — coin appears with two sides visible
 * STEALTH KBE: Choice of generous interpretation = stress reduction (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'coin' | 'active' | 'chosen' | 'resonant' | 'afterglow';

export default function Interpreter_BenefitOfDoubt({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('coin');
  const [choice, setChoice] = useState<'hurt' | 'generous' | null>(null);
  const [flipping, setFlipping] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const kbe = useRef({ promptShown: 0 });

  useEffect(() => {
    t(() => { setStage('active'); kbe.current.promptShown = Date.now(); }, 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const chooseSide = (side: 'hurt' | 'generous') => {
    const reactionMs = Date.now() - kbe.current.promptShown;
    console.log(`[KBE:E] BenefitOfDoubt choice=${side} reactionMs=${reactionMs}`);
    setFlipping(true);
    setChoice(side);
    t(() => {
      setFlipping(false);
      setStage('chosen');
    }, 800);
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'coin' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ width: '80px', height: '80px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 6),
                border: `2px solid ${themeColor(TH.accentHSL, 0.15, 10)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.25, 10), fontSize: '11px' }}>A / B</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You have no evidence. Why choose the story that hurts you? Choose the generous story. It is strategically superior.
            </div>
            {/* Coin */}
            <motion.div
              animate={flipping ? { rotateY: [0, 360, 720] } : { rotateY: 0 }}
              transition={{ duration: 0.8 }}
              style={{ width: '80px', height: '80px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1, 6),
                border: `2px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }} />
            <div style={{ display: 'flex', gap: '16px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => chooseSide('hurt')}
                style={{ padding: '14px 20px', borderRadius: radius.xl, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.3, 12), fontSize: '13px' }}>
                  A: They hate me
                </div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => chooseSide('generous')}
                style={{ padding: '14px 20px', borderRadius: radius.xl, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12), fontSize: '13px' }}>
                  B: They are busy
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'chosen' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%',
              background: choice === 'generous'
                ? themeColor(TH.accentHSL, 0.12, 8)
                : themeColor(TH.primaryHSL, 0.1, 4),
              border: `2px solid ${choice === 'generous'
                ? themeColor(TH.accentHSL, 0.15, 10)
                : themeColor(TH.primaryHSL, 0.12, 6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ ...navicueType.texture, color: choice === 'generous'
                ? themeColor(TH.accentHSL, 0.4, 12) : themeColor(TH.primaryHSL, 0.3, 10),
                fontSize: '13px' }}>
                {choice === 'generous' ? 'B' : 'A'}
              </div>
            </div>
            <div style={{ ...navicueType.texture, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'generous'
                ? 'Assume they are busy. For one hour. See what happens to the tension.'
                : 'You chose the painful story. Notice how it feels in your body.'}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>
              {choice === 'generous' ? 'the generous assumption' : 'the costly assumption'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Charitable attribution. Without evidence, the generous interpretation is not naive {'\u2014'} it is strategically optimal. It reduces cortisol, preserves relationships, and costs nothing to test.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Generous.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}