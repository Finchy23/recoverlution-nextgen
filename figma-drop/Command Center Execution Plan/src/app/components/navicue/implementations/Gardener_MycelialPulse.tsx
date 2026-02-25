/**
 * GARDENER II #4 — The Mycelial Pulse
 * "Competition is for the weak. Strong systems cooperate."
 * Pattern A (Tap) — Touch soil; pulse travels underground to neighboring tree
 * STEALTH KBE: Sending resource to struggling tree = Prosocial Behavior / Altruism (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GARDENER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Ecological Identity', 'embodying', 'Canopy');
type Stage = 'arriving' | 'soil' | 'pulsing' | 'shared' | 'resonant' | 'afterglow';

export default function Gardener_MycelialPulse({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('soil'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const sendPulse = () => {
    if (stage !== 'soil') return;
    setStage('pulsing');
    t(() => {
      console.log(`[KBE:E] MycelialPulse altruism=confirmed prosocialBehavior=true`);
      setStage('shared');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }, 2500);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Ecological Identity" kbe="embodying" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '2px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'soil' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Touch the soil. Send a pulse of energy underground to the struggling tree beside you.
            </div>
            {/* Two trees with underground connection */}
            <svg width="120" height="60" viewBox="0 0 120 60">
              <line x1="30" y1="40" x2="30" y2="20" stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="2" />
              <circle cx="30" cy="14" r="8" fill={themeColor(TH.accentHSL, 0.06, 3)} />
              <line x1="90" y1="40" x2="90" y2="24" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="2" />
              <circle cx="90" cy="18" r="6" fill={themeColor(TH.primaryHSL, 0.03, 1)} />
              <text x="90" y="6" textAnchor="middle" fill={palette.textFaint} fontSize="11">struggling</text>
              <line x1="30" y1="40" x2="90" y2="40" stroke={themeColor(TH.primaryHSL, 0.03, 1)} strokeWidth="0.5" strokeDasharray="2,2" />
              <rect x="0" y="38" width="120" height="22" fill={themeColor(TH.primaryHSL, 0.02, 1)} rx="2" />
            </svg>
            <motion.div whileTap={{ scale: 0.9 }} onClick={sendPulse}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Send Pulse</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'pulsing' && (
          <motion.div key="pu" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <svg width="120" height="60" viewBox="0 0 120 60">
              <line x1="30" y1="40" x2="30" y2="20" stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="2" />
              <circle cx="30" cy="14" r="8" fill={themeColor(TH.accentHSL, 0.06, 3)} />
              <line x1="90" y1="40" x2="90" y2="24" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="2" />
              <circle cx="90" cy="18" r="6" fill={themeColor(TH.primaryHSL, 0.03, 1)} />
              <rect x="0" y="38" width="120" height="22" fill={themeColor(TH.primaryHSL, 0.02, 1)} rx="2" />
              <motion.circle
                initial={{ cx: 30, cy: 46 }}
                animate={{ cx: 90, cy: 46 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                r="3" fill={themeColor(TH.accentHSL, 0.1, 6)} />
            </svg>
            <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6), fontStyle: 'italic' }}>
              Resource sharing...
            </span>
          </motion.div>
        )}
        {stage === 'shared' && (
          <motion.div key="sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Shared. The pulse arrived. The struggling tree{"'"}s roots received your surplus. Competition is for the weak. Strong systems cooperate. The Wood Wide Web — mycelial networks that connect trees underground — allows "mother trees" to send carbon and nutrients to seedlings. Send your surplus to the struggling tree. The forest stands together.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            The Wood Wide Web. Suzanne Simard{"'"}s research: forest trees share resources through mycorrhizal fungal networks. "Mother trees" send carbon to shaded seedlings, fungi facilitate nutrient exchange between species, and dying trees dump their resources into the network. The forest is not a collection of individuals competing for light — it is a superorganism cooperating underground. Altruism research (Batson): genuine empathic concern for others exists and improves well-being for both giver and receiver.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Connected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}