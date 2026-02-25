/**
 * GARDENER II #10 — The Gardener Seal
 * "To plant a garden is to believe in tomorrow."
 * Pattern A (Tap) — Hands holding soil with sprout; seal stewardship
 * STEALTH KBE: Completion = Ecological Identity mastery confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'sprout' | 'sealed' | 'resonant' | 'afterglow';

export default function Gardener_GardenerSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('sprout'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const seal = () => {
    if (stage !== 'sprout') return;
    console.log(`[KBE:K] GardenerSeal ecologicalIdentity=confirmed stewardship=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2.5, repeat: Infinity }} exit={{ opacity: 0 }}>
            <div style={{ width: '4px', height: '8px', borderRadius: '2px 2px 0 0',
              background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'sprout' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Cupped hands with sprout */}
            <svg width="60" height="50" viewBox="0 0 60 50">
              {/* Hands cupped */}
              <path d="M10,35 Q15,25 30,28 Q45,25 50,35 Q45,42 30,40 Q15,42 10,35Z"
                fill={themeColor(TH.primaryHSL, 0.04, 2)} stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="0.5" />
              {/* Soil */}
              <ellipse cx="30" cy="33" rx="12" ry="5" fill={themeColor(TH.primaryHSL, 0.05, 3)} />
              {/* Sprout */}
              <motion.g initial={{ scaleY: 1 }} animate={{ scaleY: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
                <line x1="30" y1="30" x2="30" y2="18" stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="1" />
                <ellipse cx="26" cy="17" rx="4" ry="3" fill={themeColor(TH.accentHSL, 0.06, 3)}
                  transform="rotate(-20,26,17)" />
                <ellipse cx="34" cy="16" rx="4" ry="3" fill={themeColor(TH.accentHSL, 0.06, 3)}
                  transform="rotate(20,34,16)" />
              </motion.g>
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              "To plant a garden is to believe in tomorrow." — Audrey Hepburn
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={seal}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Steward</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="se" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Sealed. The Gardener: you planted seeds for strangers, composted your failures, pruned the distractions, shared resources underground, waited for the fruit, tapped deep reserves, cross-pollinated ideas, respected the winter, and balanced the ecosystem. You do not own the land. You are borrowing it from your grandchildren. Tend it. Return it richer than you found it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Biophilia and stewardship. E.O. Wilson{"'"}s biophilia hypothesis: humans have an innate need to connect with nature. Horticultural therapy research (Soga & Gaston, 2016): gardening reduces cortisol, increases life satisfaction, and builds sense of purpose. The 7th Generation Principle (Haudenosaunee Confederacy): every decision should consider its impact seven generations into the future. To plant a garden is the most optimistic act possible — it is a declaration that tomorrow will exist and is worth preparing for.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Tended.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}