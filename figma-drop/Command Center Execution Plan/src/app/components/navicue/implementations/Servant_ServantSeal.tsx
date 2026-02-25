/**
 * SERVANT #10 — The Servant Seal (Helper's High)
 * "The cup that runs over waters the world."
 * ARCHETYPE: Pattern A (Tap) — Two hands forming a bowl, water overflows
 * ENTRY: Cold open — cupped hands
 * STEALTH KBE: Completion = Helper's High / Warm Glow effect
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'hands' | 'filling' | 'overflowing' | 'resonant' | 'afterglow';

export default function Servant_ServantSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('hands'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const pour = () => {
    if (stage !== 'hands') return;
    setStage('filling');
    t(() => setStage('overflowing'), 3000);
    t(() => {
      console.log(`[KBE:E] ServantSeal helpersHigh=confirmed warmGlow=true`);
      setStage('resonant');
    }, 7000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <svg width="40" height="24" viewBox="0 0 40 24">
              <path d="M5,12 Q10,20 20,20 Q30,20 35,12" fill="none"
                stroke={themeColor(TH.primaryHSL, 0.06, 3)} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}
        {stage === 'hands' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Cupped hands */}
            <svg width="80" height="50" viewBox="0 0 80 50">
              <path d="M10,25 Q15,40 40,42 Q65,40 70,25" fill={themeColor(TH.primaryHSL, 0.03, 1)}
                stroke={themeColor(TH.accentHSL, 0.08, 5)} strokeWidth="2" strokeLinecap="round" />
              <path d="M10,25 Q8,20 12,15" fill="none"
                stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1.5" />
              <path d="M70,25 Q72,20 68,15" fill="none"
                stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1.5" />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px' }}>
              Two hands. An offering. Fill the cup.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={pour}
              style={{ padding: '10px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Fill</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'filling' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <svg width="80" height="50" viewBox="0 0 80 50">
              <path d="M10,25 Q15,40 40,42 Q65,40 70,25" fill={themeColor(TH.accentHSL, 0.04, 2)}
                stroke={themeColor(TH.accentHSL, 0.1, 6)} strokeWidth="2" />
              <motion.ellipse cx="40" cy="30" rx="20" ry="6"
                fill={themeColor(TH.accentHSL, 0.06, 4)}
                initial={{ ry: 0 }} animate={{ ry: 8 }}
                transition={{ duration: 2.5 }} />
            </svg>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.25, 8), fontStyle: 'italic' }}>
              Filling...
            </div>
          </motion.div>
        )}
        {stage === 'overflowing' && (
          <motion.div key="of" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <svg width="80" height="60" viewBox="0 0 80 60">
                <path d="M10,25 Q15,40 40,42 Q65,40 70,25" fill={themeColor(TH.accentHSL, 0.06, 3)}
                  stroke={themeColor(TH.accentHSL, 0.12, 8)} strokeWidth="2" />
                <ellipse cx="40" cy="28" rx="22" ry="8" fill={themeColor(TH.accentHSL, 0.08, 4)} />
              </svg>
              {/* Overflow drops */}
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div key={i}
                  initial={{ y: 0, opacity: 0.3 }}
                  animate={{ y: 20, opacity: 0 }}
                  transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                  style={{ position: 'absolute', bottom: '-4px',
                    left: `${25 + i * 8}px`,
                    width: '2px', height: '6px', borderRadius: '1px',
                    background: themeColor(TH.accentHSL, 0.1, 6) }} />
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px',
              fontStyle: 'italic' }}>
              The cup runs over. The overflow waters the ground below. That{"'"}s not waste — that{"'"}s purpose. The cup that runs over waters the world.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Helper{"'"}s High. Acts of altruism release endorphins and oxytocin, producing a measurable euphoria (the "warm glow" effect). Research shows that givers live longer, report higher life satisfaction, and have lower cortisol levels than non-givers. Self-actualization — becoming your best self — is just the base camp. The summit is self-transcendence: giving yourself away so that life grows around you. The cup that runs over waters the world.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Overflowing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}