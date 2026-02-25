/**
 * MAGNUM OPUS II #7 — The Key Turn
 * "You built the cell. You forged the key. Unlock the door."
 * Pattern A (Tap) — Insert key, turn it; door opens to Freedom
 * STEALTH KBE: Acknowledging internal lock = Psychological Freedom (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MASTERY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Self-Actualization', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'locked' | 'turning' | 'open' | 'resonant' | 'afterglow';

export default function Mastery_KeyTurn({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('locked'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const turnKey = () => {
    if (stage !== 'locked') return;
    setStage('turning');
    t(() => {
      console.log(`[KBE:K] KeyTurn unlocked=true internalLock=true psychologicalFreedom=true`);
      setStage('open');
    }, 1500);
    t(() => setStage('resonant'), 6000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Actualization" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '10px', height: '16px', borderRadius: '2px', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'locked' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: radius.sm,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 4)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '12px', height: '8px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.1, 6),
                boxShadow: `0 0 4px ${themeColor(TH.primaryHSL, 0.05, 3)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A complex lock. You have the key. Tap to turn it.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={turnKey}
              style={{ padding: '10px 22px', borderRadius: '18px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Turn the key</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'turning' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.div animate={{ rotate: [0, 90] }} transition={{ duration: 1.2 }}
              style={{ width: '20px', height: '8px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.2, 8) }} />
            <div style={{ fontSize: '9px', color: palette.textFaint }}>Click.</div>
          </motion.div>
        )}
        {stage === 'open' && (
          <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            The door opens to Freedom. You built the cell. You forged the key. You are the prisoner and the warden. The lock was always internal. Every constraint you blame on the world is a lock you installed. Acknowledge this and you hold the master key.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Learned helplessness (Seligman): the belief that you cannot escape leads to passivity even when the cage is open. The antidote: learned optimism — recognizing that most constraints are explanatory style, not physical reality. Unlock the door.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Free.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}