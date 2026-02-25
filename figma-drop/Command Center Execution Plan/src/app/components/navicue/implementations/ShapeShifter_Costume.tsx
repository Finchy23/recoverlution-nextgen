/**
 * SHAPESHIFTER #6 — The Costume Change
 * "The roles are real. The actor is realer."
 * ARCHETYPE: Pattern B (Drag) — A wardrobe rack. Drag horizontally
 * to cycle through costumes (Parent, Boss, Friend, Stranger, Lover).
 * The figure stays the same underneath. Role Fluidity.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ROLES = [
  { label: 'PARENT', icon: '\u2661', desc: 'protector' },
  { label: 'BOSS', icon: '\u2606', desc: 'commander' },
  { label: 'FRIEND', icon: '\u263A', desc: 'companion' },
  { label: 'STRANGER', icon: '\u25CB', desc: 'mystery' },
  { label: 'LOVER', icon: '\u2764', desc: 'tenderness' },
];

export default function ShapeShifter_Costume({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const drag = useDragInteraction({
    axis: 'x', sticky: true,
    onComplete: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const t = drag.progress;
  const currentRole = Math.min(Math.floor(t * ROLES.length), ROLES.length - 1);
  const role = ROLES[currentRole];

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The wardrobe opens...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You wear five costumes a day. Parent, boss, friend, stranger, lover. The roles are real. But the actor is realer.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>drag to change costumes</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            <div {...drag.dragProps}
              style={{ ...drag.dragProps.style, position: 'relative', width: '200px', height: '200px', borderRadius: radius.md, overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.95, 1) }}>

              {/* Wardrobe rack */}
              <div style={{ position: 'absolute', top: '20px', left: '30px', right: '30px', height: '2px',
                background: themeColor(TH.primaryHSL, 0.08, 8), borderRadius: '1px' }} />

              {/* Costume hangers — slide with drag */}
              <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '80px', overflow: 'hidden' }}>
                <motion.div
                  animate={{ x: -currentRole * 40 }}
                  transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                  style={{ display: 'flex', gap: '8px', position: 'absolute', left: '70px', top: '10px' }}>
                  {ROLES.map((r, i) => (
                    <div key={i} style={{ width: '32px', textAlign: 'center' }}>
                      {/* Hanger hook */}
                      <div style={{ width: '1px', height: '10px', background: themeColor(TH.primaryHSL, 0.06, 6), margin: '0 auto' }} />
                      {/* Costume shape */}
                      <motion.div
                        animate={{
                          opacity: i === currentRole ? 1 : 0.3,
                          scale: i === currentRole ? 1.1 : 0.9,
                        }}
                        style={{
                          width: '32px', height: '45px', borderRadius: `${radius.xs} ${radius.xs} ${radius.sm} ${radius.sm}`,
                          background: i === currentRole
                            ? themeColor(TH.accentHSL, 0.08, 12)
                            : themeColor(TH.primaryHSL, 0.04, 4),
                          border: `1px solid ${i === currentRole
                            ? themeColor(TH.accentHSL, 0.1, 15)
                            : themeColor(TH.primaryHSL, 0.04, 5)}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.3s ease',
                        }}>
                        <div style={{ fontSize: '12px', opacity: i === currentRole ? 0.4 : 0.15 }}>{r.icon}</div>
                      </motion.div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* The figure beneath — constant, unchanged */}
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}>
                <svg width="60" height="80" viewBox="0 0 60 80">
                  {/* Constant silhouette — never changes */}
                  <ellipse cx="30" cy="20" rx="10" ry="12" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.1, 15)} strokeWidth="0.5" strokeDasharray="2 1" />
                  <rect x="22" y="33" width="16" height="25" rx="4" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.08, 12)} strokeWidth="0.5" strokeDasharray="2 1" />
                  <rect x="20" y="58" width="8" height="16" rx="3" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.06, 10)} strokeWidth="0.4" strokeDasharray="2 1" />
                  <rect x="32" y="58" width="8" height="16" rx="3" fill="none"
                    stroke={themeColor(TH.accentHSL, 0.06, 10)} strokeWidth="0.4" strokeDasharray="2 1" />
                  {/* "YOU" label — always there */}
                  <text x="30" y="50" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.12, 12)} letterSpacing="0.15em">
                    YOU
                  </text>
                </svg>
              </div>
            </div>

            {/* Current role display */}
            <AnimatePresence mode="wait">
              <motion.div key={currentRole} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.7, y: 0 }} exit={{ opacity: 0, y: -4 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em',
                  color: themeColor(TH.accentHSL, 0.2, 15) }}>
                  {role.label}
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'serif', fontStyle: 'italic',
                  color: themeColor(TH.accentHSL, 0.12, 10) }}>
                  {role.desc}
                </div>
              </motion.div>
            </AnimatePresence>

            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.primaryHSL, 0.1, 8), letterSpacing: '0.1em' }}>
              {Math.round(t * 100)}% CYCLED
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Five costumes. One actor. The costumes change; you do not. Knowing the difference between the role and the self, that is freedom.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the actor outlasts every costume</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The actor is realer.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}