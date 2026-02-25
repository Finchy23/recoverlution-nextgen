/**
 * BROADCAST #9 — The Rhythm Background
 * "Do not watch it. Just let it be in your peripheral vision."
 * ARCHETYPE: Pattern C (Draw) — Draw a breathing pattern, the background adopts it
 * ENTRY: Ambient Fade — a subtle geometric shift already moving at 6 breaths/min
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart(
  'sensory_cinema',
  'Metacognition',
  'believing',
  'Practice'
);
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Broadcast_RhythmBackground({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [breathPhase, setBreathPhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.3,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2800);
    const breath = setInterval(() => setBreathPhase(p => p + 0.03), 50); // ~6 breaths/min cycle
    return () => { T.current.forEach(clearTimeout); clearInterval(breath); };
  }, []);

  const breathScale = 1 + Math.sin(breathPhase) * 0.08;
  const breathRotation = Math.sin(breathPhase * 0.5) * 3;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ scale: breathScale, rotate: breathRotation }}
              transition={{ duration: 0.05 }}
              style={{
                width: '120px', height: '120px', borderRadius: radius.md,
                border: `1px solid ${themeColor(TH.accentHSL, 0.05, 5)}`,
                background: themeColor(TH.primaryHSL, 0.03, 2),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: radius.sm,
                border: `1px solid ${themeColor(TH.accentHSL, 0.04, 8)}`,
                transform: `rotate(${-breathRotation * 2}deg)`,
              }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>already breathing</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Do not watch it. Just let it be in your peripheral vision. Your breath will match it automatically. Draw your own rhythm into the field below.
            </div>
            {/* Breathing geometry */}
            <motion.div
              animate={{ scale: breathScale, rotate: breathRotation }}
              transition={{ duration: 0.05 }}
              style={{
                width: '100px', height: '100px', borderRadius: radius.md,
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
                background: themeColor(TH.primaryHSL, 0.03, 2),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <div style={{
                width: '35px', height: '35px', borderRadius: radius.sm,
                border: `1px solid ${themeColor(TH.accentHSL, 0.05, 8)}`,
                transform: `rotate(${-breathRotation * 2}deg)`,
                transition: 'transform 0.1s',
              }} />
            </motion.div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '200px', height: '80px', borderRadius: radius.sm, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.03, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.05, 5)}`,
              overflow: 'hidden',
            }}>
              <svg width="200" height="80" viewBox="0 0 200 80" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                {draw.strokes.map((s, si) => (
                  <polyline key={si} fill="none"
                    stroke={themeColor(TH.accentHSL, 0.15, 10)}
                    strokeWidth="2" strokeLinecap="round"
                    points={s.points.map(p => `${p.x * 200},${p.y * 80}`).join(' ')} />
                ))}
                {draw.currentStroke.length > 1 && (
                  <polyline fill="none"
                    stroke={themeColor(TH.accentHSL, 0.2, 12)}
                    strokeWidth="2" strokeLinecap="round"
                    points={draw.currentStroke.map(p => `${p.x * 200},${p.y * 80}`).join(' ')} />
                )}
              </svg>
              <div style={{ position: 'absolute', bottom: '4px', right: '8px', fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.2 }}>
                draw your rhythm
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Unconscious Entrainment. The peripheral nervous system naturally aligns respiratory rate with dominant visual rhythms in the environment. Visual-Respiratory Coupling. You weren{'\u2019'}t watching the pattern {'\u2014'} but your breath was already following it. The background became the metronome.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Entrained.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}