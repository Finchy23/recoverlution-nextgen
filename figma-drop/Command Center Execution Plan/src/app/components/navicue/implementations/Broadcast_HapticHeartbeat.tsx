/**
 * BROADCAST #3 — The Haptic Heartbeat
 * "I am here. You are not alone in this room."
 * ARCHETYPE: Pattern E (Hold) — Hold to feel the heartbeat, companionship grows
 * ENTRY: Scene-First — a double-beat pulse already visible
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPill } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Broadcast_HapticHeartbeat({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [beatPhase, setBeatPhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    // Double-beat heartbeat: thump-thump ... thump-thump
    const beat = setInterval(() => {
      setBeatPhase(1);
      setTimeout(() => setBeatPhase(0), 100);
      setTimeout(() => { setBeatPhase(2); setTimeout(() => setBeatPhase(0), 100); }, 200);
    }, 1200);
    return () => { T.current.forEach(clearTimeout); clearInterval(beat); };
  }, []);

  const tension = hold.tension;
  const heartScale = beatPhase > 0 ? 1.08 : 1;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ scale: heartScale }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 5),
              }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>thump-thump</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              I am here. You are not alone in this room. Feel the pulse. It is a reminder to breathe. Hold on to the heartbeat.
            </div>
            <motion.div
              animate={{ scale: heartScale }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              style={{
                width: `${60 + tension * 20}px`, height: `${60 + tension * 20}px`, borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.1 + tension * 0.1, 8)}, ${themeColor(TH.accentHSL, 0.03, 3)})`,
                transition: 'width 0.5s, height 0.5s',
              }} />
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              ...immersiveHoldPill(palette).base(tension),
            }}>
              <div style={immersiveHoldPill(palette).label}>
                {hold.completed ? 'accompanied' : hold.isHolding ? 'feeling\u2026' : 'hold to feel'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Social Presence via Haptics. Simulating a heartbeat creates a sense of companionship, reducing the physiological markers of loneliness and isolation. You were never alone in this room. The pulse was always here. You just needed to hold still long enough to feel it.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Accompanied.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}