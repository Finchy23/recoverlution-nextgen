/**
 * TUNER #10 — The Tuner Seal (The Proof)
 * "You are an instrument. You are now in tune."
 * ARCHETYPE: Pattern A (Tap) — Tap the tuning fork, watch resonance propagate
 * ENTRY: Cold Open — a tuning fork silhouette appears, vibrating
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function Tuner_TunerSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [struck, setStruck] = useState(false);
  const [rings, setRings] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const strike = () => {
    if (stage !== 'active' || struck) return;
    setStruck(true);
    // Propagate rings
    let count = 0;
    const ring = setInterval(() => {
      count++;
      setRings(count);
      if (count >= 5) {
        clearInterval(ring);
        t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
      }
    }, 600);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
              animate={{ x: [-1, 1, -1] }}
              transition={{ duration: 0.08, repeat: Infinity }}
              style={{ fontSize: '48px', color: palette.text, fontFamily: 'serif', opacity: 0.5 }}>
              {'\u2442'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={strike}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: struck ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              You are an instrument. Strike the fork. Feel the resonance spread through the whole body.
            </div>
            <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Radiating rings */}
              {Array.from({ length: rings }, (_, i) => (
                <motion.div key={i}
                  initial={{ scale: 0.3, opacity: 0.3 }}
                  animate={{ scale: 1 + i * 0.4, opacity: 0 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
                    border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}`,
                  }} />
              ))}
              {/* Tuning fork */}
              <motion.div
                animate={struck ? { x: [-2, 2, -1.5, 1.5, -1, 1, -0.5, 0.5, 0], transition: { duration: 3, ease: 'easeOut' } } : { x: 0 }}
                style={{
                  width: '8px', height: '80px', borderRadius: radius.xs,
                  background: themeColor(TH.accentHSL, struck ? 0.25 : 0.1, 10),
                  position: 'relative',
                }}>
                {/* Fork tines */}
                <div style={{
                  position: 'absolute', top: '-30px', left: '-8px',
                  width: '8px', height: '35px', borderRadius: `${radius.xs} ${radius.xs} 0 0`,
                  background: themeColor(TH.accentHSL, struck ? 0.2 : 0.08, 8),
                }} />
                <div style={{
                  position: 'absolute', top: '-30px', right: '-8px',
                  width: '8px', height: '35px', borderRadius: `${radius.xs} ${radius.xs} 0 0`,
                  background: themeColor(TH.accentHSL, struck ? 0.2 : 0.08, 8),
                }} />
              </motion.div>
            </div>
            {!struck && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>strike</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Interoceptive Accuracy {':'} the ability to perceive the internal state of the body. You just trained yourself to feel subtle physiological shifts. The fork is struck. The resonance spreads. You are an instrument, and you are now in tune.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>In tune.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}