/**
 * OMEGA #2 — The Fractal Zoom (Inward)
 * "As above, so below. The universe is folded inside you."
 * STEALTH KBE: Navigating the zoom — awe response = Holographic Worldview (B)
 * Web: Drag (y-axis) to zoom deeper through scale levels
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Macrocosm/Microcosm', 'believing', 'Cosmos');
type Stage = 'arriving' | 'zoom' | 'universe' | 'resonant' | 'afterglow';

const LEVELS = ['Hand', 'Cells', 'DNA', 'Atoms', 'Energy', 'Universe'];

export default function Unity_FractalZoom({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'y',
    onComplete: () => {
      console.log(`[KBE:B] FractalZoom zoomComplete=true holographicWorldview=true awe=true`);
      setStage('universe');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
    },
  });

  useEffect(() => { t(() => setStage('zoom'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const levelIndex = Math.min(LEVELS.length - 1, Math.floor(drag.progress * LEVELS.length));

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Macrocosm/Microcosm" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: radius.xs, background: themeColor(TH.accentHSL, 0.05, 2) }} />
          </motion.div>
        )}
        {stage === 'zoom' && (
          <motion.div key="z" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div {...drag.bind()}
              style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', cursor: 'grab',
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06 + drag.progress * 0.08, 4)}` }}>
              {/* Concentric circles representing zoom levels */}
              {LEVELS.map((_, i) => {
                const active = i <= levelIndex;
                const r = 50 - i * 8;
                return (
                  <motion.div key={i}
                    animate={{ opacity: active ? 0.4 + i * 0.1 : 0.05 }}
                    style={{ position: 'absolute', left: '50%', top: '50%',
                      width: `${r * 2}px`, height: `${r * 2}px`, borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      border: `1px solid ${themeColor(TH.accentHSL, active ? 0.12 : 0.03, active ? 6 : 2)}` }} />
                );
              })}
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8), transition: 'all 0.3s' }}>
                {LEVELS[levelIndex]}
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontSize: '11px' }}>
              Drag down to zoom inward. It is all you.
            </div>
            <div style={{ width: '80px', height: '3px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.04, 1) }}>
              <motion.div style={{ width: `${drag.progress * 100}%`, height: '100%', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.15, 5) }} />
            </div>
          </motion.div>
        )}
        {stage === 'universe' && (
          <motion.div key="u" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '28px', color: themeColor(TH.accentHSL, 0.2, 10) }}>{'\u221E'}</div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontSize: '11px' }}>
              The universe is folded inside you.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            {"\""}As above, so below{"\""} (Hermes Trismegistus). The fractal geometry of nature (Mandelbrot, 1982) reveals self-similar patterns at every scale: from galaxies to neurons. The universe is not outside you. It is folded inside you. Unfold it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Inside.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}