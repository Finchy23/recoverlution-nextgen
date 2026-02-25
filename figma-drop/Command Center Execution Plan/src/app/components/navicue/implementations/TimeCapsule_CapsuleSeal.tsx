/**
 * TIME CAPSULE #10 — The Capsule Seal
 * "Time is a circle. You have planted a seed in your own timeline."
 * ARCHETYPE: Pattern C (Draw) — Trace a circle to bury the capsule
 * ENTRY: Ambient Fade — earth, box, grass all appear together
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Identity Koan');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function TimeCapsule_CapsuleSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.25,
    minStrokes: 1,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const coverage = draw.coverage;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="200" height="120" viewBox="0 0 200 120">
              {/* Earth */}
              <rect x="0" y="70" width="200" height="50" fill={themeColor(TH.primaryHSL, 0.06, 3)} />
              {/* Box */}
              <motion.rect x="70" y="50" width="60" height="40" rx="3"
                fill={themeColor(TH.accentHSL, 0.08, 5)}
                stroke={themeColor(TH.accentHSL, 0.12, 8)} strokeWidth="0.5"
                initial={{ y: 30, opacity: 0 }} animate={{ y: 50, opacity: 1 }} transition={{ delay: 0.5, duration: 1.5 }} />
              {/* Grass blades */}
              {[40, 60, 80, 100, 120, 140, 160].map((x, i) => (
                <motion.line key={i} x1={x} y1={70} x2={x + 2} y2={60 - i % 3 * 3}
                  stroke={themeColor(TH.accentHSL, 0.06, 5)} strokeWidth="0.5"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.1 }} />
              ))}
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>earth is waiting</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              I am someone who plants seeds in their own timeline.
            </div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '200px', height: '200px', borderRadius: '50%', position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              overflow: 'hidden',
            }}>
              <svg width="200" height="200" viewBox="0 0 200 200" style={{ position: 'absolute', top: 0, left: 0 }}>
                {draw.strokes.map((s, si) => (
                  <polyline key={si} fill="none"
                    stroke={themeColor(TH.accentHSL, 0.15, 10)}
                    strokeWidth="2" strokeLinecap="round"
                    points={s.points.map(p => `${p.x * 200},${p.y * 200}`).join(' ')} />
                ))}
                {draw.currentStroke.length > 1 && (
                  <polyline fill="none"
                    stroke={themeColor(TH.accentHSL, 0.2, 12)}
                    strokeWidth="2" strokeLinecap="round"
                    points={draw.currentStroke.map(p => `${p.x * 200},${p.y * 200}`).join(' ')} />
                )}
              </svg>
              {/* Grass growing with coverage */}
              <motion.div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${coverage * 60}%`,
                background: `linear-gradient(to top, ${themeColor(TH.accentHSL, 0.06, 5)}, transparent)`,
              }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Buried. Grass grows over it now. Time is a circle — what you plant here ripples forward and backward. You are not waiting for the future. You are building it, one sealed capsule at a time. You are the archivist of your own becoming.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Planted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}