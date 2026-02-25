/**
 * ZERO POINT #1 — The Sensory Deprivation
 * "Float." The screen fades to absolute black. No sound. No vibration.
 * STEALTH KBE: Duration of "Blackout" hold = Sensory Regulation (E)
 * Web: Hold a dark button to maintain the void; timer counts silently.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Sensory Gating', 'embodying', 'Ocean');
type Stage = 'arriving' | 'instruction' | 'void' | 'resonant' | 'afterglow';

export default function Void_SensoryDeprivation({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holding, setHolding] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const T = useRef<number[]>([]);
  const interval = useRef<number | null>(null);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('instruction'), 2200); return () => { T.current.forEach(clearTimeout); if (interval.current) clearInterval(interval.current); }; }, []);

  const startHold = () => {
    if (stage !== 'void') return;
    setHolding(true);
    interval.current = window.setInterval(() => setElapsed(e => e + 0.1), 100);
  };

  const endHold = () => {
    setHolding(false);
    if (interval.current) { clearInterval(interval.current); interval.current = null; }
    if (elapsed >= 5) {
      console.log(`[KBE:E] SensoryDeprivation holdDuration=${elapsed.toFixed(1)}s sensoryRegulation=true`);
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 8000);
    }
  };

  const enterVoid = () => {
    setStage('void');
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Sensory Gating" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'instruction' && (
          <motion.div key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '280px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The senses are noisy. Turn them off. No sight. No sound. Just the hum of your own nervous system.
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={enterVoid}
              style={{ padding: '8px 20px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 2)}` }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: palette.textFaint }}>SINK INTO THE BLACK</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'void' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <motion.div
              onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold}
              animate={{ scale: holding ? 0.96 : 1, opacity: holding ? 0.6 : 0.15 }}
              transition={{ duration: 0.4 }}
              style={{ width: '120px', height: '120px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.02, 0),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 1)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, holding ? 0.15 : 0.06, 3), transition: 'all 0.5s' }}>
                {holding ? `${elapsed.toFixed(0)}s` : 'Float'}
              </span>
            </motion.div>
            <div style={{ fontSize: '11px', color: palette.textFaint, opacity: 0.4 }}>
              Hold to sustain the void
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Sensory deprivation tanks reduce cortisol by 21.6% (Kjellgren et al., 2001). When external stimulation drops, the brain amplifies internal signals. The silence is not empty. It is full of answers.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Silence.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}