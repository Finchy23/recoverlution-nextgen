/**
 * OBSERVER #3 — Spooky Action
 * "Distance is an illusion."
 * ARCHETYPE: Pattern D (Type) — Name the entangled one
 * ENTRY: Reverse Reveal — the physics first, then the personal
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function Observer_SpookyAction({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const T = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const typer = useTypeInteraction({
    minLength: 2,
    onAccept: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => setStage('active'), 3500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'active') t(() => inputRef.current?.focus(), 300);
  }, [stage]);

  const g = Math.min(typer.value.length / 10, 1);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Particles that have interacted remain connected forever, sharing a state regardless of separation. Einstein called it spooky action at a distance. You are entangled with everyone you have ever loved.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>now name them</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* Two entangled particles */}
            <svg width="200" height="80" viewBox="0 0 200 80">
              <motion.circle cx="40" cy="40" r="12"
                fill={themeColor(TH.accentHSL, 0.1 + g * 0.1, 12)}
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <motion.circle cx="160" cy="40" r="12"
                fill={themeColor(TH.accentHSL, 0.1 + g * 0.1, 12)}
                animate={{ scale: [1.05, 1, 1.05] }} transition={{ duration: 1.5, repeat: Infinity }} />
              {/* Entanglement thread */}
              <motion.line x1="52" y1="40" x2="148" y2="40"
                stroke={themeColor(TH.accentHSL, 0.04 + g * 0.08, 15)} strokeWidth="0.5" strokeDasharray="3 4" />
              <text x="100" y="68" textAnchor="middle" fontSize="11" fontFamily="monospace"
                fill={themeColor(TH.accentHSL, 0.08, 10)} letterSpacing="0.08em">ENTANGLED</text>
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.5, textAlign: 'center' }}>
              Who are you still entangled with?
            </div>
            <input ref={inputRef} type="text" value={typer.value}
              onChange={e => typer.onChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && typer.submit()}
              placeholder="a name..."
              disabled={typer.accepted}
              style={{ width: '100%', padding: '12px 16px', fontSize: '15px', fontFamily: 'serif', fontStyle: 'italic',
                textAlign: 'center', background: themeColor(TH.voidHSL, 0.5, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.05, 10)}`, borderRadius: radius.sm, color: palette.text, outline: 'none' }} />
            {!typer.accepted && typer.value.length >= 2 && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', ...navicueType.hint, color: palette.textFaint }}>
                tug the thread
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Quantum entanglement. Space cannot separate what was once connected. You tugged the thread. Somewhere, somehow, they felt it. Distance is an illusion.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Still connected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}