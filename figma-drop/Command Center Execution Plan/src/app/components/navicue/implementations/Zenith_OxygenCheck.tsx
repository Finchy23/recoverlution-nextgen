/**
 * ZENITH #8 — The Oxygen Check
 * "Panic burns oxygen. Calm conserves it."
 * ARCHETYPE: Pattern A (Tap) — Box breathing via timed taps
 * ENTRY: Scene-first — O2 meter dropping
 * STEALTH KBE: Successful box breathing = Breath Regulation / Physiological Efficiency (E)
 * WEB ADAPT: microphone → tap rhythm
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'dropping' | 'breathing' | 'resonant' | 'afterglow';

const PHASES = ['Inhale', 'Hold', 'Exhale', 'Hold'];

export default function Zenith_OxygenCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [o2, setO2] = useState(40);
  const [phase, setPhase] = useState(0);
  const [cycles, setCycles] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('dropping'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const breatheTap = () => {
    if (stage !== 'dropping') return;
    const nextPhase = (phase + 1) % 4;
    setPhase(nextPhase);
    setO2(prev => Math.min(100, prev + 8));
    if (nextPhase === 0) {
      const nextCycle = cycles + 1;
      setCycles(nextCycle);
      if (nextCycle >= 2) {
        console.log(`[KBE:E] OxygenCheck breathRegulation=confirmed physiologicalEfficiency=true cycles=${nextCycle}`);
        setStage('breathing');
        t(() => setStage('resonant'), 5000);
        t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
      }
    }
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <span style={{ fontSize: '10px', color: palette.textFaint }}>O₂</span>
          </motion.div>
        )}
        {stage === 'dropping' && (
          <motion.div key="dr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              O₂ dropping. Box breathe: tap through each phase.
            </div>
            {/* O2 meter */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: o2 < 50 ? 'hsla(0, 12%, 35%, 0.2)' : palette.textFaint }}>O₂</span>
              <div style={{ width: '80px', height: '6px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                <div style={{ height: '100%', borderRadius: '3px',
                  width: `${o2}%`,
                  background: o2 < 50
                    ? 'hsla(0, 12%, 28%, 0.08)'
                    : themeColor(TH.accentHSL, 0.12, 6),
                  transition: 'all 0.3s' }} />
              </div>
              <span style={{ fontSize: '11px', color: o2 < 50 ? 'hsla(0, 12%, 35%, 0.2)' : palette.textFaint }}>{o2}%</span>
            </div>
            {/* Phase indicator */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {PHASES.map((p, i) => (
                <div key={i} style={{ padding: '4px 8px', borderRadius: radius.xs,
                  background: i === phase
                    ? themeColor(TH.accentHSL, 0.08, 4)
                    : themeColor(TH.primaryHSL, 0.02, 1),
                  border: `1px solid ${i === phase
                    ? themeColor(TH.accentHSL, 0.15, 8)
                    : themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                  <span style={{ fontSize: '11px',
                    color: i === phase ? themeColor(TH.accentHSL, 0.4, 12) : palette.textFaint }}>{p}</span>
                </div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={breatheTap}
              style={{ width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `2px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>Tap</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'breathing' && (
          <motion.div key="br" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            O₂ restored. Panic burns oxygen. Calm conserves it. In the death zone (above 8,000m), breath control is the difference between summit and death. Box breathing, inhale 4, hold 4, exhale 4, hold 4, activates the parasympathetic system. Master the panic.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Breath regulation. Navy SEALs use box breathing under combat stress. The mechanism: controlled exhalation activates the vagus nerve, triggering the parasympathetic "rest and digest" response. At altitude, this conserves precious O₂. In life, it conserves precious cognitive resources. Panic is metabolically expensive. Calm is metabolically efficient.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Breathing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}