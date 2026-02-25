/**
 * GLITCH #9 — The Reality Tear
 * "Look at the code. It is just a number. You can change the variable."
 * ARCHETYPE: Pattern B (Drag) — Drag to tear the interface, revealing raw data
 * ENTRY: Ambient Fade — interface surface appears with a subtle crack
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GLITCH_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Storm');
type Stage = 'ambient' | 'active' | 'torn' | 'resonant' | 'afterglow';

const CODE_LINES = [
  '{ "user": {',
  '    "anger_level": 8,',
  '    "fear_index": 6,',
  '    "hope": 0.3,',
  '    "status": "struggling"',
  '  }',
  '}',
];

export default function Glitch_RealityTear({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const drag = useDragInteraction({
    axis: 'x',
    onComplete: () => {
      setStage('torn');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tearAmount = drag.progress;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.div animate={{ opacity: [0.03, 0.06, 0.03] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ width: '1px', height: '100px',
                background: themeColor(TH.accentHSL, 0.08, 6) }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a crack in the surface</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The interface has a seam. Drag to tear it open. See what's underneath.
            </div>
            <div style={{ position: 'relative', width: '240px', height: '120px', overflow: 'hidden', borderRadius: radius.sm }}>
              {/* Code layer (behind) */}
              <div style={{ position: 'absolute', inset: 0, padding: '10px',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                opacity: tearAmount }}>
                {CODE_LINES.map((line, i) => (
                  <div key={i} style={{ fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.5,
                    color: themeColor(TH.accentHSL, 0.25 + tearAmount * 0.15, 10) }}>{line}</div>
                ))}
              </div>
              {/* Surface layer */}
              <div style={{ position: 'absolute', inset: 0,
                background: themeColor(TH.primaryHSL, 0.1, 5),
                clipPath: `inset(0 ${tearAmount * 100}% 0 0)`,
                transition: 'clip-path 0.1s',
                borderRight: tearAmount > 0.05 ? `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ ...navicueType.hint, color: palette.textFaint }}>the surface</div>
              </div>
            </div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              padding: '8px 28px', borderRadius: radius.xl, cursor: 'grab',
              background: themeColor(TH.primaryHSL, 0.06 + tearAmount * 0.04, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06 + tearAmount * 0.08, 6)}`,
            }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {drag.completed ? 'torn' : drag.isDragging ? 'tearing\u2026' : 'drag to tear'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'torn' && (
          <motion.div key="torn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ padding: '12px', borderRadius: radius.sm, background: themeColor(TH.primaryHSL, 0.04, 2) }}>
              {CODE_LINES.map((line, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ fontFamily: 'monospace', fontSize: '10px', lineHeight: 1.6,
                    color: themeColor(TH.accentHSL, 0.3, 12) }}>{line}</motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>
              "Anger_Level: 8." It is just a number. You can change the variable.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Reification. Turning a subjective feeling into an objective data object creates psychological distance and manageability. "I am furious" becomes "Anger = 8." Variables can be decremented.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Just a variable.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}