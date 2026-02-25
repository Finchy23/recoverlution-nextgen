/**
 * ANCESTOR #10 -- The Ancestral Seal (Transgenerational Resilience)
 * "You are the leaf. They are the root. As below, so above."
 * ARCHETYPE: Pattern A (Tap) -- Tree root system mirroring branches
 * ENTRY: Cold open -- symmetrical tree
 * STEALTH KBE: Completion = Lineage awareness / Secure Base
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'embodying', 'Ember');
type Stage = 'arriving' | 'growing' | 'sealed' | 'resonant' | 'afterglow';

export default function Ancestor_AncestralSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('growing'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const seal = () => {
    if (stage !== 'growing') return;
    console.log(`[KBE:E] AncestralSeal transgenerationalResilience=confirmed`);
    setStage('sealed');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="60" height="80" viewBox="0 0 60 80">
              {/* Branches */}
              <line x1="30" y1="40" x2="30" y2="15" stroke={themeColor(TH.accentHSL, 0.1, 5)} strokeWidth="2" />
              <line x1="30" y1="25" x2="20" y2="15" stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="1.5" />
              <line x1="30" y1="25" x2="40" y2="15" stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="1.5" />
              {/* Roots -- mirror */}
              <line x1="30" y1="40" x2="30" y2="65" stroke={themeColor(TH.primaryHSL, 0.1, 5)} strokeWidth="2" />
              <line x1="30" y1="55" x2="20" y2="65" stroke={themeColor(TH.primaryHSL, 0.08, 4)} strokeWidth="1.5" />
              <line x1="30" y1="55" x2="40" y2="65" stroke={themeColor(TH.primaryHSL, 0.08, 4)} strokeWidth="1.5" />
            </svg>
          </motion.div>
        )}
        {stage === 'growing' && (
          <motion.div key="gr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>as below, so above</div>
            <svg width="80" height="100" viewBox="0 0 80 100">
              {/* Branches above */}
              <line x1="40" y1="50" x2="40" y2="18" stroke={themeColor(TH.accentHSL, 0.12, 6)} strokeWidth="2.5" />
              <line x1="40" y1="32" x2="24" y2="18" stroke={themeColor(TH.accentHSL, 0.1, 5)} strokeWidth="2" />
              <line x1="40" y1="32" x2="56" y2="18" stroke={themeColor(TH.accentHSL, 0.1, 5)} strokeWidth="2" />
              <line x1="24" y1="18" x2="16" y2="10" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1" />
              <line x1="56" y1="18" x2="64" y2="10" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1" />
              {/* Roots below -- mirrored */}
              <line x1="40" y1="50" x2="40" y2="82" stroke={themeColor(TH.primaryHSL, 0.12, 6)} strokeWidth="2.5" />
              <line x1="40" y1="68" x2="24" y2="82" stroke={themeColor(TH.primaryHSL, 0.1, 5)} strokeWidth="2" />
              <line x1="40" y1="68" x2="56" y2="82" stroke={themeColor(TH.primaryHSL, 0.1, 5)} strokeWidth="2" />
              <line x1="24" y1="82" x2="16" y2="90" stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="1" />
              <line x1="56" y1="82" x2="64" y2="90" stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="1" />
            </svg>
            <motion.div whileTap={{ scale: 0.95 }} onClick={seal}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Seal</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              You are the leaf. They are the root. You are the fruit. They are the seed. As below, so above.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Transgenerational resilience. Awareness of your place in a lineage provides a "secure base" that buffers against existential anxiety. The roots mirror the branches. You are not alone. You are the tip of the spear, and behind you is the shaft of 10,000 lives.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rooted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}