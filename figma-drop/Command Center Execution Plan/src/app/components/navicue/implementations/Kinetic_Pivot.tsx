/**
 * KINETIC #6 — The Pivot (The Eurostep)
 * "The plan failed. The goal remains. Change the angle."
 * ARCHETYPE: Pattern A (Tap) — Wall appears, tap dodge button before timer expires
 * ENTRY: Cold open — running forward
 * STEALTH KBE: Reaction latency = Cognitive Agility vs Rigidity (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'running' | 'wall' | 'dodged' | 'resonant' | 'afterglow';

export default function Kinetic_Pivot({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const wallTime = useRef(0);

  useEffect(() => {
    t(() => setStage('running'), 1500);
    t(() => { setStage('wall'); wallTime.current = Date.now(); }, 3500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const dodge = () => {
    if (stage !== 'wall') return;
    const latency = Date.now() - wallTime.current;
    console.log(`[KBE:E] Pivot reactionMs=${latency} cognitiveAgility=${latency < 2000}`);
    setStage('dodged');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
              style={{ width: '12px', height: '20px', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.12, 6) }} />
          </motion.div>
        )}
        {stage === 'running' && (
          <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.3, repeat: Infinity }}
              style={{ width: '12px', height: '20px', borderRadius: radius.sm,
                background: themeColor(TH.accentHSL, 0.15, 8) }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>running forward...</div>
          </motion.div>
        )}
        {stage === 'wall' && (
          <motion.div key="w" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ width: '100px', height: '60px', background: 'hsla(0, 25%, 30%, 0.08)',
              border: '2px solid hsla(0, 25%, 35%, 0.15)', borderRadius: radius.xs,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...navicueType.choice, color: 'hsla(0, 30%, 40%, 0.5)', fontSize: '12px' }}>WALL</span>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={dodge}
              animate={{ x: [0, -3, 3, 0] }} transition={{ duration: 0.3, repeat: Infinity }}
              style={{ padding: '12px 28px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.1, 6),
                border: `2px solid ${themeColor(TH.accentHSL, 0.15, 10)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 15) }}>PIVOT →</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'dodged' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Dodged. The plan changed. The goal didn{"'"}t. You{"'"}re still moving.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive agility. The plan failed, but the goal remains. Freezing is rigidity. Pivoting is agility. The eurostep: change the angle, keep the momentum. The obstacle is not the end; it{"'"}s the redirect.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Pivoted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}