/**
 * INTUITION #10 — The Oracle Seal (Implicit Learning)
 * "The answer was never outside."
 * Pattern A (Tap) — Crystal ball reveals your own eye
 * STEALTH KBE: Completion = Implicit Learning confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'gazing' | 'revealed' | 'resonant' | 'afterglow';

export default function Intuition_OracleSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('gazing'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const reveal = () => {
    if (stage !== 'gazing') return;
    console.log(`[KBE:K] OracleSeal implicitLearning=confirmed selfOracle=true`);
    setStage('revealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="knowing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%',
              background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.04, 2)}, transparent)` }} />
          </motion.div>
        )}
        {stage === 'gazing' && (
          <motion.div key="ga" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div animate={{ boxShadow: [`0 0 12px ${themeColor(TH.accentHSL, 0.03, 2)}`, `0 0 20px ${themeColor(TH.accentHSL, 0.05, 3)}`, `0 0 12px ${themeColor(TH.accentHSL, 0.03, 2)}`] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.04, 2)}, ${themeColor(TH.primaryHSL, 0.02, 1)})`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              A crystal ball. Gaze into it. Clear the fog.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={reveal}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Clear</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'revealed' && (
          <motion.div key="rv" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%',
              background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.08, 4)} 30%, transparent 70%)`,
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.12, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}` }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%',
                  background: themeColor(TH.primaryHSL, 0.08, 4), margin: '4px' }} />
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Your own eye. Looking back at you. The crystal ball clears to reveal... the oracle was always you. The answer was never outside. Every exercise in this collection — the gut check, the coin flip, the body scan, the silence — they were all techniques for accessing what you already know.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Implicit learning. Arthur Reber{"'"}s research: knowledge acquired independently of conscious attempts to learn. You know more than you can articulate — this is the "tacit knowledge" Polanyi described. Intuition is the felt sense of implicit learning surfacing. The Oracle collection trained you to access this channel: through the body (somatic markers), through silence (DMN), through projection (future self), through elimination (fear vs. danger). The answer was never outside.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Oracle.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}