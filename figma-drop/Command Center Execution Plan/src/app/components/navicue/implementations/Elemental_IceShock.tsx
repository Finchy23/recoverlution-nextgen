/**
 * ELEMENTAL #5 — The Ice Shock
 * "The cold strips away the ego. It shuts up the monkey mind."
 * INTERACTION: The screen frosts over in stages. Each tap cracks the
 * frost — blue-white flash, sharp sound energy. Breathe into each
 * freeze. Three cycles of freeze→crack→clarity.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Somatic Regulation', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CYCLES = [
  { frost: 'hsla(200, 40%, 75%, 0.3)', label: 'First freeze.', breathe: 'Breathe in.' },
  { frost: 'hsla(210, 50%, 80%, 0.4)', label: 'Deeper.', breathe: 'Breathe into the cold.' },
  { frost: 'hsla(220, 60%, 85%, 0.5)', label: 'Stripped clean.', breathe: 'The ego goes quiet.' },
];

export default function Elemental_IceShock({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cycleIdx, setCycleIdx] = useState(0);
  const [frosting, setFrosting] = useState(false);
  const [cracked, setCracked] = useState(false);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Auto-frost when entering each cycle
  useEffect(() => {
    if (stage !== 'active' || completed.includes(cycleIdx)) return;
    setFrosting(false);
    setCracked(false);
    addTimer(() => setFrosting(true), 800);
  }, [stage, cycleIdx]);

  const crack = () => {
    if (!frosting || cracked || stage !== 'active') return;
    setCracked(true);
    setFlashOpacity(0.6);
    addTimer(() => setFlashOpacity(0), 300);
    addTimer(() => {
      const next = [...completed, cycleIdx];
      setCompleted(next);
      if (next.length >= CYCLES.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      } else {
        setCycleIdx(prev => prev + 1);
      }
    }, 1500);
  };

  const current = CYCLES[cycleIdx];
  const frostLevel = frosting ? 1 : 0;

  // Generate frost crystal paths
  const frostCrystals = Array.from({ length: 12 }, (_, i) => {
    const cx = 20 + (i % 4) * 60;
    const cy = 15 + Math.floor(i / 4) * 55;
    const size = 10 + (i * 7) % 15;
    const branches = Array.from({ length: 6 }, (_, j) => {
      const angle = (j / 6) * Math.PI * 2;
      const endX = cx + Math.cos(angle) * size;
      const endY = cy + Math.sin(angle) * size;
      return `M ${cx} ${cy} L ${endX} ${endY}`;
    }).join(' ');
    return { paths: branches, key: i };
  });

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Somatic Regulation" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Temperature dropping...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The cold strips away the ego. Breathe into the freeze.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to crack the ice</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={crack}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: frosting && !cracked ? 'pointer' : 'default', width: '100%', maxWidth: '280px' }}>
            {/* Ice field */}
            <div style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${current.frost}` }}>
              {/* Frost overlay */}
              <motion.div
                animate={{ opacity: frosting && !cracked ? frostLevel * 0.5 : 0 }}
                transition={{ duration: frosting ? 2 : 0.3 }}
                style={{ position: 'absolute', inset: 0, background: current.frost }}
              />
              {/* Crystal pattern */}
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {frostCrystals.map(({ paths, key }) => (
                  <motion.path key={key} d={paths}
                    fill="none"
                    stroke={cracked ? 'hsla(200, 20%, 50%, 0.05)' : current.frost}
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: frosting && !cracked ? 0.4 : 0 }}
                    transition={{ duration: 1, delay: key * 0.1 }}
                  />
                ))}
                {/* Crack lines when broken */}
                {cracked && (
                  <>
                    <motion.path d="M 110 85 L 60 30" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }}
                      fill="none" stroke="hsla(200, 50%, 90%, 0.6)" strokeWidth="1.5" />
                    <motion.path d="M 110 85 L 170 40" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.05 }}
                      fill="none" stroke="hsla(200, 50%, 90%, 0.5)" strokeWidth="1" />
                    <motion.path d="M 110 85 L 80 140" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3, delay: 0.1 }}
                      fill="none" stroke="hsla(200, 50%, 90%, 0.4)" strokeWidth="1" />
                    <motion.path d="M 110 85 L 180 130" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25, delay: 0.12 }}
                      fill="none" stroke="hsla(200, 50%, 90%, 0.35)" strokeWidth="0.8" />
                  </>
                )}
              </svg>
              {/* Flash */}
              <motion.div
                animate={{ opacity: flashOpacity }}
                transition={{ duration: 0.15 }}
                style={{ position: 'absolute', inset: 0, background: 'hsla(200, 60%, 90%, 0.8)', pointerEvents: 'none' }}
              />
            </div>
            {/* Cycle text */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.5 }}>
                {cracked ? current.label : frosting ? current.breathe : '...'}
              </div>
            </div>
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {CYCLES.map((c, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: completed.includes(i) ? 'hsla(200, 50%, 70%, 0.6)' : i === cycleIdx ? current.frost : palette.primaryFaint }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', opacity: completed.includes(i) ? 0.7 : i === cycleIdx ? 0.4 : 0.15, backgroundColor: 'rgba(0,0,0,0)' }}
                />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Cold is truth. The monkey mind went quiet.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Norepinephrine spiked, then the deep rebound. Parasympathetic clarity.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Frozen. Cracked. Clear.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}