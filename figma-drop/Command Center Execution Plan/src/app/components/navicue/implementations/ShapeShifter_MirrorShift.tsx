/**
 * SHAPESHIFTER #1 — The Mirror Shift
 * "You are not one person. You are a parliament."
 * ARCHETYPE: Pattern A (Tap ×5) — A mirror surface. Each tap shifts the
 * reflection to a different version: child, rebel, sage, lover, creator.
 * Self-Complexity Theory — more selves = more resilient.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const FACES = [
  { label: 'THE CHILD', desc: 'wonder', size: 10, eyes: 4 },
  { label: 'THE REBEL', desc: 'defiance', size: 14, eyes: 2.5 },
  { label: 'THE SAGE', desc: 'knowing', size: 12, eyes: 3 },
  { label: 'THE LOVER', desc: 'tenderness', size: 13, eyes: 3.5 },
  { label: 'THE CREATOR', desc: 'fire', size: 15, eyes: 3 },
];

export default function ShapeShifter_MirrorShift({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const shift = () => {
    if (stage !== 'active' || taps >= FACES.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= FACES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const current = FACES[Math.min(taps, FACES.length - 1)];
  const t = taps / FACES.length;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A reflection stirs...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You are not one person. You are a parliament of selves. Each one has a vote. Let them speak.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the mirror to shift</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={shift}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= FACES.length ? 'default' : 'pointer' }}>

            {/* Mirror frame */}
            <div style={{ position: 'relative', width: '160px', height: '200px', borderRadius: `${radius.full} ${radius.full} ${radius.md} ${radius.md}`, overflow: 'hidden',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 10)}`,
              background: themeColor(TH.voidHSL, 0.95, 1) }}>

              {/* Mirror sheen */}
              <div style={{ position: 'absolute', inset: 0,
                background: `linear-gradient(135deg, ${themeColor(TH.primaryHSL, 0.03, 15)} 0%, transparent 50%, ${themeColor(TH.accentHSL, 0.02, 10)} 100%)` }} />

              {/* The face — changes with each tap */}
              <AnimatePresence mode="wait">
                {taps > 0 && (
                  <motion.div key={taps}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg width="100" height="120" viewBox="0 0 100 120">
                      {/* Head shape — size varies per face */}
                      <ellipse cx="50" cy="50" rx={current.size + 8} ry={current.size + 10}
                        fill="none" stroke={themeColor(TH.accentHSL, 0.1, 12)} strokeWidth="0.5" />
                      {/* Eyes — character varies */}
                      <circle cx={50 - current.eyes * 2} cy="46" r={current.eyes}
                        fill={themeColor(TH.accentHSL, 0.12, 15)} />
                      <circle cx={50 + current.eyes * 2} cy="46" r={current.eyes}
                        fill={themeColor(TH.accentHSL, 0.12, 15)} />
                      {/* Expression line */}
                      <path d={taps <= 2
                        ? `M 42 58 Q 50 ${56 + taps * 2} 58 58`   // neutral to smile
                        : `M 42 60 Q 50 65 58 60`}                  // warm smile
                        fill="none" stroke={themeColor(TH.accentHSL, 0.08, 12)} strokeWidth="0.5" />
                      {/* Identity label */}
                      <text x="50" y="90" textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={themeColor(TH.accentHSL, 0.2, 15)} letterSpacing="0.1em">
                        {current.label}
                      </text>
                      <text x="50" y="100" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic"
                        fill={themeColor(TH.accentHSL, 0.12, 10)}>
                        {current.desc}
                      </text>
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ripple on tap */}
              {taps > 0 && (
                <motion.div key={`r-${taps}`}
                  initial={{ scale: 0, opacity: 0.15 }} animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 1 }}
                  style={{ position: 'absolute', top: '50%', left: '50%', width: '40px', height: '40px',
                    marginLeft: '-20px', marginTop: '-20px', borderRadius: '50%',
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 15)}` }} />
              )}

              {/* Empty mirror prompt */}
              {taps === 0 && (
                <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.primaryHSL, 0.1, 10), letterSpacing: '0.1em' }}>
                    TAP TO LOOK
                  </div>
                </motion.div>
              )}
            </div>

            {/* Face dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {FACES.map((_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.2, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Five faces. One mirror. You contain all of them. Self-complexity is not confusion, it is resilience.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>more selves, more stable</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The parliament is in session.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}