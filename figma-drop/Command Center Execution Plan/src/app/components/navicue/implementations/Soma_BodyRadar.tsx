/**
 * SOMA #1 — The Body Scan Radar
 * "Your body has been talking. You just weren't listening."
 * ARCHETYPE: Pattern B (Drag) — Drag attention through body regions
 * ENTRY: Ambient Fade — a silhouette slowly fades in from the dark
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOMA_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

const REGIONS = ['crown', 'jaw', 'throat', 'shoulders', 'chest', 'belly', 'hips', 'knees', 'feet'];

export default function Soma_BodyRadar({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const p = drag.progress;
  const regionIdx = Math.min(REGIONS.length - 1, Math.floor(p * REGIONS.length));

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ opacity: [0.02, 0.05, 0.02] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '40px', height: '140px', borderRadius: `${radius.xl} ${radius.xl} ${radius.sm} ${radius.sm}`,
                background: themeColor(TH.accentHSL, 0.06, 5) }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.6 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a body appears</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your body has been talking. You just weren{'\u2019'}t listening. Drag downward through each region. Notice what you find.
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                {REGIONS.map((r, i) => (
                  <motion.div key={r}
                    animate={{ opacity: i <= regionIdx ? 0.5 : 0.08, scale: i === regionIdx ? 1.1 : 1 }}
                    style={{
                      width: i === 0 || i === REGIONS.length - 1 ? '20px' : i < 4 ? '28px' : '32px',
                      height: '12px', borderRadius: radius.xs,
                      background: themeColor(TH.accentHSL, i <= regionIdx ? 0.12 : 0.04, 5),
                      transition: 'background 0.3s',
                    }} />
                ))}
              </div>
              <div {...drag.dragProps} style={{
                ...drag.dragProps.style,
                width: '36px', height: '160px', borderRadius: radius.full, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.04, 3),
              }}>
                <motion.div style={{
                  position: 'absolute', top: `${8 + p * 110}px`, left: '4px',
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + p * 0.08, 6),
                  pointerEvents: 'none',
                }} />
              </div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>{REGIONS[regionIdx]}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Interoceptive scanning. Each body region stores information your conscious mind misses. The jaw holds unsaid words. The belly holds unprocessed decisions. You just gave your attention to every room in the house.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Heard.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}