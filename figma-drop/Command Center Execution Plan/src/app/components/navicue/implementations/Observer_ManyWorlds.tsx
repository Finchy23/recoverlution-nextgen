/**
 * OBSERVER #6 — The Many Worlds
 * "Every choice creates a universe."
 * ARCHETYPE: Pattern A (Tap ×5) — Each tap branches the path
 * ENTRY: Ambient Fade — forking road visible from start
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OBSERVER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'ambient' | 'resonant' | 'afterglow';

export default function Observer_ManyWorlds({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => () => T.current.forEach(clearTimeout), []);

  const branch = () => {
    if (stage !== 'ambient' || taps >= 5) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 5) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            onClick={branch}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: taps >= 5 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              There is a version of you who took the other path. Let them go. You are in this timeline. Play this hand.
            </div>
            <svg width="200" height="140" viewBox="0 0 200 140">
              {/* Main trunk */}
              <line x1="100" y1="130" x2="100" y2={130 - 20 * Math.min(taps, 1)}
                stroke={themeColor(TH.accentHSL, 0.15, 12)} strokeWidth="1" />
              {/* Branches */}
              {Array.from({ length: taps }, (_, i) => {
                const y = 110 - i * 20;
                const spread = 15 + i * 8;
                return (
                  <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {/* Fork point */}
                    <circle cx="100" cy={y} r="2" fill={themeColor(TH.accentHSL, 0.12, 15)} />
                    {/* Left branch (not taken) */}
                    <line x1="100" y1={y} x2={100 - spread} y2={y - 18}
                      stroke={themeColor(TH.primaryHSL, 0.05, 8)} strokeWidth="0.5" strokeDasharray="2 2" />
                    {/* Right branch (taken) */}
                    <line x1="100" y1={y} x2="100" y2={y - 20}
                      stroke={themeColor(TH.accentHSL, 0.12, 12)} strokeWidth="1" />
                    {/* Ghost timeline label */}
                    <text x={100 - spread - 5} y={y - 18} fontSize="11" fontFamily="monospace"
                      fill={themeColor(TH.primaryHSL, 0.04, 8)}>v{i + 1}</text>
                  </motion.g>
                );
              })}
              {/* Current position */}
              {taps > 0 && (
                <motion.circle cx="100" cy={110 - (taps - 1) * 20 - 20} r="4"
                  fill={themeColor(TH.accentHSL, 0.2, 18)}
                  animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              )}
            </svg>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.25, 15) : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Many-worlds interpretation. All alternate histories are real; just not for this version of you. The road not taken exists. Let it go. Play this hand.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>This timeline.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}