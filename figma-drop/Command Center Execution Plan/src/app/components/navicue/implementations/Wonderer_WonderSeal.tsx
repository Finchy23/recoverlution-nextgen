/**
 * WONDERER #10 — The Wonder Seal (Epistemic Curiosity)
 * "The universe is hiding in the details. Keep looking."
 * ARCHETYPE: Pattern A (Tap) — Magnifying glass over grain of sand reveals galaxy
 * ENTRY: Cold open — a grain
 * STEALTH KBE: Completion = Epistemic Curiosity / nucleus accumbens reward
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Identity Koan');
type Stage = 'arriving' | 'grain' | 'zooming' | 'galaxy' | 'resonant' | 'afterglow';

export default function Wonderer_WonderSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('grain'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const look = () => {
    if (stage !== 'grain') return;
    setStage('zooming');
    t(() => setStage('galaxy'), 2000);
    t(() => {
      console.log(`[KBE:K] WonderSeal epistemicCuriosity=confirmed nucleusAccumbens=activated`);
      setStage('resonant');
    }, 7500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
  };

  const STARS = Array.from({ length: 16 }).map((_, i) => ({
    angle: (i / 16) * Math.PI * 4,
    dist: 6 + (i / 16) * 28,
    size: 1 + Math.random() * 1.2,
    bright: 0.1 + Math.random() * 0.15,
  }));

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '4px', height: '4px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.1, 5) }} />
        )}
        {stage === 'grain' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>
              a grain of sand
            </div>
            <div style={{ position: 'relative', width: '60px', height: '60px',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Magnifying glass */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '40%',
                  background: themeColor(TH.primaryHSL, 0.12, 6) }} />
              </div>
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px',
                width: '12px', height: '2px', borderRadius: '1px',
                background: themeColor(TH.primaryHSL, 0.08, 5),
                transform: 'rotate(45deg)' }} />
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={look}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Look closer</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'zooming' && (
          <motion.div key="z" initial={{ scale: 1, opacity: 1 }} animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.8 }}
            style={{ width: '4px', height: '4px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.12, 6) }} />
        )}
        {stage === 'galaxy' && (
          <motion.div key="gal" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, type: 'spring', damping: 15 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {STARS.map((s, i) => (
                <motion.div key={i} animate={{ opacity: [s.bright, s.bright + 0.1, s.bright] }}
                  transition={{ duration: 2 + i * 0.2, repeat: Infinity }}
                  style={{ position: 'absolute',
                    left: `${40 + Math.cos(s.angle) * s.dist}px`,
                    top: `${40 + Math.sin(s.angle) * s.dist}px`,
                    width: `${s.size}px`, height: `${s.size}px`, borderRadius: '50%',
                    background: themeColor(TH.accentHSL, s.bright + 0.05, 8 + i % 6) }} />
              ))}
              <div style={{ width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.25, 12),
                boxShadow: `0 0 6px ${themeColor(TH.accentHSL, 0.06, 8)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px',
              fontStyle: 'italic' }}>
              Inside the grain of sand: a galaxy. The universe is hiding in the details. Keep looking.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Epistemic curiosity. The desire to obtain new knowledge stimulates the nucleus accumbens, the brain{"'"}s reward center, similarly to food, sex, and social bonding. Curiosity isn{"'"}t just a trait; it{"'"}s a neurobiological drive. The grain of sand contains a galaxy because every detail, examined closely enough, reveals infinite depth. Keep looking.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Infinite.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}