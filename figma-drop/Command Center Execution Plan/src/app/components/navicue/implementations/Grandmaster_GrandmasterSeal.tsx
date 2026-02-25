/**
 * GRANDMASTER #10 — The Grandmaster Seal (Antifragility)
 * "The board changes. The player remains."
 * ARCHETYPE: Pattern A (Tap) — Tip the king; it rights itself
 * ENTRY: Cold open — king piece standing
 * STEALTH KBE: Completion = Antifragility mastery
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Circuit');
type Stage = 'arriving' | 'standing' | 'tipping' | 'sealed' | 'resonant' | 'afterglow';

export default function Grandmaster_GrandmasterSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('standing'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tip = () => {
    if (stage !== 'standing') return;
    setStage('tipping');
    t(() => {
      console.log(`[KBE:E] GrandmasterSeal antifragility=confirmed`);
      setStage('sealed');
    }, 2000);
    t(() => setStage('resonant'), 6000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '20px', height: '40px', borderRadius: '4px 4px 0 0',
              background: themeColor(TH.accentHSL, 0.08, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }} />
            <div style={{ width: '30px', height: '8px', borderRadius: '0 0 4px 4px',
              background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'standing' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>
              the king
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.2, 10), marginBottom: '2px' }} />
              <div style={{ width: '20px', height: '40px', borderRadius: '4px 4px 0 0',
                background: themeColor(TH.accentHSL, 0.1, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }} />
              <div style={{ width: '30px', height: '8px', borderRadius: '0 0 4px 4px',
                background: themeColor(TH.accentHSL, 0.08, 4) }} />
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={tip}
              style={{ padding: '10px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>Tip it</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'tipping' && (
          <motion.div key="tip" initial={{ opacity: 1 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ rotate: [0, 45, 30, 45, 15, 0] }}
              transition={{ duration: 2, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transformOrigin: 'bottom center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.2, 10), marginBottom: '2px' }} />
              <div style={{ width: '20px', height: '40px', borderRadius: '4px 4px 0 0',
                background: themeColor(TH.accentHSL, 0.1, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }} />
              <div style={{ width: '30px', height: '8px', borderRadius: '0 0 4px 4px',
                background: themeColor(TH.accentHSL, 0.08, 4) }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                filter: `drop-shadow(0 0 8px ${themeColor(TH.accentHSL, 0.1, 8)})` }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.25, 12), marginBottom: '2px' }} />
              <div style={{ width: '20px', height: '40px', borderRadius: '4px 4px 0 0',
                background: themeColor(TH.accentHSL, 0.12, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.18, 10)}` }} />
              <div style={{ width: '30px', height: '8px', borderRadius: '0 0 4px 4px',
                background: themeColor(TH.accentHSL, 0.1, 5) }} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              The board changes. The player remains. Antifragile.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Antifragility. The property of a system that benefits from shocks rather than just withstanding them. The king tips but rights itself, not fragile, not robust, but antifragile. The board changes. The player remains.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Antifragile.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}