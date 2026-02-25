/**
 * FREQUENCY #6 — The Interference Pattern
 * "Two waves meet. What happens next is up to you."
 * ARCHETYPE: Pattern A (Tap) — Tap to create constructive/destructive interference
 * ENTRY: Ambient Fade — two faint waves drift toward each other
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FREQUENCY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Frequency_InterferencePattern({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [taps, setTaps] = useState(0);
  const [phase, setPhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2600);
    const ph = setInterval(() => setPhase(p => p + 1), 100);
    return () => { T.current.forEach(clearTimeout); clearInterval(ph); };
  }, []);

  const handleTap = () => {
    if (stage !== 'active') return;
    const next = taps + 1;
    setTaps(next);
    if (next >= 8) {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    }
  };

  const progress = Math.min(1, taps / 8);
  const phaseShift = taps * 0.4;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="200" height="40">
              {Array.from({ length: 60 }).map((_, i) => (
                <circle key={i} cx={i * 3.3} cy={20 + Math.sin(i * 0.2) * 6} r="0.8"
                  fill={themeColor(TH.accentHSL, 0.06, 5)} />
              ))}
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>waves approaching</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Two waves meet. Tap to shift their phase. Constructive or destructive {'\u2014'} amplification or cancellation. The same energy, different alignment.
            </div>
            <svg width="240" height="70" style={{ overflow: 'visible' }}>
              {/* Wave 1 */}
              {Array.from({ length: 80 }).map((_, i) => {
                const x = i * 3;
                const y1 = 20 + Math.sin((phase + i) * 0.15) * 8;
                return <circle key={`a${i}`} cx={x} cy={y1} r="0.8"
                  fill={themeColor(TH.accentHSL, 0.08, 5)} />;
              })}
              {/* Wave 2 */}
              {Array.from({ length: 80 }).map((_, i) => {
                const x = i * 3;
                const y2 = 50 + Math.sin((phase + i) * 0.15 + phaseShift) * 8;
                return <circle key={`b${i}`} cx={x} cy={y2} r="0.8"
                  fill={themeColor(TH.accentHSL, 0.08, 5)} />;
              })}
              {/* Combined */}
              {progress > 0.2 && Array.from({ length: 80 }).map((_, i) => {
                const x = i * 3;
                const combined = Math.sin((phase + i) * 0.15) + Math.sin((phase + i) * 0.15 + phaseShift);
                const yc = 35 + combined * 5;
                return <circle key={`c${i}`} cx={x} cy={yc} r="1"
                  fill={themeColor(TH.accentHSL, 0.04 + Math.abs(combined) * 0.04, 8)} />;
              })}
            </svg>
            <motion.div whileTap={{ scale: 0.94 }} onClick={handleTap}
              style={{
                padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05 + progress * 0.04, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>shift phase</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Wave interference. When two waves are in phase, they double in amplitude. When anti-phase, they cancel to zero. Relationships work identically {'\u2014'} the same two people can amplify or cancel each other depending solely on alignment. The energy doesn{'\u2019'}t change. The phase does.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Aligned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}