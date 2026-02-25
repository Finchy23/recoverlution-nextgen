/**
 * TRIBALIST #3 — The Gift Loop
 * "A transaction ends. A relationship loops."
 * ARCHETYPE: Pattern B (Drag) — Swipe up to throw a glowing ball; it returns larger
 * ENTRY: Cold open — glowing orb in your hands
 * STEALTH KBE: Executing "Send Gratitude" = Embodied Connection (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRIBALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'active' | 'thrown' | 'returned' | 'resonant' | 'afterglow';

export default function Tribalist_GiftLoop({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [loops, setLoops] = useState(0);
  const [size, setSize] = useState(30);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const throwGift = () => {
    if (stage !== 'active') return;
    setStage('thrown');
    t(() => {
      const next = loops + 1;
      setLoops(next);
      setSize(30 + next * 8);
      if (next >= 3) {
        console.log(`[KBE:E] GiftLoop loops=${next} embodiedConnection=confirmed`);
        setStage('returned');
        t(() => setStage('resonant'), 4500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
      } else {
        setStage('active');
      }
    }, 1200);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.1, 6),
              boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.08, 8)}` }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Give without a contract. Watch who throws it back.
            </div>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 8),
                boxShadow: `0 0 ${8 + loops * 4}px ${themeColor(TH.accentHSL, 0.08 + loops * 0.03, 8)}`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}` }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={throwGift}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>
                {loops === 0 ? 'Give' : `Give again (${loops}/3)`}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'thrown' && (
          <motion.div key="th" initial={{ y: 0, opacity: 1 }} animate={{ y: -80, opacity: 0 }} transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.12, 8) }} />
          </motion.div>
        )}
        {stage === 'returned' && (
          <motion.div key="ret" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.15, 10),
                boxShadow: `0 0 20px ${themeColor(TH.accentHSL, 0.1, 10)}` }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Each loop made it larger. Reciprocity is the heartbeat of belonging.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Generosity reciprocity. A transaction ends. A relationship loops. Each act of giving without expectation strengthens the bond exponentially: the gift economy of belonging.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Looping.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}