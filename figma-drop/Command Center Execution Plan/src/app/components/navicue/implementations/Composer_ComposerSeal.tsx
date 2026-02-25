/**
 * COMPOSER #10 — The Composer Seal (Coherence)
 * "The baton is in your hand. Downbeat... Now."
 * ARCHETYPE: Pattern A (Tap) — Baton tap
 * ENTRY: Cold open — tapping baton
 * STEALTH KBE: Completion = Heart-breath-brainwave coherence
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Theater');
type Stage = 'arriving' | 'tapping' | 'downbeat' | 'resonant' | 'afterglow';

export default function Composer_ComposerSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('tapping'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const tap = () => {
    if (stage !== 'tapping') return;
    const next = taps + 1;
    setTaps(next);
    if (next >= 3) {
      console.log(`[KBE:E] ComposerSeal coherence=confirmed heartBreathBrain=synchronized`);
      setStage('downbeat');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ width: '2px', height: '30px', borderRadius: '1px',
              background: themeColor(TH.accentHSL, 0.06, 3),
              transform: 'rotate(-15deg)' }} />
        )}
        {stage === 'tapping' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Baton */}
            <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '2px', height: '40px', borderRadius: '1px',
                background: themeColor(TH.accentHSL, 0.08, 4),
                transform: 'rotate(-15deg)',
                transformOrigin: 'bottom center' }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              Tap. Tap. Tap. The silence is pregnant with potential.
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={tap}
              style={{ width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `2px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>
                {taps === 0 ? 'Tap' : taps === 1 ? 'Tap' : 'Now'}
              </span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'downbeat' && (
          <motion.div key="d" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Downbeat. The baton is in your hand. The orchestra awaits. The silence before the first note contains every possibility. You conducted. You found the chord within the chaos. You are the composer.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Coherence. The HeartMath Institute{"'"}s research: when heart rhythm, respiratory rate, and brainwave patterns synchronize at approximately 0.1Hz, the body enters a state of optimal performance — reduced cortisol, enhanced cognitive function, emotional stability. The conductor doesn{"'"}t play an instrument. They synchronize the whole system. Downbeat. Now.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Conducted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}