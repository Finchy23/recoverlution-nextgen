/**
 * GRAVITON #4 — The Black Hole
 * "Absorb the noise."
 * ARCHETYPE: Pattern E (Hold) — Hold silence; absorb aggression
 * ENTRY: Cold Open — pure darkness, then the event horizon appears
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRAVITON_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Stellar');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function Graviton_BlackHole({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const h = hold.tension;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
            style={{ width: '100px', height: '100px', borderRadius: '50%', background: themeColor(TH.voidHSL, 0.95, 0),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 5)}` }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              When they yell, do not reflect it back. Be a black hole. Let their anger fall into your silence and disappear. It ends with you.
            </div>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 160, 160).base, borderRadius: '50%' }}>
              <svg width="100%" height="100%" viewBox="0 0 160 160">
                {/* Event horizon */}
                <circle cx="80" cy="80" r="30" fill={themeColor(TH.voidHSL, 0.99, 0)} />
                <circle cx="80" cy="80" r="30" fill="none"
                  stroke={themeColor(TH.accentHSL, 0.06 + h * 0.06, 10)} strokeWidth="0.5" />
                {/* Light bending inward */}
                {Array.from({ length: 6 + Math.floor(h * 6) }, (_, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  const outer = 65 - h * 10;
                  const inner = 32;
                  return (
                    <motion.line key={i}
                      x1={80 + Math.cos(a) * outer} y1={80 + Math.sin(a) * outer}
                      x2={80 + Math.cos(a + 0.3) * inner} y2={80 + Math.sin(a + 0.3) * inner}
                      stroke={themeColor(TH.accentHSL, 0.04 + h * 0.04, 12)}
                      strokeWidth="0.4"
                      initial={{ opacity: 0.03 }}
                      animate={{ opacity: [0.03, 0.08, 0.03] }}
                      transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }} />
                  );
                })}
                {/* Accretion ring */}
                <motion.ellipse cx="80" cy="80" rx={40 + h * 5} ry={10 + h * 3} fill="none"
                  stroke={themeColor(TH.accentHSL, 0.06 + h * 0.08, 15)} strokeWidth="0.5"
                  initial={{ ry: 10 + h * 3 }}
                  animate={{ ry: [10 + h * 3, 12 + h * 3, 10 + h * 3] }}
                  transition={{ duration: 3, repeat: Infinity }} />
              </svg>
            </div>
            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
                {hold.isHolding ? 'absorbing...' : 'hold the silence'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Containment. The capacity to absorb another{'\u2019'}s distress without becoming dysregulated yourself. It stops the cycle of escalation. The noise fell in. It ended with you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>It ends with you.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}