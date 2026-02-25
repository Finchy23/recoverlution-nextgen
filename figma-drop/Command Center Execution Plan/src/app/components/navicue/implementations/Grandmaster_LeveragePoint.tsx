/**
 * GRANDMASTER #3 — The Leverage Point
 * "Hard work is often just bad physics. Find the fulcrum."
 * ARCHETYPE: Pattern A (Tap) — Choose "More Strength" or "Longer Lever"
 * ENTRY: Scene-first — massive boulder
 * STEALTH KBE: Choosing lever = Strategic Efficiency (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Circuit');
type Stage = 'arriving' | 'stuck' | 'choose' | 'moved' | 'resonant' | 'afterglow';

export default function Grandmaster_LeveragePoint({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'strength' | 'lever' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('stuck'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tryPush = () => {
    if (stage !== 'stuck') return;
    setStage('choose');
  };

  const pick = (c: 'strength' | 'lever') => {
    if (stage !== 'choose') return;
    setChoice(c);
    console.log(`[KBE:K] LeveragePoint choice=${c} strategicEfficiency=${c === 'lever'}`);
    setStage('moved');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
          </motion.div>
        )}
        {stage === 'stuck' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The boulder won{"'"}t move.
            </div>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.08, 4),
              border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.2, 8) }}>THE PROBLEM</span>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={tryPush}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>Push</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'choose' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              It didn{"'"}t budge. What now?
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('strength')}
                style={{ padding: '12px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.05, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>More Strength</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('lever')}
                style={{ padding: '12px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Longer Lever</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'moved' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {choice === 'lever' ? (
              <motion.div initial={{ x: 0 }} animate={{ x: 40 }} transition={{ duration: 1.5 }}
                style={{ width: '40px', height: '40px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }} />
            ) : (
              <div style={{ width: '70px', height: '70px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.08, 4),
                border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }} />
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'lever'
                ? 'A gentle tap. The boulder rolls. Good physics.'
                : 'Still stuck. You bruised your hands. The fulcrum was right there.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Strategic efficiency. Hard work is often just bad physics. The fulcrum is the small move that moves the big thing. Grandmasters don{"'"}t push harder. They find leverage.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Leveraged.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}