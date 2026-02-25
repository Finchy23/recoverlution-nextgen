/**
 * ZERO POINT #8 — The Reset Button
 * "Factory Reset. The memory is cleared. Start fresh."
 * STEALTH KBE: Pressing the button triggers a physiological sigh = Somatic Reset (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'State Change', 'embodying', 'Ocean');
type Stage = 'arriving' | 'button' | 'glitch' | 'sunrise' | 'resonant' | 'afterglow';

export default function Void_ResetButton({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('button'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const pressReset = () => {
    if (stage !== 'button') return;
    console.log(`[KBE:E] ResetButton pressed=true somaticReset=true stateChange=true`);
    setStage('glitch');
    t(() => setStage('sunrise'), 3000);
    t(() => setStage('resonant'), 8000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 15000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="State Change" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.05, 2) }} />
          </motion.div>
        )}
        {stage === 'button' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Too many background processes. Reboot.
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={pressReset}
              style={{ width: '70px', height: '70px', borderRadius: '50%', cursor: 'pointer',
                background: 'hsla(0, 40%, 25%, 0.3)',
                border: '2px solid hsla(0, 45%, 35%, 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px hsla(0, 40%, 25%, 0.15)' }}>
              <span style={{ fontSize: '7px', letterSpacing: '0.15em', color: 'hsla(0, 50%, 60%, 0.7)', fontWeight: 600 }}>RESET</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'glitch' && (
          <motion.div key="gl" initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0, 1, 0, 0.5, 0, 0.2] }}
            transition={{ duration: 2.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.15, 5), fontFamily: 'monospace' }}>
              REBOOTING...
            </div>
            <div style={{ width: '60px', height: '2px', background: themeColor(TH.accentHSL, 0.1, 4) }} />
          </motion.div>
        )}
        {stage === 'sunrise' && (
          <motion.div key="sr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 3 }}
              style={{ width: '100px', height: '50px', borderRadius: '50px 50px 0 0',
                background: `linear-gradient(180deg, ${themeColor(TH.accentHSL, 0.12, 10)}, ${themeColor(TH.primaryHSL, 0.02, 0)})` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontSize: '9px' }}>
              The memory is cleared. Start fresh.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The physiological sigh (Huberman, 2023), a double inhale followed by an extended exhale, is the fastest voluntary method to reduce autonomic arousal. One button press. One sigh. The system reboots. You are not your last state.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Fresh.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}