/**
 * PRISM #9 — The Infrared
 * "Feel the warmth. Ignore the words."
 * ARCHETYPE: Pattern D (Type) — Name what you feel, not what you see
 * ENTRY: Reverse Reveal — thermal truth shown first, then you name it
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function Prism_Infrared({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const T = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();
  const typer = useTypeInteraction({
    minLength: 2,
    onAccept: () => addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    addTimer(() => setStage('active'), 3200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'active') addTimer(() => inputRef.current?.focus(), 300);
  }, [stage]);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Thermal silhouette */}
            <svg width="120" height="160" viewBox="0 0 120 160">
              <defs>
                <radialGradient id={`${svgId}-thermal`} cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="hsla(0, 50%, 40%, 0.3)" />
                  <stop offset="50%" stopColor="hsla(30, 40%, 30%, 0.15)" />
                  <stop offset="100%" stopColor="hsla(220, 20%, 15%, 0.05)" />
                </radialGradient>
              </defs>
              <ellipse cx="60" cy="40" rx="20" ry="25" fill={`url(#${svgId}-thermal)`} />
              <rect x="40" y="60" width="40" height="60" rx="10" fill={`url(#${svgId}-thermal)`} />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Words are just visible light. Intention is infrared. Feel the heat of their heart. Are they warm? That is the truth.
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.5, textAlign: 'center' }}>
              Think of someone. What do you feel — warm or cold?
            </div>
            <input ref={inputRef} type="text" value={typer.value}
              onChange={e => typer.onChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && typer.submit()}
              placeholder="warm, cold, burning, ice..."
              disabled={typer.accepted}
              style={{ width: '100%', padding: '12px 16px', fontSize: '15px', fontFamily: 'serif', fontStyle: 'italic',
                textAlign: 'center', background: themeColor(TH.voidHSL, 0.5, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.05, 10)}`, borderRadius: radius.sm, color: palette.text, outline: 'none' }} />
            {!typer.accepted && typer.value.length >= 2 && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', ...navicueType.hint, color: palette.textFaint }}>
                name it
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Emotional temperature. Detecting warmth or coldness happens below conscious language processing — subliminal perception. You knew the answer before the words. Trust the infrared.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Feel the heat.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}