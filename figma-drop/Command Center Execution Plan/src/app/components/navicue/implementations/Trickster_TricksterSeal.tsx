/**
 * TRICKSTER #10 — The Trickster Seal (Gelotology)
 * "Don't take yourself so seriously. None of us get out of this alive."
 * ARCHETYPE: Pattern A (Tap) — Wind the jack-in-the-box, tension builds, POP
 * ENTRY: Cold open — jack-in-the-box
 * STEALTH KBE: Completion = Biological reset via laughter
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'winding' | 'tension' | 'pop' | 'resonant' | 'afterglow';

export default function Trickster_TricksterSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [winds, setWinds] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('winding'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const wind = () => {
    if (stage !== 'winding') return;
    const next = winds + 1;
    setWinds(next);
    if (next >= 5) {
      setStage('tension');
      t(() => {
        console.log(`[KBE:E] TricksterSeal gelotology=confirmed`);
        setStage('pop');
      }, 1200);
      t(() => setStage('resonant'), 6000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11500);
    }
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '30px', height: '35px', borderRadius: '4px 4px 0 0',
              background: themeColor(TH.accentHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
        )}
        {stage === 'winding' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>
              wind it...
            </div>
            <motion.div animate={{ rotate: winds * 30 }} transition={{ duration: 0.3 }}
              style={{ width: '40px', height: '48px', borderRadius: '6px 6px 2px 2px',
                background: themeColor(TH.accentHSL, 0.06 + winds * 0.02, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08 + winds * 0.02, 5 + winds)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2 + winds * 0.04, 8) }}>?</span>
              {/* Crank */}
              <div style={{ position: 'absolute', right: '-10px', top: '50%',
                width: '8px', height: '4px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.1, 6) }} />
            </motion.div>
            <motion.div whileTap={{ scale: 0.9, rotate: 15 }} onClick={wind}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>
                Wind ({winds}/5)
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'tension' && (
          <motion.div key="ten" animate={{ x: [-2, 2, -3, 3, -1, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '48px', borderRadius: '6px 6px 2px 2px',
              background: themeColor(TH.accentHSL, 0.12, 5),
              border: `2px solid ${themeColor(TH.accentHSL, 0.2, 10)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '14px', color: themeColor(TH.accentHSL, 0.35, 12) }}>!</span>
            </div>
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 10) }}>...building...</div>
          </motion.div>
        )}
        {stage === 'pop' && (
          <motion.div key="pop" initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '120px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div key={i}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 60,
                    opacity: [1, 1, 0], scale: [1, 1.2, 0.5] }}
                  transition={{ duration: 1.5, delay: i * 0.05 }}
                  style={{ width: '6px', height: '6px', borderRadius: '50%',
                    background: i % 2 === 0
                      ? themeColor(TH.accentHSL, 0.3, 10 + i * 2)
                      : themeColor(TH.primaryHSL, 0.15, 8 + i) }} />
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              Don{"'"}t take yourself so seriously. None of us get out of this alive. Laugh. It{"'"}s a biological reset button.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Gelotology: the science of laughter. Laughter reduces serum cortisol by up to 40% and increases pain tolerance. It{"'"}s a biological reset button. Tension builds... builds... and then POP. The release. That{"'"}s the architecture of comedy. And of healing.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>POP.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}