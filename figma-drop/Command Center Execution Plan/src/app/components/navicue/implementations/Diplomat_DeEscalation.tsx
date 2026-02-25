/**
 * DIPLOMAT #8 — The De-Escalation
 * "Lower the temperature. One degree at a time."
 * INTERACTION: A glowing heat gauge at maximum. Tap to apply cooling
 * techniques — each one lowers the temperature by one band. Reach
 * the cool zone. The conflict doesn't vanish — it becomes workable.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('pattern_glitch', 'Somatic Regulation', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const COOLDOWNS = [
  { technique: 'Pause. Don\'t respond yet.', temp: 80 },
  { technique: 'Name the emotion silently.', temp: 60 },
  { technique: 'Breathe. Slow the body.', temp: 45 },
  { technique: 'Ask: what do they need?', temp: 30 },
  { technique: 'Speak from want, not wound.', temp: 15 },
];

function getHeatColor(temp: number): string {
  if (temp > 70) return 'hsla(0, 70%, 55%, 0.8)';
  if (temp > 50) return 'hsla(25, 65%, 52%, 0.7)';
  if (temp > 35) return 'hsla(45, 55%, 50%, 0.6)';
  if (temp > 20) return 'hsla(180, 40%, 48%, 0.6)';
  return 'hsla(210, 45%, 55%, 0.6)';
}

export default function Diplomat_DeEscalation({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [coolIdx, setCoolIdx] = useState(-1);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleCool = () => {
    if (stage !== 'active') return;
    const next = coolIdx + 1;
    if (next < COOLDOWNS.length) {
      setCoolIdx(next);
      if (next >= COOLDOWNS.length - 1) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  const currentTemp = coolIdx < 0 ? 95 : COOLDOWNS[coolIdx].temp;
  const heatColor = getHeatColor(currentTemp);
  const fillPct = currentTemp;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Somatic Regulation" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The temperature is rising.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Lower the temperature. One degree at a time.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to apply each cooling technique</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleCool}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: 'pointer' }}>
            {/* Heat gauge */}
            <div style={{ width: '40px', height: '180px', borderRadius: radius.xl, border: `1px solid ${palette.primaryFaint}`, position: 'relative', overflow: 'hidden' }}>
              <motion.div
                animate={{ height: `${fillPct}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: heatColor, borderRadius: '0 0 20px 20px', transition: 'background 1s' }} />
              {/* Temperature marks */}
              {[20, 40, 60, 80].map(y => (
                <div key={y} style={{ position: 'absolute', top: `${100 - y}%`, left: 0, right: 0, height: '1px', background: palette.primaryFaint, opacity: 0.1 }} />
              ))}
            </div>
            {/* Current technique */}
            {coolIdx >= 0 && (
              <motion.div key={coolIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }}
                style={{ ...navicueType.texture, color: palette.text, textAlign: 'center', maxWidth: '240px', fontSize: '13px', fontStyle: 'italic' }}>
                {COOLDOWNS[coolIdx].technique}
              </motion.div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {coolIdx < COOLDOWNS.length - 1 ? `${coolIdx + 2} of ${COOLDOWNS.length} techniques` : 'cooled'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The conflict doesn't vanish. It becomes workable.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cool heads find paths that hot ones can't see.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            One degree at a time.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}