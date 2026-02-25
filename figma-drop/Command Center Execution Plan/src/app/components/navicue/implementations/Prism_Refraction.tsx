/**
 * PRISM #1 — The Refraction
 * "Do not stare at the white light. Split it."
 * ARCHETYPE: Pattern A (Tap ×3) — Break overwhelming white into R, G, B
 * ENTRY: Cold Open — word "SPLIT" appears, then scene materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

const SPLITS = [
  { color: 'hsla(0, 45%, 40%, 0.7)', label: 'RED', desc: 'the anger that protects' },
  { color: 'hsla(120, 30%, 35%, 0.7)', label: 'GREEN', desc: 'the growth that heals' },
  { color: 'hsla(220, 40%, 45%, 0.7)', label: 'BLUE', desc: 'the depth that understands' },
];

export default function Prism_Refraction({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const split = () => {
    if (stage !== 'active' || taps >= 3) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ fontSize: '28px', fontFamily: 'serif', letterSpacing: '0.2em', color: palette.text, textAlign: 'center' }}>
            SPLIT
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={split}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: taps >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The problem is too big because it is white light: overwhelming and blinding. Pass it through the prism. Break it into colors. Tackle them one by one.
            </div>
            <svg width="220" height="160" viewBox="0 0 220 160">
              {/* White beam */}
              <motion.line x1="0" y1="80" x2="80" y2="80"
                stroke={`hsla(0, 0%, 90%, ${0.15 - taps * 0.04})`} strokeWidth="3" />
              {/* Prism */}
              <polygon points="80,40 80,120 130,80" fill={themeColor(TH.primaryHSL, 0.12, 8)}
                stroke={themeColor(TH.accentHSL, 0.1, 10)} strokeWidth="0.5" />
              {/* Split beams */}
              {SPLITS.map((s, i) => (
                <motion.line key={i} x1="130" y1="80"
                  x2="220" y2={50 + i * 30}
                  stroke={i < taps ? s.color : themeColor(TH.primaryHSL, 0.04, 5)}
                  strokeWidth={i < taps ? 2 : 0.5}
                  animate={{ opacity: i < taps ? 1 : 0.3 }}
                  transition={{ duration: 0.6 }} />
              ))}
              {/* Labels */}
              {SPLITS.map((s, i) => i < taps && (
                <motion.text key={`t-${i}`} x="205" y={54 + i * 30} fontSize="11" fontFamily="monospace"
                  fill={s.color} initial={{ opacity: 0 }} animate={{ opacity: 1 }} textAnchor="end">
                  {s.label}
                </motion.text>
              ))}
            </svg>
            <div style={{ display: 'flex', gap: '8px' }}>
              {SPLITS.map((s, i) => (
                <motion.div key={i} style={{ width: '24px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < taps ? s.color : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
            {taps < 3 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>split it</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Three colors. Three problems, each with a name. "I{'\u2019'}m failing" became red, green, blue: anger that protects, growth that heals, depth that understands. First principles. Break the white light.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Split it.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}