/**
 * GAIA #1 — The Breath Exchange
 * "Your waste is their food. Their waste is your life."
 * Pattern C (Hold) — Hold to exhale; tree inhales, tree exhales, you inhale
 * WEB ADAPT: mic → hold interaction (breathe with tree)
 * STEALTH KBE: Syncing breath with tree = Physiological Connection / Respiratory Entrainment (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Systems Thinking', 'embodying', 'Canopy');
type Stage = 'arriving' | 'breathing' | 'synced' | 'resonant' | 'afterglow';

export default function Gaia_BreathExchange({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cycle, setCycle] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 4000,
    onComplete: () => {
      setCycle(c => {
        const next = c + 1;
        if (next >= 3) {
          console.log(`[KBE:E] BreathExchange respiratoryEntrainment=confirmed physiologicalConnection=true cycles=3`);
          setStage('synced');
          t(() => setStage('resonant'), 5000);
          t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
        }
        return next;
      });
    },
  });

  useEffect(() => { t(() => setStage('breathing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '10px', height: '20px', borderRadius: '5px 5px 0 0',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'breathing' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A tree. You exhale — it inhales. It exhales — you inhale. Symbiosis. Hold to breathe together.
            </div>
            {/* Tree */}
            <div style={{ position: 'relative', width: '60px', height: '70px' }}>
              <motion.div
                animate={{ scale: hold.isHolding ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', top: 0, left: '8px', width: '44px', height: '40px',
                  borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.04 + hold.progress * 0.02, 2) }} />
              <div style={{ position: 'absolute', bottom: 0, left: '26px', width: '8px', height: '30px',
                borderRadius: '1px', background: themeColor(TH.accentHSL, 0.04, 2) }} />
              {/* Exchange arrows */}
              {hold.isHolding && (
                <>
                  <motion.div animate={{ y: [-10, -20], opacity: [0.06, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ position: 'absolute', left: '-8px', top: '20px',
                      fontSize: '11px', color: themeColor(TH.accentHSL, 0.15, 6) }}>↑</motion.div>
                  <motion.div animate={{ y: [0, 10], opacity: [0.06, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.8 }}
                    style={{ position: 'absolute', right: '-8px', top: '20px',
                      fontSize: '11px', color: themeColor(TH.primaryHSL, 0.15, 6) }}>↓</motion.div>
                </>
              )}
            </div>
            <motion.div {...hold.holdProps}
              style={immersiveHoldPillThemed(TH.accentHSL).container(hold.progress)}>
              <div style={immersiveHoldPillThemed(TH.accentHSL).label(hold.progress)}>
                {hold.isHolding ? `Exhale... ${Math.round(hold.progress * 100)}%` : 'Hold to Exhale'}
              </div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Breath cycle {cycle}/3</div>
          </motion.div>
        )}
        {stage === 'synced' && (
          <motion.div key="sy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Synced. Your waste is their food. Their waste is your life. You are breathing each other. You are one lung. The CO{"₂"} you just exhaled is being split by photosynthesis into carbon and oxygen. The oxygen you inhale was assembled by a tree. There is no "your air" and "their air." There is just air. You are not separate from nature. You are nature breathing itself.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Symbiosis and respiratory entrainment. Plants and animals form a closed-loop gas exchange: photosynthesis (CO{"₂"} → O{"₂"}) and respiration (O{"₂"} → CO{"₂"}). Polyvagal theory (Porges): slow, rhythmic breathing activates the ventral vagal complex, producing calm and social engagement. Breathing with a natural rhythm (trees, ocean waves) creates interspecies entrainment — your nervous system literally synchronizes with the biosphere.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Synced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}