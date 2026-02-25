/**
 * DREAMWALKER #10 — The Walker Seal
 * "I am awake inside the dream."
 * ARCHETYPE: Pattern D (Type) — A sleeping figure with closed eyes.
 * Type the lucid declaration. The eyes open. The figure stands.
 * Conscious Living — lucid dreaming as metaphor for waking life.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function DreamWalker_WalkerSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const typer = useTypeInteraction({
    acceptPhrases: ['i am awake inside the dream', 'i am awake', 'i am lucid'],
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

  const sealed = typer.accepted;
  const typing = typer.value.length;
  const eyeOpen = sealed ? 1 : Math.min(typing / 25, 0.6);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A figure stirs...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Most people sleepwalk through their waking life too. The rarest skill is not falling asleep — it is waking up while still inside the dream. Declare it.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>speak the lucid declaration</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            {/* The sleeping/waking figure */}
            <div style={{ position: 'relative', width: '160px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 160 130">
                {/* Dream aura */}
                <motion.circle cx="80" cy="60" r={40 + eyeOpen * 10}
                  fill={themeColor(TH.accentHSL, 0.02 + eyeOpen * 0.02, 15)}
                  initial={{ r: 40 }}
                  animate={{ r: [40 + eyeOpen * 10, 45 + eyeOpen * 10, 40 + eyeOpen * 10] }}
                  transition={{ duration: 3, repeat: Infinity }} />

                {/* Head */}
                <ellipse cx="80" cy="50" rx="18" ry="20"
                  fill={themeColor(TH.accentHSL, 0.04, 10)}
                  stroke={themeColor(TH.accentHSL, 0.08, 15)} strokeWidth="0.5" />

                {/* Eyes — closed → opening → open */}
                <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: eyeOpen }}>
                  {/* Left eye */}
                  <ellipse cx="72" cy="48" rx="4" ry={2 + eyeOpen * 2}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.12 + eyeOpen * 0.08, 20)}
                    strokeWidth="0.5" />
                  {eyeOpen > 0.3 && (
                    <circle cx="72" cy="48" r={eyeOpen * 2}
                      fill={themeColor(TH.accentHSL, 0.15, 22)} />
                  )}
                  {/* Right eye */}
                  <ellipse cx="88" cy="48" rx="4" ry={2 + eyeOpen * 2}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.12 + eyeOpen * 0.08, 20)}
                    strokeWidth="0.5" />
                  {eyeOpen > 0.3 && (
                    <circle cx="88" cy="48" r={eyeOpen * 2}
                      fill={themeColor(TH.accentHSL, 0.15, 22)} />
                  )}
                </motion.g>

                {/* Closed eye lines — visible when eyes closed */}
                {eyeOpen < 0.3 && (
                  <g>
                    <line x1="68" y1="48" x2="76" y2="48"
                      stroke={themeColor(TH.accentHSL, 0.08, 15)} strokeWidth="0.5" />
                    <line x1="84" y1="48" x2="92" y2="48"
                      stroke={themeColor(TH.accentHSL, 0.08, 15)} strokeWidth="0.5" />
                  </g>
                )}

                {/* Body — rises when sealed */}
                <motion.rect x="68" y="72" width="24" height="30" rx="6"
                  fill={themeColor(TH.accentHSL, 0.04, 10)}
                  initial={{ y: 72, height: 30 }}
                  animate={{ y: sealed ? 68 : 72, height: sealed ? 38 : 30 }}
                  transition={{ duration: 1 }} />

                {/* Standing indicator */}
                {sealed && (
                  <motion.text x="80" y="120" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.2, 18)} letterSpacing="0.12em"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    LUCID
                  </motion.text>
                )}
              </svg>
            </div>

            {/* Input */}
            <motion.div
              key={typer.shakeCount}
              animate={typer.status === 'rejected' ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
              transition={{ duration: 0.5 }}
              style={{ width: '100%' }}>
              <input
                ref={inputRef}
                type="text"
                value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="I am awake inside the dream"
                disabled={typer.accepted}
                style={{
                  width: '100%', padding: '12px 16px', fontSize: '15px',
                  fontFamily: 'serif', fontStyle: 'italic', textAlign: 'center',
                  background: sealed
                    ? themeColor(TH.accentHSL, 0.06, 12)
                    : themeColor(TH.voidHSL, 0.5, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, sealed ? 0.15 : 0.05, 10)}`,
                  borderRadius: radius.sm,
                  color: sealed ? themeColor(TH.accentHSL, 0.7, 25) : palette.text,
                  outline: 'none', transition: 'all 0.5s ease', letterSpacing: '0.02em',
                }}
              />
            </motion.div>

            {!sealed && typer.value.length > 3 && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 18px',
                  ...navicueType.hint, color: palette.textFaint }}>
                declare it
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The eyes opened. Not in the dream — in life. Lucid dreaming is practice for lucid living. The question is never {'\u201C'}am I dreaming?{'\u201D'} It is {'\u201C'}am I awake?{'\u201D'}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>lucid living begins now</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>I am awake.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}