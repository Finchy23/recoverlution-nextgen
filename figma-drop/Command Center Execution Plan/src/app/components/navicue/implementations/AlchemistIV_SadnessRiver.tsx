/**
 * ALCHEMIST IV #7 - The Sadness River
 * "Do not dam the river. Let it flow."
 * Pattern B (Drag) - Swipe to open floodgates; pressure drops
 * STEALTH KBE: Opening the gate = Emotional Acceptance / Allowing (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Emotional Regulation', 'embodying', 'Ember');
type Stage = 'arriving' | 'dammed' | 'flowing' | 'resonant' | 'afterglow';

export default function AlchemistIV_SadnessRiver({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] SadnessRiver emotionalAcceptance=confirmed allowing=true`);
      setStage('flowing');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('dammed'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const pressure = 1 - drag.progress;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '8px', borderRadius: '1px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'dammed' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A dam holding back water. The pressure is high. Drag down to open the floodgates. Let the river flow.
            </div>
            {/* Dam visualization */}
            <svg width="100" height="60" viewBox="0 0 100 60">
              {/* Water behind dam */}
              <rect x="0" y="5" width="45" height="50" rx="2"
                fill={themeColor(TH.accentHSL, 0.03 + pressure * 0.04, 2)} />
              {/* Dam wall */}
              <rect x="45" y="0" width="8" height="55" rx="1"
                fill={themeColor(TH.primaryHSL, 0.06, 3)} />
              {/* Pressure indicator */}
              <text x="22" y="30" textAnchor="middle"
                fill={`hsla(0, ${10 + pressure * 15}%, ${25 + pressure * 5}%, ${0.06 + pressure * 0.06})`}
                fontSize="7">{pressure > 0.3 ? 'HIGH' : 'LOW'}</text>
              {/* Flow (when opening) */}
              {drag.progress > 0.2 && (
                <motion.rect x="53" y="30" width={30 * drag.progress} height="4" rx="2"
                  fill={themeColor(TH.accentHSL, 0.06, 3)}
                  initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} />
              )}
            </svg>
            {/* Drag control */}
            <div ref={drag.containerRef} style={{ width: '12px', height: '80px', borderRadius: '6px',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              touchAction: 'none', position: 'relative' }}>
              <motion.div {...drag.dragProps}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'grab',
                  background: themeColor(TH.accentHSL, 0.08 + drag.progress * 0.04, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                  position: 'absolute', left: '-6px', top: '2px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Open the gates ↓</div>
          </motion.div>
        )}
        {stage === 'flowing' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Flowing. The pressure dropped. Do not dam the river - let it flow. Sadness cleanses the landscape. It will pass if you let it move. The Daoist principle: water that is blocked becomes stagnant; water that flows stays clear. Your sadness is not a flood to fear. It is a river to trust.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Emotional acceptance. James Gross{"'"}s process model: suppression (damming) increases physiological arousal and impairs memory. Acceptance (allowing) reduces the duration and intensity of negative affect. The paradox: fighting sadness prolongs it; allowing sadness resolves it. ACT (Acceptance and Commitment Therapy) calls this "willingness" - letting the emotion move through you rather than trying to control it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Flowing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}