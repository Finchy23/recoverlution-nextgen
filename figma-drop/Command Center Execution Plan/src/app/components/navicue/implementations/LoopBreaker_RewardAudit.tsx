/**
 * LOOP BREAKER #5 — The Reward Audit
 * "You wouldn't do it if it didn't pay. Find the cheese."
 * ARCHETYPE: Pattern D (Type) — Type the hidden payoff you keep getting
 * ENTRY: Cold Open — "Cheese" appears, then the maze materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function LoopBreaker_RewardAudit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    minLength: 6,
    onAccept: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ fontSize: '24px', fontFamily: 'serif', letterSpacing: '0.2em', color: palette.text, textAlign: 'center' }}>
            CHEESE
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              You keep doing this. Why? You wouldn{'\u2019'}t do it if it didn{'\u2019'}t pay. Every behavior has a hidden reward: attention, victimhood, avoidance. Name the cheese. What is the secret payoff?
            </div>
            <svg width="180" height="80" viewBox="0 0 180 80">
              {/* Simple maze walls */}
              <rect x="10" y="10" width="160" height="60" rx="4" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.06, 5)} strokeWidth="0.5" />
              <line x1="50" y1="10" x2="50" y2="50" stroke={themeColor(TH.primaryHSL, 0.06, 5)} strokeWidth="0.5" />
              <line x1="90" y1="30" x2="90" y2="70" stroke={themeColor(TH.primaryHSL, 0.06, 5)} strokeWidth="0.5" />
              <line x1="130" y1="10" x2="130" y2="50" stroke={themeColor(TH.primaryHSL, 0.06, 5)} strokeWidth="0.5" />
              {/* Cheese at end */}
              <motion.circle cx="155" cy="40" r="5"
                fill={themeColor(TH.accentHSL, 0.15, 10)}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </svg>
            <textarea
              value={typeInt.value}
              onChange={e => typeInt.onChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); typeInt.submit(); } }}
              placeholder=""
              rows={2}
              style={{
                width: '240px', padding: '10px', borderRadius: radius.sm, resize: 'none',
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
                color: palette.text, fontFamily: 'inherit', fontSize: '13px', outline: 'none',
              }} />
            {typeInt.value.length > 0 && typeInt.value.length < 6 && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>name it</div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Found it. The hidden payoff. The behavior wasn{'\u2019'}t irrational. It was serving a function you didn{'\u2019'}t want to admit. Now that you{'\u2019'}ve named the cheese, you can find a healthier way to get the same reward. Or choose to stop needing it entirely.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Exposed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}