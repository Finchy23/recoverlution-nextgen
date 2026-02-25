/**
 * ELEMENTAL #6 — The Root Drop
 * "Stability is not built up. It is grown down. Anchor yourself in the dark."
 * INTERACTION: Fast-motion camera diving into soil. Roots expand
 * downward in the dark — each tap sends another root deeper. The
 * deeper the roots, the more stable the trunk above.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Somatic Regulation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ROOT_PATHS = [
  { d: 'M 100 20 Q 95 50, 85 80 Q 80 100, 75 130', label: 'first root' },
  { d: 'M 100 20 Q 108 55, 120 85 Q 128 110, 135 140', label: 'anchoring' },
  { d: 'M 100 20 Q 90 40, 70 60 Q 55 80, 45 120', label: 'spreading' },
  { d: 'M 100 20 Q 115 45, 130 65 Q 145 85, 155 115', label: 'deepening' },
  { d: 'M 100 20 Q 100 50, 100 80 Q 100 110, 100 150', label: 'taproot. Anchored.' },
];

export default function Elemental_RootDrop({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [roots, setRoots] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const growRoot = () => {
    if (stage !== 'active' || roots >= ROOT_PATHS.length) return;
    const next = roots + 1;
    setRoots(next);
    if (next >= ROOT_PATHS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const stability = roots / ROOT_PATHS.length;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Descending into the dark...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stability is not built up. It is grown down.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to send roots deeper</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={growRoot}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: roots >= ROOT_PATHS.length ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Root system — underground view */}
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `linear-gradient(180deg, hsla(25, 20%, ${15 + stability * 5}%, 0.3) 0%, hsla(20, 25%, 10%, 0.5) 100%)` }}>
              {/* Soil line */}
              <div style={{ position: 'absolute', top: '12px', left: 0, right: 0, height: '1px', background: `hsla(25, 15%, 30%, ${0.15 + stability * 0.1})` }} />
              {/* Trunk stub above soil */}
              <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '14px', background: `hsla(25, 25%, ${25 + stability * 10}%, ${0.2 + stability * 0.2})`, borderRadius: '2px' }} />
              {/* Roots */}
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {ROOT_PATHS.slice(0, roots).map((root, i) => (
                  <motion.path key={i} d={root.d}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    fill="none"
                    stroke={`hsla(25, ${15 + i * 3}%, ${30 + i * 4}%, 0.5)`}
                    strokeWidth={2 - i * 0.2}
                    strokeLinecap="round"
                  />
                ))}
                {/* Root hairs — tiny offshoots */}
                {ROOT_PATHS.slice(0, roots).map((_, i) => {
                  const hairs: JSX.Element[] = [];
                  for (let h = 0; h < 3; h++) {
                    const sx = 60 + i * 20 + h * 10;
                    const sy = 50 + i * 20 + h * 15;
                    hairs.push(
                      <motion.line key={`h${i}${h}`}
                        x1={sx} y1={sy}
                        x2={sx + (h % 2 ? 8 : -8)} y2={sy + 6}
                        initial={{ opacity: 0 }} animate={{ opacity: 0.2 }}
                        transition={{ delay: 0.5 }}
                        stroke="hsla(25, 10%, 35%, 0.3)"
                        strokeWidth="0.5"
                      />
                    );
                  }
                  return hairs;
                })}
                {/* Soil particles */}
                {Array.from({ length: 20 }, (_, i) => (
                  <circle key={`s${i}`}
                    cx={15 + Math.sin(i * 3.7) * 80 + 85}
                    cy={25 + Math.cos(i * 2.3) * 70 + 60}
                    r={0.5 + Math.random() * 1}
                    fill="hsla(25, 15%, 25%, 0.1)"
                  />
                ))}
              </svg>
            </div>
            {/* Root label */}
            {roots > 0 && (
              <motion.div key={roots} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic' }}>
                {ROOT_PATHS[roots - 1].label}
              </motion.div>
            )}
            <div style={{ display: 'flex', gap: '5px' }}>
              {ROOT_PATHS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < roots ? 'hsla(25, 20%, 45%, 0.5)' : palette.primaryFaint, opacity: i < roots ? 0.5 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Anchor yourself in the dark. You are rooted now.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Downward counteracts the upward pull of anxiety. Grounded. Stable.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Rooted. Dark. Stable.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}