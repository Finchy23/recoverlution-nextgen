/**
 * GAIA #3 — The Zoom Out (Powers of Ten)
 * "From here, your ego is invisible."
 * Pattern A (Tap) — Tap through scales: Hand → House → City → Earth → Galaxy
 * STEALTH KBE: Self-importance drop after zoom = Small Self Effect / Awe (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GAIA_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'zooming' | 'cosmic' | 'resonant' | 'afterglow';

const { palette } = navicueQuickstart('sacred_ordinary', 'Systems Thinking', 'believing', 'Canopy');
const SCALES = [
  { label: 'Your Hand', size: 8 },
  { label: 'Your House', size: 14 },
  { label: 'Your City', size: 22 },
  { label: 'Your Continent', size: 32 },
  { label: 'Earth', size: 44 },
  { label: 'Solar System', size: 58 },
  { label: 'Galaxy', size: 74 },
];

export default function Gaia_ZoomOut({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [scaleIdx, setScaleIdx] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('zooming'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const zoom = () => {
    if (stage !== 'zooming') return;
    const next = scaleIdx + 1;
    if (next >= SCALES.length) {
      console.log(`[KBE:B] ZoomOut smallSelfEffect=confirmed awe=true`);
      setStage('cosmic');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    } else {
      setScaleIdx(next);
    }
  };

  const scale = SCALES[Math.min(scaleIdx, SCALES.length - 1)];

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Systems Thinking" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%',
              background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'zooming' && (
          <motion.div key="z" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Tap to zoom out. You are getting smaller.
            </div>
            <motion.div key={scaleIdx} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}>
              <div style={{ width: `${scale.size}px`, height: `${scale.size}px`, borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.04 + (scaleIdx / SCALES.length) * 0.04, 2),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06 + (scaleIdx / SCALES.length) * 0.04, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {scaleIdx === 0 && <div style={{ width: '2px', height: '2px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.08, 4) }} />}
              </div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.25, 8) }}>{scale.label}</div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={zoom}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Zoom Out</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'cosmic' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            You are small. From here, your ego is invisible. Your problem is a pixel. You are stardust contemplating itself. The Galaxy doesn{"'"}t know your name — and that is not frightening. It is freeing. You are part of something so vast that your significance is not personal. It is cosmic. You are the universe experiencing itself.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Overview Effect. Frank White (1987): astronauts viewing Earth from space report a cognitive shift — national boundaries disappear, fragility becomes visceral, interconnection becomes obvious. Dacher Keltner{"'"}s "awe" research: experiences of vastness and accommodation (updating mental models) reduce self-focus, increase prosocial behavior, and lower inflammatory cytokines. The "small self" effect: feeling small paradoxically increases well-being.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Vast.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}