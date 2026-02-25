/**
 * GAIA #6 — The Sun Source
 * "Every calorie in your body is just trapped sunlight."
 * Pattern A (Tap) — Tap backward through energy chain: Sandwich → Wheat → Soil → Sun
 * STEALTH KBE: Correctly tracing chain = Ecological Literacy / Energy Chain (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Systems Thinking', 'knowing', 'Canopy');
type Stage = 'arriving' | 'tracing' | 'sourced' | 'resonant' | 'afterglow';

const CHAIN = [
  { name: 'Sandwich', icon: '▭' },
  { name: 'Wheat', icon: '⌇' },
  { name: 'Soil', icon: '⊟' },
  { name: 'Sun', icon: '◉' },
];

export default function Gaia_SunSource({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chainIdx, setChainIdx] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('tracing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const trace = () => {
    if (stage !== 'tracing') return;
    const next = chainIdx + 1;
    if (next >= CHAIN.length) {
      console.log(`[KBE:K] SunSource ecologicalLiteracy=confirmed energyChain=true`);
      setStage('sourced');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    } else {
      setChainIdx(next);
    }
  };

  const item = CHAIN[Math.min(chainIdx, CHAIN.length - 1)];

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'tracing' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A sandwich. Where did the energy come from? Trace it back to the source.
            </div>
            <motion.div key={chainIdx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '20px', color: themeColor(TH.accentHSL, 0.12, 6) }}>{item.icon}</span>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12) }}>{item.name}</span>
            </motion.div>
            {/* Chain progress */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {CHAIN.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                    background: i <= chainIdx ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.03, 1) }} />
                  {i < CHAIN.length - 1 && (
                    <span style={{ fontSize: '11px', color: palette.textFaint }}>←</span>
                  )}
                </div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={trace}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Trace Back</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sourced' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Sun. Every calorie in your body is just trapped sunlight. The sandwich came from wheat. The wheat grew from soil. The soil was energized by the sun. Photosynthesis captured photons and stored them as chemical bonds. You ate those bonds. You are eating light. You are a solar battery walking around.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Ecological literacy. David Orr{"'"}s concept: understanding how natural systems work and how human systems interact with them. The food chain is literally a solar chain — every trophic level transfers photosynthetic energy. Second Law of Thermodynamics: only ~10% of energy transfers between levels, which is why ecosystems are pyramid-shaped. Understanding this chain changes how you relate to food, nature, and your own body. You are not separate from the energy grid. You are a node.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sourced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}