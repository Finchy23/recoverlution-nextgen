/**
 * ZENITH #7 — The Sherpa Mindset
 * "Help them. The service creates the energy."
 * ARCHETYPE: Pattern A (Tap) — Help someone struggling, energy bar refills
 * ENTRY: Scene-first — exhausted, another struggling
 * STEALTH KBE: Performing help action = Altruistic Energy / Helper's High (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ZENITH_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'tired' | 'helped' | 'resonant' | 'afterglow';

export default function Zenith_SherpaMindset({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [energy, setEnergy] = useState(20);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('tired'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const help = () => {
    if (stage !== 'tired') return;
    console.log(`[KBE:E] SherpaMindset altruisticEnergy=confirmed helpersHigh=true`);
    setEnergy(85);
    setStage('helped');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: '8px', height: '14px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              <div style={{ width: '8px', height: '14px', borderRadius: '2px', background: themeColor(TH.primaryHSL, 0.03, 1) }} />
            </motion.div>
        )}
        {stage === 'tired' && (
          <motion.div key="ti" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You{"'"}re exhausted. Someone else is struggling. Offer a hand?
            </div>
            {/* Energy bar */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>Energy</span>
              <div style={{ width: '80px', height: '6px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                <motion.div animate={{ width: `${energy}%` }}
                  style={{ height: '100%', borderRadius: '3px',
                    background: energy < 30
                      ? 'hsla(0, 12%, 28%, 0.08)'
                      : themeColor(TH.accentHSL, 0.12, 6) }} />
              </div>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>{energy}%</span>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={help}
              style={{ padding: '14px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Offer Hand</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'helped' && (
          <motion.div key="he" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {/* Refilled bar */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>Energy</span>
              <div style={{ width: '80px', height: '6px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                <motion.div initial={{ width: '20%' }} animate={{ width: '85%' }}
                  transition={{ duration: 1, type: 'spring' }}
                  style={{ height: '100%', borderRadius: '3px',
                    background: themeColor(TH.accentHSL, 0.12, 6) }} />
              </div>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>85%</span>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Your energy refilled. You were tired because you were thinking about your own legs. When you helped them, something shifted. The service created the energy. The sherpa carries the heaviest load and climbs the fastest.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Helper{"'"}s High. Allan Luks{"'"} research on altruistic energy: helping others triggers endorphin release and reduces stress hormones. The paradox: giving energy creates energy. Self-focused rumination depletes; other-focused service refuels. The Sherpa carries the heaviest load and is the strongest on the mountain. Service is not sacrifice; it{"'"}s fuel.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Fueled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}