/**
 * EDITOR #4 — Kill Your Darlings
 * "If everything is a priority, nothing is. Cut the scene."
 * ARCHETYPE: Pattern A (Tap) — Choose 1 of 3 goals, discard the other 2
 * ENTRY: Scene-first — three shiny goals appear
 * STEALTH KBE: Speed of discarding = Decision Clarity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'knowing', 'Storm');
type Stage = 'arriving' | 'active' | 'cut' | 'resonant' | 'afterglow';
const GOALS = ['Master a craft', 'Build wealth', 'Deep relationships'];

export default function Editor_KillYourDarlings({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [kept, setKept] = useState<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const stageStart = useRef(0);

  useEffect(() => {
    t(() => { setStage('active'); stageStart.current = Date.now(); }, 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const choose = (idx: number) => {
    if (stage !== 'active') return;
    const elapsed = Date.now() - stageStart.current;
    setKept(idx);
    console.log(`[KBE:K] KillYourDarlings kept="${GOALS[idx]}" decisionMs=${elapsed} clarity=${elapsed < 6000}`);
    setStage('cut');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="knowing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '10px' }}>
            {GOALS.map((_, i) => (
              <div key={i} style={{ width: '36px', height: '36px', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You can only keep one. Sacrifice the good to save the great.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              {GOALS.map((g, i) => (
                <motion.div key={i} whileTap={{ scale: 0.97 }} onClick={() => choose(i)}
                  style={{ padding: '12px 16px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.05, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
                  <div style={{ ...navicueType.choice, color: palette.text }}>{g}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'cut' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ padding: '14px 22px', borderRadius: radius.md,
                background: themeColor(TH.accentHSL, 0.08, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>
                {kept !== null ? GOALS[kept] : ''}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Two darlings shattered. The great survived the cut.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Decision clarity. "Kill your darlings" is the editor{"'"}s maxim. If everything is a priority, nothing is. The speed of your sacrifice reveals how clearly you see the one thing that matters.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Cut.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}