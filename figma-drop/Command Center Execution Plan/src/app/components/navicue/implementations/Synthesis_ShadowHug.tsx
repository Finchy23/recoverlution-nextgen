/**
 * SYNTHESIS #3 — The Shadow Hug
 * "Hug the monster to get the gold."
 * ARCHETYPE: Pattern B (Drag) — Drag bright and dark avatars together
 * ENTRY: Scene-first — two figures
 * STEALTH KBE: Sustaining embrace = Self-Acceptance / Integration (E)
 * WEB ADAPT: haptic → visual pulse unification
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'separate' | 'embraced' | 'resonant' | 'afterglow';

export default function Synthesis_ShadowHug({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] ShadowHug integration=confirmed selfAcceptance=true`);
      setStage('embraced');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('separate'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const gap = 40 * (1 - drag.progress);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '30px' }}>
            <div style={{ width: '14px', height: '20px', borderRadius: radius.xs, background: themeColor(TH.accentHSL, 0.06, 4) }} />
            <div style={{ width: '14px', height: '20px', borderRadius: radius.xs, background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'separate' && (
          <motion.div key="sep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You and your shadow. Bring them together.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${gap}px`, transition: 'gap 0.15s' }}>
              {/* Bright avatar */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + drag.progress * 0.06, 5) }} />
                <div style={{ width: '10px', height: '18px', borderRadius: '3px',
                  background: themeColor(TH.accentHSL, 0.08 + drag.progress * 0.04, 4) }} />
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6) }}>You</span>
              </div>
              {drag.progress > 0.85 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ width: '24px', height: '30px', borderRadius: '6px',
                    background: `linear-gradient(135deg, ${themeColor(TH.accentHSL, 0.08, 4)}, ${themeColor(TH.primaryHSL, 0.06, 3)})`,
                    border: `1px solid ${themeColor(TH.accentHSL, 0.12, 6)}` }} />
              )}
              {/* Dark shadow */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%',
                  background: themeColor(TH.primaryHSL, 0.06, 2) }} />
                <div style={{ width: '10px', height: '18px', borderRadius: '3px',
                  background: themeColor(TH.primaryHSL, 0.04, 1) }} />
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Shadow</span>
              </div>
            </div>
            <div ref={drag.containerRef} style={{ width: '12px', height: '80px', borderRadius: '6px',
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
        {stage === 'embraced' && (
          <motion.div key="em" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            One being. Textured, whole. The shadow wasn{"'"}t a villain; it was a lost part of you carrying a heavy gift. Hug the monster to get the gold. The jagged pulse is now a single heartbeat.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Shadow integration. Carl Jung: "One does not become enlightened by imagining figures of light, but by making the darkness conscious." The shadow contains not just our flaws but our unlived potential: creativity, power, spontaneity. Integration doesn{"'"}t mean the shadow disappears; it means you stop fighting it. The embrace is the medicine.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Whole.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}