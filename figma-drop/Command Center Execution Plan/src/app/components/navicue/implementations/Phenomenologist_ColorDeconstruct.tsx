/**
 * PHENOMENOLOGIST #7 — The Color Deconstruct
 * "That is not 'green.' It is 40% Cyan, 60% Yellow. See the ingredients."
 * INTERACTION: Colored blocks appear. Tap each to deconstruct into
 * CMYK percentage breakdowns. The gestalt "green" dissolves into
 * component values. See the recipe, not the label.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const COLORS = [
  { label: '"green"', actual: 'hsla(140, 40%, 40%, 0.7)', cmyk: { c: 42, m: 0, y: 58, k: 20 } },
  { label: '"red"', actual: 'hsla(5, 55%, 48%, 0.7)', cmyk: { c: 0, m: 78, y: 65, k: 12 } },
  { label: '"blue"', actual: 'hsla(215, 50%, 45%, 0.7)', cmyk: { c: 72, m: 38, y: 0, k: 15 } },
  { label: '"skin"', actual: 'hsla(25, 40%, 65%, 0.7)', cmyk: { c: 0, m: 22, y: 35, k: 8 } },
  { label: '"shadow"', actual: 'hsla(240, 10%, 25%, 0.7)', cmyk: { c: 15, m: 12, y: 0, k: 72 } },
];

export default function Phenomenologist_ColorDeconstruct({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [deconstructed, setDeconstructed] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const deconstruct = (idx: number) => {
    if (stage !== 'active' || deconstructed.includes(idx)) return;
    const next = [...deconstructed, idx];
    setDeconstructed(next);
    if (next.length >= COLORS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Breaking the spectrum...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>That is not "green." It is 42% Cyan, 58% Yellow. See the ingredients of reality.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each color to see its recipe</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            {/* Color blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {COLORS.map((c, i) => {
                const isOpen = deconstructed.includes(i);
                return (
                  <motion.div key={i}
                    onClick={() => deconstruct(i)}
                    whileTap={{ scale: 0.98 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: radius.sm, cursor: isOpen ? 'default' : 'pointer', background: 'hsla(0, 0%, 10%, 0.2)', transition: 'all 0.3s' }}>
                    {/* Color swatch */}
                    <motion.div
                      animate={{ borderRadius: isOpen ? '4px' : '4px' }}
                      style={{ width: '32px', height: '32px', borderRadius: radius.xs, background: c.actual, flexShrink: 0 }}
                    />
                    {/* Label or CMYK */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {!isOpen ? (
                        <div style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', opacity: 0.4 }}>{c.label}</div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
                          style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {Object.entries(c.cmyk).map(([key, val]) => (
                            <div key={key} style={{ fontFamily: 'monospace', fontSize: '11px', color: palette.text, opacity: 0.5 }}>
                              <span style={{ color: key === 'c' ? 'hsla(190, 50%, 55%, 0.7)' : key === 'm' ? 'hsla(330, 50%, 55%, 0.7)' : key === 'y' ? 'hsla(50, 60%, 55%, 0.7)' : 'hsla(0, 0%, 40%, 0.7)', fontWeight: 600 }}>
                                {key.toUpperCase()}
                              </span>
                              <span style={{ marginLeft: '2px' }}>{val}%</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                    {/* Status */}
                    {isOpen && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                        style={{ fontSize: '11px', color: palette.textFaint, fontFamily: 'monospace' }}>
                        ✓
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.25 }}>
              {deconstructed.length}/{COLORS.length} deconstructed
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Not "green." Not "red." Just percentages. You saw the ingredients of reality.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Gestalt perception broken. Component seeing activated. Emotional associations dissolved.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Ingredients. Not labels. Recipe.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}