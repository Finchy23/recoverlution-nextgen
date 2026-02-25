/**
 * GRANDMASTER #6 — The Fog of War
 * "Information is expensive. Send the scout to the biggest risk."
 * ARCHETYPE: Pattern A (Tap) — Place one scout token to reveal Goal or Threat
 * ENTRY: Cold open — fog-covered map
 * STEALTH KBE: Revealing Threat first = Prudence; Goal = Optimism (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Circuit');
type Stage = 'arriving' | 'active' | 'revealed' | 'resonant' | 'afterglow';

export default function Grandmaster_FogOfWar({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState<'threat' | 'goal' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const scout = (sector: 'threat' | 'goal') => {
    if (stage !== 'active') return;
    setChoice(sector);
    console.log(`[KBE:K] FogOfWar scouted=${sector} prudence=${sector === 'threat'}`);
    setStage('revealed');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '100px', height: '70px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>FOG</span>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              One scout. Two sectors hidden. What must you know?
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => scout('threat')}
                style={{ width: '90px', height: '60px', borderRadius: radius.sm, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px' }}>{'\u26a0'}</span>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Threat</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => scout('goal')}
                style={{ width: '90px', height: '60px', borderRadius: radius.sm, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.04, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px' }}>{'\u2605'}</span>
                <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>Goal</span>
              </motion.div>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              you cannot know everything
            </div>
          </motion.div>
        )}
        {stage === 'revealed' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
              style={{ padding: '12px 20px', borderRadius: radius.sm,
                background: choice === 'threat' ? themeColor(TH.primaryHSL, 0.05, 3) : themeColor(TH.accentHSL, 0.05, 3),
                border: `1px solid ${choice === 'threat' ? themeColor(TH.primaryHSL, 0.08, 5) : themeColor(TH.accentHSL, 0.08, 6)}` }}>
              <span style={{ ...navicueType.texture, color: palette.text }}>
                {choice === 'threat' ? 'Threat revealed: Ambush at 3 o\'clock. Reroute.' : 'Goal revealed: The treasure is north. But what guards it?'}
              </span>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'threat'
                ? 'Prudent. You neutralized the downside first.'
                : 'Optimistic. You found the prize, but blind to the risk.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Risk prioritization. You cannot wait for certainty. Information is expensive. The grandmaster scouts the threat first because eliminating downside preserves optionality. Guess the rest.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Scouted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}