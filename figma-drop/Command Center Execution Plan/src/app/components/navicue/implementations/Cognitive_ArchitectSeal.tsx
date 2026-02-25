/**
 * ARCHITECT II #10 — The Architect Seal (Cognitive Sovereignty)
 * "You are the master of the house."
 * Pattern A (Tap) — Golden key turns in lock; palace doors open
 * STEALTH KBE: Completion = Cognitive Sovereignty confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'keyhole' | 'sealed' | 'resonant' | 'afterglow';

export default function Cognitive_ArchitectSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('keyhole'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const turn = () => {
    if (stage !== 'keyhole') return;
    console.log(`[KBE:K] ArchitectSeal cognitiveSovereignty=confirmed palaceMaster=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }} exit={{ opacity: 0 }}>
            <svg width="16" height="24" viewBox="0 0 16 24">
              <circle cx="8" cy="8" r="5" fill="none" stroke={themeColor(TH.accentHSL, 0.05, 3)} strokeWidth="1" />
              <rect x="6" y="12" width="4" height="10" rx="1" fill={themeColor(TH.accentHSL, 0.04, 2)} />
            </svg>
          </motion.div>
        )}
        {stage === 'keyhole' && (
          <motion.div key="k" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Key and lock */}
            <div style={{ position: 'relative' }}>
              {/* Door */}
              <div style={{ width: '60px', height: '80px', borderRadius: '30px 30px 0 0',
                background: themeColor(TH.primaryHSL, 0.025, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Keyhole */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.06, 3) }} />
                  <div style={{ width: '4px', height: '8px',
                    background: themeColor(TH.accentHSL, 0.06, 3),
                    borderRadius: '0 0 2px 2px' }} />
                </div>
              </div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              A golden key. A heavy lock. The palace doors wait.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={turn}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Turn Key</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="se" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            {/* Doors opening */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <motion.div animate={{ rotateY: -30 }} transition={{ duration: 1.5 }}
                style={{ width: '28px', height: '60px', borderRadius: '14px 0 0 0',
                  background: themeColor(TH.accentHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}`,
                  transformOrigin: 'left center' }} />
              <motion.div animate={{ rotateY: 30 }} transition={{ duration: 1.5 }}
                style={{ width: '28px', height: '60px', borderRadius: '0 14px 0 0',
                  background: themeColor(TH.accentHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}`,
                  transformOrigin: 'right center' }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Sealed. You are the master of the house. The mind is a palace — you designed the rooms. Memory Palace for the past. Focus Fortress for the present. Logic Library for the thoughts. Perspective Balcony for others. Value Vault for the non-negotiables. Decision Bridge for the crossings. Creativity Workshop for the making. Doubt Dungeon for the fears. Future Observatory for what{"'"}s next. Every room serves you. The key was always yours.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive sovereignty. The state of having full ownership and command over one{"'"}s own mental faculties and attention. This is the meta-skill: not any single cognitive technique, but the architecture that houses them all. The palace metaphor maps to the "method of loci" — one of the oldest mnemonic devices, used since ancient Greece. But here, the palace is not just for memory. It{"'"}s for identity. You are not your thoughts. You are the one who designed the rooms.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sovereign.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}