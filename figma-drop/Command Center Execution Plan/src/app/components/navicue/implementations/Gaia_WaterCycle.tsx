/**
 * GAIA #4 — The Water Cycle
 * "You are just water briefly holding a shape."
 * Pattern A (Tap) — Tap through cycle: Rain → Leaf → River → Cloud → Rain
 * STEALTH KBE: Accepting evaporation = Existential Peace / Continuity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Systems Thinking', 'believing', 'Canopy');
type Stage = 'arriving' | 'cycling' | 'accepted' | 'resonant' | 'afterglow';

const PHASES = [
  { name: 'Rain', desc: 'A drop falls', icon: '↓' },
  { name: 'Leaf', desc: 'It hits a leaf', icon: '◎' },
  { name: 'River', desc: 'Joins the river', icon: '~' },
  { name: 'Evaporate', desc: 'Rises as vapor', icon: '↑' },
  { name: 'Cloud', desc: 'Becomes cloud', icon: '○' },
];

export default function Gaia_WaterCycle({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [phaseIdx, setPhaseIdx] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('cycling'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const next = () => {
    if (stage !== 'cycling') return;
    const ni = phaseIdx + 1;
    if (ni >= PHASES.length) {
      console.log(`[KBE:B] WaterCycle existentialPeace=confirmed continuity=true`);
      setStage('accepted');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    } else {
      setPhaseIdx(ni);
    }
  };

  const phase = PHASES[Math.min(phaseIdx, PHASES.length - 1)];

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '8px', borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'cycling' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Follow the drop. Trace the water cycle. The drop is the ocean.
            </div>
            <motion.div key={phaseIdx} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px', color: themeColor(TH.accentHSL, 0.12, 6) }}>{phase.icon}</span>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12) }}>{phase.name}</span>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>{phase.desc}</span>
            </motion.div>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {PHASES.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: i <= phaseIdx ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.03, 1) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={next}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Continue</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'accepted' && (
          <motion.div key="ac" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Full cycle. The drop returns. You are just water briefly holding a shape. Do not fear the evaporation — you are just returning to the clouds. Rain, leaf, river, vapor, cloud, rain again. Nothing is created. Nothing is destroyed. Only transformed. The drop is the ocean. The ocean is the drop.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Conservation of matter. Lavoisier{"'"}s Law: matter is neither created nor destroyed, only transformed. The water molecule you drank this morning may have been in a dinosaur 65 million years ago. Existential psychology (Yalom): confronting death paradoxically reduces death anxiety when paired with a sense of continuity — the knowledge that your atoms will persist. The cycle is not a metaphor. It is physics.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Cycling.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}