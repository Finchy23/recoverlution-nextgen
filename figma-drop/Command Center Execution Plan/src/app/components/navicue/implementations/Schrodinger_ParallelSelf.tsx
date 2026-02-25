/**
 * SCHRODINGER #2 — The Parallel Self Chat
 * "Both voices are real. Both are happening now. You are the referee."
 * ARCHETYPE: Pattern A (Tap) — Tap one voice to collapse
 * ENTRY: Cold Open — two chat bubbles appear simultaneously
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'cold' | 'active' | 'chosen' | 'resonant' | 'afterglow';

export default function Schrodinger_ParallelSelf({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [chosen, setChosen] = useState<'fear' | 'brave' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const choose = (side: 'fear' | 'brave') => {
    if (chosen) return;
    setChosen(side);
    setStage('chosen');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 9500);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.7, 0.4, 0.8] }}
            transition={{ duration: 1.8, times: [0, 0.3, 0.6, 1] }} exit={{ opacity: 0 }}
            style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.25em', color: palette.text }}>
            TWO VOICES
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>
              Both voices are real. Tap the one that wins.
            </div>
            <motion.div onClick={() => choose('fear')}
              whileTap={{ scale: 0.97 }}
              style={{ padding: '14px 20px', borderRadius: `${radius.lg} ${radius.lg} ${radius.xs} ${radius.lg}`, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.1, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                maxWidth: '240px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.25, 12), marginBottom: '6px' }}>FEARFUL YOU</div>
              <div style={{ ...navicueType.hint, color: palette.text }}>"Don't do it. You'll fail. Stay where it's safe. The risk isn't worth the pain."</div>
            </motion.div>
            <motion.div onClick={() => choose('brave')}
              whileTap={{ scale: 0.97 }}
              style={{ padding: '14px 20px', borderRadius: `${radius.lg} ${radius.lg} ${radius.lg} ${radius.xs}`, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.1, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                maxWidth: '240px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.25, 12), marginBottom: '6px' }}>BRAVE YOU</div>
              <div style={{ ...navicueType.hint, color: palette.text }}>"The fear means it matters. Move toward it. You've survived worse. You know what you need to do."</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'chosen' && chosen && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.15em',
                color: themeColor(TH.accentHSL, 0.35, 15) }}>
              {chosen === 'brave' ? 'BRAVE YOU WINS' : 'FEARFUL YOU WINS'}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {chosen === 'brave'
                ? 'You chose to feed the wolf that runs toward the fire.'
                : 'Even fear is a teacher. You chose to listen before leaping. That\u2019s not weakness; it\u2019s intelligence.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Dialogical Self. Both voices are happening in your head simultaneously, always. You just consciously chose which neural network to reinforce. The wolf you feed is the one that grows.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>The referee.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}