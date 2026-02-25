/**
 * ENGINEER #9 — The Maintenance Schedule
 * "Fix the roof when the sun is shining."
 * Pattern B (Drag) — Drag rest blocks into calendar before red zone
 * STEALTH KBE: Placing rest before stressor = Proactive Coping (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ENGINEER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Behavioral Design', 'embodying', 'Circuit');
type Stage = 'arriving' | 'crisis' | 'scheduled' | 'resonant' | 'afterglow';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CRISIS_DAY = 4; // Thursday (index 4 = Fri)

export default function Engineer_MaintenanceSchedule({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [restDays, setRestDays] = useState<Set<number>>(new Set());
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('crisis'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const toggleRest = (i: number) => {
    if (stage !== 'crisis') return;
    const next = new Set(restDays);
    if (next.has(i)) next.delete(i); else next.add(i);
    setRestDays(next);
  };

  const schedule = () => {
    if (stage !== 'crisis' || restDays.size === 0) return;
    const beforeCrisis = Array.from(restDays).some(d => d < CRISIS_DAY);
    console.log(`[KBE:E] MaintenanceSchedule restDays=${Array.from(restDays).map(d => DAYS[d]).join(',')} proactiveCoping=${beforeCrisis}`);
    setStage('scheduled');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Design" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '8px', height: '10px', borderRadius: '1px',
                  background: themeColor(TH.primaryHSL, 0.03, 1) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'crisis' && (
          <motion.div key="cr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Calendar. Friday is crisis (red). Place rest blocks before the breakdown.
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {DAYS.map((d, i) => {
                const isCrisis = i === CRISIS_DAY;
                const isRest = restDays.has(i);
                return (
                  <motion.div key={d} whileTap={{ scale: 0.9 }}
                    onClick={() => !isCrisis && toggleRest(i)}
                    style={{ width: '28px', height: '32px', borderRadius: '3px', cursor: isCrisis ? 'default' : 'pointer',
                      background: isCrisis
                        ? (restDays.size > 0 && Array.from(restDays).some(r => r < CRISIS_DAY)
                          ? themeColor(TH.accentHSL, 0.06, 3)
                          : 'hsla(0, 15%, 20%, 0.06)')
                        : isRest
                          ? themeColor(TH.accentHSL, 0.08, 4)
                          : themeColor(TH.primaryHSL, 0.025, 1),
                      border: `1px solid ${isCrisis
                        ? 'hsla(0, 15%, 25%, 0.08)'
                        : isRest
                          ? themeColor(TH.accentHSL, 0.12, 6)
                          : themeColor(TH.primaryHSL, 0.04, 3)}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '11px', color: palette.textFaint }}>{d}</span>
                    <span style={{ fontSize: '11px', color: isCrisis
                      ? 'hsla(0, 12%, 30%, 0.15)'
                      : isRest ? themeColor(TH.accentHSL, 0.25, 8) : palette.textFaint }}>
                      {isCrisis ? '⚠' : isRest ? 'Rest' : '·'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={schedule}
              style={{ padding: '14px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                opacity: restDays.size > 0 ? 1 : 0.4 }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Schedule</div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>Tap days to add rest blocks</div>
          </motion.div>
        )}
        {stage === 'scheduled' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Scheduled. The red zone turned green. You fix the roof when the sun is shining. Schedule the maintenance before the breakdown. Preventative care is cheap; repair is expensive. Most people only rest after the crisis — the engineer rests before it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Proactive coping. Schwarzer{"'"}s research: proactive coping (anticipating and preparing for stressors) produces significantly better outcomes than reactive coping (dealing with stress after it hits). Scheduled maintenance — regular exercise, sleep hygiene, social connection — works like preventive medicine. The body doesn{"'"}t wait for a crisis to need rest. It{"'"}s on a schedule. Honor the schedule and the crisis often never arrives.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Scheduled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}