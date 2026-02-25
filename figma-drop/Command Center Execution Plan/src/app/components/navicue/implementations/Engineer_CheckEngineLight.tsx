/**
 * ENGINEER #5 — The Check Engine Light
 * "The irritability is not a character flaw; it is a sensor reading."
 * Pattern A (Tap) — Tap blinking light, identify root cause
 * STEALTH KBE: Correct physiological ID = HALT Awareness (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Behavioral Design', 'knowing', 'Circuit');
type Stage = 'arriving' | 'blinking' | 'diagnosed' | 'resonant' | 'afterglow';

const CAUSES = [
  { label: 'Hungry', icon: '○' },
  { label: 'Tired', icon: '◐' },
  { label: 'Overwhelmed', icon: '◉' },
  { label: 'Lonely', icon: '◌' },
];

export default function Engineer_CheckEngineLight({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cause, setCause] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('blinking'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const diagnose = (c: string) => {
    if (stage !== 'blinking') return;
    setCause(c);
    console.log(`[KBE:K] CheckEngineLight cause="${c}" haltAwareness=confirmed selfDiagnostics=true`);
    setStage('diagnosed');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 1.2, repeat: Infinity }} exit={{ opacity: 0 }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%',
              background: 'hsla(25, 20%, 30%, 0.06)' }} />
          </motion.div>
        )}
        {stage === 'blinking' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Dashboard warning: "Irritable." Not a character flaw — a sensor reading. Tap to run diagnostics.
            </div>
            {/* Dashboard */}
            <div style={{ width: '140px', height: '50px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.025, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <motion.div animate={{ opacity: [0.08, 0.2, 0.08] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                style={{ width: '10px', height: '10px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.15, 6) }} />
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>⚠ IRRITABLE</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {CAUSES.map(c => (
                <motion.div key={c.label} whileTap={{ scale: 0.9 }} onClick={() => diagnose(c.label)}
                  style={{ padding: '12px 18px', borderRadius: '10px', cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.06, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>
                    {c.icon} {c.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'diagnosed' && (
          <motion.div key="di" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Diagnosed: {cause}. The check engine light is not the problem — it{"'"}s the messenger. You are a biological machine. Irritability is a sensor reading: check your fluids, check your battery. The HALT protocol: are you Hungry, Angry, Lonely, or Tired? Fix the input. The output changes.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            HALT protocol. Recovery programs use HALT (Hungry, Angry, Lonely, Tired) as a quick diagnostic for emotional disturbance. Most "psychological" problems have physiological roots: low blood sugar mimics anxiety, sleep deprivation mimics depression, dehydration affects cognitive function by 25%. Before analyzing your thoughts, check your body{"'"}s maintenance status. Often, the fix is lunch — not therapy.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Diagnosed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}