/**
 * SERVANT #1 — The Ripple Effect
 * "Your kindness to the barista just changed her dinner conversation."
 * ARCHETYPE: Pattern A (Tap) — Tap to create ripple, watch the chain
 * ENTRY: Scene-first — still pond
 * STEALTH KBE: Tracing the chain = Interconnectedness understanding (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'still' | 'rippling' | 'resonant' | 'afterglow';

export default function Servant_RippleEffect({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [ripples, setRipples] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('still'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tap = () => {
    if (stage !== 'still' && stage !== 'rippling') return;
    setStage('rippling');
    setRipples(r => {
      const next = r + 1;
      if (next >= 3) {
        console.log(`[KBE:K] RippleEffect ripples=${next} interconnectedness=confirmed consequenceTracing=true`);
        t(() => setStage('resonant'), 4000);
        t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
      }
      return next;
    });
  };

  const CHAIN = [
    'You smiled at the barista.',
    'She tipped the busker extra.',
    'He wrote a song that made a stranger cry happy tears.',
  ];

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '30px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 3)}` }} />
        )}
        {(stage === 'still' || stage === 'rippling') && (
          <motion.div key="pond" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {ripples === 0 ? 'A still pond. Tap.' : `Ripple ${ripples}. Tap again.`}
            </div>
            {/* Pond with ripples */}
            <motion.div whileTap={{ scale: 0.97 }} onClick={tap}
              style={{ width: '120px', height: '80px', borderRadius: '50%', cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
                background: themeColor(TH.accentHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.accentHSL, 0.05, 3)}` }}>
              {Array.from({ length: ripples }).map((_, i) => (
                <motion.div key={i} initial={{ scale: 0, opacity: 0.12 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 2.5, delay: i * 0.3 }}
                  style={{ position: 'absolute', left: '50%', top: '50%',
                    width: '20px', height: '14px', borderRadius: '50%',
                    transform: 'translate(-50%,-50%)',
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }} />
              ))}
            </motion.div>
            {/* Chain events */}
            {ripples > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '260px' }}>
                {CHAIN.slice(0, ripples).map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                    <span style={{ color: themeColor(TH.accentHSL, 0.15 + i * 0.06, 6 + i * 2), fontSize: '8px' }}>→</span>
                    <span style={{ fontSize: '10px', color: themeColor(TH.accentHSL, 0.25 + i * 0.06, 8 + i * 2),
                      fontStyle: 'italic' }}>{c}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Consequence tracing. Nicholas Christakis{"'"} research shows that emotions, behaviors, and even health outcomes spread through social networks up to three degrees of separation. Your kindness doesn{"'"}t end when you walk away. It ripples. The barista{"'"}s dinner conversation. The stranger{"'"}s tears. You are the first domino in a chain you{"'"}ll never see. That{"'"}s not invisible. That{"'"}s infinite.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Rippling.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}