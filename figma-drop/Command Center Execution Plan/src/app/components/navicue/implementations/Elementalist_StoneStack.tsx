/**
 * ELEMENTALIST #6 — The Stone Stack (Balance)
 * "Balance is not static. It is a series of micro-adjustments."
 * ARCHETYPE: Pattern A (Tap) — Place stones carefully on cairn
 * ENTRY: Scene-first — zen cairn
 * STEALTH KBE: Fine placement = Focus / Fine Motor Control (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Canopy');
type Stage = 'arriving' | 'stacking' | 'balanced' | 'resonant' | 'afterglow';

const STONES = [
  { w: 36, h: 12, rx: '3px' },
  { w: 28, h: 10, rx: '4px' },
  { w: 22, h: 9, rx: '5px' },
  { w: 16, h: 8, rx: '6px' },
];

export default function Elementalist_StoneStack({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState(1); // first stone starts placed
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('stacking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const placeStone = () => {
    if (stage !== 'stacking') return;
    const next = placed + 1;
    setPlaced(next);
    if (next >= STONES.length) {
      console.log(`[KBE:E] StoneStack focus=confirmed fineMotorBalance=true`);
      setStage('balanced');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '10px', borderRadius: '3px', background: themeColor(TH.primaryHSL, 0.05, 3) }} />
          </motion.div>
        )}
        {stage === 'stacking' && (
          <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Stack the stones. Place each one carefully. Breathe while you place it.
            </div>
            {/* Cairn */}
            <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '1px' }}>
              {STONES.map((s, i) => (
                i < placed ? (
                  <motion.div key={i} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                    style={{ width: `${s.w}px`, height: `${s.h}px`, borderRadius: s.rx,
                      background: themeColor(TH.primaryHSL, 0.04 + i * 0.01, 2 + i),
                      border: `1px solid ${themeColor(TH.primaryHSL, 0.06 + i * 0.01, 4)}` }} />
                ) : null
              ))}
            </div>
            {/* Next stone preview + place button */}
            {placed < STONES.length && (
              <motion.div whileTap={{ scale: 0.9 }} onClick={placeStone}
                animate={{ y: [-2, 2, -2] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>
                  Place stone {placed + 1}
                </span>
              </motion.div>
            )}
            <div style={{ display: 'flex', gap: '4px' }}>
              {STONES.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: i < placed
                    ? themeColor(TH.accentHSL, 0.15, 8)
                    : themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'balanced' && (
          <motion.div key="ba" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Balanced. Four stones, each placed with care. Balance is not static — it is a series of micro-adjustments. Find the center of gravity. The cairn holds because each stone respects the one beneath it. So does your life.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Dynamic equilibrium. Balance in living systems is never static — it{"'"}s a continuous process of sensing and adjusting (allostasis, not homeostasis). The body balances temperature, pH, hormone levels through constant micro-corrections. A Zen cairn embodies this: each stone finds balance not through rigidity but through sensitivity to the forces acting on it. Life balance works the same way.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Balanced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}