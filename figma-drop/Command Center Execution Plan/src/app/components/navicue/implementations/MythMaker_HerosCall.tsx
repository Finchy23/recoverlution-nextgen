/**
 * MYTHMAKER #3 — The Hero's Call
 * "The cave you fear to enter holds the treasure you seek."
 * ARCHETYPE: Pattern A (Tap) — A phone ringing in an empty room.
 * 5 taps: each tap makes the ring louder and the room brighter.
 * On final tap the phone is answered. Approach Motivation.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYTHMAKER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MYTHMAKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STEPS = 5;

export default function MythMaker_HerosCall({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const [ringPulse, setRingPulse] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Pulsing ring animation
  useEffect(() => {
    if (stage !== 'active' || taps >= STEPS) return;
    const interval = window.setInterval(() => setRingPulse(p => !p), 800);
    return () => clearInterval(interval);
  }, [stage, taps]);

  const answer = () => {
    if (stage !== 'active' || taps >= STEPS) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = taps / STEPS;
  const roomLight = 0.02 + t * 0.06;
  const answered = taps >= STEPS;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something is ringing...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The adventure is calling. You can hang up, but it will ring again. The cave you fear to enter holds the treasure you seek.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to answer the call</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '300px' }}>

            {/* The room — darkens with light from phone */}
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, 1) }}>

              {/* Room glow — increases with taps */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at 50% 65%, ${themeColor(TH.accentHSL, roomLight, 12)}, transparent 70%)`,
                transition: 'all 0.6s ease',
              }} />

              {/* Floor line */}
              <div style={{ position: 'absolute', bottom: '40px', left: '20px', right: '20px', height: '1px',
                background: themeColor(TH.primaryHSL, 0.04 + t * 0.03, 8) }} />

              {/* The phone */}
              <motion.div
                onClick={answer}
                animate={!answered ? { rotate: ringPulse ? [-3, 3, -3] : [3, -3, 3] } : { rotate: 0 }}
                transition={{ duration: 0.3, repeat: !answered ? 2 : 0 }}
                style={{
                  position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)',
                  cursor: answered ? 'default' : 'pointer',
                }}>
                {/* Phone body */}
                <svg width="40" height="50" viewBox="0 0 40 50">
                  {/* Base */}
                  <rect x="8" y="20" width="24" height="28" rx="4" fill={themeColor(TH.primaryHSL, 0.12, 8)} />
                  {/* Receiver */}
                  <motion.rect
                    x="6" y={answered ? 8 : 5} width="28" height="10" rx="5"
                    fill={themeColor(TH.accentHSL, 0.15 + t * 0.08, 12)}
                    animate={!answered ? { y: ringPulse ? 3 : 7 } : { y: 20, opacity: 0.5 }}
                    transition={{ duration: 0.2 }}
                  />
                  {/* Ring waves */}
                  {!answered && (
                    <>
                      <motion.circle cx="20" cy="8" r={12 + taps * 3}
                        fill="none" stroke={themeColor(TH.accentHSL, 0.06, 15)} strokeWidth="0.5"
                        initial={{ r: 12 + taps * 3, opacity: 0.06 }}
                        animate={{ r: [12 + taps * 3, 20 + taps * 3], opacity: [0.06, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }} />
                      <motion.circle cx="20" cy="8" r={8 + taps * 2}
                        fill="none" stroke={themeColor(TH.accentHSL, 0.04, 10)} strokeWidth="0.3"
                        initial={{ r: 8 + taps * 2, opacity: 0.12 }}
                        animate={{ r: [8 + taps * 2, 16 + taps * 2], opacity: [0.04, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
                    </>
                  )}
                </svg>
              </motion.div>

              {/* Door outline — becomes visible as room brightens */}
              <motion.div
                animate={{ opacity: t * 0.15 }}
                style={{
                  position: 'absolute', top: '20px', right: '30px',
                  width: '30px', height: '60px', borderRadius: `${radius.lg} ${radius.lg} 0 0`,
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 10)}`,
                  borderBottom: 'none',
                }} />
            </div>

            {/* Tap counter */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {Array.from({ length: STEPS }, (_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.2, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)', transition: 'all 0.3s ease' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You answered. The refusal of the call is the start of the tragedy. The acceptance is the start of the adventure.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the hero has entered the story</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The adventure begins.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}