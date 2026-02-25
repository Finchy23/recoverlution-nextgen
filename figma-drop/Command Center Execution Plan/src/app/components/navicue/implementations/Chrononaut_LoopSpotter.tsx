/**
 * CHRONONAUT #9 — The Loop Spotter (Deja Vu)
 * "Ah, this again. You know this ride. Step off."
 * INTERACTION: A record player skipping on the same beat — click,
 * click, click. The groove repeats. Tap to lift the needle off
 * the record. Silence. Then a new track begins.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LOOPS = [
  'Start something new. Get excited. Abandon it.',
  'Feel hurt. Go silent. Build resentment.',
  'Get stressed. Numb out. Feel worse.',
  'Promise to change. Do well for a week. Slide back.',
];

export default function Chrononaut_LoopSpotter({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [recognized, setRecognized] = useState<number[]>([]);
  const [lifted, setLifted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const timersRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (stage === 'active' && !lifted) {
      intervalRef.current = window.setInterval(() => setClickCount(p => p + 1), 800);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [stage, lifted]);

  const handleRecognize = (i: number) => {
    if (stage !== 'active' || recognized.includes(i) || lifted) return;
    const next = [...recognized, i];
    setRecognized(next);
    if (next.length >= LOOPS.length) {
      setLifted(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const skipPhase = clickCount % 3; // visual skip indicator

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            click... click... click...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Ah, this again. You know this ride.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>recognize each loop to lift the needle</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>
            {/* Record visualization */}
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <motion.div
                animate={{ rotate: lifted ? 0 : clickCount * 15 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', height: '100%', borderRadius: '50%', border: `2px solid ${palette.primaryFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Grooves */}
                {[18, 26, 34].map(r => (
                  <div key={r} style={{ position: 'absolute', width: `${r * 2}px`, height: `${r * 2}px`, borderRadius: '50%', border: `0.5px solid rgba(255,255,255,0.04)` }} />
                ))}
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: lifted ? palette.accent : palette.primaryFaint, boxShadow: lifted ? `0 0 8px ${palette.accentGlow}` : 'none' }} />
              </motion.div>
              {/* Needle */}
              <motion.div
                animate={{ rotate: lifted ? -30 : -10 + skipPhase * 2, opacity: lifted ? 0.2 : 0.5 }}
                transition={{ duration: lifted ? 0.8 : 0.15 }}
                style={{ position: 'absolute', top: '-4px', right: '-8px', width: '2px', height: '44px', background: palette.textFaint, transformOrigin: 'top right', borderRadius: '1px' }} />
            </div>
            {!lifted && (
              <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 0.8, repeat: Infinity }}
                style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace' }}>
                skip... skip... skip...
              </motion.div>
            )}
            {/* Loop patterns */}
            {LOOPS.map((l, i) => {
              const isRec = recognized.includes(i);
              return (
                <motion.button key={i} onClick={() => handleRecognize(i)}
                  animate={{ opacity: isRec ? 0.7 : 0.35 }}
                  whileHover={!isRec && !lifted ? { opacity: 0.55, scale: 1.02 } : undefined}
                  style={{ width: '100%', padding: '14px 14px', background: 'rgba(255,255,255,0.01)', border: `1px solid ${isRec ? palette.accent : palette.primaryFaint}`, borderRadius: radius.sm, cursor: isRec || lifted ? 'default' : 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: isRec ? palette.accent : palette.primaryFaint, opacity: isRec ? 0.5 : 0.2 }} />
                  <span style={{ ...navicueType.texture, color: isRec ? palette.text : palette.textFaint, fontSize: '11px', fontStyle: 'italic', textDecoration: isRec ? 'line-through' : 'none' }}>{l}</span>
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {lifted ? 'needle lifted' : `${recognized.length} of ${LOOPS.length} recognized`}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The record stopped skipping. You lifted the needle.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You know this ride. You know where it ends. Step off.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            New track. New groove.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}