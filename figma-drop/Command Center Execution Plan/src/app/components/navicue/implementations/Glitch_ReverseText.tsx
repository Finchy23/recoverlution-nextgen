/**
 * GLITCH #3 — The Reverse Text
 * "Comfort makes you sleep. Difficulty wakes you up. Work for the meaning."
 * ARCHETYPE: Pattern E (Hold) — Hold to slowly decode the reversed text
 * ENTRY: Instruction-as-poetry — backwards text appears immediately
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPill } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'active' | 'resonant' | 'afterglow';

const MESSAGE = 'You are stronger than the story you tell yourself.';
const REVERSED = MESSAGE.split('').reverse().join('');

export default function Glitch_ReverseText({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 6000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Interpolate between reversed and normal based on tension
  const tension = hold.tension;
  const charCount = MESSAGE.length;
  const revealedCount = Math.floor(tension * charCount);
  const displayText = MESSAGE.split('').map((ch, i) =>
    i < revealedCount ? ch : REVERSED[charCount - 1 - i]
  ).join('');

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ fontFamily: 'monospace', fontSize: '13px', color: palette.text, textAlign: 'center',
              maxWidth: '280px', direction: 'rtl' as any }}>
            {REVERSED}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '13px', color: palette.text, textAlign: 'center',
              letterSpacing: '0.02em', lineHeight: 1.6, transition: 'all 0.2s' }}>
              {hold.completed ? MESSAGE : displayText}
            </div>
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              ...immersiveHoldPill(palette).base(tension),
            }}>
              <div style={immersiveHoldPill(palette).label}>
                {hold.completed ? 'decoded' : hold.isHolding ? 'decoding\u2026' : 'hold to decode'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Disfluency Effect. Information that is slightly difficult to process is retained better and processed more deeply than easy information. The work of decoding forced you to really read it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Earned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}