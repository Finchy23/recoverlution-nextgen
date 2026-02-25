/**
 * ASTRONAUT #3 -- The Fractal Zoom
 * "You are mostly empty space. Why so heavy?"
 * ARCHETYPE: Pattern A (Tap) -- Tap to zoom deeper: leaf → cells → molecules → atoms → void
 * ENTRY: Scene-first -- a leaf
 * STEALTH KBE: Understanding emptiness = Deconstruction of solidity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Stellar');
type Stage = 'arriving' | 'zooming' | 'void' | 'resonant' | 'afterglow';

const LEVELS = [
  { name: 'A Leaf', detail: 'veins and chlorophyll', scale: 1 },
  { name: 'Cells', detail: 'walls, nuclei, mitochondria', scale: 0.7 },
  { name: 'Molecules', detail: 'carbon chains dancing', scale: 0.45 },
  { name: 'Atoms', detail: 'electron clouds, orbiting nothing', scale: 0.25 },
  { name: 'Empty Space', detail: '99.9999% nothing', scale: 0.08 },
];

export default function Astronaut_FractalZoom({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [level, setLevel] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('zooming'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const zoomDeeper = () => {
    if (stage !== 'zooming') return;
    const next = level + 1;
    if (next >= LEVELS.length) {
      console.log(`[KBE:K] FractalZoom deconstruction=confirmed depthReached=emptySpace`);
      setStage('void');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    } else {
      setLevel(next);
    }
  };

  const current = LEVELS[Math.min(level, LEVELS.length - 1)];
  const particles = Math.min(level + 2, 8);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '30px', height: '40px', borderRadius: '50% 50% 50% 0',
              background: themeColor(TH.accentHSL, 0.06, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
        )}
        {stage === 'zooming' && (
          <motion.div key={`z-${level}`} initial={{ opacity: 0, scale: 1.2 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>
              {current.name}
            </div>
            {/* Visual representation that gets more abstract */}
            <div style={{ position: 'relative', width: '70px', height: '70px',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: `${70 * current.scale}px`, height: `${70 * current.scale}px`,
                borderRadius: level < 2 ? '50% 50% 50% 0' : '50%',
                background: themeColor(TH.accentHSL, 0.04 + level * 0.01, 3 + level),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06 + level * 0.02, 4 + level * 2)}`,
                transition: 'all 0.6s' }} />
              {level >= 2 && Array.from({ length: particles }).map((_, i) => (
                <motion.div key={i} animate={{ x: Math.sin(i * 1.2) * (10 + level * 5),
                  y: Math.cos(i * 1.2) * (10 + level * 5), opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                  style={{ position: 'absolute', width: `${3 - level * 0.3}px`, height: `${3 - level * 0.3}px`,
                    borderRadius: '50%', background: themeColor(TH.accentHSL, 0.12, 8 + i) }} />
              ))}
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.25, 8), textAlign: 'center',
              fontStyle: 'italic' }}>
              {current.detail}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={zoomDeeper}
              style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>
                Zoom deeper ({level + 1}/{LEVELS.length})
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'void' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '80px', height: '80px', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Almost nothing -- a single tiny dot */}
              <motion.div animate={{ opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 3, repeat: Infinity }}
                style={{ width: '3px', height: '3px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.2, 10) }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px',
              fontStyle: 'italic' }}>
              You are mostly empty space. You are not solid. You are vibrating energy pretending to be heavy. Why so heavy?
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Deconstruction. Zoom into anything and it dissolves. Leaf → cells → molecules → atoms → 99.9999% empty space. You are not solid. You are vibrating energy with the appearance of form. If matter itself is mostly nothing, how solid can your problems really be?
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Empty.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}