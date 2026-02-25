/**
 * MYTHMAKER #1 — The Incantation (Abracadabra)
 * "Words are spells. Speak the spell correctly."
 * ARCHETYPE: Pattern D (Type) — Type "I have to..." (shakes/rejects).
 * Type "I get to..." (glows gold). Linguistic Determinism.
 * Ancient gold palette. Manuscript void.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYTHMAKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MYTHMAKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function MythMaker_Incantation({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const inputRef = useRef<HTMLInputElement>(null);

  const typer = useTypeInteraction({
    rejectPhrases: ['i have to', 'i must', 'i need to', 'i should'],
    acceptPhrases: ['i get to', 'i choose to', 'i want to'],
    onAccept: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'active') addTimer(() => inputRef.current?.focus(), 300);
  }, [stage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') typer.submit();
  };

  const glowAlpha = typer.status === 'accepted' ? 0.12 : 0;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The words are listening...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Words are spells. {'\u201C'}Abracadabra{'\u201D'} means {'\u201C'}I create as I speak.{'\u201D'} Do not curse yourself with weak language.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>speak the spell correctly</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            {/* Glowing rune circle */}
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ marginBottom: '-8px' }}>
              <circle cx="60" cy="60" r="50" fill="none"
                stroke={themeColor(TH.accentHSL, 0.06 + glowAlpha, 10)} strokeWidth="0.5" />
              <circle cx="60" cy="60" r="38" fill="none"
                stroke={themeColor(TH.accentHSL, 0.04 + glowAlpha, 5)} strokeWidth="0.3" />
              {/* Inner glow on accept */}
              {typer.status === 'accepted' && (
                <motion.circle cx="60" cy="60" r="30"
                  fill={themeColor(TH.accentHSL, 0.08, 15)}
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }} />
              )}
              <text x="60" y="64" textAnchor="middle" fontSize="11" fontFamily="serif"
                fill={themeColor(TH.accentHSL, typer.status === 'accepted' ? 0.25 : 0.08, 15)}
                style={{ transition: 'fill 1s ease' }}>
                ABRACADABRA
              </text>
            </svg>

            {/* Input field */}
            <motion.div
              key={typer.shakeCount}
              animate={typer.status === 'rejected' ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
              transition={{ duration: 0.5 }}
              style={{ width: '100%' }}>
              <input
                ref={inputRef}
                type="text"
                value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="I have to... or I get to..."
                disabled={typer.accepted}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  background: typer.status === 'accepted'
                    ? themeColor(TH.accentHSL, 0.08, 15)
                    : typer.status === 'rejected'
                      ? 'hsla(0, 20%, 15%, 0.3)'
                      : themeColor(TH.voidHSL, 0.6, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, typer.status === 'accepted' ? 0.2 : 0.06, 10)}`,
                  borderRadius: radius.sm,
                  color: typer.status === 'accepted'
                    ? themeColor(TH.accentHSL, 0.9, 30)
                    : palette.text,
                  outline: 'none',
                  transition: 'all 0.5s ease',
                  letterSpacing: '0.02em',
                }}
              />
            </motion.div>

            {/* Submit hint */}
            {!typer.accepted && typer.value.length > 2 && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                onClick={typer.submit}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  ...navicueType.hint, color: palette.textFaint,
                }}>
                cast the spell
              </motion.button>
            )}

            {/* Rejection feedback */}
            {typer.status === 'rejected' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
                style={{ ...navicueType.hint, color: 'hsla(0, 25%, 55%, 0.7)', fontStyle: 'italic' }}>
                weak language repelled...
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2, ease: 'easeOut' }}
              style={{ width: '60px', height: '60px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.08, 15), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '20px', color: themeColor(TH.accentHSL, 0.3, 25) }}>{'\u2728'}</div>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              {'\u201C'}{typer.value}{'\u201D'}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              the spell is cast — language rewires the chemistry
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>I create as I speak.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}