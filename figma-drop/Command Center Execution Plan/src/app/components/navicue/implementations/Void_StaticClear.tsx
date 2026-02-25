/**
 * ZERO POINT #3 — The Static Clear
 * "The signal is always there. The static is your anxiety. Swipe the interference."
 * STEALTH KBE: Decisiveness of swipe = belief in accessible clarity (B)
 * Web: useDragInteraction (x axis) to swipe static away, revealing a mirror.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Clarity', 'believing', 'Ocean');
type Stage = 'arriving' | 'static' | 'clear' | 'resonant' | 'afterglow';

export default function Void_StaticClear({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      console.log(`[KBE:B] StaticClear swipeComplete=true clarityBelief=true`);
      setStage('clear');
      t(() => setStage('resonant'), 4000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('static'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Clarity" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '10px', height: '10px', background: themeColor(TH.accentHSL, 0.05, 2) }} />
          </motion.div>
        )}
        {stage === 'static' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '140px', height: '100px', borderRadius: radius.sm, overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.03, 1), border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }}>
              {/* Static noise overlay */}
              <motion.div
                animate={{ opacity: [0.15, 0.08, 0.12, 0.06] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                style={{ position: 'absolute', inset: 0,
                  backgroundImage: `repeating-linear-gradient(0deg, ${themeColor(TH.accentHSL, 0.04, 2)} 0px, transparent 1px, transparent 2px)`,
                  backgroundSize: '2px 3px' }} />
              {/* Swipeable layer */}
              <motion.div {...drag.bind()}
                style={{ position: 'absolute', inset: 0, cursor: 'grab',
                  background: themeColor(TH.primaryHSL, 0.06 * (1 - drag.progress), 2),
                  transform: `translateX(${drag.progress * 100}%)` }} />
              {/* Mirror beneath */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%',
                  background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.08 * drag.progress, 8)}, transparent)`,
                  border: `1px solid ${themeColor(TH.accentHSL, 0.04 * drag.progress, 4)}` }} />
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Swipe the static. The channel is clear.
            </div>
            <div style={{ width: '100px', height: '3px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.04, 1) }}>
              <motion.div style={{ width: `${drag.progress * 100}%`, height: '100%', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.15, 5) }} />
            </div>
          </motion.div>
        )}
        {stage === 'clear' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }}
              style={{ width: '80px', height: '80px', borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.1, 10)}, transparent)`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>Clear.</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The signal-to-noise ratio (Shannon, 1948): the information was always there. Anxiety is noise on a clear channel. Meditation doesn{"'"}t create calm; it removes interference. The stillness was pre-existing.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Clear.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}