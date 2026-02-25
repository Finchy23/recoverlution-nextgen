/**
 * ARCHITECT II #6 — The Decision Bridge
 * "Data provides structure. Intuition provides design. You need both."
 * Pattern A (Tap) — Combine a Fact and a Feeling to cross the chasm
 * STEALTH KBE: Combining both = Integrated Decision Making (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Structuring', 'believing', 'Circuit');
type Stage = 'arriving' | 'chasm' | 'crossed' | 'resonant' | 'afterglow';

export default function Cognitive_DecisionBridge({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [hasFact, setHasFact] = useState(false);
  const [hasFeel, setHasFeel] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('chasm'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const addPier = (type: 'fact' | 'feel') => {
    if (stage !== 'chasm') return;
    if (type === 'fact') setHasFact(true);
    if (type === 'feel') setHasFeel(true);
  };

  const cross = () => {
    if (!hasFact || !hasFeel) return;
    console.log(`[KBE:B] DecisionBridge integratedDecisionMaking=confirmed dataAndIntuition=combined`);
    setStage('crossed');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <svg width="40" height="20" viewBox="0 0 40 20">
              <line x1="0" y1="18" x2="15" y2="18" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" />
              <line x1="25" y1="18" x2="40" y2="18" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" />
            </svg>
          </motion.div>
        )}
        {stage === 'chasm' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A chasm of indecision. Build a bridge with two piers: Data and Intuition. You need both to cross.
            </div>
            {/* Bridge visualization */}
            <svg width="120" height="50" viewBox="0 0 120 50">
              {/* Cliffs */}
              <rect x="0" y="30" width="30" height="20" rx="2" fill={themeColor(TH.primaryHSL, 0.04, 2)} />
              <rect x="90" y="30" width="30" height="20" rx="2" fill={themeColor(TH.primaryHSL, 0.04, 2)} />
              {/* Piers */}
              {hasFact && <rect x="42" y="20" width="8" height="30" rx="1" fill={themeColor(TH.accentHSL, 0.06, 3)} />}
              {hasFeel && <rect x="70" y="20" width="8" height="30" rx="1" fill={themeColor(TH.accentHSL, 0.06, 3)} />}
              {/* Bridge deck */}
              {hasFact && hasFeel && (
                <motion.rect x="28" y="18" width="64" height="4" rx="1"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  fill={themeColor(TH.accentHSL, 0.08, 4)} />
              )}
              {/* Labels */}
              {hasFact && <text x="46" y="16" fontSize="5" fill={palette.textFaint}>Data</text>}
              {hasFeel && <text x="71" y="16" fontSize="5" fill={palette.textFaint}>Intuition</text>}
            </svg>
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => addPier('fact')}
                style={{ padding: '12px 18px', borderRadius: '10px', cursor: 'pointer',
                  background: hasFact ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.025, 1),
                  border: `1px solid ${hasFact ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                <span style={{ fontSize: '11px', color: hasFact ? themeColor(TH.accentHSL, 0.4, 14) : palette.textFaint }}>
                  {hasFact ? '✓ ' : ''}Data Pier
                </span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => addPier('feel')}
                style={{ padding: '12px 18px', borderRadius: '10px', cursor: 'pointer',
                  background: hasFeel ? themeColor(TH.accentHSL, 0.08, 4) : themeColor(TH.primaryHSL, 0.025, 1),
                  border: `1px solid ${hasFeel ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.04, 3)}` }}>
                <span style={{ fontSize: '11px', color: hasFeel ? themeColor(TH.accentHSL, 0.4, 14) : palette.textFaint }}>
                  {hasFeel ? '✓ ' : ''}Intuition Pier
                </span>
              </motion.div>
            </div>
            {hasFact && hasFeel && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                whileTap={{ scale: 0.9 }} onClick={cross}
                style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
                <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Cross</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'crossed' && (
          <motion.div key="cr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Crossed. Data provides the structure. Intuition provides the design. A bridge needs both piers — a one-legged bridge collapses. Pure logic without feeling produces correct but lifeless decisions. Pure feeling without logic produces passionate but reckless ones. The integrated decision stands.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Dual-process theory. Kahneman{"'"}s System 1 (fast, intuitive) and System 2 (slow, deliberate) are not rivals — they{"'"}re partners. Antonio Damasio{"'"}s somatic marker hypothesis: patients with damaged emotional centers make objectively worse decisions, even when their logic is intact. The best decisions integrate both systems: data to constrain options, intuition to choose among them. The bridge has two piers.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Crossed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}