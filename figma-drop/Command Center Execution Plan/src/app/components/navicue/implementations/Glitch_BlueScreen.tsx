/**
 * GLITCH #5 — The Blue Screen (The Reset)
 * "FATAL ERROR: EGO OVERLOAD. Hard reboot required."
 * ARCHETYPE: Pattern A (Tap) — BSOD shock, then close eyes for 10s
 * ENTRY: Cold Open — simulated crash screen
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'crash' | 'counting' | 'resonant' | 'afterglow';

export default function Glitch_BlueScreen({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('crash');
  const [count, setCount] = useState(10);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    return () => T.current.forEach(clearTimeout);
  }, []);

  const startReboot = () => {
    if (stage !== 'crash') return;
    setStage('counting');
    let c = 10;
    const interval = window.setInterval(() => {
      c--;
      setCount(c);
      if (c <= 0) {
        clearInterval(interval);
        setStage('resonant');
        t(() => { setStage('afterglow'); onComplete?.(); }, 6000);
      }
    }, 1000);
    T.current.push(interval as any);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'crash' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
              padding: '24px', borderRadius: radius.sm, maxWidth: '280px',
              background: themeColor(TH.accentHSL, 0.03, 2) }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.08em',
              color: themeColor(TH.accentHSL, 0.5, 15), textAlign: 'center' }}>
              FATAL ERROR
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '10px',
              color: themeColor(TH.accentHSL, 0.25, 10), textAlign: 'center', lineHeight: 1.6 }}>
              EGO_OVERLOAD.exe{'\n'}
              Too many tabs open.{'\n'}
              System critical.{'\n'}
              Hard reboot required.
            </div>
            <motion.div onClick={startReboot} whileTap={{ scale: 0.97 }}
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ padding: '12px 20px', borderRadius: radius.xs, cursor: 'pointer', marginTop: '8px',
                background: themeColor(TH.accentHSL, 0.08, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 10)}` }}>
              <div style={{ fontFamily: 'monospace', fontSize: '10px',
                color: themeColor(TH.accentHSL, 0.4, 15) }}>REBOOT</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'counting' && (
          <motion.div key="cnt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              Close your eyes. Breathe. The system is rebooting.
            </div>
            <motion.div key={count}
              initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ fontSize: '36px', fontFamily: 'monospace',
                color: themeColor(TH.accentHSL, 0.2 + (10 - count) * 0.03, 10) }}>
              {count}
            </motion.div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace',
              color: palette.textFaint }}>seconds remaining</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive reset. The visual shock served as a metaphor for burnout: too many processes, not enough capacity. Ten seconds of darkness is a biological stop. Your system needed that reboot.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>System restored.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}