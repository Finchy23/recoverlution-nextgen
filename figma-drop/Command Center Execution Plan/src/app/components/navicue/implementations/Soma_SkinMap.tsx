/**
 * SOMA #3 — The Skin Map
 * "Draw where you hold it."
 * ARCHETYPE: Pattern C (Draw) — Draw where tension and ease live in your body
 * ENTRY: Instruction-as-poetry — "Your skin is a map. Draw what it says."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDrawInteraction } from '../interactions/useDrawInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'active' | 'resonant' | 'afterglow';

export default function Soma_SkinMap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('active');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const draw = useDrawInteraction({
    coverageThreshold: 0.25,
    minStrokes: 2,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your skin is a map. Draw where you hold it. Tension. Ease. The places your body whispers loudest.
            </motion.div>
            <div {...draw.drawProps} style={{
              ...draw.drawProps.style,
              width: '200px', height: '220px', borderRadius: radius.sm, position: 'relative', overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.03, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 3)}`,
            }}>
              {/* Body silhouette hint */}
              <div style={{
                position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)',
                width: '24px', height: '24px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.04, 3),
              }} />
              <div style={{
                position: 'absolute', top: '42px', left: '50%', transform: 'translateX(-50%)',
                width: '40px', height: '80px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.03, 2),
              }} />
              <svg width="200" height="220" style={{ position: 'absolute', top: 0, left: 0 }}>
                {draw.strokes.map((stroke, si) => (
                  <polyline key={si}
                    points={stroke.points.map(pt => `${pt.x * 200},${pt.y * 220}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.15, 8)} strokeWidth="2" strokeLinecap="round" />
                ))}
                {draw.currentStroke.length > 1 && (
                  <polyline
                    points={draw.currentStroke.map(pt => `${pt.x * 200},${pt.y * 220}`).join(' ')}
                    fill="none" stroke={themeColor(TH.accentHSL, 0.2, 10)} strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {draw.coverage < 0.1 ? 'draw on the body' : draw.coverage < 0.25 ? 'more\u2026' : 'mapped'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Somatic mapping. The places you drew are somatotopic hotspots: areas where emotional processing creates measurable physical sensation. Finnish researchers mapped these across 700 subjects. Everyone draws in the same places. Your body speaks a universal language.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Mapped.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}