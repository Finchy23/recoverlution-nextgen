/**
 * MYSTIC #5 — The Space Between
 * "The thoughts are clouds. You are the sky."
 * Pattern C (Hold) — Two thoughts float by; hold the gap open between them
 * STEALTH KBE: Duration holding empty space = Witness Consciousness / Disidentification (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Non-Dual Awareness', 'embodying', 'Practice');
type Stage = 'arriving' | 'thoughts' | 'gap' | 'sky' | 'resonant' | 'afterglow';

export default function Mystic_SpaceBetween({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] SpaceBetween witnessConsciousness=confirmed disidentification=true`);
      setStage('sky');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('thoughts'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage === 'thoughts') t(() => setStage('gap'), 3500);
  }, [stage]);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '40px', height: '1px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'thoughts' && (
          <motion.div key="th" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 0.6 }}
              transition={{ duration: 1.5 }}
              style={{ padding: '6px 12px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>I am hungry</span>
            </motion.div>
            <div style={{ height: '20px' }} />
            <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 0.6 }}
              transition={{ duration: 1.5, delay: 1.5 }}
              style={{ padding: '6px 12px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>I am tired</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'gap' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A gap opened between the thoughts. Who is in the gap? Hold it open.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '4px 10px', borderRadius: '6px', background: themeColor(TH.primaryHSL, 0.02, 1),
                opacity: 0.4 }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>I am hungry</span>
              </div>
              <motion.div animate={{ height: [20, 28 + hold.progress * 20, 20] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ width: '1px', background: themeColor(TH.accentHSL, 0.04 + hold.progress * 0.04, 3) }} />
              <div style={{ padding: '4px 10px', borderRadius: '6px', background: themeColor(TH.primaryHSL, 0.02, 1),
                opacity: 0.4 }}>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>I am tired</span>
              </div>
            </div>
            <motion.div {...hold.holdProps}
              style={immersiveHoldPillThemed(TH.accentHSL).container(hold.progress)}>
              <div style={immersiveHoldPillThemed(TH.accentHSL).label(hold.progress)}>
                {hold.isHolding ? `Holding... ${Math.round(hold.progress * 100)}%` : 'Hold the Gap'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sky' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            You are the sky. The thoughts were clouds — "I am hungry," "I am tired." But who was noticing them? Who was in the gap? The sky is not hungry. The sky is not tired. The sky just holds everything. That spacious awareness between thoughts — that{"'"}s what you are. Not the content. The container.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Witness consciousness. The "observer self" in Eastern traditions (sakshi in Sanskrit) and Western psychology (ACT{"'"}s "self-as-context"). The gap between thoughts is not empty — it is awareness itself. Neuroscience: the default mode network generates the "narrative self" (the story); meditation deactivates the DMN, revealing the "minimal self" — pure awareness without content. The sky metaphor (from Dzogchen tradition): thoughts are clouds that form and dissolve, but the sky remains unchanged.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sky.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}