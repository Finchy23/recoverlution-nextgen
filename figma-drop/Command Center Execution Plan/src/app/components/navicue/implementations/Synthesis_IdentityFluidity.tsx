/**
 * SYNTHESIS #7 -- The Identity Fluidity
 * "You are the water, not the cup."
 * ARCHETYPE: Pattern A (Tap) -- Pour water from one container shape to another
 * ENTRY: Scene-first -- water in a container
 * STEALTH KBE: Speed of transition = Psychological Agility / Role Flexibility (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'pouring' | 'fluid' | 'resonant' | 'afterglow';

const SHAPES = [
  { name: 'Circle', path: 'M50,10 A40,40 0 1,1 49.99,10 Z', label: 'Bowl' },
  { name: 'Square', path: 'M10,10 L90,10 L90,90 L10,90 Z', label: 'Box' },
  { name: 'Triangle', path: 'M50,10 L90,90 L10,90 Z', label: 'Funnel' },
];

export default function Synthesis_IdentityFluidity({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [shapeIdx, setShapeIdx] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('pouring'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const pour = () => {
    if (stage !== 'pouring') return;
    const next = shapeIdx + 1;
    if (next >= SHAPES.length) {
      console.log(`[KBE:K] IdentityFluidity psychologicalAgility=confirmed roleFlexibility=true shapes=${SHAPES.length}`);
      setStage('fluid');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    } else {
      setShapeIdx(next);
    }
  };

  const shape = SHAPES[shapeIdx];

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'pouring' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Water in a {shape.label.toLowerCase()}. Pour it into the next shape. You are the water, not the cup.
            </div>
            <motion.div key={shapeIdx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <svg viewBox="0 0 100 100" width="60" height="60">
                <path d={shape.path} fill={themeColor(TH.accentHSL, 0.06, 3)}
                  stroke={themeColor(TH.accentHSL, 0.12, 6)} strokeWidth={1} />
              </svg>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.3, 10) }}>
                {shape.label}
              </span>
            </motion.div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {SHAPES.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: i <= shapeIdx ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.03, 1) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={pour}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Pour</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'fluid' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Fluid. The water took every shape without losing itself. You are not your role, your title, your relationship status, or your body shape. You are the awareness that flows through all of them. Identity is not a statue; it{"'"}s a river.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Psychological flexibility. Todd Kashdan{"'"}s research: psychological flexibility (the ability to shift between roles, perspectives, and behaviors as context demands) is one of the strongest predictors of well-being. Rigid identity attachment ("I am X") leads to fragility when X is threatened. Fluid identity ("I can be X, Y, and Z as needed") creates resilience. Bruce Lee: "Be water, my friend." The self is not a thing; it{"'"}s a process.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Fluid.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
