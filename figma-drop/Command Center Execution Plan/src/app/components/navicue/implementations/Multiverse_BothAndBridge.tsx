/**
 * MULTIVERSE #2 — The "Both/And" Bridge
 * "Contradiction is not a bug; it is a feature of complexity."
 * ARCHETYPE: Pattern A (Tap) — Build the AND bridge
 * ENTRY: Scene-first — two cliffs with chasm
 * STEALTH KBE: Accepting AND = Dialectical Thinking / Paradox Tolerance (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'chasm' | 'bridged' | 'resonant' | 'afterglow';

export default function Multiverse_BothAndBridge({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('chasm'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const buildBridge = () => {
    if (stage !== 'chasm') return;
    console.log(`[KBE:B] BothAndBridge paradoxTolerance=confirmed dialecticalThinking=true`);
    setStage('bridged');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '20px', height: '12px', borderRadius: '2px 2px 0 0', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
            <div style={{ width: '20px', height: '12px', borderRadius: '2px 2px 0 0', background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'chasm' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Two cliffs. A chasm between them. You don{"'"}t have to choose.
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>I am weak</span>
                <div style={{ width: '40px', height: '30px', borderRadius: '2px 2px 0 0',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6) }}>I am strong</span>
                <div style={{ width: '40px', height: '30px', borderRadius: '2px 2px 0 0',
                  background: themeColor(TH.accentHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }} />
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={buildBridge}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Build the AND</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'bridged' && (
          <motion.div key="br" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0px' }}>
              <div style={{ width: '40px', height: '30px', borderRadius: '2px 2px 0 0',
                background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8 }}
                style={{ width: '30px', height: '3px', background: themeColor(TH.accentHSL, 0.1, 5),
                  borderRadius: '1px', transformOrigin: 'left' }} />
              <div style={{ width: '40px', height: '30px', borderRadius: '2px 2px 0 0',
                background: themeColor(TH.accentHSL, 0.04, 2) }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              The bridge holds both. Weak AND strong. Contradiction is not a bug — it{"'"}s a feature of complexity. You do not have to choose. Walk across.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Dialectical thinking. Marsha Linehan{"'"}s DBT: the core skill is holding two opposing truths simultaneously — acceptance AND change, vulnerability AND strength. "Either/Or" thinking is a cognitive distortion. "Both/And" is the bridge that connects apparent contradictions. The tension between opposites is not a problem to solve; it{"'"}s a richness to inhabit.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Both.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}