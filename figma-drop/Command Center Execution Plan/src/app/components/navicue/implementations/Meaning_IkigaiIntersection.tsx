/**
 * MEANING MAKER #4 — The Ikigai Intersection
 * "Balance is not static. It is a dynamic tension."
 * ARCHETYPE: Pattern B (Drag) — Drag pin to center of 4 overlapping circles
 * ENTRY: Scene-first — Venn diagram
 * STEALTH KBE: Acknowledging misalignment = Honesty / Self-Correction (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'mapping' | 'centered' | 'resonant' | 'afterglow';

const CIRCLES = [
  { label: 'Love', cx: -18, cy: -18, hue: 340 },
  { label: 'Good at', cx: 18, cy: -18, hue: 45 },
  { label: 'Paid for', cx: 18, cy: 18, hue: 200 },
  { label: 'World needs', cx: -18, cy: 18, hue: 145 },
];

export default function Meaning_IkigaiIntersection({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] IkigaiIntersection selfCorrection=confirmed honesty=true`);
      setStage('centered');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('mapping'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '50px', height: '50px', position: 'relative' }}>
            {CIRCLES.map((c, i) => (
              <div key={i} style={{ position: 'absolute',
                left: `${25 + c.cx * 0.5}px`, top: `${25 + c.cy * 0.5}px`,
                width: '20px', height: '20px', borderRadius: '50%', transform: 'translate(-50%,-50%)',
                border: `1px solid hsla(${c.hue}, 10%, 20%, 0.05)` }} />
            ))}
          </motion.div>
        )}
        {stage === 'mapping' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Four circles. Find the center. Where do they overlap?
            </div>
            {/* Ikigai diagram */}
            <div style={{ width: '140px', height: '140px', position: 'relative' }}>
              {CIRCLES.map((c, i) => (
                <div key={i} style={{ position: 'absolute',
                  left: `${70 + c.cx}px`, top: `${70 + c.cy}px`,
                  width: '60px', height: '60px', borderRadius: '50%', transform: 'translate(-50%,-50%)',
                  background: `hsla(${c.hue}, 12%, 20%, ${0.02 + drag.progress * 0.02})`,
                  border: `1px solid hsla(${c.hue}, 12%, 25%, ${0.05 + drag.progress * 0.04})`,
                  transition: 'all 0.3s' }}>
                  <div style={{ position: 'absolute', fontSize: '7px',
                    color: `hsla(${c.hue}, 12%, 35%, ${0.2 + drag.progress * 0.15})`,
                    left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
                    whiteSpace: 'nowrap' }}>{c.label}</div>
                </div>
              ))}
              {/* Pin at center */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', left: '65px', top: '65px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + drag.progress * 0.15, 5 + drag.progress * 5),
                  border: `2px solid ${themeColor(TH.accentHSL, 0.15 + drag.progress * 0.15, 8)}`,
                  zIndex: 2 }} />
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.25 + drag.progress * 0.15, 8),
              textAlign: 'center', fontStyle: 'italic' }}>
              {drag.progress < 0.3 ? 'Drag toward center' : drag.progress < 0.7 ? 'Getting closer...' : 'Almost there...'}
            </div>
            <div ref={drag.containerRef} style={{ width: '12px', height: '80px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.1, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
                  position: 'absolute', left: '-6px', top: '2px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'centered' && (
          <motion.div key="c" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Centered. Ikigai — your reason for being. Love, talent, income, impact. The intersection is small and dynamic. You don{"'"}t find it once; you tune toward it daily. Acknowledging where you{"'"}re off-center is the first act of self-correction.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Ikigai — the Japanese concept of life purpose. The intersection of what you love, what you{"'"}re good at, what the world needs, and what you can be paid for. Research from Okinawa (the world{"'"}s longest-lived population) shows that having ikigai correlates with longevity, lower cortisol, and reduced inflammation. Balance isn{"'"}t a static state — it{"'"}s a dynamic tension. Find the center.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Centered.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}