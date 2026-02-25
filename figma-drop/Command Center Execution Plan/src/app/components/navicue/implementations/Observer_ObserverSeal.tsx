/**
 * OBSERVER #10 — The Observer Seal
 * "I am the Witness."
 * ARCHETYPE: Pattern D (Type) — Declaration: consciousness creates reality
 * ENTRY: Ambient Fade — eye + declaration arrive together
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'ambient' | 'resonant' | 'afterglow';

export default function Observer_ObserverSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const typer = useTypeInteraction({
    acceptPhrases: ['i am the witness', 'i am the observer', 'i am the screen', 'i am watching', 'i see'],
    onAccept: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => inputRef.current?.focus(), 1500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const g = Math.min(typer.value.length / 14, 1);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* The eye */}
            <svg width="140" height="80" viewBox="0 0 140 80">
              <motion.path d="M 10 40 Q 70 5 130 40 Q 70 75 10 40 Z"
                fill={themeColor(TH.voidHSL, 0.5, 2)}
                stroke={themeColor(TH.accentHSL, 0.1 + g * 0.1, 15)} strokeWidth="0.5" />
              <motion.circle cx="70" cy="40" r={12 + g * 4}
                fill={themeColor(TH.accentHSL, 0.08 + g * 0.1, 12)}
                animate={{ r: [12 + g * 4, 13 + g * 4, 12 + g * 4] }}
                transition={{ duration: 2.5, repeat: Infinity }} />
              <circle cx="70" cy="40" r="4" fill={themeColor(TH.voidHSL, 0.9, 0)} />
              {/* Light reflection */}
              <circle cx="75" cy="36" r="1.5" fill={themeColor(TH.accentHSL, 0.15 + g * 0.1, 25)} />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Without you, there is no movie. You are the screen, the projector, and the audience.
            </div>
            <motion.div key={typer.shakeCount}
              animate={typer.status === 'rejected' ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              style={{ width: '100%' }}>
              <input ref={inputRef} type="text" value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && typer.submit()}
                placeholder="I am the witness"
                disabled={typer.accepted}
                style={{ width: '100%', padding: '12px 16px', fontSize: '15px', fontFamily: 'serif', fontStyle: 'italic',
                  textAlign: 'center', background: themeColor(TH.voidHSL, 0.5, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, typer.accepted ? 0.2 : 0.05, 10)}`, borderRadius: radius.sm,
                  color: palette.text, outline: 'none' }} />
            </motion.div>
            {!typer.accepted && typer.value.length > 3 && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', ...navicueType.hint, color: palette.textFaint }}>
                seal
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Biocentrism. Life creates the universe rather than the other way around. You are not in the world — the world is in you. The eye opened. Reality appeared. You are the witness.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>I am the Witness.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}