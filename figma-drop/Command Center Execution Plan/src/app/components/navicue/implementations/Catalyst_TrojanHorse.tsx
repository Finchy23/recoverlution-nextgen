/**
 * CATALYST #3 — The Trojan Horse (The Story)
 * "Facts trigger defense. Stories trigger curiosity. Hide truth in the tale."
 * ARCHETYPE: Pattern A (Tap) — Choose "Data Dump" or "Anecdote" to open the gates
 * ENTRY: Scene-first — closed city gate
 * STEALTH KBE: Choosing Anecdote = Narrative Persuasion belief (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CATALYST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'blocked' | 'choose' | 'result' | 'resonant' | 'afterglow';

export default function Catalyst_TrojanHorse({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'data' | 'story' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('blocked'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tryFacts = () => {
    if (stage !== 'blocked') return;
    setStage('choose');
  };

  const pick = (c: 'data' | 'story') => {
    if (stage !== 'choose') return;
    setChoice(c);
    console.log(`[KBE:B] TrojanHorse method=${c} narrativePersuasion=${c === 'story'}`);
    setStage('result');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '80px', height: '50px', borderRadius: '4px 4px 0 0',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>GATE CLOSED</span>
            </div>
          </motion.div>
        )}
        {stage === 'blocked' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The gate is closed. Facts bounce off.
            </div>
            <div style={{ width: '90px', height: '55px', borderRadius: '4px 4px 0 0',
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>THEIR MIND</span>
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={tryFacts}
              style={{ padding: '8px 16px', borderRadius: radius.lg, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>Push Facts</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'choose' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint }}>Facts bounced off. Try another way.</div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('data')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint, fontSize: '11px' }}>Data Dump</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => pick('story')}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Anecdote</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'result' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {choice === 'story' ? (
              <motion.div initial={{ height: '55px' }} animate={{ height: '5px' }} transition={{ duration: 1.2 }}
                style={{ width: '90px', borderRadius: radius.xs,
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}`,
                  overflow: 'hidden' }} />
            ) : (
              <div style={{ width: '90px', height: '55px', borderRadius: '4px 4px 0 0',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `2px solid ${themeColor(TH.primaryHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>STILL CLOSED</span>
              </div>
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'story'
                ? 'The gates opened. The story walked right through the front door.'
                : 'More facts, same wall. The gate stays shut. They don\'t trust your data.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Narrative persuasion. Facts trigger the brain{"'"}s defense systems. Stories trigger curiosity and bypass the amygdala. The Trojan Horse of influence: hide the truth inside the tale.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Through.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}