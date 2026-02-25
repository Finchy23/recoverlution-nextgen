/**
 * ADAPTIVE #3 -- The Immune Response
 * "You need the dirt. You need the failure. It is the data to evolve."
 * ARCHETYPE: Pattern A (Tap) -- Categorize a failure as "Loss" or "Training"
 * ENTRY: Cold open -- virus entering
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ADAPTIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'active' | 'absorbed' | 'resonant' | 'afterglow';

export default function Adaptive_ImmuneResponse({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'loss' | 'training' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const categorize = (c: 'loss' | 'training') => {
    if (stage !== 'active') return;
    setChoice(c);
    console.log(`[KBE:B] ImmuneResponse category=${c} growthMindset=${c === 'training'}`);
    setStage('absorbed');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 0.5, x: 0 }} exit={{ opacity: 0 }}
            style={{ width: '14px', height: '14px', borderRadius: '50%',
              background: 'hsla(0, 30%, 35%, 0.12)', border: '1px solid hsla(0, 25%, 30%, 0.1)' }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A failure entered the system. What is it?
            </div>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%',
              background: 'hsla(0, 25%, 30%, 0.1)', border: '1px solid hsla(0, 20%, 30%, 0.12)' }} />
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => categorize('loss')}
                style={{ padding: '14px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: 'hsla(0, 18%, 28%, 0.05)', border: '1px solid hsla(0, 18%, 35%, 0.1)' }}>
                <div style={{ ...navicueType.choice, color: 'hsla(0, 25%, 40%, 0.4)' }}>Loss</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => categorize('training')}
                style={{ padding: '14px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Training</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'absorbed' && (
          <motion.div key="ab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {choice === 'training' && (
              <motion.div initial={{ scale: 1 }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5 }}
                style={{ width: '22px', height: '22px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.12, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}` }} />
            )}
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'training'
                ? 'Absorbed. Cells surrounded, consumed, and evolved. Stronger now. Glowing.'
                : 'You labeled it a loss. The cells rejected it. No learning. No antibodies formed.'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Growth mindset. A sterile life makes a weak immune system. You need the dirt, the failure. It{"'"}s the data your system needs to evolve. Reappraising failure as training transforms the virus into a vaccine.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Immune.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}