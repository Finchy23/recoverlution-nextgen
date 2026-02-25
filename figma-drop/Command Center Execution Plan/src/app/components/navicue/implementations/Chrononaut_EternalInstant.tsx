/**
 * CHRONONAUT #10 — The Eternal Instant
 * "There is only Now."
 * INTERACTION: The screen freezes. Absolute stillness. A single
 * particle of dust hangs in the air. Hold still for 10 seconds.
 * Be the witness. Collapse time anxiety into presence.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('witness_ritual', 'Somatic Regulation', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STILL_DURATION = 10000; // 10 seconds of stillness

export default function Chrononaut_EternalInstant({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [watching, setWatching] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const tick = () => {
    const e = Date.now() - startRef.current;
    setElapsed(e);
    if (e >= STILL_DURATION) {
      setCompleted(true);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const startWatching = () => {
    if (watching || stage !== 'active') return;
    setWatching(true);
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const pct = Math.min(1, elapsed / STILL_DURATION);

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Somatic Regulation" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Everything stops.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The distinction between past, present, and future is only a stubbornly persistent illusion.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to stop everything</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startWatching}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', cursor: watching ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Frozen space */}
            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Ambient stillness field */}
              <motion.div
                animate={{ opacity: watching ? 0.08 : 0.02 }}
                transition={{ duration: 3 }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${palette.accent}, transparent 70%)` }} />
              {/* The single particle of dust */}
              <motion.div
                animate={{
                  opacity: watching ? [0.3, 0.6, 0.3] : 0.1,
                  boxShadow: watching
                    ? [`0 0 ${4 + pct * 20}px ${palette.accentGlow}`, `0 0 ${8 + pct * 30}px ${palette.accentGlow}`, `0 0 ${4 + pct * 20}px ${palette.accentGlow}`]
                    : 'none',
                }}
                transition={{ duration: 4, repeat: watching ? Infinity : 0, ease: 'easeInOut' }}
                style={{ width: `${4 + pct * 8}px`, height: `${4 + pct * 8}px`, borderRadius: '50%', background: palette.accent, position: 'relative', zIndex: 2 }} />
              {/* Stillness ring */}
              {watching && (
                <svg style={{ position: 'absolute', inset: '10px', width: '180px', height: '180px', transform: 'rotate(-90deg)' }}>
                  <circle cx="90" cy="90" r="86" fill="none" stroke={palette.accent} strokeWidth="0.5" strokeLinecap="round" opacity={0.2}
                    strokeDasharray={Math.PI * 172} strokeDashoffset={Math.PI * 172 * (1 - pct)} />
                </svg>
              )}
            </div>
            {/* Status */}
            <div style={{ textAlign: 'center' }}>
              {!watching ? (
                <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 3, repeat: Infinity }}
                  style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>
                  tap to stop everything
                </motion.div>
              ) : !completed ? (
                <div>
                  <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', opacity: 0.3 }}>
                    {(elapsed / 1000).toFixed(1)}s of stillness
                  </div>
                  <div style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', marginTop: '4px', opacity: 0.5 }}>
                    be the witness
                  </div>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                  style={{ ...navicueType.texture, color: palette.accent, fontSize: '12px' }}>
                  Now.
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>There is only Now.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Stop everything. Be the witness. This is enough.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Now. Now. Now.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}