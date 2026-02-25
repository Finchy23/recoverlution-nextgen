/**
 * TRIBALIST #8 — The Ritual Maker
 * "The tribe is held together by glue. The glue is 'We do this every week.'"
 * ARCHETYPE: Pattern C (Hold) — Tap and hold Sunday to create a recurring gold ring
 * ENTRY: Ambient fade — calendar grid appears
 * STEALTH KBE: Creating recurring event = Belief in Community (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRIBALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'active' | 'created' | 'resonant' | 'afterglow';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Tribalist_RitualMaker({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    maxDuration: 2500,
    onComplete: () => {
      console.log(`[KBE:B] RitualMaker ritualCreated=true communityBelief=confirmed`);
      setStage('created');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '4px' }}>
            {DAYS.map(d => (
              <div key={d} style={{ width: '28px', height: '28px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '7px', color: themeColor(TH.primaryHSL, 0.15, 8) }}>{d}</span>
              </div>
            ))}
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Routine is habit. Ritual is sacred. Hold Sunday.
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {DAYS.map((d, i) => {
                const isSunday = i === 6;
                return (
                  <motion.div key={d}
                    {...(isSunday ? hold.holdProps : {})}
                    animate={isSunday && hold.isHolding ? {
                      boxShadow: `0 0 ${8 + hold.tension * 15}px ${themeColor(TH.accentHSL, 0.1 + hold.tension * 0.15, 8)}`
                    } : {}}
                    style={{ width: '32px', height: '32px', borderRadius: isSunday ? '50%' : '4px',
                      background: isSunday
                        ? themeColor(TH.accentHSL, 0.05 + hold.tension * 0.1, 4)
                        : themeColor(TH.primaryHSL, 0.04, 2),
                      border: `${isSunday ? 2 : 1}px solid ${isSunday
                        ? themeColor(TH.accentHSL, 0.1 + hold.tension * 0.15, 8)
                        : themeColor(TH.primaryHSL, 0.06, 4)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: isSunday ? 'pointer' : 'default',
                      touchAction: 'none', userSelect: 'none' }}>
                    <span style={{ fontSize: '11px',
                      color: isSunday ? themeColor(TH.accentHSL, 0.3 + hold.tension * 0.2, 10) : themeColor(TH.primaryHSL, 0.15, 8) }}>
                      {d}
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {hold.isHolding ? `creating ritual... ${Math.round(hold.tension * 100)}%` : 'hold Sunday'}
            </div>
          </motion.div>
        )}
        {stage === 'created' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {DAYS.map((d, i) => (
                <div key={d} style={{ width: '32px', height: '32px', borderRadius: i === 6 ? '50%' : '4px',
                  background: i === 6 ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.04, 2),
                  border: `${i === 6 ? 2 : 1}px solid ${i === 6
                    ? themeColor(TH.accentHSL, 0.2, 12)
                    : themeColor(TH.primaryHSL, 0.06, 4)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: i === 6 ? `0 0 10px ${themeColor(TH.accentHSL, 0.08, 8)}` : 'none' }}>
                  <span style={{ fontSize: '11px',
                    color: i === 6 ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.15, 8) }}>{d}</span>
                </div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              The gold ring glows. Sunday is now sacred. The tribe has a heartbeat.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Commitment to ritual. Shared rituals are the glue of every enduring community: from ancient tribes to modern families. Creating a recurring sacred time signals belief that this group is worth protecting.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sacred.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}