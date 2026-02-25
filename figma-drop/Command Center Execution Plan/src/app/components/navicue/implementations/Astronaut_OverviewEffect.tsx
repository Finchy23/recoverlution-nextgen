/**
 * ASTRONAUT #1 -- The Overview Effect
 * "From here, you cannot see your deadline. You can only see the marble."
 * ARCHETYPE: Pattern B (Drag) -- Drag to zoom out: street → city → earth → cosmos
 * ENTRY: Scene-first -- map view zooming out
 * STEALTH KBE: Stress drop after zoom = Small Self effect (B)
 * WEB ADAPTATION: Pinch → drag slider zoom
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Stellar');
type Stage = 'arriving' | 'active' | 'overview' | 'resonant' | 'afterglow';

const LAYERS = ['Your Street', 'Your City', 'Your Country', 'The Continent', 'The Earth', 'The Solar System', 'Silence.'];

export default function Astronaut_OverviewEffect({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] OverviewEffect smallSelfEffect=confirmed scaleReappraisal=true`);
      setStage('overview');
      t(() => setStage('resonant'), 6000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const layerIdx = Math.min(LAYERS.length - 1, Math.floor(drag.progress * LAYERS.length));
  const earthScale = 1 - drag.progress * 0.7;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '40px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Drag upward. Leave the ground.
            </div>
            {/* The shrinking earth */}
            <div style={{ position: 'relative', width: '80px', height: '80px',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div style={{
                width: `${Math.max(8, 60 * earthScale)}px`,
                height: `${Math.max(8, 60 * earthScale)}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle at 40% 35%,
                  ${themeColor(TH.accentHSL, 0.12, 10)},
                  ${themeColor(TH.primaryHSL, 0.08, 4)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                boxShadow: drag.progress > 0.6
                  ? `0 0 ${20 * drag.progress}px ${themeColor(TH.accentHSL, 0.04, 4)}`
                  : 'none',
              }} />
              {/* Stars appearing as you zoom out */}
              {drag.progress > 0.4 && Array.from({ length: Math.floor(drag.progress * 8) }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.3 + Math.random() * 0.3 }}
                  style={{ position: 'absolute',
                    left: `${10 + Math.sin(i * 2.3) * 35}px`,
                    top: `${10 + Math.cos(i * 1.7) * 35}px`,
                    width: '2px', height: '2px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.15, 12) }} />
              ))}
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center',
              transition: 'all 0.5s', fontStyle: drag.progress > 0.7 ? 'italic' : 'normal' }}>
              {LAYERS[layerIdx]}
            </div>
            <div ref={drag.containerRef} style={{ width: '12px', height: '120px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '36px', height: '36px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.12, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.18, 8)}`,
                  position: 'absolute', left: '-6px', top: '3px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'overview' && (
          <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.15, 8),
                boxShadow: `0 0 20px ${themeColor(TH.accentHSL, 0.06, 6)}` }} />
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ position: 'absolute',
                  left: `${50 + Math.sin(i * 0.52) * 40}px`,
                  top: `${50 + Math.cos(i * 0.52) * 40}px`,
                  width: '1.5px', height: '1.5px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + (i % 3) * 0.05, 10) }} />
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px',
              fontStyle: 'italic' }}>
              From here, you cannot see your deadline. You cannot see your enemy. You can only see the marble. Stay here.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Overview Effect. Astronauts who see Earth from space undergo a permanent cognitive shift -- the "small self" effect. Problems dissolve against the scale of the cosmos. Your deadline, your rival, your fear -- they{"'"}re invisible from orbit. The marble doesn{"'"}t care. Stay here a moment longer.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Overview.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}