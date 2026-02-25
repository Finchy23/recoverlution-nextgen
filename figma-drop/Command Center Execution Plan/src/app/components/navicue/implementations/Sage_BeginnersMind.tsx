/**
 * SAGE #9 — The Beginner's Mind
 * "Labels make you blind. Forget the name. See it for the first time."
 * Pattern A (Tap) — Object dissolves from labeled to abstract; dwell time measured
 * WEB ADAPT: rotate → tap-to-defocus exploration
 * STEALTH KBE: Dwell time exploring abstract = Perceptual Freshness / Curiosity (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'embodying', 'Practice');
type Stage = 'arriving' | 'labeled' | 'abstract' | 'seen' | 'resonant' | 'afterglow';

export default function Sage_BeginnersMind({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [blur, setBlur] = useState(0);
  const dwellRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('labeled'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const defocus = () => {
    if (stage !== 'labeled') return;
    setStage('abstract');
    setBlur(8);
    dwellRef.current = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - dwellRef.current) / 1000;
      if (elapsed >= 4) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        console.log(`[KBE:E] BeginnersMind dwellTimeS=${elapsed.toFixed(1)} perceptualFreshness=confirmed curiosity=true`);
        setStage('seen');
        t(() => setStage('resonant'), 5500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
      }
    }, 500);
  };

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%',
              background: 'hsla(0, 20%, 30%, 0.04)' }} />
          </motion.div>
        )}
        {stage === 'labeled' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              An apple. You know what this is — or do you? Forget the name. See it for the first time.
            </div>
            {/* Apple (labeled) */}
            <div style={{ width: '50px', height: '50px', borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%',
              background: 'hsla(0, 18%, 28%, 0.06)',
              border: `1px solid hsla(0, 15%, 25%, 0.06)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ ...navicueType.status, color: palette.textFaint }}>Apple</span>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={defocus}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Forget the Name</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'abstract' && (
          <motion.div key="ab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}>
              See the color. See the curve. See the light.
            </div>
            {/* Abstract forms */}
            <motion.div
              animate={{ borderRadius: ['50% 50% 50% 50%', '40% 60% 55% 45%', '55% 45% 40% 60%', '50% 50% 50% 50%'] }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{ width: '60px', height: '58px',
                background: `radial-gradient(ellipse at 40% 35%, hsla(0, 20%, 35%, 0.06), hsla(120, 10%, 25%, 0.04), hsla(45, 15%, 30%, 0.03))`,
                filter: `blur(${blur}px)` }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              Just look... no label needed
            </div>
          </motion.div>
        )}
        {stage === 'seen' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Seen. For the first time. Labels make you blind — you say "apple" and stop looking. Forget the name. See the color, see the light, see the curve. Shoshin, beginner{"'"}s mind: "In the beginner{"'"}s mind there are many possibilities, in the expert{"'"}s mind there are few." You just looked at something familiar and saw it as if you had never seen it before. This is the gift of unlearning.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Shoshin ({"初心"}). Shunryu Suzuki: "In the beginner{"'"}s mind there are many possibilities, but in the expert{"'"}s mind there are few." The "curse of knowledge" (Camerer, 1989): expertise creates perceptual blindness. Once you label something, you stop seeing its qualities. Mindfulness research (Langer, 1989): "mindful" seeing — attending to novelty in familiar objects — increases engagement, creativity, and well-being. The beginner sees what the expert has forgotten.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Seen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}