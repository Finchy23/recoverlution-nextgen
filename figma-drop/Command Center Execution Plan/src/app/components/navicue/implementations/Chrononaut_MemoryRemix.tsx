/**
 * CHRONONAUT #1 — The Memory Remix
 * "You cannot change the event. But you can change the soundtrack."
 * INTERACTION: A video editor timeline with memory blocks. Scrub to
 * each red "bad memory" block and overlay a new soundtrack (Comedy
 * or Compassion). The block turns gold on re-scoring.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart(
  'pattern_glitch',
  'Metacognition',
  'believing',
  'Practice'
);
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const MEMORIES = [
  { label: 'The rejection letter', duration: '0:42' },
  { label: 'That public mistake', duration: '1:03' },
  { label: 'The argument you lost', duration: '0:58' },
  { label: 'The door that closed', duration: '0:31' },
  { label: 'The silence after', duration: '1:17' },
];

export default function Chrononaut_MemoryRemix({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [rescored, setRescored] = useState<Record<number, 'comedy' | 'compassion'>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleRescore = (score: 'comedy' | 'compassion') => {
    if (stage !== 'active' || rescored[activeIdx]) return;
    const next = { ...rescored, [activeIdx]: score };
    setRescored(next);
    if (Object.keys(next).length >= MEMORIES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    } else {
      addTimer(() => setActiveIdx(prev => Math.min(prev + 1, MEMORIES.length - 1)), 600);
    }
  };

  const rescoredCount = Object.keys(rescored).length;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Rewinding...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You cannot change the event. But you can change the soundtrack.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>re-score each memory</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '320px' }}>
            {/* Timeline track */}
            <div style={{ width: '100%', display: 'flex', gap: '3px', alignItems: 'center' }}>
              {MEMORIES.map((_, i) => {
                const r = rescored[i];
                const isCurrent = i === activeIdx && !r;
                return (
                  <motion.div key={i}
                    animate={{
                      background: r ? 'hsla(42, 60%, 50%, 0.5)' : isCurrent ? 'hsla(0, 50%, 45%, 0.6)' : 'hsla(0, 30%, 35%, 0.2)',
                      scale: isCurrent ? 1.05 : 1,
                    }}
                    style={{ flex: 1, height: '6px', borderRadius: '3px', transition: 'all 0.4s' }}
                  />
                );
              })}
            </div>
            {/* Current memory */}
            {activeIdx < MEMORIES.length && !rescored[activeIdx] && (
              <motion.div key={activeIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', padding: '20px 16px', border: `1px solid hsla(0, 40%, 45%, 0.3)`, borderRadius: radius.md, textAlign: 'center' }}>
                <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', fontFamily: 'monospace', opacity: 0.4, marginBottom: '6px' }}>
                  [{MEMORIES[activeIdx].duration}]
                </div>
                <div style={{ ...navicueType.texture, color: palette.text, fontSize: '13px', fontStyle: 'italic', marginBottom: '18px' }}>
                  {MEMORIES[activeIdx].label}
                </div>
                <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginBottom: '12px', opacity: 0.4 }}>
                  choose a new soundtrack
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <motion.button onClick={() => handleRescore('comedy')}
                    whileHover={{ scale: 1.05 }}
                    style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.02)', border: `1px solid hsla(42, 50%, 50%, 0.4)`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: 'hsla(42, 50%, 60%, 0.8)', fontSize: '11px' }}>
                    comedy
                  </motion.button>
                  <motion.button onClick={() => handleRescore('compassion')}
                    whileHover={{ scale: 1.05 }}
                    style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.02)', border: `1px solid hsla(260, 30%, 55%, 0.4)`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: 'hsla(260, 30%, 65%, 0.8)', fontSize: '11px' }}>
                    compassion
                  </motion.button>
                </div>
              </motion.div>
            )}
            {/* Completed memories */}
            {rescoredCount > 0 && rescoredCount < MEMORIES.length && (
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                {Object.entries(rescored).map(([idx, type]) => (
                  <motion.div key={idx} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ width: '8px', height: '8px', borderRadius: '50%', background: type === 'comedy' ? 'hsla(42, 60%, 55%, 0.6)' : 'hsla(260, 35%, 55%, 0.6)' }} />
                ))}
              </div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{rescoredCount} of {MEMORIES.length} rescored</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Same events. New soundtrack.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Re-score your history. The footage doesn't change. You do.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The remix is playing.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}