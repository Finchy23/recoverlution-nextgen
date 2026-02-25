/**
 * ANCESTOR II #4 -- The Name Etching
 * "The name fades. The verb remains."
 * Pattern D (Type) -- Stone wall; carve your name; then select your "Core Verb"
 * STEALTH KBE: Selecting core verb = Identity as Action / Verb Identification (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'wall' | 'verb' | 'etched' | 'resonant' | 'afterglow';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Transgenerational Meaning', 'knowing', 'Ember');
const VERBS = ['To Teach', 'To Heal', 'To Build', 'To Protect', 'To Create', 'To Connect', 'To Liberate', 'To Nurture'];

export default function AncestorII_NameEtching({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('wall'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const carve = () => {
    if (stage !== 'wall') return;
    setStage('verb');
  };

  const selectVerb = (v: string) => {
    if (stage !== 'verb') return;
    setChoice(v);
    console.log(`[KBE:K] NameEtching verbIdentification=confirmed coreVerb="${v}" identityAsAction=true`);
    setStage('etched');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '28px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.03, 2) }} />
          </motion.div>
        )}
        {stage === 'wall' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A stone wall. Thousands of names. You find your space. Carve your name.
            </div>
            <div style={{ width: '80px', height: '50px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.03, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint, opacity: 0.4 }}>[ your space ]</span>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={carve}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Carve</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'verb' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The name fades. The verb remains. What is your core verb? What did you DO? That is the only carving that survives the rain.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {VERBS.map(v => (
                <motion.div key={v} whileTap={{ scale: 0.9 }} onClick={() => selectVerb(v)}
                  style={{ padding: '12px 14px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.03, 1),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                  <span style={{ fontSize: '11px', color: palette.textFaint }}>{v}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'etched' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Etched: <span style={{ fontStyle: 'italic' }}>{choice}</span>. The name fades. Names always do. But the verb, what you DID, that is the carving that survives the rain. Identity is not a noun. It is a verb. You are not what you are called. You are what you do, repeatedly, with intention. "{choice}" is your core action. It is the truest summary of a life.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Identity as action. Aristotle: "We are what we repeatedly do." James Clear{"'"}s identity-based habits: lasting change comes from shifting identity (noun to verb). Narrative identity research (McAdams): people who define themselves through actions ("I teach") show greater life coherence than those who define through static traits ("I am smart"). The Stoics (Marcus Aurelius): focus on what you can control: your actions. Everything else (reputation, legacy, even your name) is beyond your control and subject to time.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Verb.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}