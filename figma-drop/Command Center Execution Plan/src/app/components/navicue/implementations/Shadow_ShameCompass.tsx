/**
 * SHADOW WORKER #5 — The Shame Compass
 * "Shame guards the gate to your values. Walk through shame to find the value."
 * ARCHETYPE: Pattern D (Type) — Type the positive value behind the shame
 * ENTRY: Scene-first — spinning compass
 * STEALTH KBE: Correct value identification = Cognitive Reappraisal (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Ocean');
type Stage = 'arriving' | 'active' | 'valued' | 'resonant' | 'afterglow';

export default function Shadow_ShameCompass({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'what value does this shame protect?',
    onAccept: (value: string) => {
      if (value.trim().length < 2) return;
      console.log(`[KBE:K] ShameCompass value="${value.trim()}" cognitiveReappraisal=confirmed`);
      setStage('valued');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div animate={{ rotate: [0, 180, 360, 540, 720] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '30px', height: '30px', borderRadius: '50%',
                border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
                position: 'relative' }}>
              <div style={{ position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)',
                width: '2px', height: '10px', background: 'hsla(0, 30%, 40%, 0.2)', borderRadius: '1px' }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The compass points toward your deepest shame. Follow the needle. What value does this shame guard?
            </div>
            <motion.div animate={{ rotate: [0, 10, -10, 5, 0] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '40px', height: '40px', borderRadius: '50%',
                border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
                position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '2px', height: '14px', background: 'hsla(0, 25%, 35%, 0.15)', borderRadius: '1px',
                position: 'absolute', top: '6px' }} />
              <span style={{ position: 'absolute', top: '-2px', fontSize: '11px', color: 'hsla(0, 20%, 40%, 0.25)' }}>N</span>
            </motion.div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Walk through</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'valued' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            The needle steadied. Behind the shame was a value all along. It was guarding the gate.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive reappraisal. Shame guards the gate to your values. If you{"'"}re ashamed of "being lazy," it means you value creation. Walk through the shame to find the treasure it{"'"}s protecting.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Valued.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}