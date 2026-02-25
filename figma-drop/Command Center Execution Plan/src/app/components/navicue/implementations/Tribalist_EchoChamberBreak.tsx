/**
 * TRIBALIST #7 — The Echo Chamber Break
 * "Inbreeding kills the tribe. Invite the stranger. Listen to the dissent."
 * ARCHETYPE: Pattern A (Tap) — Mirrors surround you; smash a window to let someone different in
 * ENTRY: Scene-first — room of mirrors
 * STEALTH KBE: Choosing "Listen" over "Block" = Intellectual Humility (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { TRIBALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'mirrors' | 'stranger' | 'decided' | 'resonant' | 'afterglow';

export default function Tribalist_EchoChamberBreak({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'listen' | 'block' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('mirrors'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const smash = () => {
    if (stage !== 'mirrors') return;
    setStage('stranger');
  };

  const decide = (d: 'listen' | 'block') => {
    setChoice(d);
    console.log(`[KBE:K] EchoChamberBreak choice=${d} intellectualHumility=${d === 'listen'}`);
    setStage('decided');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '8px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ width: '28px', height: '36px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'mirrors' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Everyone looks like you. Diversity is immunity. Break the glass.
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ width: '32px', height: '40px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.05, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                    background: themeColor(TH.primaryHSL, 0.08, 4) }} />
                </div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={smash}
              style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Smash window</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'stranger' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>A different voice enters:</div>
            <div style={{ padding: '12px 16px', borderRadius: radius.lg,
              background: themeColor(TH.accentHSL, 0.05, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontStyle: 'italic', textAlign: 'center' }}>
                "What if you{"'"}re all wrong about this?"
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide('listen')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Listen</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => decide('block')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.3, 10) }}>Block</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'decided' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'listen'
                ? 'The stranger sits down. The room is richer. Dissent is the immune system of a group.'
                : 'The window sealed shut. The mirrors remain. The echo grows louder.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Intellectual humility. The strongest tribes invite the dissenter. Genetic diversity prevents extinction; cognitive diversity prevents groupthink. The stranger{"'"}s question is the tribe{"'"}s antibody.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Diverse.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}