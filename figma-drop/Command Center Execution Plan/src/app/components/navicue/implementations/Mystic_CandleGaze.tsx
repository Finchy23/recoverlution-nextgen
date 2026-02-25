/**
 * MYSTIC #1 — The Candle Gaze (Trataka)
 * "The fire is burning your distraction. Become the fire."
 * Pattern C (Hold) — Hold gaze steady; background fades to black; flame becomes only reality
 * WEB ADAPT: front camera eye tracking → hold interaction (30s gaze)
 * STEALTH KBE: Steady gaze 30s = One-Pointed Focus (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Non-Dual Awareness', 'embodying', 'Practice');
type Stage = 'arriving' | 'gazing' | 'dissolved' | 'resonant' | 'afterglow';

export default function Mystic_CandleGaze({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 6000,
    onComplete: () => {
      console.log(`[KBE:E] CandleGaze onePointedFocus=confirmed gazeStability=true`);
      setStage('dissolved');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('gazing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const bgOpacity = 0.02 - hold.progress * 0.018;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }} exit={{ opacity: 0 }}>
            <div style={{ width: '4px', height: '10px', borderRadius: '50% 50% 0 0',
              background: themeColor(TH.accentHSL, 0.06, 4) }} />
          </motion.div>
        )}
        {stage === 'gazing' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center',
              opacity: 1 - hold.progress * 0.8 }}>
              A single flame. Do not blink. Hold your gaze. Let everything else fall away.
            </div>
            {/* Flame */}
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{ scaleY: [1, 1.15, 0.95, 1.1, 1], scaleX: [1, 0.95, 1.05, 0.97, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '12px', height: '28px',
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  background: `radial-gradient(ellipse at 50% 70%, ${themeColor(TH.accentHSL, 0.12 + hold.progress * 0.08, 8)}, ${themeColor(TH.accentHSL, 0.06, 4)} 70%, transparent)`,
                  boxShadow: `0 0 ${8 + hold.progress * 12}px ${themeColor(TH.accentHSL, 0.04 + hold.progress * 0.04, 6)}` }} />
              {/* Wick */}
              <div style={{ position: 'absolute', bottom: '-4px', left: '5px', width: '2px', height: '6px',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            </div>
            <motion.div {...hold.holdProps}
              style={immersiveHoldPillThemed(TH.accentHSL).container(hold.progress)}>
              <div style={immersiveHoldPillThemed(TH.accentHSL).label(hold.progress)}>
                {hold.isHolding ? `Gazing... ${Math.round(hold.progress * 100)}%` : 'Hold to Gaze'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'dissolved' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Dissolved. The background is gone. Only the flame remains. The fire burned your distraction — thought by thought, until only awareness was left. You didn{"'"}t look at the flame. You became the flame. Trataka: the yogic practice of steady gazing. The eyes steady, the mind stills. The object of focus becomes the subject. Observer and observed merge.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Trataka (steady gazing). A classical yogic kriya (purification practice) involving sustained fixation on a single point — traditionally a candle flame. Neuroscience: prolonged fixation activates the dorsal attention network while suppressing the default mode network (mind-wandering). EEG studies show increased alpha coherence during trataka, consistent with meditative states. The practice demonstrates that attention is not passive reception but active construction of reality.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Flame.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}