/**
 * ENGINEER #6 — The Redundancy (Backup)
 * "Plan B allows Plan A to be aggressive."
 * Pattern A (Tap) — Add a safety net to the tightrope walker
 * STEALTH KBE: Installing the net = Risk Mitigation / Safety Net belief (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'exposed' | 'secured' | 'resonant' | 'afterglow';

export default function Engineer_Redundancy({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [netInstalled, setNetInstalled] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('exposed'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const installNet = () => {
    if (stage !== 'exposed') return;
    setNetInstalled(true);
    console.log(`[KBE:B] Redundancy safetyNet=installed riskMitigation=confirmed`);
    setStage('secured');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <svg width="60" height="20" viewBox="0 0 60 20">
              <line x1="5" y1="5" x2="55" y2="5" stroke={themeColor(TH.primaryHSL, 0.05, 3)} strokeWidth="1" />
            </svg>
          </motion.div>
        )}
        {stage === 'exposed' && (
          <motion.div key="ex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A tightrope walker. One mistake = death. No net. Add one.
            </div>
            <svg width="140" height="70" viewBox="0 0 140 70">
              {/* Rope */}
              <line x1="10" y1="20" x2="130" y2="20" stroke={themeColor(TH.primaryHSL, 0.06, 4)} strokeWidth="1.5" />
              {/* Walker */}
              <motion.g initial={{ x: 0 }} animate={{ x: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}>
                <circle cx="70" cy="14" r="4" fill={themeColor(TH.accentHSL, 0.08, 4)} />
                <line x1="70" y1="18" x2="70" y2="28" stroke={themeColor(TH.accentHSL, 0.06, 3)} strokeWidth="1" />
              </motion.g>
              {/* Platforms */}
              <rect x="2" y="16" width="12" height="8" rx="1" fill={themeColor(TH.primaryHSL, 0.04, 2)} />
              <rect x="126" y="16" width="12" height="8" rx="1" fill={themeColor(TH.primaryHSL, 0.04, 2)} />
              {/* Net (if installed) */}
              {netInstalled && (
                <motion.path d="M20,50 Q45,40 70,50 Q95,60 120,50" fill="none"
                  initial={{ opacity: 0 }} animate={{ opacity: 0.08 }}
                  stroke={themeColor(TH.accentHSL, 0.1, 5)} strokeWidth="1" strokeDasharray="4 2" />
              )}
              {/* Drop zone text */}
              {!netInstalled && (
                <text x="55" y="55" fill={palette.textFaint} fontSize="6">No net</text>
              )}
            </svg>
            <motion.div whileTap={{ scale: 0.9 }} onClick={installNet}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Add Safety Net</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'secured' && (
          <motion.div key="se" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Net installed. Now you can walk faster. Fragility is having one point of failure. Resilience is having a backup. Paradoxically, the net doesn{"'"}t make you timid — it makes you brave. Plan B allows Plan A to be aggressive. Safety isn{"'"}t the enemy of ambition; it{"'"}s the foundation.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Antifragility. Nassim Taleb{"'"}s key insight: systems with redundancy don{"'"}t just survive shocks — they benefit from them. The tightrope walker without a net takes fewer risks, not more. Backup plans don{"'"}t signal weakness; they free you to act boldly. In financial engineering, it{"'"}s called a "margin of safety." In psychology, it{"'"}s called "secure attachment" — the safety net of a reliable relationship allows you to take bigger risks in the world.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Secured.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}