/**
 * TRICKSTER #7 — The Primal Scream
 * "Words are too small. Roar. Hum. Let the pressure valve open."
 * ARCHETYPE: Pattern C (Hold) — Hold to "fill" the vocal meter
 * ENTRY: Cold open — microphone meter
 * STEALTH KBE: Sustained hold = Cathartic Release (E)
 * WEB ADAPTATION: Mic input → hold interaction (simulated vocal activation)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'active' | 'released' | 'resonant' | 'afterglow';

export default function Trickster_PrimalScream({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 4000,
    onComplete: () => {
      console.log(`[KBE:E] PrimalScream catharticRelease=confirmed`);
      setStage('released');
      t(() => setStage('resonant'), 4000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 9500);
    },
  });

  useEffect(() => { t(() => setStage('active'), 1800); return () => T.current.forEach(clearTimeout); }, []);

  const meterBars = 12;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ width: '4px', height: `${8 + i * 3}px`, borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The jar is full. Empty it. Hold to scream.
            </div>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '50px' }}>
              {Array.from({ length: meterBars }).map((_, i) => {
                const filled = hold.progress > i / meterBars;
                return (
                  <motion.div key={i}
                    animate={hold.isHolding && filled ? { scaleY: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    style={{ width: '6px', height: `${12 + i * 3}px`, borderRadius: '2px',
                      background: filled
                        ? themeColor(TH.accentHSL, 0.15 + (i / meterBars) * 0.2, 6 + i)
                        : themeColor(TH.primaryHSL, 0.05, 3),
                      transition: 'background 0.15s' }} />
                );
              })}
            </div>
            <div {...hold.holdProps}
              style={{ padding: '14px 32px', borderRadius: '9999px', cursor: 'pointer', userSelect: 'none',
                background: hold.isHolding
                  ? themeColor(TH.accentHSL, 0.12 + hold.progress * 0.06, 6)
                  : themeColor(TH.accentHSL, 0.08, 4),
                border: `2px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.2 : 0.12, 8)}`,
                transform: hold.isHolding ? `scale(${1 + hold.progress * 0.05})` : 'none' }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.55, 16) }}>
                {hold.isHolding ? (hold.progress < 0.5 ? 'AAAA...' : 'AAAAAAHHH...') : 'Hold to release'}
              </div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {hold.isHolding ? 'let it all out' : 'roar. hum. whatever it takes.'}
            </div>
          </motion.div>
        )}
        {stage === 'released' && (
          <motion.div key="rel" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.4, 12), textAlign: 'center', maxWidth: '260px' }}>
              Empty. The pressure valve opened. Lighter now. Quieter.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cathartic release. Words are too small for some feelings. Sound bypasses the cognitive filter and speaks directly to the nervous system. A roar, a hum, a sustained exhale: any vocalization activates the vagus nerve and shifts the body from fight-or-flight to rest-and-digest. The pressure valve was always there.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Released.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}