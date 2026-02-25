/**
 * MEANING MAKER #9 — The Cosmic Joke
 * "It is serious. But it is not that serious. Monkey on a rock in space."
 * ARCHETYPE: Pattern A (Tap) — Accept the laugh
 * ENTRY: Scene-first — timeline of the universe
 * STEALTH KBE: Accepting the laugh = Transcendent Humor (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'timeline' | 'laughed' | 'resonant' | 'afterglow';

export default function Meaning_CosmicJoke({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('timeline'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const laugh = () => {
    if (stage !== 'timeline') return;
    console.log(`[KBE:B] CosmicJoke humorAccepted=true transcendentHumor=confirmed`);
    setStage('laughed');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '120px', height: '3px', borderRadius: '1.5px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
        )}
        {stage === 'timeline' && (
          <motion.div key="tl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            {/* Timeline of the universe */}
            <div style={{ width: '200px', height: '30px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, height: '2px',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              <div style={{ position: 'absolute', top: '8px', left: '2px', fontSize: '6px',
                color: palette.textFaint }}>Big Bang</div>
              <div style={{ position: 'absolute', top: '18px', right: '2px', fontSize: '6px',
                color: palette.textFaint }}>Heat Death</div>
              {/* Your problem */}
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ position: 'absolute', top: '12px', left: '55%', transform: 'translateX(-50%)',
                  width: '3px', height: '6px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.15, 8) }} />
              <div style={{ position: 'absolute', top: '0px', left: '55%', transform: 'translateX(-50%)',
                fontSize: '6px', color: themeColor(TH.accentHSL, 0.25, 10), whiteSpace: 'nowrap' }}>
                your problem
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A monkey on a rock in space, worried about a deadline. It{"'"}s serious. But it{"'"}s not that serious.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={laugh}
              style={{ padding: '10px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Laugh</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'laughed' && (
          <motion.div key="la" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Ha. Good. The cosmic perspective doesn{"'"}t invalidate your pain — it frames it. The absurdity is the medicine. You{"'"}re a brief arrangement of atoms that learned to worry. That{"'"}s funny. And beautiful. And both at once.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Transcendent humor. Viktor Frankl called humor "the soul{"'"}s weapon in the fight for self-preservation." Nietzsche: "The ability to make a joke of oneself is the highest form of self-affirmation." The cosmic perspective — seeing your problem against the 13.8-billion-year timeline — doesn{"'"}t diminish it. It contextualizes it. Humor isn{"'"}t avoidance; it{"'"}s transcendence. Laugh at the absurdity. Then get back to work.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ha.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}