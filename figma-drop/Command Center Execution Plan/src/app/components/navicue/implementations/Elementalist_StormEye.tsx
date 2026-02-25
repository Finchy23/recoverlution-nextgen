/**
 * ELEMENTALIST #5 — The Storm Eye (Center)
 * "The chaos is rotational. The center is dead calm."
 * ARCHETYPE: Pattern C (Hold) — Hold still while screen spins
 * ENTRY: Scene-first — hurricane spinning
 * STEALTH KBE: Sustained stillness = Regulation / Centering (E)
 * WEB ADAPT: gyroscope → hold button while storm spins
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Canopy');
type Stage = 'arriving' | 'storming' | 'centered' | 'resonant' | 'afterglow';

export default function Elementalist_StormEye({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({ duration: 6000,
    onComplete: () => {
      console.log(`[KBE:E] StormEye centering=confirmed regulation=stillness`);
      setStage('centered');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('storming'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2, rotate: 360 }}
            transition={{ rotate: { duration: 4, repeat: Infinity, ease: 'linear' } }}
            style={{ width: '30px', height: '30px', borderRadius: '50%',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
        )}
        {stage === 'storming' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A hurricane. Debris flying. Hold the center. Stay in the eye.
            </div>
            {/* Storm visual */}
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              {/* Spinning rings */}
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  animate={{ rotate: (i % 2 === 0 ? 360 : -360) * (1 - hold.progress * 0.6) }}
                  transition={{ duration: 2 + i, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute',
                    top: `${10 + i * 10}px`, left: `${10 + i * 10}px`,
                    width: `${80 - i * 20}px`, height: `${80 - i * 20}px`,
                    borderRadius: '50%', border: `1px solid ${themeColor(TH.primaryHSL, 0.04 - hold.progress * 0.02, 2)}` }} />
              ))}
              {/* Eye center */}
              <motion.div animate={{ scale: hold.isHolding ? 1.2 : 1, opacity: safeOpacity(0.04 + hold.progress * 0.08) }}
                style={{ position: 'absolute', top: '38px', left: '38px',
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.06 + hold.progress * 0.06, 3) }} />
            </div>
            {/* Hold button */}
            <motion.div {...hold.holdProps}
              animate={hold.isHolding ? { boxShadow: `0 0 ${6 + hold.progress * 16}px ${themeColor(TH.accentHSL, 0.03 + hold.progress * 0.05, 3)}` } : {}}
              style={{ width: '56px', height: '56px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.04 + hold.progress * 0.04, 2),
                border: `2px solid ${themeColor(TH.accentHSL, 0.06 + hold.progress * 0.1, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                userSelect: 'none', WebkitUserSelect: 'none' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2 + hold.progress * 0.2, 8) }}>
                {hold.isHolding ? `${Math.ceil(6 - hold.progress * 6)}s` : 'Hold'}
              </span>
            </motion.div>
            <div style={{ width: '60px', height: '3px', borderRadius: '1.5px', background: themeColor(TH.primaryHSL, 0.03, 1) }}>
              <div style={{ height: '100%', borderRadius: '1.5px', width: `${hold.progress * 100}%`,
                background: themeColor(TH.accentHSL, 0.1, 5), transition: 'width 0.1s' }} />
            </div>
          </motion.div>
        )}
        {stage === 'centered' && (
          <motion.div key="ce" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Dead calm. The chaos is rotational — it spins around you. But the center is still. You held it. The eye of the storm is not a place of denial; it{"'"}s the only place where you can see clearly. Don{"'"}t live on the rim. Live in the eye.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Centering. The polyvagal theory (Stephen Porges): your autonomic nervous system has a "window of tolerance" — a zone between hyperarousal (storm) and hypoarousal (collapse). The practice of finding center is training your vagus nerve to return to that window. The storm doesn{"'"}t stop. Your ability to find the calm center within it is what changes. That{"'"}s regulation.
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