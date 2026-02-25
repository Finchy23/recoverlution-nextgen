/**
 * SURFER #3 — The Breath Synchro
 * "Your breath is the engine. Fuel the expansion."
 * ARCHETYPE: Pattern C (Hold) — Hold to expand the circle (inhale), release (exhale)
 * ENTRY: Ambient fade — expanding circle
 * STEALTH KBE: Sustained breath rhythm = Physiological Entrainment (E)
 * WEB ADAPTATION: Mic → hold-release pacer
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'active' | 'synced' | 'resonant' | 'afterglow';

const CYCLES_NEEDED = 4;

export default function Surfer_BreathSynchro({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [holding, setHolding] = useState(false);
  const [size, setSize] = useState(30);
  const [cycles, setCycles] = useState(0);
  const wasHolding = useRef(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const iv = setInterval(() => {
      setSize(s => {
        if (holding) return Math.min(70, s + 1.5);
        return Math.max(20, s - 1.5);
      });
    }, 50);
    return () => clearInterval(iv);
  }, [stage, holding]);

  useEffect(() => {
    // Detect cycles: was holding → released
    if (wasHolding.current && !holding && stage === 'active') {
      const next = cycles + 1;
      setCycles(next);
      if (next >= CYCLES_NEEDED) {
        console.log(`[KBE:E] BreathSynchro cycles=${next} physiologicalEntrainment=confirmed`);
        setStage('synced');
        t(() => setStage('resonant'), 4500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
      }
    }
    wasHolding.current = holding;
  }, [holding]);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '20px', height: '20px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.05, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Hold to breathe in. Release to breathe out.
            </div>
            {/* Expanding circle */}
            <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: `${size}px`, height: `${size}px`, borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.04 + (size / 70) * 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08 + (size / 70) * 0.08, 5)}`,
                boxShadow: holding ? `0 0 ${size / 3}px ${themeColor(TH.accentHSL, 0.03, 4)}` : 'none',
                transition: 'width 0.05s, height 0.05s, background 0.3s',
              }} />
            </div>
            <div
              onPointerDown={() => setHolding(true)}
              onPointerUp={() => setHolding(false)}
              onPointerLeave={() => setHolding(false)}
              style={{ padding: '14px 32px', borderRadius: radius.full, cursor: 'pointer', userSelect: 'none',
                background: holding
                  ? themeColor(TH.accentHSL, 0.1, 5)
                  : themeColor(TH.accentHSL, 0.06, 3),
                border: `2px solid ${themeColor(TH.accentHSL, holding ? 0.18 : 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>
                {holding ? 'inhale...' : 'hold to breathe'}
              </div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              cycle {cycles + 1}/{CYCLES_NEEDED}
            </div>
          </motion.div>
        )}
        {stage === 'synced' && (
          <motion.div key="sy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Synced. Your breath became the engine. The circle expanded because you did. The machine runs on you.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Respiratory control. Controlled breathing is the only autonomic function you can consciously override, and the fastest way to shift your nervous system state. Slow, deep breathing activates the parasympathetic branch within 30 seconds. Your breath is the engine. If you stop breathing, the machine stops.
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