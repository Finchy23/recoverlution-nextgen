/**
 * TIME CAPSULE #8 — The Wine Cellar
 * "Some ideas are vinegar. Some are wine. Only time knows."
 * ARCHETYPE: Pattern E (Hold) — Hold to lay the bottle down on the rack
 * ENTRY: Ambient Fade — bottle, dust, rack all materialize simultaneously
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

export default function TimeCapsule_WineCellar({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 4000,
    onComplete: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2400);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tension = hold.tension;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <svg width="200" height="120" viewBox="0 0 200 120">
              {/* Rack */}
              {[0, 1, 2].map(i => (
                <motion.line key={i} x1="30" y1={30 + i * 35} x2="170" y2={30 + i * 35}
                  stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="1"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.2 }} />
              ))}
              {/* Bottles */}
              {[0, 1].map(i => (
                <motion.rect key={`b${i}`} x={50 + i * 60} y={18 + i * 35} width="40" height="10" rx="5"
                  fill={themeColor(TH.accentHSL, 0.08, 5)}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.3 }} />
              ))}
              {/* Dust particles */}
              {[0, 1, 2, 3].map(i => (
                <motion.circle key={`d${i}`} cx={40 + i * 40} cy={20 + i * 25} r="1"
                  fill={themeColor(TH.accentHSL, 0.1, 10)}
                  animate={{ opacity: [0.05, 0.15, 0.05], y: [0, -3, 0] }}
                  transition={{ duration: 3 + i, repeat: Infinity }} />
              ))}
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              dusty and patient
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              This idea is not ready. Some ideas are vinegar. Some are wine. Only time knows the difference. Lay it down. Let the unconscious mind do the fermenting. We{'\u2019'}ll uncork it in six months.
            </div>
            <svg width="200" height="60" viewBox="0 0 200 60">
              <line x1="20" y1="40" x2="180" y2="40" stroke={themeColor(TH.primaryHSL, 0.08, 5)} strokeWidth="1" />
              <motion.rect x={20 + tension * 100} y="30" width="60" height="14" rx="7"
                fill={themeColor(TH.accentHSL, 0.1 + tension * 0.15, 8)}
                animate={{ x: 20 + tension * 100 }}
                transition={{ type: 'spring', stiffness: 200 }} />
            </svg>
            <div
              {...hold.holdProps}
              style={{
                ...hold.holdProps.style,
                padding: '14px 28px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06 + tension * 0.08, 5),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 5)}`,
                userSelect: 'none', touchAction: 'none',
              }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {hold.completed ? 'cellared' : hold.isHolding ? 'laying down\u2026' : 'hold to cellar'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Laid down. The incubation begins. Your conscious mind will forget about it, but the deeper architecture will keep working in the dark: reorganizing, connecting, fermenting. When you uncork it, the insight will taste different.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Aging.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}