/**
 * ANCESTOR II #9 -- The Inheritance Audit
 * "You can refuse the bequest."
 * Pattern A (Tap) -- Box of family traits; keep/return; consciously reject negative trait
 * STEALTH KBE: Rejecting negative trait = Psychological Autonomy / Differentiation (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Transgenerational Meaning', 'knowing', 'Ember');
type Stage = 'arriving' | 'audit' | 'audited' | 'resonant' | 'afterglow';

const TRAITS = [
  { id: 'stubbornness', label: 'Stubbornness', keep: false },
  { id: 'humor', label: 'Humor', keep: true },
  { id: 'fear', label: 'Fear', keep: false },
  { id: 'resilience', label: 'Resilience', keep: true },
  { id: 'anger', label: 'Anger', keep: false },
  { id: 'curiosity', label: 'Curiosity', keep: true },
];

export default function AncestorII_InheritanceAudit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [kept, setKept] = useState<string[]>([]);
  const [returned, setReturned] = useState<string[]>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('audit'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const decide = (id: string, action: 'keep' | 'return') => {
    if (stage !== 'audit') return;
    if (action === 'keep') setKept(prev => [...prev, id]);
    else setReturned(prev => [...prev, id]);

    const totalDecided = kept.length + returned.length + 1;
    if (totalDecided >= TRAITS.length) {
      const returnedNames = [...returned, ...(action === 'return' ? [id] : [])];
      console.log(`[KBE:K] InheritanceAudit differentiation=confirmed returned=[${returnedNames}] psychologicalAutonomy=true`);
      setStage('audited');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }
  };

  const remaining = TRAITS.filter(tr => !kept.includes(tr.id) && !returned.includes(tr.id));

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '12px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'audit' && (
          <motion.div key="au" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A box of family traits. You can refuse the bequest. Keep what serves. Return what doesn{"'"}t.
            </div>
            {remaining.length > 0 && (
              <motion.div key={remaining[0].id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '8px 16px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
                  <span style={{ fontSize: '11px', color: palette.text }}>{remaining[0].label}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.div whileTap={{ scale: 0.9 }} onClick={() => decide(remaining[0].id, 'keep')}
                    style={{ padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                      background: themeColor(TH.accentHSL, 0.06, 3),
                      border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                    <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.45, 14) }}>Keep</span>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.9 }} onClick={() => decide(remaining[0].id, 'return')}
                    style={{ padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                      background: themeColor(TH.primaryHSL, 0.03, 1),
                      border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                    <span style={{ fontSize: '11px', color: palette.textFaint }}>Return</span>
                  </motion.div>
                </div>
              </motion.div>
            )}
            <div style={{ fontSize: '11px', color: palette.textFaint }}>
              {kept.length > 0 && `Kept: ${kept.map(id => TRAITS.find(t => t.id === id)?.label).join(', ')}`}
              {returned.length > 0 && ` | Returned: ${returned.map(id => TRAITS.find(t => t.id === id)?.label).join(', ')}`}
            </div>
          </motion.div>
        )}
        {stage === 'audited' && (
          <motion.div key="ad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Audited. You kept what serves and returned what doesn{"'"}t. You do not have to accept the fear just because it was your father{"'"}s. Return to sender. The inheritance audit is the act of conscious differentiation: deciding which parts of your family legacy to carry forward and which to release. You are not rejecting your ancestors. You are honoring them by becoming more fully yourself.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Differentiation of self. Murray Bowen{"'"}s Family Systems Theory: differentiation is the ability to maintain your sense of self while remaining emotionally connected to your family. Low differentiation = emotional fusion (automatically adopting family patterns). High differentiation = conscious choice about which patterns to continue. IFS (Internal Family Systems): inherited "parts" can be unburdened through conscious processing. You are the first generation that can choose, and choosing is the highest form of respect.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Chosen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}