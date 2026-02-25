/**
 * CATALYST #5 — The Label Inception
 * "Call them 'Kind' before they are kind. They will act to make it true."
 * ARCHETYPE: Pattern A (Tap) — Drag a positive label onto avatar → they rise
 * ENTRY: Scene-first — confused avatar
 * STEALTH KBE: Selecting positive trait = Constructive Influence (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CATALYST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Theater');
type Stage = 'arriving' | 'active' | 'labeled' | 'resonant' | 'afterglow';
const LABELS = ['Generous', 'Brave', 'Wise'];

export default function Catalyst_LabelInception({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<string | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const label = (l: string) => {
    if (stage !== 'active') return;
    setChosen(l);
    console.log(`[KBE:K] LabelInception label=${l} constructiveInfluence=confirmed`);
    setStage('labeled');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
            <span style={{ fontSize: '11px', color: palette.textFaint }}>?</span>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              What label do you give them?
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>?</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {LABELS.map(l => (
                <motion.div key={l} whileTap={{ scale: 0.95 }} onClick={() => label(l)}
                  style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.05, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
                  <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12), fontSize: '11px' }}>{l}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'labeled' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div initial={{ height: '40px' }} animate={{ height: '50px' }} transition={{ duration: 1 }}
              style={{ width: '40px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>{chosen}</span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              They stand taller. They act "{chosen?.toLowerCase()}." The label became prophecy.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Pygmalion Effect. People rise to the label you give them. Higher expectations lead to higher performance. Call them kind before they are kind — and watch them act to make it true.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Labeled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}