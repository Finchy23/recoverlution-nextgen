/**
 * EDITOR #7 — The Continuity Fix
 * "It is not a character flaw. It is a plot hole. Fill it with context."
 * ARCHETYPE: Pattern A (Tap) — Bridge a timeline gap with compassionate label
 * ENTRY: Scene-first — timeline with gap
 * STEALTH KBE: Choosing "Tired" over "Lazy" = Self-Compassion narrative shift (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { EDITOR_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Storm');
type Stage = 'arriving' | 'active' | 'bridged' | 'resonant' | 'afterglow';

export default function Editor_ContinuityFix({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'tired' | 'lazy' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const bridge = (label: 'tired' | 'lazy') => {
    if (stage !== 'active') return;
    setChoice(label);
    console.log(`[KBE:B] ContinuityFix bridge=${label} selfCompassion=${label === 'tired'}`);
    setStage('bridged');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '40px', height: '3px', background: themeColor(TH.accentHSL, 0.15, 8), borderRadius: '2px' }} />
            <div style={{ width: '20px', height: '3px', background: 'transparent', borderTop: `1px dashed ${themeColor(TH.primaryHSL, 0.1, 6)}` }} />
            <div style={{ width: '40px', height: '3px', background: themeColor(TH.primaryHSL, 0.08, 4), borderRadius: '2px' }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Fill the gap. Context, not shame.
            </div>
            {/* Timeline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '50px', height: '3px', background: themeColor(TH.accentHSL, 0.15, 8), borderRadius: '2px' }} />
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 10) }}>disciplined</span>
              </div>
              <div style={{ width: '30px', height: '0', borderTop: `1px dashed ${themeColor(TH.primaryHSL, 0.1, 6)}` }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '50px', height: '3px', background: themeColor(TH.primaryHSL, 0.06, 3), borderRadius: '2px' }} />
                <span style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.15, 6) }}>???</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => bridge('tired')}
                style={{ padding: '14px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15), fontSize: '11px' }}>I was tired</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => bridge('lazy')}
                style={{ padding: '14px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.3, 10), fontSize: '11px' }}>I am lazy</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'bridged' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '50px', height: '3px', background: themeColor(TH.accentHSL, 0.15, 8), borderRadius: '2px' }} />
              <motion.div initial={{ width: 0 }} animate={{ width: '30px' }} transition={{ duration: 0.8 }}
                style={{ height: '3px', borderRadius: '2px',
                  background: choice === 'tired' ? themeColor(TH.accentHSL, 0.12, 6) : themeColor(TH.primaryHSL, 0.06, 3) }} />
              <div style={{ width: '50px', height: '3px', background: themeColor(TH.accentHSL, 0.1, 6), borderRadius: '2px' }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'tired'
                ? 'The gap is bridged with compassion. You didn\'t break. You rested.'
                : 'The gap is filled with shame. The timeline fractures further.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-compassion narrative. It{"'"}s not a character flaw; it{"'"}s a plot hole. Filling the gap with context instead of shame rewrites the self-narrative from "broken" to "resting."
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Bridged.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}