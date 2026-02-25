/**
 * SYNTHESIS #2 — The Emotion Blender
 * "Pure flavors are for children. Adults acquire the taste for complexity."
 * ARCHETYPE: Pattern B (Drag) — Two faders: Sadness + Gratitude → Bittersweet
 * ENTRY: Scene-first — mixing board
 * STEALTH KBE: Accepting mixed state = Emotional Maturity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'mixing' | 'blended' | 'resonant' | 'afterglow';

export default function Synthesis_EmotionBlender({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const fader1 = useDragInteraction({ axis: 'y', sticky: true, onComplete: () => {} });
  const fader2 = useDragInteraction({ axis: 'y', sticky: true, onComplete: () => {} });

  useEffect(() => { t(() => setStage('mixing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage === 'mixing' && fader1.progress > 0.6 && fader2.progress > 0.6) {
      console.log(`[KBE:B] EmotionBlender sadness=${fader1.progress.toFixed(2)} gratitude=${fader2.progress.toFixed(2)} emotionalMaturity=confirmed`);
      setStage('blended');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  }, [fader1.progress, fader2.progress, stage]);

  const blend = (fader1.progress + fader2.progress) / 2;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '6px', height: '30px', borderRadius: '3px', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            <div style={{ width: '6px', height: '30px', borderRadius: '3px', background: themeColor(TH.accentHSL, 0.06, 3) }} />
          </motion.div>
        )}
        {stage === 'mixing' && (
          <motion.div key="mix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Slide both faders up. Blend the emotions.
            </div>
            {/* Result color */}
            <div style={{ width: '60px', height: '30px', borderRadius: radius.sm,
              background: `hsla(${30 - blend * 10}, ${15 + blend * 10}%, ${20 + blend * 8}%, ${0.04 + blend * 0.08})`,
              border: `1px solid hsla(${30 - blend * 10}, ${15 + blend * 10}%, ${25 + blend * 8}%, ${0.06 + blend * 0.06})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.15 + blend * 0.2, 6 + blend * 6) }}>
                {blend < 0.3 ? '...' : blend < 0.6 ? 'Complex' : 'Bittersweet'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              {/* Fader 1: Sadness */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Sadness</span>
                <div ref={fader1.containerRef} style={{ width: '8px', height: '70px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                  touchAction: 'none', position: 'relative' }}>
                  <motion.div {...fader1.dragProps}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', cursor: 'grab',
                      background: `hsla(220, 12%, ${22 + fader1.progress * 8}%, ${0.08 + fader1.progress * 0.06})`,
                      border: `1px solid hsla(220, 12%, 30%, ${0.1 + fader1.progress * 0.06})`,
                      position: 'absolute', left: '-6px', top: '2px' }} />
                </div>
              </div>
              {/* Fader 2: Gratitude */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6) }}>Gratitude</span>
                <div ref={fader2.containerRef} style={{ width: '8px', height: '70px', borderRadius: radius.xs,
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                  touchAction: 'none', position: 'relative' }}>
                  <motion.div {...fader2.dragProps}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', cursor: 'grab',
                      background: themeColor(TH.accentHSL, 0.08 + fader2.progress * 0.06, 4),
                      border: `1px solid ${themeColor(TH.accentHSL, 0.12 + fader2.progress * 0.06, 6)}`,
                      position: 'absolute', left: '-6px', top: '2px' }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'blended' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Bittersweet. Sadness and Gratitude together taste like wisdom. The chef doesn{"'"}t remove the bitter; they balance it with the sweet. Emotional complexity isn{"'"}t confusion; it{"'"}s maturity. Pure flavors are for children.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Emotional complexity. Susan David{"'"}s research on emotional agility shows that people who accept mixed emotions, rather than forcing themselves to feel one "correct" thing, have better psychological health, stronger relationships, and greater resilience. The bittersweet is not a bug; it{"'"}s the highest flavor. Blend them.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Blended.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}