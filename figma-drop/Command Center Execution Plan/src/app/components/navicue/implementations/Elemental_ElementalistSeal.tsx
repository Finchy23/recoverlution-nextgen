/**
 * ELEMENTAL #10 — The Elementalist Seal (The Proof)
 * "You are real. You take up space. The earth feels you."
 * INTERACTION: Press your hand (thumb) into wet sand — the imprint
 * appears and holds. A tide line approaches but doesn't wash it away.
 * Embodied verification: you are here, you matter, the earth knows.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Somatic Regulation', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PRESS_DURATION = 5000;

export default function Elemental_ElementalistSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [printed, setPrinted] = useState(false);
  const [tidePhase, setTidePhase] = useState(0);
  const [tideReached, setTideReached] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleDown = () => {
    if (stage !== 'active' || printed) return;
    setPressing(true);
    startRef.current = Date.now() - progress * PRESS_DURATION;
    const tick = () => {
      const p = Math.min(1, (Date.now() - startRef.current) / PRESS_DURATION);
      setProgress(p);
      if (p >= 1) {
        setPressing(false);
        setPrinted(true);
        // Start tide
        let tP = 0;
        const tideTick = () => {
          tP += 0.008;
          setTidePhase(tP);
          if (tP >= 1) {
            setTideReached(true);
            addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
          } else {
            rafRef.current = requestAnimationFrame(tideTick);
          }
        };
        rafRef.current = requestAnimationFrame(tideTick);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleUp = () => {
    if (!pressing) return;
    setPressing(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const imprintDepth = progress;
  const tideX = 220 - tidePhase * 130;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Somatic Regulation" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The sand waits for you...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You are real. You take up space. The earth feels you.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>press into the sand and leave your mark</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={handleDown} onPointerUp={handleUp} onPointerLeave={handleUp}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: printed ? 'default' : 'pointer', touchAction: 'none', width: '100%', maxWidth: '280px' }}>
            {/* Sand field */}
            <div style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: 'linear-gradient(180deg, hsla(40, 25%, 55%, 0.15) 0%, hsla(35, 30%, 45%, 0.2) 100%)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Sand texture dots */}
                {Array.from({ length: 40 }, (_, i) => (
                  <circle key={`s${i}`}
                    cx={10 + (i * 37 + i * i * 3) % 200}
                    cy={10 + (i * 23 + i * i * 2) % 150}
                    r={0.3 + Math.random() * 0.5}
                    fill="hsla(35, 20%, 50%, 0.08)"
                  />
                ))}
                {/* Handprint imprint — appears with pressure */}
                {imprintDepth > 0 && (
                  <g opacity={imprintDepth * 0.5}>
                    {/* Palm */}
                    <ellipse cx="110" cy="90" rx={22 * imprintDepth} ry={28 * imprintDepth}
                      fill="hsla(35, 25%, 35%, 0.15)"
                      stroke="hsla(35, 20%, 40%, 0.1)" strokeWidth="0.5" />
                    {/* Fingers */}
                    {[
                      { x: 90, y: 58, rx: 5, ry: 12 },
                      { x: 100, y: 54, rx: 5, ry: 14 },
                      { x: 112, y: 53, rx: 5, ry: 14 },
                      { x: 123, y: 56, rx: 5, ry: 13 },
                      { x: 132, y: 65, rx: 5, ry: 10 },
                    ].map((f, i) => (
                      <ellipse key={`f${i}`} cx={f.x} cy={f.y} rx={f.rx * imprintDepth} ry={f.ry * imprintDepth}
                        fill="hsla(35, 25%, 35%, 0.12)" />
                    ))}
                    {/* Depth shadow */}
                    <ellipse cx="110" cy="90" rx={16 * imprintDepth} ry={20 * imprintDepth}
                      fill="hsla(35, 20%, 25%, 0.08)" />
                  </g>
                )}
                {/* Tide line */}
                {printed && (
                  <motion.g>
                    <line x1={tideX} y1="0" x2={tideX} y2="170"
                      stroke="hsla(195, 30%, 50%, 0.15)" strokeWidth="2" />
                    <line x1={tideX + 5} y1="0" x2={tideX + 5} y2="170"
                      stroke="hsla(195, 25%, 45%, 0.08)" strokeWidth="1" />
                    {/* Foam dots */}
                    {Array.from({ length: 8 }, (_, i) => (
                      <circle key={`f${i}`}
                        cx={tideX - 2 + Math.random() * 6}
                        cy={20 + i * 18 + Math.sin(tidePhase * 10 + i) * 5}
                        r="1"
                        fill="hsla(195, 30%, 70%, 0.15)"
                      />
                    ))}
                  </motion.g>
                )}
              </svg>
              {/* Status text */}
              {pressing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                  style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic' }}>
                  pressing deeper...
                </motion.div>
              )}
              {printed && !tideReached && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                  style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', ...navicueType.texture, color: 'hsla(195, 30%, 55%, 0.5)', fontSize: '11px', fontStyle: 'italic' }}>
                  the tide approaches...
                </motion.div>
              )}
              {tideReached && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                  style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                  your print remains.
                </motion.div>
              )}
            </div>
            {/* Progress */}
            {!printed && (
              <div style={{ width: '100%', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${progress * 100}%` }} style={{ height: '100%', background: 'hsla(35, 25%, 45%, 0.4)' }} />
              </div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>
              {printed ? '' : 'press and hold'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The tide came. Your print held. You are here.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>You are real. You take up space. The earth felt you. Verified.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Pressed. Held. Here.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}