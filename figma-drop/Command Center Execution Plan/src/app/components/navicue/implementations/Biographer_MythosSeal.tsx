/**
 * BIOGRAPHER #10 — The Mythos Seal / The Proof (Locus of Control)
 * "You are the author. The pen never leaves your hand."
 * ARCHETYPE: Pattern A (Tap) — Tap to close the leather-bound book
 * ENTRY: Ambient fade — book slowly materializes with gold title
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'ambient' | 'active' | 'closing' | 'resonant' | 'afterglow';

export default function Biographer_MythosSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 3200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const closeBook = () => {
    setStage('closing');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '80px', height: '100px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.04, 3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '40px', height: '1px', background: themeColor(TH.accentHSL, 0.06, 6) }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a leather-bound book</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are the author. The pen never leaves your hand. Close the book. Your name is on the cover.
            </div>
            <motion.div onClick={closeBook} whileTap={{ scale: 0.96 }}
              style={{ width: '100px', height: '130px', borderRadius: radius.xs, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.14, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: `2px 2px 8px ${themeColor(TH.voidHSL, 0.3, 0)}` }}>
              <div style={{ width: '50px', height: '1px', background: themeColor(TH.accentHSL, 0.12, 10) }} />
              <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                color: themeColor(TH.accentHSL, 0.25, 12) }}>YOUR NAME</div>
              <div style={{ width: '50px', height: '1px', background: themeColor(TH.accentHSL, 0.12, 10) }} />
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to close</div>
          </motion.div>
        )}
        {stage === 'closing' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div initial={{ rotateX: 0 }} animate={{ rotateX: [0, -5, 0] }}
              transition={{ duration: 0.4 }}
              style={{ width: '100px', height: '130px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.18, 8),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 10)}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: `3px 3px 12px ${themeColor(TH.voidHSL, 0.4, 0)}` }}>
              <div style={{ width: '50px', height: '1px', background: themeColor(TH.accentHSL, 0.18, 12) }} />
              <motion.div initial={{ opacity: 0.25 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
                style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                  color: themeColor(TH.accentHSL, 0.4, 18) }}>YOUR NAME</motion.div>
              <div style={{ width: '50px', height: '1px', background: themeColor(TH.accentHSL, 0.18, 12) }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              thud.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Locus of Control. The ultimate shift from "life happens to me" to "I write the life." You are not the passenger. You are the author. The pen never leaves your hand.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Author.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}