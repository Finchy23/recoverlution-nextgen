/**
 * BROADCAST #2 — The Subliminal Pulse
 * "You don't need to read it. Your amygdala sees it."
 * ARCHETYPE: Pattern A (Tap) — Each tap sends a subliminal flash, building safety
 * ENTRY: Cold Open — a barely-visible flash, then explanation
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';
const MESSAGES = ['safe', 'held', 'enough', 'here', 'calm'];

export default function Broadcast_SubliminalPulse({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [flashes, setFlashes] = useState(0);
  const [flashText, setFlashText] = useState('');
  const [showFlash, setShowFlash] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    // Cold open: single subliminal flash
    t(() => { setFlashText('safe'); setShowFlash(true); }, 600);
    t(() => setShowFlash(false), 650);
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const click = () => {
    if (stage !== 'active' || flashes >= 5) return;
    const n = flashes + 1;
    setFlashes(n);
    setFlashText(MESSAGES[n - 1]);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 50); // 50ms — below conscious threshold
    if (n >= 5) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px' }}>
            <div style={{ fontSize: '14px', fontFamily: 'monospace', color: palette.text, opacity: showFlash ? 0.06 : 0 }}>
              {flashText}
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={click}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: flashes >= 5 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              You don{'\u2019'}t need to read it. Your amygdala sees it. I am whispering to the sentry. Each tap sends a message below the threshold. You won{'\u2019'}t catch it. Your nervous system will.
            </div>
            <div style={{
              width: '160px', height: '60px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.03, 2),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                fontSize: '12px', fontFamily: 'monospace', color: palette.text,
                opacity: showFlash ? 0.04 : 0, transition: 'none',
                position: 'absolute',
              }}>
                {flashText}
              </div>
              {/* Accumulated safety glow */}
              <motion.div
                animate={{ opacity: flashes * 0.015 }}
                style={{
                  width: '100%', height: '100%', borderRadius: radius.sm,
                  background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.04, 8)}, transparent)`,
                }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {MESSAGES.map((_, i) => (
                <motion.div key={i} style={{ width: '20px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < flashes ? themeColor(TH.accentHSL, 0.3, 10) : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
            {flashes < 5 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>tap to transmit</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Subliminal Priming. Visual stimuli presented below the threshold of conscious awareness still activate semantic networks and influence emotional state. You didn{'\u2019'}t read those words. But your amygdala processed every one. The sentry received the message: you are safe.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Received.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}