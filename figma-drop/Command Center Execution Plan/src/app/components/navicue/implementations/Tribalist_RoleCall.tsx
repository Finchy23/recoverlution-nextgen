/**
 * TRIBALIST #4 — The Role Call
 * "Every group needs a cast. Play your part. Let them play theirs."
 * ARCHETYPE: Pattern A (Tap) — Select a mask archetype for your stage spot
 * ENTRY: Scene-first — empty stage with spotlight
 * STEALTH KBE: Consistent archetype selection = Self-Concept Clarity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { TRIBALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'active' | 'cast' | 'resonant' | 'afterglow';
const ROLES = [
  { id: 'sage', label: 'The Sage', desc: 'wisdom & calm' },
  { id: 'jester', label: 'The Jester', desc: 'joy & disruption' },
  { id: 'warrior', label: 'The Warrior', desc: 'protection & action' },
];

export default function Tribalist_RoleCall({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<string | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const choose = (id: string) => {
    if (stage !== 'active') return;
    setChosen(id);
    console.log(`[KBE:K] RoleCall archetype=${id} selfConceptClarity=confirmed`);
    setStage('cast');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '2px', borderRadius: '1px',
              background: themeColor(TH.primaryHSL, 0.1, 6) }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.1, 6) }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>empty stage</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Who are you in this group?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              {ROLES.map(r => (
                <motion.div key={r.id} whileTap={{ scale: 0.97 }} onClick={() => choose(r.id)}
                  style={{ padding: '12px 16px', borderRadius: radius.lg, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.05, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}`,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ ...navicueType.choice, color: palette.text }}>{r.label}</div>
                  <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>{r.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'cast' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ padding: '14px 22px', borderRadius: radius.lg,
                background: themeColor(TH.accentHSL, 0.08, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>
                {ROLES.find(r => r.id === chosen)?.label}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              You claimed your spot. The cast is set. Play your part fully.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Role identity. Self-concept clarity, knowing your archetype within a group, is the foundation of effective teamwork. If you try to be everything, you are nothing. The group needs your specific frequency.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Cast.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}