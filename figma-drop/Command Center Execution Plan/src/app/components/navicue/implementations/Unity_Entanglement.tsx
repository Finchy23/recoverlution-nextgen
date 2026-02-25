/**
 * OMEGA #5 — The Entanglement (Connection)
 * "Distance is an illusion. Love is the entanglement."
 * STEALTH KBE: Interacting with particles = Relational Permanence (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Non-Locality', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'particles' | 'entangled' | 'resonant' | 'afterglow';

export default function Unity_Entanglement({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [touched, setTouched] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('particles'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const touchParticle = () => {
    if (stage !== 'particles' || touched) return;
    setTouched(true);
    console.log(`[KBE:K] Entanglement touched=true relationalPermanence=true nonLocality=true`);
    t(() => setStage('entangled'), 2500);
    t(() => setStage('resonant'), 7000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 14000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Non-Locality" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.06, 3) }} />
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.06, 3) }} />
            </div>
          </motion.div>
        )}
        {stage === 'particles' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '60px', position: 'relative' }}>
              {/* Particle A — touchable */}
              <motion.div whileTap={{ scale: 0.8 }} onClick={touchParticle}
                animate={touched ? { scale: [1, 1.3, 1], backgroundColor: themeColor(TH.accentHSL, 0.2, 10) } : {}}
                style={{ width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer',
                  backgroundColor: themeColor(TH.accentHSL, 0.08, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 6)}`,
                  zIndex: 1 }} />
              {/* Connection line */}
              <div style={{ position: 'absolute', left: '24px', top: '11px', width: '60px', height: '1px',
                background: touched ? themeColor(TH.accentHSL, 0.15, 6) : themeColor(TH.primaryHSL, 0.04, 2),
                transition: 'all 0.5s' }} />
              {/* Particle B — responds */}
              <motion.div
                animate={touched ? { scale: [1, 1.3, 1], backgroundColor: themeColor(TH.accentHSL, 0.2, 10) } : {}}
                transition={{ delay: 0.1 }}
                style={{ width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: themeColor(TH.accentHSL, 0.08, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 6)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Touch one particle. Watch the other respond instantly.
            </div>
            {touched && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontSize: '11px', color: palette.textFaint }}>Spooky action at a distance.</motion.div>
            )}
          </motion.div>
        )}
        {stage === 'entangled' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.15, 8) }} />
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.15, 8) }} />
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontSize: '11px' }}>
              You are never separate from what you love.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Quantum entanglement (Bell, 1964): two particles, once connected, respond to each other instantaneously regardless of distance. Einstein called it {"\""}spooky action at a distance.{"\""} Distance is an illusion. Love is the entanglement.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Connected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}