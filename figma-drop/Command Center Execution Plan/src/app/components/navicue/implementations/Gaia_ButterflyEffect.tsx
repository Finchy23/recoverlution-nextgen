/**
 * GAIA #9 — The Butterfly Effect
 * "A tiny kindness today can stop a war in ten years."
 * Pattern A (Tap) — Tap butterfly; trace wind from Brazil to Texas tornado
 * STEALTH KBE: Connecting small to large = Chaos Theory / Causality (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Systems Thinking', 'knowing', 'Canopy');
type Stage = 'arriving' | 'flap' | 'tracing' | 'tornado' | 'resonant' | 'afterglow';

const STEPS = ['Wing flap', 'Air current', 'Pressure shift', 'Storm system', 'Tornado'];

export default function Gaia_ButterflyEffect({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [step, setStep] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('flap'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const flap = () => {
    if (stage !== 'flap') return;
    setStage('tracing');
    // Auto-advance through chain
    let i = 0;
    const advance = () => {
      i++;
      setStep(i);
      if (i >= STEPS.length - 1) {
        console.log(`[KBE:K] ButterflyEffect chaosTheory=confirmed causality=true`);
        t(() => {
          setStage('tornado');
          t(() => setStage('resonant'), 5500);
          t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
        }, 800);
      } else {
        t(advance, 800);
      }
    };
    t(advance, 800);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.06, 3) }}>∿</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'flap' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A butterfly in Brazil. Tap its wings.
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={flap}
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
              <span style={{ fontSize: '18px' }}>∿</span>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Flap</div>
          </motion.div>
        )}
        {stage === 'tracing' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ ...navicueType.prompt, color: palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}>
              Tracing the wind...
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <motion.div
                    animate={{ opacity: i <= step ? 1 : 0.3, scale: i === step ? 1.2 : 1 }}
                    style={{ width: '8px', height: '8px', borderRadius: '50%',
                      background: i <= step ? themeColor(TH.accentHSL, 0.08 + i * 0.02, 4) : themeColor(TH.primaryHSL, 0.03, 1) }} />
                  {i < STEPS.length - 1 && <span style={{ fontSize: '11px', color: palette.textFaint }}>→</span>}
                </div>
              ))}
            </div>
            <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>{STEPS[step]}</span>
          </motion.div>
        )}
        {stage === 'tornado' && (
          <motion.div key="to" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Tornado in Texas. One wing flap in Brazil → air current → pressure shift → storm system → tornado. Non-linear dynamics. A tiny kindness today can stop a war in ten years. You never know the end of your action. The butterfly doesn{"'"}t cause the tornado — but without it, the exact tornado wouldn{"'"}t exist. Every action ripples.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Sensitive dependence on initial conditions. Edward Lorenz (1963): tiny rounding errors in weather simulations produced wildly different outcomes. This is the mathematical foundation of chaos theory — deterministic systems that are practically unpredictable because small inputs amplify nonlinearly. The moral implication: in complex systems (societies, relationships, careers), small actions have disproportionate consequences. Every choice is a wing flap.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rippling.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}