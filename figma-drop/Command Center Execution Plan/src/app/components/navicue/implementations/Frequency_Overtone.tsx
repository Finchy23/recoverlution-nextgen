/**
 * FREQUENCY #7 — The Overtone
 * "There's a note underneath the note."
 * ARCHETYPE: Pattern D (Type) — Type the note underneath the note
 * ENTRY: Cold Open — "What's the real frequency?"
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Frequency_Overtone({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typer = useTypeInteraction({
    minLength: 3,
    onAccept: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const textLen = typer.value.length;
  const depth = Math.min(1, textLen / 15);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '320px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              There{'\u2019'}s a note underneath the note. What you say you want {'\u2014'} and what you actually want. Type the deeper frequency. The overtone hiding beneath the surface.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              {[0.06, 0.04 + depth * 0.04, 0.03 + depth * 0.06].map((alpha, i) => (
                <div key={i} style={{
                  width: `${180 - i * 30}px`, height: '1px',
                  background: themeColor(TH.accentHSL, alpha, 5 + i * 2),
                }} />
              ))}
            </div>
            <div style={{
              width: '100%',
              borderBottom: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
              padding: '8px 0',
            }}>
              <input
                type="text"
                value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                placeholder="the real note\u2026"
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  ...navicueType.texture, color: palette.text, textAlign: 'center',
                }}
              />
            </div>
            {textLen >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.96 }}
                onClick={typer.submit}
                style={{
                  padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                }}>
                <div style={{ ...navicueType.hint, color: palette.textFaint }}>that{'\u2019'}s the one</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Harmonic series. Every sound contains invisible overtones {'\u2014'} frequencies that vibrate at multiples of the fundamental. What makes a piano and a guitar play the same note differently is which overtones dominate. You just named your overtone. It was always playing.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Underneath.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}