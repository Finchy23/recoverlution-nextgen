/**
 * SOMA #10 — The Soma Seal (The Proof)
 * "I am the body knowing."
 * ARCHETYPE: Pattern A (Tap) — Identity koan, tap to seal
 * ENTRY: Cold Open — the statement appears immediately
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'IdentityKoan');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Soma_SomaSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const handleTap = () => {
    if (stage !== 'active') return;
    const next = taps + 1;
    setTaps(next);
    if (next >= 3) {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    }
  };

  const progress = Math.min(1, taps / 3);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              I am the body knowing.
            </div>
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                width: `${80 + progress * 30}px`, height: `${100 + progress * 20}px`,
                borderRadius: '40% 40% 45% 45%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.06 + progress * 0.06, 5)}, transparent)`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.06 + progress * 0.08, 5)}`,
                transition: 'width 0.5s, height 0.5s',
              }} />
            <motion.div whileTap={{ scale: 0.96 }} onClick={handleTap}
              style={{
                padding: '14px 32px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05 + progress * 0.04, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {taps === 0 ? 'seal' : taps < 3 ? 'again' : 'sealed'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You are not a mind riding a body. You are a body that learned to think. Every decision, every memory, every intuition passes through flesh first. The soma is not the vehicle; it is the intelligence.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Embodied.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}