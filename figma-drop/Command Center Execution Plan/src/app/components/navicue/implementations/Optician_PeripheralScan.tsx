/**
 * OPTICIAN #7 — The Peripheral Scan (Panoramic Vision)
 * "Tunnel vision is fear. Panoramic vision is safety. Soften your eyes."
 * ARCHETYPE: Pattern C (Hold) — Hold gaze on center dot while peripherals flash
 * ENTRY: Ambient fade — central dot materializes slowly
 * STEALTH KBE: Completion of duration = parasympathetic activation (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Practice');
type Stage = 'fade' | 'active' | 'soft' | 'resonant' | 'afterglow';

export default function Optician_PeripheralScan({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('fade');
  const [flashIndex, setFlashIndex] = useState(-1);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => {
      console.log(`[KBE:E] PeripheralScan completed=true duration=6000ms`);
      setStage('soft');
      t(() => setStage('resonant'), 4000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 9500);
    },
  });

  // Flash peripheral icons while holding
  useEffect(() => {
    if (stage !== 'active' || !hold.isHolding) return;
    const iv = window.setInterval(() => {
      setFlashIndex(Math.floor(Math.random() * 4));
      window.setTimeout(() => setFlashIndex(-1), 300);
    }, 800);
    return () => clearInterval(iv);
  }, [stage, hold.isHolding]);

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const corners = [
    { top: '8px', left: '8px' },
    { top: '8px', right: '8px' },
    { bottom: '8px', left: '8px' },
    { bottom: '8px', right: '8px' },
  ];
  const icons = ['\u25CB', '\u25B3', '\u25A1', '\u25C7']; // circle, triangle, square, diamond

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'fade' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.3, 10) }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Tunnel vision is fear. Panoramic vision is safety. Soften your eyes. See the edges.
            </div>
            <div {...hold.holdProps}
              style={{ width: '220px', height: '180px', borderRadius: radius.md, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.04, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 6)}`,
                touchAction: 'none', cursor: 'pointer', userSelect: 'none' }}>
              {/* Center dot */}
              <motion.div
                animate={{ scale: hold.isHolding ? [1, 1.2, 1] : 1, opacity: 0.5 + hold.tension * 0.3 }}
                transition={{ duration: 0.8, repeat: hold.isHolding ? Infinity : 0 }}
                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.4 + hold.tension * 0.3, 10) }} />
              {/* Corner flashes */}
              {corners.map((pos, i) => (
                <motion.div key={i}
                  animate={{ opacity: flashIndex === i ? 0.5 : 0.05, scale: flashIndex === i ? 1.3 : 1 }}
                  transition={{ duration: 0.15 }}
                  style={{ position: 'absolute', ...pos, fontSize: '16px',
                    color: themeColor(TH.accentHSL, 0.4, 15) }}>
                  {icons[i]}
                </motion.div>
              ))}
              {/* Progress ring */}
              <svg width="50" height="50" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <circle cx="25" cy="25" r="20" fill="none"
                  stroke={themeColor(TH.accentHSL, 0.08, 6)} strokeWidth="1" />
                <circle cx="25" cy="25" r="20" fill="none"
                  stroke={themeColor(TH.accentHSL, 0.2, 10)} strokeWidth="1.5"
                  strokeDasharray={`${hold.tension * 125.6} 125.6`}
                  transform="rotate(-90 25 25)" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {hold.isHolding ? 'don\u2019t look at the shapes. just notice them.' : 'hold the center dot'}
            </div>
          </motion.div>
        )}
        {stage === 'soft' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '12px', height: '12px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.3, 12),
                boxShadow: `0 0 30px ${themeColor(TH.accentHSL, 0.08, 15)}` }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>soft gaze achieved</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Peripheral awareness activates the parasympathetic nervous system. Tunnel vision is the sympathetic stress response. Softening your gaze literally shifts your nervous system into a safe state.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Panoramic.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}