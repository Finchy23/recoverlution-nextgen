/**
 * GRANDMASTER #9 — The Optionality Key
 * "Keep doors open. But when you walk through, bolt it shut."
 * ARCHETYPE: Pattern A (Tap) — Doors closing behind you; choose and lock one
 * ENTRY: Cold open — corridor with closing doors
 * STEALTH KBE: Decisive lock = Focus; hesitation = FOMO (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { GRANDMASTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'active' | 'locked' | 'resonant' | 'afterglow';
const DOORS = ['Career', 'Freedom', 'Commitment'];

export default function Grandmaster_Optionality({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<number | null>(null);
  const [closing, setClosing] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const stageStart = useRef(0);

  useEffect(() => {
    t(() => { setStage('active'); stageStart.current = Date.now(); }, 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Doors slowly closing
  useEffect(() => {
    if (stage !== 'active') return;
    const id = window.setInterval(() => setClosing(c => Math.min(c + 1, 100)), 200);
    return () => clearInterval(id);
  }, [stage]);

  const lock = (idx: number) => {
    if (stage !== 'active') return;
    const latency = Date.now() - stageStart.current;
    setChosen(idx);
    console.log(`[KBE:B] Optionality door="${DOORS[idx]}" latencyMs=${latency} focus=${latency < 6000}`);
    setStage('locked');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '10px' }}>
            {DOORS.map((_, i) => (
              <div key={i} style={{ width: '24px', height: '36px', borderRadius: '4px 4px 0 0',
                background: themeColor(TH.primaryHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Choose a door. The others lock forever.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {DOORS.map((door, i) => (
                <motion.div key={i} whileTap={{ scale: 0.95 }}
                  onClick={() => lock(i)}
                  animate={{ height: `${60 - closing * 0.3}px` }}
                  style={{ width: '60px', borderRadius: '6px 6px 0 0', cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.05 - (closing * 0.0003), 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 10) }}>{door}</span>
                </motion.div>
              ))}
            </div>
            <div style={{ ...navicueType.hint, color: 'hsla(0, 25%, 40%, 0.4)' }}>
              doors closing... {Math.round(closing * 0.5)}%
            </div>
          </motion.div>
        )}
        {stage === 'locked' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {DOORS.map((door, i) => (
                <div key={i} style={{ width: '60px', height: '50px', borderRadius: '6px 6px 0 0',
                  background: i === chosen ? themeColor(TH.accentHSL, 0.08, 6) : themeColor(TH.primaryHSL, 0.02, 1),
                  border: `1px solid ${i === chosen ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.04, 3)}`,
                  opacity: i === chosen ? 1 : 0.3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '11px', color: i === chosen ? themeColor(TH.accentHSL, 0.3, 10) : palette.textFaint }}>
                    {i === chosen ? door : 'LOCKED'}
                  </span>
                </div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Bolted shut. No looking back. Commitment turns options into outcomes.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Commitment timing. Keep doors open as long as possible. Optionality is valuable. But when you walk through, bolt it shut. Flirting with options after commitment is poison. The lock is the strategy.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Committed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}