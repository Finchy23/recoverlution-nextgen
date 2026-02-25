/**
 * ETHICIST #7 — The Responsibility Weight
 * "Fault is the past. Responsibility is the future."
 * ARCHETYPE: Pattern A (Tap) — Accept and lift the barbell
 * ENTRY: Scene-first — heavy barbell
 * STEALTH KBE: Accepting weight = Locus of Control shift / Victim → Player (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'grounded' | 'lifted' | 'resonant' | 'afterglow';

export default function Ethicist_ResponsibilityWeight({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('grounded'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const lift = () => {
    if (stage !== 'grounded') return;
    console.log(`[KBE:B] ResponsibilityWeight locusOfControl=internal victimToPlayer=confirmed`);
    setStage('lifted');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              <div style={{ width: '30px', height: '3px', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.06, 3) }} />
            </div>
          </motion.div>
        )}
        {stage === 'grounded' && (
          <motion.div key="gr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              "It is not your fault." But it IS your responsibility. Pick up the weight.
            </div>
            {/* Barbell */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.07, 4)}` }} />
              <div style={{ width: '60px', height: '4px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              <div style={{ width: '16px', height: '16px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.07, 4)}` }} />
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={lift}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Lift</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'lifted' && (
          <motion.div key="li" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Lifted. The weight makes you stronger. Fault is the past — it looks backward, assigns blame, paralyzes. Responsibility is the future — it looks forward, assigns action, empowers. Pick up the weight. It{"'"}s not punishment. It{"'"}s training.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Locus of control. Julian Rotter{"'"}s research: people with an internal locus of control (I am responsible for outcomes) have better mental health, higher achievement, and more adaptive coping than those with an external locus (things happen to me). Will Smith{"'"}s distinction: "Fault and responsibility are not the same thing. It may not be your fault, but it is your responsibility." The shift from victim to player is the weight you lift.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Lifted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}