/**
 * FUTURE WEAVER #2 — The Regret Minimization
 * "I do not regret the mistakes. I regret the 'What ifs.'"
 * ARCHETYPE: Pattern A (Tap) — Choose between two paths
 * ENTRY: Scene-first — forking path
 * STEALTH KBE: Choosing the Elder-endorsed path = Long-Term Value alignment (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'fork' | 'chosen' | 'resonant' | 'afterglow';

export default function FutureWeaver_RegretMinimization({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'safe' | 'scary' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('fork'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: 'safe' | 'scary') => {
    if (stage !== 'fork') return;
    setChoice(c);
    console.log(`[KBE:K] RegretMinimization choice=${c} anticipatedRegret=${c === 'safe'} longTermValues=${c === 'scary'}`);
    setStage('chosen');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="40" height="30" viewBox="0 0 40 30">
              <line x1="20" y1="30" x2="8" y2="5" stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="2" />
              <line x1="20" y1="30" x2="32" y2="5" stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="2" />
            </svg>
          </motion.div>
        )}
        {stage === 'fork' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Two paths. A ghost of your 80-year-old self points.
            </div>
            {/* Elder ghost pointing */}
            <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8), fontStyle: 'italic' }}>
              "Choose the one that leaves no ghosts." →
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => choose('safe')}
                style={{ padding: '12px 16px', borderRadius: radius.md, cursor: 'pointer', maxWidth: '110px',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                <div style={{ fontSize: '11px', fontWeight: 500, color: palette.textFaint }}>Path A</div>
                <div style={{ fontSize: '11px', color: palette.textFaint, marginTop: '4px' }}>Safe but Boring</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => choose('scary')}
                style={{ padding: '12px 16px', borderRadius: radius.md, cursor: 'pointer', maxWidth: '110px',
                  background: themeColor(TH.accentHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
                <div style={{ fontSize: '11px', fontWeight: 500, color: themeColor(TH.accentHSL, 0.3, 10) }}>Path B</div>
                <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6), marginTop: '4px' }}>Scary but Exciting</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'chosen' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'scary'
              ? 'The Elder smiles. No ghosts on this path. At 80, you won\'t regret the mistakes — you\'ll regret the "What ifs." Choose the path that leaves no ghosts.'
              : 'Safe. But the Elder\'s eyes are sad. "I did not regret my failures," they whisper. "I regret the roads I never took." The ghosts are the unlived possibilities.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Regret minimization. Jeff Bezos{"'"} decision framework: project yourself to age 80 and ask "What will I regret?" Research by Tom Gilovich shows that people regret inactions more than actions over the long term. The short-term regrets (failures) fade; the long-term regrets (roads not taken) haunt. Choose the path that leaves no ghosts.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Chosen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}