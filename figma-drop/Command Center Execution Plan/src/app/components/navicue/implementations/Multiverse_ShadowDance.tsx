/**
 * MULTIVERSE #8 — The Shadow Dance
 * "Your darkness has rhythm. Dance with it."
 * ARCHETYPE: Pattern A (Tap) — Engage dance interaction with shadow
 * ENTRY: Scene-first — shadow figure
 * STEALTH KBE: Accepting shadow figure = Wholeness / Shadow Integration (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MULTIVERSE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'facing' | 'dancing' | 'resonant' | 'afterglow';

export default function Multiverse_ShadowDance({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [steps, setSteps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('facing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const dance = () => {
    if (stage !== 'facing') return;
    const next = steps + 1;
    setSteps(next);
    if (next >= 3) {
      console.log(`[KBE:B] ShadowDance shadowIntegration=confirmed wholeness=true`);
      setStage('dancing');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ width: '14px', height: '26px', borderRadius: '7px 7px 4px 4px',
              background: themeColor(TH.primaryHSL, 0.04, 1) }} />
        )}
        {stage === 'facing' && (
          <motion.div key="fa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your shadow stands before you. Don{"'"}t fight it. Dance with it.
            </div>
            {/* You + Shadow */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <motion.div animate={{ rotate: steps > 0 ? [0, -8, 8, 0] : 0 }}
                transition={{ duration: 1.2, repeat: steps > 0 ? Infinity : 0 }}
                style={{ width: '16px', height: '30px', borderRadius: '8px 8px 4px 4px',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }} />
              <motion.div animate={{ rotate: steps > 0 ? [0, 8, -8, 0] : 0 }}
                transition={{ duration: 1.2, repeat: steps > 0 ? Infinity : 0 }}
                style={{ width: '16px', height: '30px', borderRadius: '8px 8px 4px 4px',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }} />
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={dance}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>
                {steps === 0 ? 'Twirl' : steps === 1 ? 'Step' : 'Dip'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: i < steps
                    ? themeColor(TH.accentHSL, 0.15, 8)
                    : themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'dancing' && (
          <motion.div key="da" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Beautiful. Your darkness has rhythm. You didn{"'"}t step on the shadow — you twirled it. The beauty is in the contrast. Light without shadow is blinding. Shadow without light is void. Together, they dance.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Shadow integration. Carl Jung: "One does not become enlightened by imagining figures of light, but by making the darkness conscious." The Shadow contains repressed qualities — both negative AND positive. Integration (not elimination) is the goal. The person who dances with their shadow is more complete, more resilient, and paradoxically, more light-filled than the person who denies it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Dancing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}