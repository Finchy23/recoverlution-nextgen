/**
 * KINETIC #4 — The Burn Rate
 * "You are sprinting a marathon. Drop to cruising speed."
 * ARCHETYPE: Pattern B (Drag) — Drag speedometer needle from Red to Green zone
 * ENTRY: Cold open — redlining
 * STEALTH KBE: Accepting green zone = Sustainability over Intensity belief (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { KINETIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'cruising' | 'resonant' | 'afterglow';

export default function Kinetic_BurnRate({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    sticky: true,
    onComplete: () => {
      console.log(`[KBE:B] BurnRate acceptedGreen=true sustainability=confirmed`);
      setStage('cruising');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const zone = drag.progress < 0.3 ? 'red' : drag.progress < 0.7 ? 'yellow' : 'green';
  const zoneColor = zone === 'red' ? 'hsla(0, 35%, 42%, 0.5)' : zone === 'yellow' ? 'hsla(45, 35%, 42%, 0.5)' : themeColor(TH.accentHSL, 0.35, 8);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: 'hsla(0, 35%, 42%, 0.5)', letterSpacing: '0.12em' }}>
            REDLINE
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You{"'"}re sprinting a marathon. Drag to cruising speed.
            </div>
            <div style={{ width: '120px', height: '60px', borderRadius: '60px 60px 0 0',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`, borderBottom: 'none',
              position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: '33%', height: '100%',
                background: 'hsla(0, 25%, 30%, 0.06)' }} />
              <div style={{ position: 'absolute', left: '33%', top: 0, width: '34%', height: '100%',
                background: 'hsla(45, 25%, 30%, 0.04)' }} />
              <div style={{ position: 'absolute', right: 0, top: 0, width: '33%', height: '100%',
                background: 'hsla(120, 15%, 25%, 0.04)' }} />
              <motion.div style={{ position: 'absolute', bottom: 0, left: '50%', width: '2px', height: '40px',
                background: zoneColor, transformOrigin: 'bottom center',
                transform: `rotate(${-80 + drag.progress * 160}deg)` }} />
            </div>
            <div style={{ ...navicueType.hint, color: zoneColor }}>{zone.toUpperCase()} ZONE</div>
            <div ref={drag.containerRef} style={{ width: '200px', height: '12px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: zoneColor, border: `1px solid ${zoneColor}`,
                  position: 'absolute', top: '-6px', left: '3px' }} />
            </div>
          </motion.div>
        )}
        {stage === 'cruising' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Cruising speed. Sustainable. You{"'"}ll finish the marathon, not just start it.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Sustainability. You{"'"}re sprinting a marathon. You{"'"}ll crash at mile 6. The disciplined athlete drops to cruising speed because the goal is finishing, not starting fast. Intensity without sustainability is just a flashy burnout.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Cruising.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}