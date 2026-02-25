/**
 * AESTHETE #6 -- The Design Edit
 * "Bad design is noise. It creates friction in the soul. Remove it."
 * INTERACTION: A cluttered grid of visual noise -- overlapping shapes,
 * harsh colors. Tap elements to remove them. Each removal simplifies.
 * The clean grid emerges. Curate your existence.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Values Clarification', 'embodying', 'Key');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CLUTTER = [
  { id: 0, x: 15, y: 10, w: 40, h: 25, color: 'hsla(0, 50%, 45%, 0.35)', shape: 'rect' },
  { id: 1, x: 60, y: 5, w: 30, h: 30, color: 'hsla(280, 40%, 40%, 0.3)', shape: 'circle' },
  { id: 2, x: 10, y: 40, w: 35, h: 20, color: 'hsla(50, 50%, 50%, 0.3)', shape: 'rect' },
  { id: 3, x: 50, y: 38, w: 25, h: 35, color: 'hsla(180, 35%, 40%, 0.3)', shape: 'rect' },
  { id: 4, x: 80, y: 42, w: 18, h: 18, color: 'hsla(320, 40%, 45%, 0.3)', shape: 'circle' },
  { id: 5, x: 30, y: 65, w: 45, h: 20, color: 'hsla(120, 30%, 35%, 0.3)', shape: 'rect' },
  { id: 6, x: 70, y: 70, w: 22, h: 22, color: 'hsla(210, 40%, 45%, 0.3)', shape: 'circle' },
];

export default function Aesthete_DesignEdit({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const removeItem = (id: number) => {
    if (stage !== 'active' || removed.has(id)) return;
    const next = new Set(removed);
    next.add(id);
    setRemoved(next);
    if (next.size >= CLUTTER.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    }
  };

  const clarity = removed.size / CLUTTER.length;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Values Clarification" kbe="embodying" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Surveying the clutter...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Bad design is noise. It creates friction in the soul.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to remove and curate your existence</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            {/* Clutter field */}
            <motion.div
              animate={{ borderColor: clarity > 0.5 ? palette.accent : palette.primaryFaint }}
              style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, border: `1px solid ${palette.primaryFaint}`, overflow: 'hidden', background: `rgba(255,255,255,${clarity * 0.01})` }}>
              {CLUTTER.map(item => {
                const isRemoved = removed.has(item.id);
                return (
                  <motion.div key={item.id}
                    animate={{ opacity: isRemoved ? 0 : 0.8, scale: isRemoved ? 0.3 : 1 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => removeItem(item.id)}
                    style={{
                      position: 'absolute',
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      width: `${item.w}%`,
                      height: `${item.h}%`,
                      background: item.color,
                      borderRadius: item.shape === 'circle' ? '50%' : '4px',
                      cursor: isRemoved ? 'default' : 'pointer',
                      pointerEvents: isRemoved ? 'none' : 'auto',
                    }}
                  />
                );
              })}
              {/* Clean grid lines emerge as clutter clears */}
              {clarity > 0.3 && (
                <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  {[45, 90, 135].map(x => (
                    <motion.line key={`v${x}`} x1={x} y1="0" x2={x} y2="180"
                      stroke={palette.accent} strokeWidth={safeSvgStroke(0.3)}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + (x / 100) }}
                    />
                  ))}
                  {[45, 90, 135].map(y => (
                    <motion.line key={`h${y}`} x1="0" y1={y} x2="220" y2={y}
                      stroke={palette.accent} strokeWidth={safeSvgStroke(0.3)}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + (y / 100) }}
                    />
                  ))}
                </svg>
              )}
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4 }}>
              {removed.size} removed, {CLUTTER.length - removed.size} remain{CLUTTER.length - removed.size === 0 ? '' : ''}
            </div>
            <div style={{ width: '100%', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${clarity * 100}%` }} style={{ height: '100%', background: palette.accent, opacity: 0.4 }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Clean. Clear. Curated.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Remove the noise. What remains is design. What remains is you.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Friction removed. Soul clear.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}