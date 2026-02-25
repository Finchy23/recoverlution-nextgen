/**
 * WONDERER #6 — The Jigsaw Pivot
 * "If the data doesn't fit the theory, throw away the theory."
 * ARCHETYPE: Pattern B (Drag) — Drag to rotate puzzle piece until it fits
 * ENTRY: Scene-first — mismatched piece
 * STEALTH KBE: Fast rotation = Low Confirmation Bias (K)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'rotating' | 'snapped' | 'resonant' | 'afterglow';

export default function Wonderer_JigsawPivot({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [rotation, setRotation] = useState(0);
  const [fit, setFit] = useState(false);
  const startTime = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const lastX = useRef(0);
  const TARGET = 135; // Must rotate to ~135 degrees

  useEffect(() => { t(() => { setStage('rotating'); startTime.current = Date.now(); }, 2000); return () => T.current.forEach(clearTimeout); }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (stage !== 'rotating' || fit) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setRotation(r => {
      const next = r + dx * 0.8;
      const norm = ((next % 360) + 360) % 360;
      if (Math.abs(norm - TARGET) < 15) {
        const elapsed = Date.now() - startTime.current;
        console.log(`[KBE:K] JigsawPivot rotationMs=${elapsed} adaptability=${elapsed < 4000} lowConfirmationBias=confirmed`);
        setFit(true);
        setStage('snapped');
        t(() => setStage('resonant'), 4500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
        return TARGET;
      }
      return next;
    });
  }, [stage, fit]);

  const pieceColor = fit
    ? themeColor(TH.accentHSL, 0.15, 10)
    : themeColor(TH.primaryHSL, 0.06, 4);
  const pieceBorder = fit
    ? themeColor(TH.accentHSL, 0.25, 12)
    : 'hsla(0, 15%, 30%, 0.08)';

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '30px', height: '30px', borderRadius: '4px 12px 4px 12px',
              background: themeColor(TH.primaryHSL, 0.05, 3),
              border: `1px solid hsla(0, 10%, 25%, 0.06)` }} />
        )}
        {stage === 'rotating' && (
          <motion.div key="rot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerMove={onMove} onPointerDown={e => { lastX.current = e.clientX; }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px',
              maxWidth: '300px', touchAction: 'none', userSelect: 'none' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              This piece doesn{"'"}t fit. Rotate it until it does.
            </div>
            {/* Slot */}
            <div style={{ position: 'relative', width: '80px', height: '80px',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '4px 12px 4px 12px',
                border: `2px dashed ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                transform: `rotate(${TARGET}deg)` }} />
              {/* Piece */}
              <motion.div style={{ position: 'absolute', width: '30px', height: '30px',
                borderRadius: '4px 12px 4px 12px', cursor: 'grab',
                background: pieceColor, border: `2px solid ${pieceBorder}`,
                transform: `rotate(${rotation}deg)`, transition: 'background 0.3s, border-color 0.3s' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag left/right to rotate</div>
          </motion.div>
        )}
        {stage === 'snapped' && (
          <motion.div key="sn" initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '4px 12px 4px 12px',
              background: themeColor(TH.accentHSL, 0.15, 10),
              border: `2px solid ${themeColor(TH.accentHSL, 0.25, 12)}`,
              transform: `rotate(${TARGET}deg)` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Snap. It fit the moment you stopped forcing it. If the data doesn{"'"}t fit the theory, throw away the theory, not the data.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Adaptability over confirmation. Feynman{"'"}s first principle: "You must not fool yourself, and you are the easiest person to fool." Confirmation bias makes us force the piece to fit. Turning it, reframing the data, is the scientific method in miniature. The anomaly isn{"'"}t a problem. It{"'"}s the discovery hiding in plain sight.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Pivoted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}