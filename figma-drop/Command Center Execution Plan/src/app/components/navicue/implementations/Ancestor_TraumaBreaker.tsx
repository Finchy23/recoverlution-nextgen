/**
 * ANCESTOR #4 -- The Trauma Breaker
 * "It ran in the family until it ran into you. You are the circuit breaker."
 * ARCHETYPE: Pattern C (Hold) -- Hold to block the domino chain
 * ENTRY: Cold open -- dominoes falling
 * STEALTH KBE: Holding through pain = Generative Commitment (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Ember');
type Stage = 'arriving' | 'falling' | 'active' | 'blocked' | 'resonant' | 'afterglow';

export default function Ancestor_TraumaBreaker({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:B] TraumaBreaker heldThrough=true generativeCommitment=confirmed`);
      setStage('blocked');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('falling'), 1500);
    t(() => setStage('active'), 3500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            {['GP', 'F', 'You', '?'].map((l, i) => (
              <div key={i} style={{ width: '12px', height: '24px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>{l}</span>
              </div>
            ))}
          </motion.div>
        )}
        {stage === 'falling' && (
          <motion.div key="f" initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            {['GP', 'F', 'You', '?'].map((l, i) => (
              <motion.div key={i} animate={{ rotate: i < 2 ? 45 : 0 }} transition={{ delay: i * 0.3, duration: 0.3 }}
                style={{ width: '12px', height: '24px', borderRadius: '2px',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                  transformOrigin: 'bottom right',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>{l}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The dominoes are falling. Hold your hand between You and the next generation.
            </div>
            <div {...hold.holdProps}
              style={{ padding: '14px 32px', borderRadius: '9999px', cursor: 'pointer', userSelect: 'none',
                background: hold.isHolding ? themeColor(TH.accentHSL, 0.1, 6) : themeColor(TH.accentHSL, 0.06, 4),
                border: `2px solid ${themeColor(TH.accentHSL, hold.isHolding ? 0.18 : 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>
                {hold.isHolding ? `absorbing... ${Math.round(hold.progress * 100)}%` : 'Hold to block'}
              </div>
            </div>
            {hold.isHolding && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...navicueType.hint, color: 'hsla(0, 20%, 40%, 0.3)' }}>
                {hold.progress < 0.5 ? 'it hurts...' : hold.progress < 0.8 ? 'absorbing the shock...' : 'almost through...'}
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'blocked' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Blocked. The chain stopped at you. The next generation is free. It ran in the family until it ran into you.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Generative commitment. Grandfather → Father → You → [Child]. You are the circuit breaker. Absorbing the shock is painful, but it saves the next line. It ran in the family until it ran into you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Broken.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}