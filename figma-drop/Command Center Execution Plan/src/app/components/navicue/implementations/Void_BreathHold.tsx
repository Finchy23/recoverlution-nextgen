/**
 * ZERO POINT #4 — The Breath Hold (The Gap)
 * "Wisdom happens in the pause. Rest in the bottom of the exhale."
 * STEALTH KBE: Duration of hold = Stress Resilience (E)
 * Web: useHoldInteraction — hold button at bottom of exhale cycle
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'CO2 Tolerance', 'embodying', 'Ocean');
type Stage = 'arriving' | 'breathe' | 'hold' | 'resonant' | 'afterglow';

export default function Void_BreathHold({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale' | 'gap'>('inhale');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    requiredDuration: 6000,
    onComplete: () => {
      console.log(`[KBE:E] BreathHold holdComplete=true stressResilience=true co2Tolerance=high`);
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('breathe'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'breathe') return;
    const cycle = () => {
      setBreathPhase('inhale');
      t(() => setBreathPhase('exhale'), 4000);
      t(() => { setBreathPhase('gap'); setStage('hold'); }, 8000);
    };
    cycle();
  }, [stage]);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="CO2 Tolerance" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'breathe' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div
              animate={{ scale: breathPhase === 'inhale' ? 1.3 : 0.7 }}
              transition={{ duration: 3.5 }}
              style={{ width: '60px', height: '60px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}`,
                background: themeColor(TH.primaryHSL, 0.03, 1) }} />
            <div style={{ ...navicueType.prompt, color: palette.text, fontSize: '11px' }}>
              {breathPhase === 'inhale' ? 'Inhale...' : breathPhase === 'exhale' ? 'Exhale...' : 'Stop.'}
            </div>
          </motion.div>
        )}
        {stage === 'hold' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div {...hold.bind()}
              animate={{ scale: hold.active ? 0.92 : 1 }}
              style={{ width: '80px', height: '80px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, hold.active ? 0.06 : 0.03, 1),
                border: `1px solid ${themeColor(TH.accentHSL, hold.active ? 0.12 : 0.06, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.15, 5) }}>
                {hold.active ? `${(hold.progress * 6).toFixed(0)}s` : 'Hold'}
              </span>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Hold the empty lung. It is safe there.
            </div>
            <div style={{ width: '80px', height: '2px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.04, 1) }}>
              <motion.div style={{ width: `${hold.progress * 100}%`, height: '100%', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.12, 5) }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            CO2 tolerance correlates directly with stress resilience (Zaccaro et al., 2018). The pause between breaths, the kumbhaka, is where contemplative traditions locate awareness itself. Life happens in the breath. Wisdom happens in the gap.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The gap.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}