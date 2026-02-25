/**
 * TUNER #8 — The Bilateral Tap
 * "Follow the ball. Let the memory play. Left. Right. Process it."
 * ARCHETYPE: Pattern A (Tap) — Alternating L/R taps following the bouncing ball
 * ENTRY: Reverse Reveal — the ball is already bouncing, then the purpose reveals
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

export default function Tuner_BilateralTap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const [ballSide, setBallSide] = useState<'left' | 'right'>('left');
  const [taps, setTaps] = useState(0);
  const [lastTapSide, setLastTapSide] = useState<'left' | 'right' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    const bounce = setInterval(() => setBallSide(s => s === 'left' ? 'right' : 'left'), 800);
    return () => { T.current.forEach(clearTimeout); clearInterval(bounce); };
  }, []);

  const tapSide = (side: 'left' | 'right') => {
    if (stage !== 'active' || taps >= 8) return;
    if (side !== ballSide) return; // Must tap correct side
    if (side === lastTapSide) return; // Must alternate
    setLastTapSide(side);
    const n = taps + 1;
    setTaps(n);
    if (n >= 8) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '200px', height: '40px', position: 'relative' }}>
              <motion.div
                animate={{ x: ballSide === 'left' ? 10 : 160 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%', position: 'absolute', top: '5px',
                  background: themeColor(TH.accentHSL, 0.15, 8),
                }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>already moving</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Follow the ball. Let the memory play. Keep tapping. Left. Right. The eyes move. The memory processes. Let it unfold.
            </div>
            {/* Ball track */}
            <div style={{ width: '220px', height: '40px', position: 'relative', borderRadius: radius.xl,
              background: themeColor(TH.primaryHSL, 0.03, 2) }}>
              <motion.div
                animate={{ x: ballSide === 'left' ? 10 : 180 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%', position: 'absolute', top: '5px',
                  background: themeColor(TH.accentHSL, 0.18, 10),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 12)}`,
                }} />
            </div>
            {/* L/R tap areas */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <motion.div
                onClick={() => tapSide('left')}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '80px', height: '50px', borderRadius: radius.sm, cursor: 'pointer',
                  background: ballSide === 'left' ? themeColor(TH.accentHSL, 0.08, 5) : themeColor(TH.primaryHSL, 0.03, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, ballSide === 'left' ? 0.1 : 0.04, 5)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, border 0.15s',
                }}>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.4 }}>L</div>
              </motion.div>
              <motion.div
                onClick={() => tapSide('right')}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: '80px', height: '50px', borderRadius: radius.sm, cursor: 'pointer',
                  background: ballSide === 'right' ? themeColor(TH.accentHSL, 0.08, 5) : themeColor(TH.primaryHSL, 0.03, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, ballSide === 'right' ? 0.1 : 0.04, 5)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s, border 0.15s',
                }}>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.4 }}>R</div>
              </motion.div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <motion.div key={i} style={{ width: '16px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.4, 10) : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              EMDR {':'} Eye Movement Desensitization and Reprocessing. Bilateral stimulation taxes working memory while recalling a difficult moment, reducing the vividness and emotional charge of the memory. The ball is the therapist{'\u2019'}s finger. The taps are the processing.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Processed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}