/**
 * LOOP BREAKER #3 — The Glitch Injection
 * "Crash the autopilot. If you are weird, you cannot be habitual."
 * ARCHETYPE: Pattern A (Tap) — Tap to inject glitches into the screen
 * ENTRY: Scene First — screen already flickering, text emerges from static
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { LOOPBREAKER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart(
  'pattern_glitch',
  'Metacognition',
  'believing',
  'Storm'
);
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

const GLITCHES = [
  'jump',
  'shout a nonsense word',
  'touch your left ear with your right hand',
];

export default function LoopBreaker_GlitchInjection({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [glitchIndex, setGlitchIndex] = useState(0);
  const [flickerPhase, setFlickerPhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const animRef = useRef<number>(0);

  useEffect(() => {
    t(() => setStage('active'), 2200);
    const animate = () => { setFlickerPhase(p => p + 0.1); animRef.current = requestAnimationFrame(animate); };
    animRef.current = requestAnimationFrame(animate);
    return () => { T.current.forEach(clearTimeout); cancelAnimationFrame(animRef.current); };
  }, []);

  const inject = () => {
    if (stage !== 'active' || glitchIndex >= 3) return;
    const n = glitchIndex + 1;
    setGlitchIndex(n);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '220px', height: '80px', position: 'relative', overflow: 'hidden', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.04, 3) }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} style={{
                  position: 'absolute',
                  top: `${20 + i * 15 + Math.sin(flickerPhase + i * 2) * 3}px`,
                  left: `${10 + Math.cos(flickerPhase + i) * 5}px`,
                  width: `${80 + i * 20}px`, height: '2px',
                  background: themeColor(TH.accentHSL, 0.06 + Math.sin(flickerPhase * 0.3 + i) * 0.03, 5),
                }}
                  animate={{ opacity: [0.3, 0.6, 0.2] }}
                  transition={{ duration: 0.5 + i * 0.2, repeat: Infinity }} />
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>signal disrupted</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={inject}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: glitchIndex >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The loop runs on autopilot. Crash the autopilot. Do something random right now, something that has zero logical connection to your current situation. If you are weird, you cannot be habitual.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '220px' }}>
              {GLITCHES.map((g, i) => (
                <motion.div key={i} style={{
                  padding: '12px 14px', borderRadius: radius.sm,
                  background: i < glitchIndex ? themeColor(TH.accentHSL, 0.08, 5) : themeColor(TH.primaryHSL, 0.03, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, i < glitchIndex ? 0.12 : 0.04, 5)}`,
                  fontSize: '12px', color: i < glitchIndex ? palette.text : palette.textFaint,
                  fontFamily: 'monospace',
                }}
                  animate={{ x: i < glitchIndex ? [0, 4, -2, 0] : 0 }}
                  transition={{ duration: 0.3 }}>
                  {i < glitchIndex ? `\u2713 ${g}` : `\u25A0 ???`}
                </motion.div>
              ))}
            </div>
            {glitchIndex < 3 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>inject glitch</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Pattern interrupted. The sudden, unexpected stimulus disrupted the neural firing pattern. For a brief moment, the autopilot crashed and you were in manual control. That window of weirdness is the window of change.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Disrupted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}