/**
 * ELEMENTALIST #7 — The Forest Bath (Connection)
 * "You think you are a single tree. You are a forest."
 * ARCHETYPE: Pattern A (Tap) — Tap root to send signal through mycelium
 * ENTRY: Scene-first — mycelium network
 * STEALTH KBE: Sending signal = Interdependence / Network > Individual (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'network' | 'connected' | 'resonant' | 'afterglow';

export default function Elementalist_ForestBath({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pulse, setPulse] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('network'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const sendSignal = () => {
    if (stage !== 'network') return;
    setPulse(true);
    console.log(`[KBE:B] ForestBath interdependence=confirmed networkOverIndividual=true`);
    t(() => setStage('connected'), 2000);
    t(() => setStage('resonant'), 7000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <svg width="60" height="20" viewBox="0 0 60 20">
              <path d="M5,15 Q15,5 30,10 Q45,15 55,5" fill="none" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" />
            </svg>
          </motion.div>
        )}
        {stage === 'network' && (
          <motion.div key="ne" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A mycelium network glowing beneath the soil. Tap a root. Send a signal.
            </div>
            {/* Mycelium visualization */}
            <svg width="160" height="60" viewBox="0 0 160 60">
              {/* Root network */}
              <path d="M10,50 Q30,30 50,40 Q70,50 90,35 Q110,20 130,30 Q145,40 155,25"
                fill="none" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" strokeDasharray="3 2" />
              <path d="M20,55 Q40,40 60,45 Q80,50 100,40 Q120,30 140,35"
                fill="none" stroke={themeColor(TH.primaryHSL, 0.03, 1)} strokeWidth="1" strokeDasharray="2 3" />
              {/* Trees above */}
              {[20, 80, 140].map((x, i) => (
                <g key={i}>
                  <line x1={x} y1="15" x2={x} y2="30" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="2" />
                  <circle cx={x} cy="12" r="6" fill={themeColor(TH.primaryHSL, 0.03, 2)} />
                </g>
              ))}
              {/* Pulse animation */}
              {pulse && (
                <motion.circle initial={{ cx: 20, cy: 50, r: 3, opacity: 0.2 }}
                  animate={{ cx: 140, cy: 30, opacity: [0.2, 0.15, 0.1, 0] }}
                  transition={{ duration: 1.5 }}
                  fill={themeColor(TH.accentHSL, 0.15, 6)} />
              )}
              {/* Tap target */}
              <circle cx="20" cy="50" r="6" fill={themeColor(TH.accentHSL, 0.06, 3)}
                stroke={themeColor(TH.accentHSL, 0.1, 5)} strokeWidth="1" />
            </svg>
            <motion.div whileTap={{ scale: 0.9 }} onClick={sendSignal}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Send Signal ◉</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'connected' && (
          <motion.div key="co" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The light traveled through the root to a tree 10 miles away. You think you are a single tree. You are a forest. Every root is connected. Tap the network — send a signal. You are not alone. You never were.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Wood Wide Web. Suzanne Simard{"'"}s research: forests are not collections of individual trees competing for resources. They are interconnected networks where "mother trees" share nutrients, water, and chemical warning signals through mycorrhizal fungi. A single tree can be connected to hundreds of others. The metaphor is precise: your wellbeing is networked, not isolated. Healing happens in connection.
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