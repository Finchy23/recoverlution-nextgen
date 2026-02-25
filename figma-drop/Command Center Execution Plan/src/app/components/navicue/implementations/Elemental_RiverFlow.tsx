/**
 * ELEMENTAL #8 — The River Flow
 * "Water does not fight the rock. It flows around it."
 * INTERACTION: A river rendered with animated flow lines meets
 * an obstacle rock. Tap to add more rocks — the water always
 * finds a way around. Watch adaptive flexibility in real time.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ROCKS = [
  { cx: 110, cy: 60, r: 15, label: 'The water divides.' },
  { cx: 70, cy: 100, r: 12, label: 'It finds another way.' },
  { cx: 150, cy: 90, r: 10, label: 'No fight. Just flow.' },
  { cx: 110, cy: 130, r: 14, label: 'Around. Always around.' },
];

export default function Elemental_RiverFlow({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState(0);
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Animate flow
  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setPhase(p => p + 0.03); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const placeRock = () => {
    if (stage !== 'active' || placed >= ROCKS.length) return;
    const next = placed + 1;
    setPlaced(next);
    if (next >= ROCKS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  // Build flow lines that curve around rocks
  const buildFlowLines = () => {
    const lines: JSX.Element[] = [];
    const activeRocks = ROCKS.slice(0, placed);
    for (let i = 0; i < 8; i++) {
      const baseX = 20 + i * 25;
      let points = '';
      for (let y = 0; y <= 170; y += 5) {
        let x = baseX + Math.sin(phase + y * 0.03 + i * 0.5) * 6;
        // Deflect around rocks
        for (const rock of activeRocks) {
          const dx = x - rock.cx;
          const dy = y - rock.cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < rock.r + 12) {
            x += (dx / dist) * (rock.r + 12 - dist) * 0.8;
          }
        }
        points += `${x},${y} `;
      }
      lines.push(
        <polyline key={i} points={points.trim()} fill="none"
          stroke={`hsla(200, 35%, 50%, ${0.12 + (i % 3) * 0.03})`}
          strokeWidth="1" strokeLinecap="round" />
      );
    }
    return lines;
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The river finds its way...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Water does not fight the rock. It flows around it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to place an obstacle</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={placeRock}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: placed >= ROCKS.length ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* River field */}
            <div style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(210, 20%, 12%, 0.4)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Flow lines */}
                {buildFlowLines()}
                {/* Rocks */}
                {ROCKS.slice(0, placed).map((rock, i) => (
                  <motion.g key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <circle cx={rock.cx} cy={rock.cy} r={rock.r}
                      fill={`hsla(25, 12%, ${22 + i * 3}%, 0.4)`}
                      stroke={`hsla(25, 10%, 30%, 0.2)`} strokeWidth="0.5" />
                  </motion.g>
                ))}
                {/* Flow particles */}
                {Array.from({ length: 12 }, (_, i) => {
                  const px = 30 + i * 17 + Math.sin(phase * 2 + i) * 8;
                  const py = ((phase * 40 + i * 20) % 170);
                  return <circle key={`p${i}`} cx={px} cy={py} r="1" fill="hsla(200, 40%, 60%, 0.15)" />;
                })}
              </svg>
            </div>
            {/* Label */}
            {placed > 0 && (
              <motion.div key={placed} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic' }}>
                {ROCKS[placed - 1].label}
              </motion.div>
            )}
            <div style={{ display: 'flex', gap: '5px' }}>
              {ROCKS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < placed ? 'hsla(200, 35%, 50%, 0.5)' : palette.primaryFaint, opacity: i < placed ? 0.5 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Be water, my friend. It splits and rejoins. Effortlessly.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Wu Wei. Non-confrontational. The flexible survives.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Flowing. Around. Always.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}