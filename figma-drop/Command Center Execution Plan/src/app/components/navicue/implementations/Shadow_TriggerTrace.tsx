/**
 * SHADOW WORKER #8 — The Trigger Trace
 * "You are not reacting to the email. Follow the thread back."
 * ARCHETYPE: Pattern D (Type) — Type the original event
 * ENTRY: Cold open — red thread tracing back through years
 * STEALTH KBE: Identifying original event = Psychodynamic Insight (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Ocean');
type Stage = 'arriving' | 'tracing' | 'active' | 'traced' | 'resonant' | 'afterglow';

export default function Shadow_TriggerTrace({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [years, setYears] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'the original event...',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      console.log(`[KBE:K] TriggerTrace originalEvent="${value.trim()}" psychodynamicInsight=confirmed`);
      setStage('traced');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('tracing'), 1500); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'tracing') return;
    const steps = [1, 5, 10, 20];
    steps.forEach((y, i) => {
      t(() => setYears(y), (i + 1) * 800);
    });
    t(() => setStage('active'), steps.length * 800 + 500);
  }, [stage]);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '2px', background: 'hsla(0, 25%, 35%, 0.12)', borderRadius: '1px' }} />
        )}
        {stage === 'tracing' && (
          <motion.div key="tr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '100px', height: '2px', background: 'hsla(0, 20%, 35%, 0.1)', borderRadius: '1px',
              position: 'relative' }}>
              <motion.div animate={{ width: `${Math.min(100, years * 5)}%` }}
                style={{ height: '2px', background: 'hsla(0, 25%, 35%, 0.15)', borderRadius: '1px' }} />
            </div>
            <div style={{ ...navicueType.hint, color: 'hsla(0, 20%, 40%, 0.3)' }}>
              {years > 0 ? `${years} years back...` : 'tracing...'}
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The thread stopped. Who pulled this thread first? What was the original event?
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Found it</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'traced' && (
          <motion.div key="tc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            The root. Not the email, not the traffic, not the comment. The original wound. Now you know what you{"'"}re really reacting to.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Psychodynamic insight. You{"'"}re not reacting to the surface trigger. You{"'"}re reacting to the thread. Follow it back through years to the original event. Who pulled this thread first? Naming the root dissolves its unconscious power.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Traced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}