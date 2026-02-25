/**
 * CATALYST #7 — The "But" to "And"
 * "'But' erases what they said. 'And' adds to it."
 * ARCHETYPE: Pattern A (Tap) — Tap glowing "BUT" to change it to "AND"
 * ENTRY: Cold open — sentence with "BUT" glowing red
 * STEALTH KBE: Successful edit = Inclusive Communication (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CATALYST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Theater');
type Stage = 'arriving' | 'active' | 'edited' | 'resonant' | 'afterglow';

export default function Catalyst_ButToAnd({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const edit = () => {
    if (stage !== 'active') return;
    console.log(`[KBE:K] ButToAnd edited=true inclusiveCommunication=confirmed`);
    setStage('edited');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
            "I hear you, <span style={{ color: 'hsla(0, 40%, 45%, 0.6)', fontWeight: '700' }}>BUT</span>..."
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {"'"}But{"'"} erases. {"'"}And{"'"} adds. Tap to edit.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ ...navicueType.texture, color: palette.textFaint }}>"I hear you,</span>
              <motion.span whileTap={{ scale: 0.9 }} onClick={edit}
                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1, repeat: Infinity }}
                style={{ padding: '4px 10px', borderRadius: radius.sm, cursor: 'pointer',
                  background: 'hsla(0, 30%, 35%, 0.08)', border: '1px solid hsla(0, 30%, 40%, 0.15)',
                  ...navicueType.choice, color: 'hsla(0, 40%, 45%, 0.6)', fontWeight: '700' }}>
                BUT
              </motion.span>
              <span style={{ ...navicueType.texture, color: palette.textFaint }}>..."</span>
            </div>
          </motion.div>
        )}
        {stage === 'edited' && (
          <motion.div key="ed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ ...navicueType.texture, color: palette.textFaint }}>"I hear you,</span>
              <motion.span initial={{ scale: 1.2 }} animate={{ scale: 1 }}
                style={{ padding: '4px 10px', borderRadius: radius.sm,
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}`,
                  ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15), fontWeight: '700' }}>
                AND
              </motion.span>
              <span style={{ ...navicueType.texture, color: palette.textFaint }}>..."</span>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The sentence flows. Their truth and your truth. Two truths coexist.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Inclusive communication. "But" negates everything before it. "And" builds on it. The improviser{"'"}s rule: "Yes, and..." keeps their truth alive while adding yours. Two truths are better than one.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>And.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}