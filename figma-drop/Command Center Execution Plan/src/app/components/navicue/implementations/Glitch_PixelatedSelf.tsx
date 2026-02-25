/**
 * GLITCH #7 — The Pixelated Self
 * "The resolution is low. The identity is blurry. Good."
 * ARCHETYPE: Pattern A (Tap) — Tap to increase/decrease resolution
 * ENTRY: Ambient Fade — pixelated abstract shape materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function Glitch_PixelatedSelf({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [pixelSize, setPixelSize] = useState(20);
  const [tapped, setTapped] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const embrace = () => {
    if (tapped) return;
    setTapped(true);
    // Animate pixel size back to large (embrace blur)
    setPixelSize(24);
    t(() => setStage('resonant'), 3500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 8500);
  };

  // Generate a pixelated grid representing "self"
  const gridSize = Math.max(3, Math.floor(100 / pixelSize));
  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const center = (gridSize - 1) / 2;
    const dist = Math.sqrt((row - center) ** 2 + (col - center) ** 2);
    const maxDist = center * 1.2;
    return dist < maxDist ? 0.04 + (1 - dist / maxDist) * 0.08 : 0;
  });

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(5, 16px)`, gap: '2px' }}>
              {Array.from({ length: 25 }, (_, i) => (
                <motion.div key={i} animate={{ opacity: [0.02, 0.06, 0.02] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                  style={{ width: '16px', height: '16px',
                    background: themeColor(TH.accentHSL, 0.05, 4) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your face at 8-bit resolution. Identity blurred. Features dissolved. Who is that? You are not your HD selfie. You are the ghost in the machine.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridSize}, ${pixelSize}px)`, gap: '1px' }}>
              {cells.map((opacity, i) => (
                <div key={i} style={{
                  width: `${pixelSize}px`, height: `${pixelSize}px`,
                  background: opacity > 0 ? themeColor(TH.accentHSL, opacity, 8) : 'transparent',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>
            {!tapped && (
              <motion.div onClick={embrace} whileTap={{ scale: 0.97 }}
                style={{ padding: '8px 22px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}` }}>
                <div style={{ ...navicueType.hint, color: palette.textFaint }}>embrace the blur</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Tactical depersonalization. Briefly detaching from your physical image reduces self-consciousness. The low resolution is the truth {'\u2014'} you are more than any high-definition version the mirror shows you.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Blurred. Free.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}