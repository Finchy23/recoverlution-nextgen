/**
 * TIME CAPSULE #7 — The Crisis Kit
 * "When the panic hits, you will have no IQ. Just break the glass."
 * ARCHETYPE: Pattern A (Tap) — Tap to break the glass and reveal the kit
 * ENTRY: Reverse Reveal — glass already broken, contents revealed first
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

const KIT_ITEMS = [
  { icon: '\u266B', label: 'the playlist' },
  { icon: '\u260E', label: 'the number' },
  { icon: '\u25CB', label: 'the breath pacer' },
];

export default function TimeCapsule_CrisisKit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const [taps, setTaps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const tap = () => {
    if (stage !== 'active' || taps >= 3) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.3 }}
              style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.5, 10), letterSpacing: '0.15em' }}>
              IN CASE OF EMERGENCY
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
              style={{
                width: '120px', height: '80px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.08, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 5)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <div style={{ fontSize: '20px', opacity: 0.3 }}>+</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.8 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>you packed this when you were calm</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={tap}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: taps >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              When the panic hits, you will have no IQ. Build the kit now: a playlist, a phone number, a breath pacer. Don{'\u2019'}t think. Just break the glass and follow the instructions you wrote when you were calm.
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              {KIT_ITEMS.map((item, i) => (
                <motion.div key={i} style={{
                  width: '64px', height: '64px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, i < taps ? 0.12 : 0.04, 5),
                  border: `1px solid ${themeColor(TH.accentHSL, i < taps ? 0.2 : 0.06, 5)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                }}
                  animate={{ scale: i < taps ? [1, 1.08, 1] : 1 }}
                  transition={{ duration: 0.3 }}>
                  <div style={{ fontSize: '16px', opacity: i < taps ? 0.6 : 0.15 }}>{item.icon}</div>
                  <div style={{ fontSize: '7px', fontFamily: 'monospace', color: palette.textFaint, opacity: i < taps ? 0.5 : 0.2 }}>
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
            {taps < 3 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>pack the kit</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Kit packed. Three tools behind glass. When the amygdala hijacks the cockpit and every rational thought leaves the building, this red box will be waiting. You pre-decided. You future-proofed yourself against your own worst moment.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ready when you need it.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}