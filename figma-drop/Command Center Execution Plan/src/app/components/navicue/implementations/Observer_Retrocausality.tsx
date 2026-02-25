/**
 * OBSERVER #7 — Retrocausality
 * "Heal the timeline."
 * ARCHETYPE: Pattern D (Type) — Rewrite what the past means
 * ENTRY: Reverse Reveal — the physics paradox first, then rewrite
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function Observer_Retrocausality({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const T = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const typer = useTypeInteraction({
    minLength: 3,
    onAccept: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 3500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'active') t(() => inputRef.current?.focus(), 300);
  }, [stage]);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              What you do today changes the meaning of what happened yesterday. If you win now, the past failure becomes training. You are rewriting history with every present action.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>now rewrite it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.5, textAlign: 'center' }}>
              Name a past failure. Now: what was it training you for?
            </div>
            <input ref={inputRef} type="text" value={typer.value}
              onChange={e => typer.onChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && typer.submit()}
              placeholder="it was training me for..."
              disabled={typer.accepted}
              style={{ width: '100%', padding: '12px 16px', fontSize: '15px', fontFamily: 'serif', fontStyle: 'italic',
                textAlign: 'center', background: themeColor(TH.voidHSL, 0.5, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.05, 10)}`, borderRadius: radius.sm, color: palette.text, outline: 'none' }} />
            {!typer.accepted && typer.value.length >= 3 && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', ...navicueType.hint, color: palette.textFaint }}>
                rewrite the timeline
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Delayed choice experiment. Decisions made in the present can influence the meaning of the past. You just rewrote history. The failure is now training. The timeline is healed.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Timeline healed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}