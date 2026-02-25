/**
 * MEANING MAKER #6 — The Service Shift
 * "Stage fright comes from 'How do I look?' Confidence comes from 'How can I help?'"
 * ARCHETYPE: Pattern B (Drag) — Drag spotlight from Self to Other
 * ENTRY: Scene-first — spotlight on you
 * STEALTH KBE: Holding spotlight on Other = Attentional Outwardness (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'lit' | 'shifted' | 'resonant' | 'afterglow';

export default function Meaning_ServiceShift({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({ axis: 'y', sticky: true,
    onComplete: () => {
      console.log(`[KBE:E] ServiceShift attentionalOutwardness=confirmed spotlightOnOther=true`);
      setStage('shifted');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('lit'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const selfOpacity = 1 - drag.progress;
  const otherOpacity = drag.progress;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '20px', height: '20px', borderRadius: '50%',
              background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.08, 5)}, transparent)` }} />
        )}
        {stage === 'lit' && (
          <motion.div key="li" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The spotlight is on you. It feels hot. Move it to them.
            </div>
            {/* Stage visualization */}
            <div style={{ width: '180px', height: '70px', position: 'relative',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px' }}>
              {/* Self figure */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                opacity: 0.3 + selfOpacity * 0.7, transition: 'opacity 0.3s' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%',
                  background: themeColor(TH.primaryHSL, 0.08, 4) }} />
                <div style={{ width: '8px', height: '16px', borderRadius: '2px',
                  background: themeColor(TH.primaryHSL, 0.06, 3) }} />
                <span style={{ fontSize: '7px', color: palette.textFaint, marginTop: '2px' }}>You</span>
              </div>
              {/* Spotlight cone */}
              <div style={{ position: 'absolute', top: '-5px',
                left: `${15 + drag.progress * 55}%`, width: '40px', height: '70px',
                background: `radial-gradient(ellipse at center top, ${themeColor(TH.accentHSL, 0.04 + otherOpacity * 0.03, 3)}, transparent)`,
                borderRadius: '50%', transition: 'left 0.2s',
                transform: 'translateX(-50%)' }} />
              {/* Others */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0, 1, 2].map(idx => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                      opacity: 0.15 + otherOpacity * 0.6, transition: 'opacity 0.3s' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%',
                        background: themeColor(TH.accentHSL, 0.06 + otherOpacity * 0.06, 3 + idx) }} />
                      <div style={{ width: '6px', height: '14px', borderRadius: '2px',
                        background: themeColor(TH.accentHSL, 0.04 + otherOpacity * 0.04, 2 + idx) }} />
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '7px', color: palette.textFaint }}>Them</span>
              </div>
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
        {stage === 'shifted' && (
          <motion.div key="sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Shifted. The light is on them now. Stage fright comes from "How do I look?" Confidence comes from "How can I help?" Moving the spotlight outward dissolves self-consciousness and activates purpose.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Attentional outwardness. Research in performance psychology shows that focusing on the audience{"'"}s needs rather than your own performance dramatically reduces anxiety and improves outcomes. Self-consciousness is a form of self-focused attention; service is its antidote. Move the light. You were never meant to stand in it alone.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Outward.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}