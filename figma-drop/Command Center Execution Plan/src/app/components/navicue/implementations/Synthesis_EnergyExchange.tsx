/**
 * SYNTHESIS #6 — The Energy Exchange
 * "You cannot output indefinitely. Where is your input?"
 * ARCHETYPE: Pattern B (Drag) — Balance input/output faders to stop overheating
 * ENTRY: Scene-first — battery visualization
 * STEALTH KBE: Finding balance quickly = Somatic Awareness / Homeostasis (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'draining' | 'balanced' | 'resonant' | 'afterglow';

export default function Synthesis_EnergyExchange({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const input = useDragInteraction({ axis: 'y', sticky: false, onComplete: () => {} });

  useEffect(() => { t(() => setStage('draining'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage === 'draining' && input.progress > 0.55 && input.progress < 0.75) {
      console.log(`[KBE:E] EnergyExchange homeostasis=confirmed somaticAwareness=true input=${input.progress.toFixed(2)}`);
      setStage('balanced');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  }, [input.progress, stage]);

  const overheating = stage === 'draining' && input.progress < 0.3;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '30px', height: '16px', borderRadius: '3px',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
        )}
        {stage === 'draining' && (
          <motion.div key="dr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You{"'"}re draining. Increase input to match output. Find balance.
            </div>
            {/* Battery */}
            <motion.div animate={overheating ? { x: [-1, 1, -1] } : {}}
              transition={{ duration: 0.2, repeat: overheating ? Infinity : 0 }}
              style={{ width: '60px', height: '28px', borderRadius: radius.xs, position: 'relative',
                border: `2px solid ${overheating ? 'hsla(0, 18%, 28%, 0.1)' : themeColor(TH.accentHSL, 0.08 + input.progress * 0.06, 5)}`,
                overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${input.progress * 100}%`,
                background: overheating ? 'hsla(0, 15%, 22%, 0.06)' : themeColor(TH.accentHSL, 0.06 + input.progress * 0.04, 3),
                transition: 'all 0.2s' }} />
            </motion.div>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Output (Work)</span>
                <div style={{ width: '24px', height: '4px', borderRadius: '2px',
                  background: themeColor(TH.primaryHSL, 0.08, 4) }}>
                  <div style={{ width: '70%', height: '100%', borderRadius: '2px',
                    background: 'hsla(0, 12%, 28%, 0.08)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6) }}>Input (Nature)</span>
                <div ref={input.containerRef} style={{ width: '8px', height: '60px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                  touchAction: 'none', position: 'relative' }}>
                  <motion.div {...input.dragProps}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', cursor: 'grab',
                      background: themeColor(TH.accentHSL, 0.1, 5),
                      border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                      position: 'absolute', left: '-6px', top: '2px' }} />
                </div>
              </div>
            </div>
            <div style={{ ...navicueType.hint, color: overheating ? 'hsla(0, 12%, 35%, 0.2)' : palette.textFaint }}>
              {overheating ? 'Overheating: increase input' : 'Find the balance point'}
            </div>
          </motion.div>
        )}
        {stage === 'balanced' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Balanced. You are an open system; you cannot output indefinitely. Where is your input? Nature, rest, play, silence. Balance the voltage or you blow the fuse. The battery charges when input matches output.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Homeostasis. Hans Selye{"'"}s General Adaptation Syndrome: the body can sustain stress only if recovery matches depletion. Burnout isn{"'"}t caused by too much output; it{"'"}s caused by insufficient input. You are a thermodynamic system. Find the equilibrium. Balance the voltage.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Balanced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}