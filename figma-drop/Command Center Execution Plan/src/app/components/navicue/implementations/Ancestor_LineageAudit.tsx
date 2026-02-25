/**
 * ANCESTOR #2 -- The Lineage Audit
 * "You inherited their luggage. Keep the gold. Leave the lead."
 * ARCHETYPE: Pattern A (Tap) -- Choose keep/discard for inherited items
 * ENTRY: Scene-first -- backpack of items
 * STEALTH KBE: Discarding a "family curse" = Intergenerational Differentiation (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'knowing', 'Ember');
type Stage = 'arriving' | 'active' | 'audited' | 'resonant' | 'afterglow';

const ITEMS = [
  { label: 'Work Ethic', type: 'gold' },
  { label: 'Alcoholism', type: 'lead' },
  { label: 'Humor', type: 'feather' },
  { label: 'Guilt', type: 'lead' },
];

export default function Ancestor_LineageAudit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [decisions, setDecisions] = useState<Record<string, 'keep' | 'discard'>>({});
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const decide = (label: string, action: 'keep' | 'discard') => {
    const next = { ...decisions, [label]: action };
    setDecisions(next);
    if (Object.keys(next).length >= ITEMS.length) {
      const discardedLead = ITEMS.filter(it => it.type === 'lead').some(it => next[it.label] === 'discard');
      console.log(`[KBE:K] LineageAudit decisions=${JSON.stringify(next)} differentiation=${discardedLead}`);
      setStage('audited');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    }
  };

  const remaining = ITEMS.filter(it => !decisions[it.label]);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '30px', height: '35px', borderRadius: '6px 6px 2px 2px',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
        )}
        {stage === 'active' && remaining.length > 0 && (
          <motion.div key={`act-${remaining[0].label}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Inherited: "{remaining[0].label}". Keep or leave?
            </div>
            <div style={{ padding: '10px 18px', borderRadius: radius.md,
              background: remaining[0].type === 'gold' ? themeColor(TH.accentHSL, 0.06, 4)
                : remaining[0].type === 'lead' ? 'hsla(0, 15%, 25%, 0.04)' : themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>{remaining[0].type}</span>
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide(remaining[0].label, 'keep')}
                style={{ padding: '14px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Keep</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide(remaining[0].label, 'discard')}
                style={{ padding: '14px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>Leave</div>
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {ITEMS.length - remaining.length}/{ITEMS.length} sorted
            </div>
          </motion.div>
        )}
        {stage === 'audited' && (
          <motion.div key="au" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Lighter. You kept the gold and left the lead by the roadside. Their luggage, your choice.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Intergenerational differentiation. You inherited their luggage: work ethic, humor, but also alcoholism and guilt. You don{"'"}t have to carry it all. Keep the gold. Leave the lead by the side of the road.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Audited.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}