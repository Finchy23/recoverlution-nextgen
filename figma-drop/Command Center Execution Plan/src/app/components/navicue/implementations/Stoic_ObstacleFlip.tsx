/**
 * STOIC #6 — The Obstacle Flip
 * "What stands in the way becomes the way."
 * INTERACTION: A massive dark boulder blocks the path. Tap it — the
 * boulder rotates, flattens, color shifts from threat-gray to
 * challenge-green. It becomes a stepping stone. The path continues.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Stoic_ObstacleFlip({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [flipped, setFlipped] = useState(false);
  const [flipPhase, setFlipPhase] = useState(0); // 0 → 1 during flip
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (!flipped) return;
    let start: number | null = null;
    const duration = 1800;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // ease out cubic
      setFlipPhase(1 - Math.pow(1 - p, 3));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [flipped]);

  const flip = () => {
    if (stage !== 'active' || flipped) return;
    setFlipped(true);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 4000);
  };

  const t = flipPhase;
  // Boulder transforms: tall → flat, gray → green
  const boulderHeight = 60 - t * 42;
  const boulderWidth = 50 + t * 60;
  const boulderY = 70 + t * 22;
  const boulderHue = t * 140; // 0 (gray) → 140 (green)
  const boulderSat = t * 15;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A boulder blocks the path...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The impediment to action advances action. What stands in the way becomes the way.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the boulder</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={flip}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: flipped ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '210px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 8%, 7%, 0.3)' }}>
              <svg width="100%" height="100%" viewBox="0 0 210 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Path — ground line */}
                <line x1="0" y1="130" x2="210" y2="130"
                  stroke="hsla(30, 8%, 25%, 0.1)" strokeWidth="0.5" />
                {/* Path arrows — before and after boulder */}
                <line x1="10" y1="130" x2="60" y2="130"
                  stroke={`hsla(${boulderHue}, ${8 + boulderSat}%, 30%, ${0.08 + t * 0.06})`} strokeWidth="1" />
                <line x1="150" y1="130" x2="200" y2="130"
                  stroke={`hsla(${boulderHue}, ${8 + boulderSat}%, 30%, ${0.08 + t * 0.06})`} strokeWidth="1" />
                {/* Path arrow tips */}
                <polygon points="58,128 62,130 58,132"
                  fill={`hsla(${boulderHue}, ${8 + boulderSat}%, 30%, ${0.08 + t * 0.06})`} />
                <polygon points="198,128 202,130 198,132"
                  fill={`hsla(${boulderHue}, ${8 + boulderSat}%, 30%, ${0.08 + t * 0.06})`} />

                {/* The boulder / stepping stone */}
                <motion.rect
                  x={105 - boulderWidth / 2}
                  y={boulderY}
                  width={boulderWidth}
                  height={boulderHeight}
                  rx={flipped ? 3 : 8}
                  fill={`hsla(${boulderHue}, ${boulderSat}%, ${18 + t * 8}%, ${0.15 + t * 0.08})`}
                  stroke={`hsla(${boulderHue}, ${boulderSat + 5}%, ${25 + t * 10}%, ${0.1 + t * 0.08})`}
                  strokeWidth="0.8"
                  animate={{
                    x: 105 - boulderWidth / 2,
                    y: boulderY,
                    width: boulderWidth,
                    height: boulderHeight,
                  }}
                  transition={{ type: 'spring', stiffness: 50 }}
                />
                {/* Surface texture lines */}
                {Array.from({ length: 3 }, (_, i) => (
                  <line key={i}
                    x1={105 - boulderWidth / 2 + 8 + i * (boulderWidth / 4)}
                    y1={boulderY + 4}
                    x2={105 - boulderWidth / 2 + 12 + i * (boulderWidth / 4)}
                    y2={boulderY + boulderHeight - 4}
                    stroke={`hsla(${boulderHue}, ${boulderSat}%, ${22 + t * 6}%, ${0.04 + t * 0.02})`}
                    strokeWidth="0.3"
                  />
                ))}
                {/* "OBSTACLE" → "STEPPING STONE" text */}
                <text x="105" y={boulderY + boulderHeight / 2 + 3} textAnchor="middle"
                  fontSize="11" fontFamily="monospace"
                  fill={`hsla(${boulderHue}, ${boulderSat + 5}%, ${30 + t * 12}%, ${0.12 + t * 0.1})`}>
                  {t < 0.5 ? 'OBSTACLE' : 'STEPPING STONE'}
                </text>
                {/* Stepping path over stone — appears when flipped */}
                {t > 0.6 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ duration: 1 }}>
                    {/* Footstep indicators on the stone */}
                    <circle cx="90" cy={boulderY - 2} r="2" fill="hsla(140, 15%, 35%, 0.1)" />
                    <circle cx="105" cy={boulderY - 4} r="2" fill="hsla(140, 15%, 35%, 0.1)" />
                    <circle cx="120" cy={boulderY - 2} r="2" fill="hsla(140, 15%, 35%, 0.1)" />
                  </motion.g>
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
              {!flipped ? 'A boulder. Immovable. Blocking.' : t < 0.5 ? 'Flipping...' : 'A stepping stone. The way forward.'}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: flipped ? 'hsla(140, 18%, 38%, 0.5)' : palette.primaryFaint, opacity: flipped ? 0.6 : 0.15 }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The boulder flattened. Gray became green. The obstacle became the path. What stands in the way becomes the way.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Cognitive reframing. Threat appraisal → challenge appraisal. Blood flow and focus recruited. Defense mechanisms released.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Boulder. Stone. Way.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}