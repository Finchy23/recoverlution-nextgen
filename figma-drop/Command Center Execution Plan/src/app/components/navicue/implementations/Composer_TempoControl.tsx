/**
 * COMPOSER #2 — The Tempo Control
 * "Do not let the environment set the tempo. You are the rhythm section."
 * ARCHETYPE: Pattern A (Tap) — Tap steady slow beat against rushing backing track
 * ENTRY: Scene-first — frantic beat visual
 * STEALTH KBE: Holding slow beat = Autonomic Regulation / Entrainment Authority (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Theater');
type Stage = 'arriving' | 'rushing' | 'entrained' | 'resonant' | 'afterglow';

export default function Composer_TempoControl({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState<number[]>([]);
  const [pulse, setPulse] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('rushing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tap = () => {
    if (stage !== 'rushing') return;
    const now = Date.now();
    setPulse(true);
    setTimeout(() => setPulse(false), 150);
    const newTaps = [...taps, now].slice(-6);
    setTaps(newTaps);
    if (newTaps.length >= 5) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) intervals.push(newTaps[i] - newTaps[i - 1]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = 60000 / avg;
      if (bpm >= 40 && bpm <= 80) {
        const variance = intervals.reduce((a, b) => a + Math.abs(b - avg), 0) / intervals.length;
        if (variance < 200) {
          console.log(`[KBE:E] TempoControl bpm=${bpm.toFixed(0)} entrainment=confirmed autonomicRegulation=true`);
          setStage('entrained');
          t(() => setStage('resonant'), 5000);
          t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
        }
      }
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            {[0, 1, 2, 3].map(i => (
              <motion.div key={i} animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 0.25, delay: i * 0.06, repeat: Infinity }}
                style={{ width: '4px', height: '12px', borderRadius: '2px',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  display: 'inline-block', margin: '0 2px' }} />
            ))}
          </motion.div>
        )}
        {stage === 'rushing' && (
          <motion.div key="ru" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The world rushes at 160 BPM. Tap your own slow, steady beat. 60 BPM.
            </div>
            {/* Rushing visual */}
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <motion.div key={i}
                  animate={{ opacity: [0.15, 0.4, 0.15], scaleY: [0.7, 1.2, 0.7] }}
                  transition={{ duration: 0.375, delay: i * 0.06, repeat: Infinity }}
                  style={{ width: '3px', height: '20px', borderRadius: '1.5px',
                    background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              ))}
            </div>
            {/* Tap target */}
            <motion.div whileTap={{ scale: 0.85 }} onClick={tap}
              animate={pulse ? { boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.1, 6)}` } : {}}
              style={{ width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.accentHSL, pulse ? 0.1 : 0.06, pulse ? 5 : 3),
                border: `2px solid ${themeColor(TH.accentHSL, pulse ? 0.2 : 0.1, 8)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>TAP</span>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {taps.length < 2 ? 'Tap slowly...' : `${taps.length}/5 beats`}
            </div>
          </motion.div>
        )}
        {stage === 'entrained' && (
          <motion.div key="en" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The music slowed to match you. You didn{"'"}t speed up — the environment followed your tempo. You are the rhythm section. Play slow. Force the band to follow.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Entrainment authority. Rhythmic entrainment is a physics phenomenon: weaker oscillators synchronize to the strongest signal. When you tap slowly against a frantic environment, you become the pacemaker. Research on cardiac coherence shows that slow, steady rhythmic activity (≈0.1Hz / 6 breaths/min) creates optimal heart-brain synchronization. You don{"'"}t match the chaos. You conduct it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Tempo set.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}