/**
 * ASTRONAUT #10 -- The Astronaut Seal (Self-Transcendence)
 * "That's here. That's home. That's us." -- Carl Sagan
 * ARCHETYPE: Pattern A (Tap) -- The Pale Blue Dot
 * ENTRY: Cold open -- vastness, then a single pixel
 * STEALTH KBE: Completion = Self-Transcendence / boundary dissolution
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Stellar');
type Stage = 'arriving' | 'vast' | 'dot' | 'sealed' | 'resonant' | 'afterglow';

export default function Astronaut_AstronautSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('vast'), 2000);
    t(() => setStage('dot'), 5500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const seal = () => {
    if (stage !== 'dot') return;
    console.log(`[KBE:E] AstronautSeal selfTranscendence=confirmed boundaryDissolution=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ width: '120px', height: '80px', position: 'relative' }}>
            {/* Emptiness with scattered faint stars */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div key={i} animate={{ opacity: [0.05, 0.12, 0.05] }}
                transition={{ duration: 3 + i, repeat: Infinity }}
                style={{ position: 'absolute',
                  left: `${10 + Math.random() * 100}px`,
                  top: `${5 + Math.random() * 70}px`,
                  width: '1px', height: '1px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.15, 8) }} />
            ))}
          </motion.div>
        )}
        {stage === 'vast' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
            <div style={{ width: '180px', height: '120px', position: 'relative' }}>
              {/* A sunbeam -- diagonal line of faint light */}
              <div style={{ position: 'absolute', left: '30%', top: 0, width: '30%', height: '100%',
                background: `linear-gradient(to bottom right,
                  transparent,
                  ${themeColor(TH.accentHSL, 0.015, 3)},
                  transparent)`,
                transform: 'skewX(-15deg)' }} />
              {/* Scattered distant stars */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ position: 'absolute',
                  left: `${Math.random() * 170}px`, top: `${Math.random() * 115}px`,
                  width: '1px', height: '1px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.06 + Math.random() * 0.06, 6) }} />
              ))}
              {/* The Pale Blue Dot -- barely visible */}
              <motion.div animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ position: 'absolute', left: '52%', top: '45%',
                  width: '2px', height: '2px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.25, 12),
                  boxShadow: `0 0 3px ${themeColor(TH.accentHSL, 0.08, 8)}` }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic', textAlign: 'center' }}>
              look at the pale blue dot...
            </motion.div>
          </motion.div>
        )}
        {stage === 'dot' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '100px', height: '70px', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ width: '2px', height: '2px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.35, 14),
                  boxShadow: `0 0 6px ${themeColor(TH.accentHSL, 0.1, 10)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px',
              fontStyle: 'italic' }}>
              That{"'"}s here. That{"'"}s home. That{"'"}s us.
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={seal}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Seal</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
            On that pale blue dot, every human who ever lived -- every saint and sinner, every king and peasant, every mother and child -- lived out their lives on a mote of dust suspended in a sunbeam.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-transcendence. The psychological state where the boundary between self and other dissolves. It doesn{"'"}t require religion or drugs -- just scale. See yourself as a pale blue dot, and the ego quiets. Life satisfaction increases. Anxiety decreases. You are small. And that{"'"}s the most liberating thing you{"'"}ll ever know.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Home.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}