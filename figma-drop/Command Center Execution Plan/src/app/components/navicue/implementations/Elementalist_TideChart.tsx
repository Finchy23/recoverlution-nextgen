/**
 * ELEMENTALIST #8 — The Tide Chart (Cycles)
 * "You cannot force the ocean. Wait for the water."
 * ARCHETYPE: Pattern A (Tap) — Choose wait vs push
 * ENTRY: Scene-first — low tide graph
 * STEALTH KBE: Choosing patience = Cyclical Wisdom (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'knowing', 'Canopy');
type Stage = 'arriving' | 'lowtide' | 'chosen' | 'resonant' | 'afterglow';

export default function Elementalist_TideChart({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'wait' | 'push' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('lowtide'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: 'wait' | 'push') => {
    if (stage !== 'lowtide') return;
    setChoice(c);
    console.log(`[KBE:K] TideChart choice=${c} cyclicalWisdom=${c === 'wait'} patience=${c === 'wait'}`);
    setStage('chosen');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="60" height="20" viewBox="0 0 60 20">
              <path d="M0,10 Q15,5 30,15 Q45,5 60,10" fill="none" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1" />
            </svg>
          </motion.div>
        )}
        {stage === 'lowtide' && (
          <motion.div key="lt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Low Tide. The boat scrapes the sand. What do you do?
            </div>
            {/* Tide chart */}
            <svg width="140" height="40" viewBox="0 0 140 40">
              <path d="M0,20 Q20,10 35,25 Q50,38 70,35 Q90,32 105,15 Q120,5 140,20"
                fill="none" stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="1.5" />
              {/* Current position marker */}
              <circle cx="70" cy="35" r="3" fill={themeColor(TH.accentHSL, 0.12, 6)} />
              <text x="60" y="30" fill={palette.textFaint} fontSize="6">Low</text>
              <text x="105" y="12" fill={themeColor(TH.accentHSL, 0.15, 8)} fontSize="6">High</text>
            </svg>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('wait')}
                style={{ padding: '12px 18px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Wait for water</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('push')}
                style={{ padding: '12px 18px', borderRadius: '14px', cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Push harder</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'chosen' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'wait'
              ? 'Wisdom. You cannot force the ocean. If the energy is low, wait. Rest is not laziness; it is the tide going out. The water will return. It always does. The sailor who understands tides sails farther than the one who rows against them.'
              : 'The boat scrapes sand. You push harder — it grinds, it scratches, it stalls. Sometimes the hardest action is non-action. The tide will return. It always does. Next time, wait for the water. Nature doesn\'t hurry, yet everything is accomplished.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cyclical awareness. Ultradian rhythms: the body operates in 90-120 minute cycles of higher and lower energy throughout the day. Forcing productivity during a low phase is like launching a boat at low tide — inefficient and exhausting. Chronobiology research shows that working with your natural energy cycles (rather than against them) increases productivity by up to 25%. Rest is strategic, not lazy.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Tidal.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}