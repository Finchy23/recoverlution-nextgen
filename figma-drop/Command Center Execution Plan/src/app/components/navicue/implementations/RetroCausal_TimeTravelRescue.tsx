/**
 * RETRO-CAUSAL #7 — The Time Travel Rescue
 * "They are still stuck there, waiting for someone to save them."
 * ARCHETYPE: Pattern E (Hold) — Hold to reach through time and hold their hand
 * ENTRY: Scene First — portal already open, the younger self visible within
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function RetroCausal_TimeTravelRescue({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [pulse, setPulse] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const animRef = useRef<number>(0);

  const hold = useHoldInteraction({
    maxDuration: 5000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    const animate = () => { setPulse(p => p + 0.02); animRef.current = requestAnimationFrame(animate); };
    animRef.current = requestAnimationFrame(animate);
    return () => { T.current.forEach(clearTimeout); cancelAnimationFrame(animRef.current); };
  }, []);

  const tension = hold.tension;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* Portal ring */}
              <motion.circle cx="80" cy="80" r="55" fill="none"
                stroke={themeColor(TH.accentHSL, 0.08, 8)} strokeWidth="1"
                initial={{ r: 53 }}
                animate={{ r: [53, 57, 53] }}
                transition={{ duration: 3, repeat: Infinity }} />
              <motion.circle cx="80" cy="80" r="45" fill={themeColor(TH.primaryHSL, 0.03, 2)} />
              {/* Small figure within */}
              <motion.circle cx="80" cy="80" r="5"
                fill={themeColor(TH.accentHSL, 0.1, 10)}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }} />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>someone is still waiting</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Your younger self is still stuck there, in that room, waiting for someone to walk in and say it{'\u2019'}s okay. You are the only one who can go back. Step through the portal. Hold their hand. Tell them what nobody told them.
            </div>
            <svg width="160" height="160" viewBox="0 0 160 160">
              <motion.circle cx="80" cy="80" r={50 + tension * 8} fill="none"
                stroke={themeColor(TH.accentHSL, 0.06 + tension * 0.12, 8)} strokeWidth={1 + tension * 1.5} />
              <circle cx="80" cy="80" r="40" fill={themeColor(TH.primaryHSL, 0.03 + tension * 0.03, 2)} />
              {/* Your hand reaching in */}
              <motion.line x1="20" y1="140" x2={50 + tension * 30} y2={100 - tension * 20}
                stroke={themeColor(TH.accentHSL, 0.1 + tension * 0.2, 10)} strokeWidth="2" strokeLinecap="round" />
              {/* Small figure */}
              <motion.circle cx="80" cy="80" r={5 + tension * 2}
                fill={themeColor(TH.accentHSL, 0.1 + tension * 0.15, 12)} />
              {/* Connection line */}
              {tension > 0.5 && (
                <motion.line x1={50 + tension * 30} y1={100 - tension * 20} x2="80" y2="80"
                  stroke={themeColor(TH.accentHSL, (tension - 0.5) * 0.3, 12)} strokeWidth="1"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              )}
            </svg>
            <div
              {...hold.holdProps}
              style={{
                ...hold.holdProps.style,
                padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06 + tension * 0.1, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}`,
                userSelect: 'none', touchAction: 'none',
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {hold.completed ? 'held' : hold.isHolding ? 'reaching\u2026' : 'hold to reach'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Connected. You entered the memory as your adult self and provided what was missing: the safety, the voice, the hand. This is imagery rescripting: the memory is rewritten not by erasing the pain, but by adding the rescue that never came. You came. Finally.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rescued.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}