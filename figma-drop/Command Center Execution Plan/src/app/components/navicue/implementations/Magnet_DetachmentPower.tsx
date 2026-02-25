/**
 * MAGNET #9 — The Detachment Power
 * "If you try to grab it, it flies. If you keep the hand open, it rests."
 * ARCHETYPE: Pattern E (Hold) — An open hand. Press and hold (keeping it open).
 * A bird slowly descends and lands. If you release too early = bird startles.
 * Outcome Independence.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldScene } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Magnet_DetachmentPower({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [birdStartled, setBirdStartled] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const hold = useHoldInteraction({
    maxDuration: 7000,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // If released before completion, bird startles briefly
  useEffect(() => {
    if (!hold.isHolding && !hold.completed && hold.tension > 0.1) {
      setBirdStartled(true);
      const t = window.setTimeout(() => setBirdStartled(false), 1200);
      timersRef.current.push(t);
    }
  }, [hold.isHolding, hold.completed, hold.tension]);

  const t = hold.tension;
  const birdY = 20 + (1 - t) * 0; // bird starts at top=20, descends with tension
  const birdDescend = 20 + (1 - t) * 60; // 80→20

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            An open hand...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>If you try to grab it, it flies. If you keep the hand open, it rests. Want nothing, have everything.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press and hold; keep the hand open, let the bird come</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, ...immersiveHoldScene(palette, 200, 180).base }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Open hand — palm up */}
                <g transform="translate(60, 110)">
                  {/* Palm */}
                  <ellipse cx="40" cy="20" rx="28" ry="14"
                    fill={themeColor(TH.primaryHSL, 0.05 + t * 0.02, 12)}
                    stroke={themeColor(TH.primaryHSL, 0.04, 10)} strokeWidth="0.3" />
                  {/* Fingers (open, relaxed) */}
                  {[
                    { x: 15, y: 12, a: -20 },
                    { x: 25, y: 6, a: -8 },
                    { x: 40, y: 4, a: 0 },
                    { x: 55, y: 6, a: 8 },
                    { x: 63, y: 14, a: 18 },
                  ].map((f, i) => (
                    <line key={i} x1={f.x} y1={f.y + 20} x2={f.x + Math.sin(f.a * Math.PI / 180) * 14} y2={f.y + 6}
                      stroke={themeColor(TH.primaryHSL, 0.05 + t * 0.015, 12)}
                      strokeWidth={2} strokeLinecap="round" />
                  ))}
                </g>

                {/* Bird — descends as you hold */}
                <motion.g
                  animate={{
                    y: birdStartled ? -20 : 0,
                    opacity: birdStartled ? 0.02 : 0.06 + t * 0.08,
                  }}
                  transition={{ type: 'spring', stiffness: birdStartled ? 100 : 20, damping: 10 }}>
                  {/* Bird body */}
                  <motion.ellipse cx="100" cy={80 - t * 60 + (birdStartled ? -30 : 0)} rx={4 + t * 2} ry={2 + t}
                    fill={themeColor(TH.accentHSL, 0.06 + t * 0.06, 15)}
                    initial={{ cy: 80 }}
                    animate={{ cy: 80 - t * 60 }}
                    transition={{ type: 'spring', stiffness: 15 }}
                  />
                  {/* Wings */}
                  <motion.line
                    x1={96 - t * 2} y1={78 - t * 60} x2={88 - t * 3} y2={74 - t * 60}
                    stroke={themeColor(TH.accentHSL, 0.05 + t * 0.04, 12)}
                    strokeWidth="0.5" strokeLinecap="round"
                    animate={{
                      y1: [78 - t * 60, 76 - t * 60, 78 - t * 60],
                      y2: [74 - t * 60, 70 - t * 60, 74 - t * 60],
                    }}
                    transition={{ duration: birdStartled ? 0.3 : 1.5, repeat: Infinity }}
                  />
                  <motion.line
                    x1={104 + t * 2} y1={78 - t * 60} x2={112 + t * 3} y2={74 - t * 60}
                    stroke={themeColor(TH.accentHSL, 0.05 + t * 0.04, 12)}
                    strokeWidth="0.5" strokeLinecap="round"
                    animate={{
                      y1: [78 - t * 60, 76 - t * 60, 78 - t * 60],
                      y2: [74 - t * 60, 70 - t * 60, 74 - t * 60],
                    }}
                    transition={{ duration: birdStartled ? 0.3 : 1.5, repeat: Infinity }}
                  />
                </motion.g>

                {/* Landing glow when bird reaches hand */}
                {hold.completed && (
                  <motion.circle cx="100" cy="125" r="15"
                    fill={themeColor(TH.accentHSL, 0.03, 12)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.03 }}
                    transition={{ duration: 2 }}
                  />
                )}

                <text x="100" y="170" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {hold.completed ? 'LANDED. the hand stayed open' :
                   birdStartled ? 'startled. hold longer next time' :
                   hold.isHolding ? `stillness: ${Math.round(t * 100)}%` :
                   'press and hold. keep the hand open'}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {hold.completed ? 'The bird landed. The hand stayed open. Want nothing, have everything.' :
                 birdStartled ? 'You released. The bird startled. Try again, hold longer.' :
                 hold.isHolding ? `${t < 0.3 ? 'Bird circling far. Keep holding.' : t < 0.7 ? 'Descending. Wings slower. Trust the stillness.' : 'Almost there. The bird is so close.'}` :
                 'An open hand. A bird in the sky. Press and hold.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.25, 0.5, 0.75, 1.0].map((threshold, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: t >= threshold ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You held the hand open. The bird circled, far at first, then closer, wings slowing. It descended. It landed. You did not close your fingers. If you try to grab it, it flies. If you keep the hand open, it rests. Want nothing, have everything. The paradox of attraction.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Outcome independence. Detachment from the specific result lowers performance anxiety and prevents needy micro-behaviors that trigger avoidance in others.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Grab. Open. Land.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}