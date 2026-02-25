/**
 * LOOP BREAKER #9 — The New Groove
 * "The new habit has no groove yet. Keep the needle down."
 * ARCHETYPE: Pattern E (Hold) — Hold to keep the needle in the new groove
 * ENTRY: Cold Open — "Scratch" → record player appears
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPill } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function LoopBreaker_NewGroove({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [rotation, setRotation] = useState(0);
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
    t(() => setStage('active'), 2000);
    const animate = () => { setRotation(r => r + 0.3); animRef.current = requestAnimationFrame(animate); };
    animRef.current = requestAnimationFrame(animate);
    return () => { T.current.forEach(clearTimeout); cancelAnimationFrame(animRef.current); };
  }, []);

  const tension = hold.tension;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ fontSize: '20px', fontFamily: 'serif', letterSpacing: '0.15em', color: palette.text, textAlign: 'center', fontStyle: 'italic' }}>
            scratch
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The new habit has no groove yet. It sounds scratchy. It feels fake. That{'\u2019'}s because the neural pathway has no myelin. Keep the needle down. Repetition wraps the wire. Play it again.
            </div>
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* Record */}
              <motion.circle cx="80" cy="80" r="65" fill={themeColor(TH.primaryHSL, 0.06, 3)}
                stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="0.5" />
              {/* Grooves */}
              {[20, 30, 40, 50, 58].map((r, i) => (
                <circle key={i} cx="80" cy="80" r={r} fill="none"
                  stroke={themeColor(TH.primaryHSL, 0.04, 3)} strokeWidth="0.5" />
              ))}
              {/* Center label */}
              <circle cx="80" cy="80" r="8" fill={themeColor(TH.accentHSL, 0.08, 5)} />
              {/* Needle */}
              <motion.line x1="80" y1="15" x2={80 + 45 * Math.cos((rotation + tension * 360) * Math.PI / 180)}
                y2={80 + 45 * Math.sin((rotation + tension * 360) * Math.PI / 180)}
                stroke={themeColor(TH.accentHSL, 0.15 + tension * 0.2, 10)} strokeWidth="1.5" />
              {/* New groove forming */}
              <motion.circle cx="80" cy="80" r={25 + tension * 20} fill="none"
                stroke={themeColor(TH.accentHSL, 0.05 + tension * 0.1, 8)}
                strokeWidth={0.5 + tension * 2} />
            </svg>
            <div
              {...hold.holdProps}
              style={{
                ...hold.holdProps.style,
                ...immersiveHoldPill(palette).base(tension),
              }}>
              <div style={immersiveHoldPill(palette).label}>
                {hold.completed ? 'groove cut' : hold.isHolding ? 'cutting\u2026' : 'hold to groove'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Groove cut. The needle tracked a new path. It will sound scratchy the first hundred times, then one morning it will sound like the song was always there. That{'\u2019'}s myelination. The wire wrapped. The new is becoming natural.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Playing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}