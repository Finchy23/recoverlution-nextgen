/**
 * BROADCAST #6 — The Digital Candle
 * "Quiet the room to steady the flame."
 * ARCHETYPE: Pattern A (Tap) — Tap to "quiet" the environment, flame steadies
 * ENTRY: Scene-First — a flickering flame already burning on black
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Broadcast_DigitalCandle({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [taps, setTaps] = useState(0);
  const [flickerAmt, setFlickerAmt] = useState(8);
  const [flickerX, setFlickerX] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    const flicker = setInterval(() => {
      setFlickerX((Math.random() - 0.5) * flickerAmt);
    }, 80);
    return () => { T.current.forEach(clearTimeout); clearInterval(flicker); };
  }, [flickerAmt]);

  const click = () => {
    if (stage !== 'active' || taps >= 4) return;
    const n = taps + 1;
    setTaps(n);
    setFlickerAmt(Math.max(1, 8 - n * 1.8)); // Reduce flicker
    if (n >= 4) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  const flameHeight = 40 + (taps * 5);
  const steadiness = taps / 4;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', width: '60px', height: '80px' }}>
              <motion.div
                animate={{ x: flickerX, scaleY: [0.95, 1.05, 0.98, 1.02, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
                style={{
                  position: 'absolute', bottom: '10px', left: '18px',
                  width: '24px', height: '40px', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  background: `linear-gradient(to top, hsla(30, 60%, 40%, 0.3), hsla(40, 50%, 50%, 0.15), transparent)`,
                }} />
              <div style={{ position: 'absolute', bottom: '0', left: '27px', width: '6px', height: '14px',
                background: themeColor(TH.primaryHSL, 0.08, 5), borderRadius: '2px' }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>flickering</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={click}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: taps >= 4 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              If the room is loud, the candle flickers. Quiet the room to steady the flame. Each tap removes a distraction. Watch the fire grow still.
            </div>
            <div style={{ position: 'relative', width: '80px', height: '100px' }}>
              {/* Flame glow */}
              <motion.div
                style={{
                  position: 'absolute', bottom: '20px', left: '10px',
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: `radial-gradient(circle, hsla(35, 55%, 45%, ${0.04 + steadiness * 0.06}), transparent)`,
                }} />
              {/* Flame body */}
              <motion.div
                animate={{ x: flickerX }}
                transition={{ duration: 0.08 }}
                style={{
                  position: 'absolute', bottom: '18px', left: `${28 - flameHeight * 0.15}px`,
                  width: `${24 + taps * 3}px`, height: `${flameHeight}px`,
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  background: `linear-gradient(to top, hsla(25, 60%, 40%, ${0.2 + steadiness * 0.15}), hsla(40, 50%, 50%, ${0.1 + steadiness * 0.08}), transparent)`,
                  transition: 'height 0.5s',
                }} />
              {/* Wick */}
              <div style={{ position: 'absolute', bottom: '0', left: '35px', width: '6px', height: '18px',
                background: themeColor(TH.primaryHSL, 0.08, 5), borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2, 3].map(i => (
                <motion.div key={i} style={{ width: '24px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.35, 10) : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
            {taps < 4 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>tap to quiet</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Biofeedback. Using visual feedback to reflect the environmental state trains you to unconsciously regulate your surroundings for optimal focus. The candle was never the point {'\u2014'} the quieting was. You steadied the flame by steadying the room.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Steady.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}