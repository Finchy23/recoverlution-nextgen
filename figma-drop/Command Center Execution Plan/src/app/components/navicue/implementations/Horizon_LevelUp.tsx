/**
 * INFINITE PLAYER II #3 — The Level Up (New Game+)
 * "Easy mode is boring. Now play it with higher stakes."
 * Pattern A (Tap) — Choose "Quit" or "New Game+ (Harder)"
 * STEALTH KBE: Selecting harder difficulty = Antifragility / Challenge Seeking (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { HORIZON_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Infinite Games', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'gameover' | 'chosen' | 'resonant' | 'afterglow';

export default function Horizon_LevelUp({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('gameover'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: string) => {
    if (stage !== 'gameover') return;
    setChoice(c);
    console.log(`[KBE:E] LevelUp choice="${c}" challengeSeeking=${c === 'newgame'} antifragility=${c === 'newgame'}`);
    setStage('chosen');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Infinite Games" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.08, 4) }}>Loading...</div>
          </motion.div>
        )}
        {stage === 'gameover' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            <div style={{ fontSize: '14px', color: themeColor(TH.accentHSL, 0.35, 10), letterSpacing: '4px', textTransform: 'uppercase' }}>
              Game Over. You Won.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('quit')}
                style={{ padding: '10px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint }}>Quit</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('newgame')}
                style={{ padding: '14px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>New Game+ (Harder)</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'chosen' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            {choice === 'newgame'
              ? 'You chose harder. Easy mode is boring. You mastered this level. The joy is in the difficulty. Antifragility (Taleb): some things benefit from shocks; they get stronger under stress. You are not fragile. You are not even robust. You grow from challenge.'
              : 'You chose to quit. Rest is valid. But notice: did you quit because you were finished, or because you were afraid of the next level? The infinite player knows there is always another game. You can rest, but don\'t retire.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Flow (Csikszentmihalyi): optimal experience occurs when challenge slightly exceeds skill. Too easy = boredom. Too hard = anxiety. New Game+ calibrates the challenge to your growth. The sweet spot is just beyond your edge.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Playing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}