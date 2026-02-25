/**
 * WONDERER #4 — The Rabbit Hole
 * "Follow the white rabbit. The distraction is a feature."
 * ARCHETYPE: Pattern A (Tap) — Reverse psychology: "Do not enter"
 * ENTRY: Scene-first — glowing hole with warning
 * STEALTH KBE: Entering despite warning = Productive Procrastination belief (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'warning' | 'fell' | 'wonder' | 'resonant' | 'afterglow';

const FACTS = [
  'Neutron stars are so dense that a teaspoon of their material weighs 6 billion tons.',
  'Octopuses have three hearts, blue blood, and can edit their own RNA.',
  'There are more possible chess games than atoms in the observable universe.',
  'Honey never spoils. Archaeologists have eaten 3,000-year-old honey from Egyptian tombs.',
  'Your body contains enough iron to make a 3-inch nail.',
];

export default function Wonderer_RabbitHole({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [fact] = useState(() => FACTS[Math.floor(Math.random() * FACTS.length)]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('warning'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const enter = () => {
    if (stage !== 'warning') return;
    console.log(`[KBE:B] RabbitHole permissiveness=confirmed productiveProcrastination=true`);
    setStage('fell');
    t(() => setStage('wonder'), 2000);
    t(() => setStage('resonant'), 8000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Probe" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '20px', height: '20px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.04, 2),
              boxShadow: `0 0 8px ${themeColor(TH.accentHSL, 0.03, 3)}` }} />
        )}
        {stage === 'warning' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <motion.div animate={{ boxShadow: [
                `0 0 8px ${themeColor(TH.accentHSL, 0.04, 4)}`,
                `0 0 16px ${themeColor(TH.accentHSL, 0.06, 6)}`,
                `0 0 8px ${themeColor(TH.accentHSL, 0.04, 4)}`,
              ] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.06, 4)}, ${themeColor(TH.primaryHSL, 0.02, 1)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
            <div style={{ ...navicueType.texture, color: 'hsla(0, 15%, 35%, 0.3)', fontSize: '11px',
              letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              DO NOT ENTER
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={enter}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Enter anyway</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'fell' && (
          <motion.div key="f" initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0.5, scale: 0.3 }}
            transition={{ duration: 1.5 }}
            style={{ width: '40px', height: '40px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
        )}
        {stage === 'wonder' && (
          <motion.div key="wo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '280px' }}>
            <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.4, 14), textAlign: 'center',
              fontStyle: 'italic' }}>
              {fact}
            </div>
            <div style={{ ...navicueType.texture, color: 'hsla(0, 15%, 35%, 0.3)', textAlign: 'center' }}>
              The distraction wasn{"'"}t a bug. It was a feature. Your brain needed a detour to find the solution.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: 'hsla(0, 15%, 35%, 0.3)', maxWidth: '300px' }}>
            Productive procrastination. Research shows that incubation periods, where you stop working on a problem and let your mind wander, produce significantly more creative solutions. The rabbit hole isn{"'"}t avoidance; it{"'"}s the default mode network doing its best work. Follow the white rabbit. The detour is the path.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: 'hsla(0, 15%, 35%, 0.3)', textAlign: 'center' }}>Wonderland.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}