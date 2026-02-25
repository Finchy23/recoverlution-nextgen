/**
 * SOMA #7 — The Voice Box
 * "Your throat wants to say something. Let it."
 * ARCHETYPE: Pattern D (Type) — Type what your throat wants to say
 * ENTRY: Cold Open — "Your throat is tight. What's stuck there?"
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Soma_VoiceBox({ onComplete }: { data?: any; onComplete?: () => void }) {
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
  const openness = Math.min(1, textLen / 20);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '320px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your throat is tight. What{'\u2019'}s stuck there? Type the unsaid thing. The words your body has been holding.
            </div>
            <motion.div
              animate={{ scaleY: 1 + openness * 0.3 }}
              style={{
                width: '30px', height: '20px', borderRadius: '0 0 50% 50%',
                background: themeColor(TH.accentHSL, 0.06 + openness * 0.08, 5),
                transition: 'background 0.3s',
              }} />
            <div style={{
              width: '100%',
              borderBottom: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
              padding: '8px 0',
            }}>
              <input
                type="text"
                value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                placeholder="what your throat wants to say\u2026"
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
                <div style={{ ...navicueType.hint, color: palette.textFaint }}>release it</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The vagus nerve runs directly through your larynx. Unspoken words create measurable tension in the throat musculature. What you just released was not just text; it was a physical decompression of the voice box. The body doesn{'\u2019'}t distinguish between speaking and typing the unsaid.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Spoken.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}