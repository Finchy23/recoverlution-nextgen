/**
 * PRISM #7 — The Shadow Cast
 * "The brighter the light, the darker the shadow."
 * ARCHETYPE: Pattern A (Tap ×3) — Each tap brightens light, deepens shadow
 * ENTRY: Scene First — visual is already alive, text emerges within
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'resonant' | 'afterglow';

export default function Prism_ShadowCast({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [taps, setTaps] = useState(0);
  const [textVisible, setTextVisible] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setTextVisible(true), 1500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const brighten = () => {
    if (stage !== 'scene' || taps >= 3) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  const d = taps / 3;
  const lightBright = 30 + d * 50;
  const shadowDark = 8 - d * 6;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={brighten}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: taps >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <svg width="200" height="160" viewBox="0 0 200 160">
              {/* Light source */}
              <motion.circle cx="60" cy="40" r={12 + d * 8}
                fill={`hsla(45, 40%, ${lightBright}%, ${0.1 + d * 0.15})`}
                animate={{ r: [12 + d * 8, 14 + d * 8, 12 + d * 8] }}
                transition={{ duration: 2, repeat: Infinity }} />
              {/* Object */}
              <rect x="85" y="50" width="30" height="60" rx="4"
                fill={themeColor(TH.primaryHSL, 0.2 + d * 0.1, 10)} />
              {/* Shadow — darkens as light brightens */}
              <motion.path d="M 115 110 L 175 130 L 175 110 L 115 50 Z"
                fill={`hsla(${TH.voidHSL[0]}, ${TH.voidHSL[1]}%, ${shadowDark}%, ${0.3 + d * 0.4})`}
                animate={{ opacity: 0.3 + d * 0.4 }} />
              {/* Light rays */}
              {Array.from({ length: 3 + taps * 2 }, (_, i) => (
                <motion.line key={i} x1="60" y1="40"
                  x2={80 + (i * 15) % 100} y2={60 + (i * 20) % 80}
                  stroke={`hsla(45, 30%, ${lightBright}%, ${0.03 + d * 0.02})`}
                  strokeWidth="0.4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              ))}
            </svg>
            {/* Text emerges over the scene */}
            <motion.div animate={{ opacity: textVisible ? 1 : 0 }} transition={{ duration: 1.2 }}
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ ...navicueType.prompt, color: palette.text }}>
                A life without shadow is a life without light. Your doubts are just the shadow of your ambitions. They prove the light is strong.
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Contrast effect. Psychological distress is often a corollary of high aspiration. Reframing doubt as proof of ambition alters the emotional valence. The brighter you shine, the darker the shadow — and that{'\u2019'}s evidence, not failure.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Proof of light.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
