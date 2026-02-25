/**
 * SHADOW WORKER #10 — The Shadow Seal (Individuation)
 * "I am not Good. I am Whole."
 * ARCHETYPE: Pattern A (Tap) — Yin-Yang spins to balance, tap to seal
 * ENTRY: Cold open — spinning yin-yang
 * STEALTH KBE: Completion = Individuation
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Ocean');
type Stage = 'arriving' | 'spinning' | 'balanced' | 'sealed' | 'resonant' | 'afterglow';

export default function Shadow_ShadowSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('spinning'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const seal = () => {
    if (stage !== 'spinning') return;
    console.log(`[KBE:E] ShadowSeal individuation=confirmed`);
    setStage('balanced');
    t(() => setStage('sealed'), 3000);
    t(() => setStage('resonant'), 7000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              style={{ width: '30px', height: '30px', borderRadius: '50%',
                background: `linear-gradient(90deg, ${themeColor(TH.primaryHSL, 0.1, 6)} 50%, ${themeColor(TH.accentHSL, 0.08, 4)} 50%)` }} />
          </motion.div>
        )}
        {stage === 'spinning' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>yin × yang</div>
            <motion.div animate={{ rotate: [0, 720] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                background: `linear-gradient(90deg, ${themeColor(TH.primaryHSL, 0.12, 6)} 50%, ${themeColor(TH.accentHSL, 0.1, 5)} 50%)`,
                border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={seal}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Balance</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'balanced' && (
          <motion.div key="b" initial={{ opacity: 1 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div initial={{ rotate: 0 }} animate={{ rotate: 0 }}
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }} />
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.25, 8) }}>
              perfectly balanced
            </div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              I am not Good. I am Whole. The light and dark, balanced and spinning together as one.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Individuation. Jung{"'"}s process of integrating conscious and unconscious. Not good, not bad. Whole. The yin-yang spins so fast it becomes grey, then stops, perfectly balanced. You contain multitudes. That{"'"}s the point.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Whole.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}