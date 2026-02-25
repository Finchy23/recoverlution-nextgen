/**
 * WONDERER #8 — The Color Thief
 * "Your eyes are asleep. Wake them up. Hunt for the yellow."
 * ARCHETYPE: Pattern A (Tap) — Select the target color from options
 * ENTRY: Scene-first — monochrome world
 * STEALTH KBE: Active scanning and selection = Exteroception (E)
 * WEB ADAPTATION: Camera → button selection from color swatches
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'hunting' | 'found' | 'resonant' | 'afterglow';

const COLORS = [
  { name: 'Yellow', hsl: 'hsla(48, 85%, 55%, 1)', target: true },
  { name: 'Red', hsl: 'hsla(0, 65%, 50%, 1)', target: false },
  { name: 'Blue', hsl: 'hsla(220, 70%, 50%, 1)', target: false },
  { name: 'Green', hsl: 'hsla(130, 55%, 40%, 1)', target: false },
];

export default function Wonderer_ColorThief({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [hint, setHint] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('hunting'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const pick = (color: typeof COLORS[0]) => {
    if (stage !== 'hunting') return;
    if (color.target) {
      console.log(`[KBE:E] ColorThief selectedColor="${color.name}" exteroception=confirmed environmentalScanning=true`);
      setStage('found');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    } else {
      setHint(`Not ${color.name}. Look around your room; find the yellow.`);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '50px', borderRadius: radius.xs,
              background: 'hsla(0, 0%, 12%, 0.04)',
              border: '1px solid hsla(0, 0%, 15%, 0.05)',
              filter: 'grayscale(1)' }} />
        )}
        {stage === 'hunting' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            {/* Greyscale "world" */}
            <div style={{ width: '160px', height: '80px', borderRadius: radius.sm, position: 'relative',
              background: 'hsla(0, 0%, 8%, 0.03)',
              border: '1px solid hsla(0, 0%, 15%, 0.04)',
              filter: 'grayscale(1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', color: 'hsla(0, 0%, 40%, 0.2)', fontStyle: 'italic' }}>
                monochrome world
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Find the yellow. Look around your room, then select it.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {COLORS.map(c => (
                <motion.div key={c.name} whileTap={{ scale: 0.85, rotate: 5 }} onClick={() => pick(c)}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
                    background: c.hsl, opacity: 0.7,
                    border: `2px solid hsla(0, 0%, 100%, 0.05)` }} />
              ))}
            </div>
            {hint && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 10), textAlign: 'center' }}>
                {hint}
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'found' && (
          <motion.div key="f" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '40px', height: '40px', borderRadius: '50%',
                background: 'hsla(48, 85%, 55%, 0.3)',
                boxShadow: '0 0 20px hsla(48, 85%, 55%, 0.1)' }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Color restored. Your eyes just woke up. The prize wasn{"'"}t the yellow; it was the act of looking. Active seeing is active living.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Exteroception: active scanning of your environment. Most of the time we look without seeing. Color-hunting forces the visual cortex into active search mode, strengthening the connection between perception and awareness. The prize is the sight itself. Wake your eyes up.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Seen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}