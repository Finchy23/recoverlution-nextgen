/**
 * RETRO-CAUSAL #8 — The Metadata Edit
 * "It is not a character flaw. It is a data point."
 * ARCHETYPE: Pattern D (Type) — Type the new tag over "Failure"
 * ENTRY: Reverse Reveal — "Data" shown first, then the edit interface
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function RetroCausal_MetadataEdit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    minLength: 4,
    onAccept: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{
                padding: '6px 16px', borderRadius: radius.xs,
                background: themeColor(TH.accentHSL, 0.06, 8),
                fontSize: '12px', fontFamily: 'monospace', color: palette.text,
              }}>
              Event: Data
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>
              not failure. information
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Open the file info. The tag says {'\u201C'}Failure.{'\u201D'} That{'\u2019'}s a character judgment. Edit the tag. It{'\u2019'}s not a flaw. It{'\u2019'}s a data point. File it under something truer.
            </div>
            <div style={{
              width: '220px', padding: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.05, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              fontFamily: 'monospace', fontSize: '11px',
            }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: palette.textFaint, opacity: 0.4 }}>File:</span>
                <span style={{ color: palette.textFaint, opacity: 0.5 }}>memory_2024.log</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: palette.textFaint, opacity: 0.4 }}>Tag:</span>
                <span style={{ textDecoration: 'line-through', color: palette.textFaint, opacity: 0.3 }}>Failure</span>
                <span style={{ color: palette.textFaint, opacity: 0.3 }}>{'\u2192'}</span>
                <input
                  type="text"
                  value={typeInt.value}
                  onChange={e => typeInt.onChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && typeInt.submit()}
                  placeholder="lesson"
                  style={{
                    width: '80px', padding: '3px 6px', borderRadius: '3px',
                    background: themeColor(TH.primaryHSL, 0.03, 2),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
                    color: palette.text, fontFamily: 'monospace', fontSize: '11px',
                    outline: 'none',
                  }} />
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Tag updated. Cognitive reappraisal: changing the semantic label changes the neural response. {'\u201C'}Failure{'\u201D'} activates shame circuitry. {'\u201C'}Data{'\u201D'} activates the learning network. Same event. Different file name. The metadata is the meaning.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Retagged.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}