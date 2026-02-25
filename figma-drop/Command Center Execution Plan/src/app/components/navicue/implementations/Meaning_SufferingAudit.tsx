/**
 * MEANING MAKER #1 — The Suffering Audit
 * "Suffering without meaning is despair. Give your pain a job."
 * ARCHETYPE: Pattern D (Type) — Type a purpose for your struggle
 * ENTRY: Scene-first — weighing scale
 * STEALTH KBE: Typing a purpose = Cognitive Reframing (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'unbalanced' | 'balanced' | 'resonant' | 'afterglow';

export default function Meaning_SufferingAudit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [purpose, setPurpose] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'what is it paying for?',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      setPurpose(value.trim());
      console.log(`[KBE:K] SufferingAudit purpose="${value.trim()}" cognitiveReframing=confirmed meaningAttribution=true`);
      setStage('balanced');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('unbalanced'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '30px', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 0, left: '28px', width: '4px', height: '20px',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            <div style={{ position: 'absolute', top: '2px', left: '5px', width: '50px', height: '2px',
              background: themeColor(TH.primaryHSL, 0.06, 3), transform: 'rotate(8deg)' }} />
          </motion.div>
        )}
        {stage === 'unbalanced' && (
          <motion.div key="ub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* Scale visualization — tilted */}
            <div style={{ width: '140px', height: '60px', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '4px', height: '30px', background: themeColor(TH.primaryHSL, 0.08, 4) }} />
              <div style={{ position: 'absolute', top: '5px', left: '10px', width: '120px', height: '2px',
                background: themeColor(TH.primaryHSL, 0.08, 4),
                transform: 'rotate(12deg)', transformOrigin: 'center' }} />
              {/* Pain side — heavy (left, low) */}
              <div style={{ position: 'absolute', top: '16px', left: '8px',
                padding: '4px 8px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <span style={{ fontSize: '8px', color: palette.textFaint }}>Your Pain</span>
              </div>
              {/* Empty side — light (right, high) */}
              <div style={{ position: 'absolute', top: '-2px', right: '8px',
                padding: '4px 8px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px dashed ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <span style={{ fontSize: '8px', color: themeColor(TH.primaryHSL, 0.08, 4) }}>?</span>
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Give your pain a job. What is this suffering paying for?
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={{ padding: '10px 22px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Balance</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'balanced' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ width: '140px', height: '50px', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '4px', height: '30px', background: themeColor(TH.accentHSL, 0.1, 6) }} />
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '120px', height: '2px',
                background: themeColor(TH.accentHSL, 0.1, 6) }} />
              <div style={{ position: 'absolute', top: '4px', left: '8px', padding: '3px 6px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.04, 2) }}>
                <span style={{ fontSize: '7px', color: palette.textFaint }}>Pain</span>
              </div>
              <div style={{ position: 'absolute', top: '4px', right: '8px', padding: '3px 6px', borderRadius: '3px',
                background: themeColor(TH.accentHSL, 0.06, 3) }}>
                <span style={{ fontSize: '7px', color: themeColor(TH.accentHSL, 0.35, 12) }}>{purpose}</span>
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Balanced. Suffering with meaning is sacrifice. You gave your pain a job: "{purpose}." That changes everything.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Viktor Frankl{"'"}s logotherapy. "He who has a why to live can bear almost any how." Frankl survived Auschwitz by finding meaning in his suffering — the promise of finishing his manuscript, the love for his wife. Meaning doesn{"'"}t remove pain; it gives pain a purpose. And purpose transforms despair into sacrifice. Give your pain a job.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Balanced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}