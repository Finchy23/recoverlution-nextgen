/**
 * STRATEGIST #9 — The Permissionless Build
 * "Don't wait to be picked. Pick yourself."
 * INTERACTION: A traffic light with all three lights off. Each tap
 * lights the green — and it STAYS on. 5 taps: 5 green lights
 * stacking vertically like a launch sequence. The gate opens
 * itself. No boss required.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, safeOpacity } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const GREEN_COUNT = 5;
const GREEN_LABELS = ['build', 'ship', 'iterate', 'own', 'free'];

export default function Strategist_PermissionlessBuild({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [greens, setGreens] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const lightGreen = () => {
    if (stage !== 'active' || greens >= GREEN_COUNT) return;
    const next = greens + 1;
    setGreens(next);
    if (next >= GREEN_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = greens / GREEN_COUNT;
  const allGreen = t >= 1;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            All lights off...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You don't need a boss to say yes. Build it. Ship it. Don't wait to be picked. Pick yourself. The gatekeepers are gone.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to light each green</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={lightGreen}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: greens >= GREEN_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '180px', height: '190px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(140, ${4 + t * 6}%, ${6 + t * 3}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 180 190" style={{ position: 'absolute', inset: 0 }}>
                {/* Traffic light housing */}
                <rect x="70" y="15" width="40" height="155" rx="8"
                  fill={`hsla(0, 0%, ${10 + t * 3}%, ${0.06 + t * 0.02})`}
                  stroke="hsla(0, 0%, 16%, 0.04)" strokeWidth="0.5" />

                {/* 5 light slots */}
                {Array.from({ length: GREEN_COUNT }, (_, i) => {
                  const cy = 35 + i * 28;
                  const lit = i < greens;
                  return (
                    <g key={i}>
                      {/* Socket */}
                      <circle cx="90" cy={cy} r="10"
                        fill={lit ? `hsla(140, ${20 + i * 3}%, ${35 + i * 3}%, ${0.08 + i * 0.02})` : 'hsla(0, 0%, 10%, 0.04)'}
                        stroke={lit ? `hsla(140, ${15 + i * 3}%, ${40 + i * 3}%, 0.08)` : 'hsla(0, 0%, 14%, 0.03)'}
                        strokeWidth="0.5" />
                      {/* Glow */}
                      {lit && (
                        <motion.circle cx="90" cy={cy} r="10"
                          fill={`hsla(140, ${22 + i * 3}%, ${42 + i * 3}%, ${0.06 + i * 0.01})`}
                          initial={{ r: 5, opacity: 0 }}
                          animate={{ r: 14, opacity: safeOpacity(0.06 + i * 0.01) }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                      {/* Inner dot */}
                      {lit && (
                        <motion.circle cx="90" cy={cy} r="4"
                          fill={`hsla(140, ${25 + i * 4}%, ${45 + i * 3}%, ${0.15 + i * 0.02})`}
                          initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        />
                      )}
                      {/* Label */}
                      <text x="125" y={cy + 2} fontSize="4" fontFamily="monospace"
                        fill={lit ? `hsla(140, 12%, 42%, 0.12)` : 'hsla(0, 0%, 20%, 0.04)'}>
                        {GREEN_LABELS[i]}
                      </text>
                    </g>
                  );
                })}

                {/* Gate opening at bottom */}
                {allGreen && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    <line x1="70" y1="175" x2="40" y2="175" stroke="hsla(140, 15%, 42%, 0.1)" strokeWidth="0.8" strokeLinecap="round" />
                    <line x1="110" y1="175" x2="140" y2="175" stroke="hsla(140, 15%, 42%, 0.1)" strokeWidth="0.8" strokeLinecap="round" />
                    <text x="90" y="185" textAnchor="middle" fontSize="5.5" fontFamily="monospace"
                      fill="hsla(140, 18%, 48%, 0.15)" letterSpacing="2">
                      LAUNCHED
                    </text>
                  </motion.g>
                )}
              </svg>
            </div>
            <motion.div key={greens} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {greens === 0 ? 'All lights dark. Waiting for permission.' : greens < GREEN_COUNT ? `Green ${greens}: "${GREEN_LABELS[greens - 1]}." The light stays on.` : 'Five greens. All lit. Gate open. You launched.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: GREEN_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < greens ? 'hsla(140, 22%, 45%, 0.5)' : palette.primaryFaint, opacity: i < greens ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five green lights. Build, ship, iterate, own, free: each one lit by you. No boss said yes. You picked yourself. The gate opened because you walked through it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Internal locus of control. Moving from passive recipient to active agent significantly reduces anxiety. The gatekeepers are gone. The green light was always yours to flip.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Dark. Light. Launched.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}