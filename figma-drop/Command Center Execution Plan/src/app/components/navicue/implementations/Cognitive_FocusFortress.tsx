/**
 * ARCHITECT II #2 — The Focus Fortress
 * "Attention is the most valuable real estate. Defend it."
 * Pattern C (Hold) — Hold to maintain fortress; distractions siege
 * STEALTH KBE: Maintaining fortress = Attentional Defense / Deep Work (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Structuring', 'embodying', 'Circuit');
type Stage = 'arriving' | 'sieged' | 'defended' | 'resonant' | 'afterglow';

export default function Cognitive_FocusFortress({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 4500,
    onComplete: () => {
      console.log(`[KBE:E] FocusFortress attentionalDefense=confirmed deepWork=true`);
      setStage('defended');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('sieged'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '20px', borderRadius: '2px 2px 0 0',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}`, borderBottom: 'none' }} />
          </motion.div>
        )}
        {stage === 'sieged' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are building a wall around Deep Work. Distractions siege the castle. Hold to raise the drawbridge and defend.
            </div>
            {/* Fortress */}
            <div style={{ position: 'relative', width: '100px', height: '60px' }}>
              <div style={{ position: 'absolute', bottom: 0, width: '100px', height: '30px',
                borderRadius: '2px 2px 0 0',
                background: themeColor(TH.primaryHSL, 0.03 + hold.progress * 0.02, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.05 + hold.progress * 0.03, 3)}`,
                borderBottom: 'none' }} />
              {/* Battlement crenels */}
              {[10, 30, 50, 70, 90].map(x => (
                <div key={x} style={{ position: 'absolute', bottom: '30px', left: `${x - 4}px`,
                  width: '8px', height: '6px', background: themeColor(TH.primaryHSL, 0.04 + hold.progress * 0.02, 2) }} />
              ))}
              {/* Distractions (flying at fortress) */}
              {hold.isHolding && [0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ x: [-30, -10], opacity: [0.06, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                  style={{ position: 'absolute', top: `${10 + i * 15}px`, left: '-10px',
                    fontSize: '11px', color: palette.textFaint }}>
                  {['·', '○', '◦'][i]}
                </motion.div>
              ))}
              {/* Deep Work label */}
              <span style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
                fontSize: '11px', color: themeColor(TH.accentHSL, 0.2 + hold.progress * 0.1, 8) }}>Deep Work</span>
            </div>
            <motion.div {...hold.holdProps}
              style={immersiveHoldPillThemed(TH.accentHSL).container(hold.progress)}>
              <div style={immersiveHoldPillThemed(TH.accentHSL).label(hold.progress)}>
                {hold.isHolding ? `Defending... ${Math.round(hold.progress * 100)}%` : 'Hold to Defend'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'defended' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The wall holds. The siege is broken. Attention is the most valuable real estate in the world — defend it. Build the walls high. Raise the drawbridge. The fortress doesn{"'"}t eliminate distraction; it makes distraction{"'"}s cost of entry higher than its reward.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Deep work. Cal Newport{"'"}s research: the ability to focus without distraction on a cognitively demanding task is becoming increasingly rare and increasingly valuable. The average knowledge worker is interrupted every 11 minutes and takes 25 minutes to return to the original task. The fortress metaphor is architectural: environment design (walls) beats willpower (defense) every time.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Defended.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}