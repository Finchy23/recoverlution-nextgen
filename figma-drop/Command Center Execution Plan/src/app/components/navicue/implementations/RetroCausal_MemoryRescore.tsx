/**
 * RETRO-CAUSAL #1 — The Memory Rescore
 * "The visual is the same. The soundtrack is your choice."
 * ARCHETYPE: Pattern B (Drag) — Drag the music fader from horror to comedy
 * ENTRY: Scene First — b&w film already playing, text emerges from the image
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { RETROCAUSAL_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function RetroCausal_MemoryRescore({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [flicker, setFlicker] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const animRef = useRef<number>(0);

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    const animate = () => { setFlicker(p => p + 0.05); animRef.current = requestAnimationFrame(animate); };
    animRef.current = requestAnimationFrame(animate);
    return () => { T.current.forEach(clearTimeout); cancelAnimationFrame(animRef.current); };
  }, []);

  const progress = drag.progress;
  const hue = 0 + progress * 60; // horror (red) → comedy (warm yellow)

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '220px', height: '130px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.05, 2), position: 'relative', overflow: 'hidden' }}>
              {/* Film grain effect */}
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i} style={{
                  position: 'absolute',
                  top: `${10 + Math.sin(flicker + i * 2) * 30}%`,
                  left: `${10 + Math.cos(flicker + i) * 30}%`,
                  width: '1px', height: '1px', borderRadius: '50%',
                  background: `rgba(255,255,255,${0.05 + Math.sin(flicker * 3 + i) * 0.03})`,
                }} />
              ))}
              {/* Sprocket holes */}
              <div style={{ position: 'absolute', left: '4px', top: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ width: '6px', height: '8px', borderRadius: '1px', background: 'rgba(255,255,255,0.03)' }} />
                ))}
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>the footage is playing</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The visual doesn{'\u2019'}t change. But the soundtrack is yours to choose. Slide the music from horror score to slapstick. Make the memory absurd. Laugh at it. The emotional tag will follow.
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.4 }}>HORROR</div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.4 }}>COMEDY</div>
            </div>
            <div {...drag.dragProps} style={{ ...drag.dragProps.style, width: '220px', height: '36px', borderRadius: radius.full, position: 'relative',
              background: `linear-gradient(to right, ${themeColor(TH.primaryHSL, 0.06, 2)}, ${themeColor(TH.accentHSL, 0.06, 8)})` }}>
              <motion.div
                style={{
                  position: 'absolute', top: '3px', left: `${5 + progress * 175}px`,
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: `hsla(${hue}, 20%, ${30 + progress * 15}%, ${0.2 + progress * 0.2})`,
                  border: `1px solid hsla(${hue}, 25%, 40%, 0.2)`,
                  pointerEvents: 'none',
                }} />
            </div>
            <motion.div style={{
              width: '220px', height: '40px', borderRadius: radius.xs, overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: palette.textFaint,
                opacity: 0.3 + progress * 0.3 }}>
                {progress < 0.3 ? '\u266B minor key...' : progress < 0.7 ? '\u266B shifting...' : '\u266B benny hill theme'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Rescored. The memory was reactivated and paired with a mismatching emotion. That{'\u2019'}s memory reconsolidation: the emotional tag is now labile, rewritable. You didn{'\u2019'}t erase the memory. You changed the music. And the music changes everything.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rescored.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}