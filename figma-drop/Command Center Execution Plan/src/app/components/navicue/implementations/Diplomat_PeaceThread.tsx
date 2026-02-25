/**
 * DIPLOMAT #4 — The Peace Thread
 * "Weave the first thread of connection."
 * INTERACTION: A tapestry torn in half. Tap to weave threads across
 * the divide — each thread a small act of repair. The tapestry
 * doesn't return to what it was. It becomes something new.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Connection', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const THREADS = [
  { y: 20, label: 'Show up.' },
  { y: 35, label: 'Listen first.' },
  { y: 50, label: 'Name what happened.' },
  { y: 65, label: 'Offer repair.' },
  { y: 80, label: 'Stay present.' },
];

export default function Diplomat_PeaceThread({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [woven, setWoven] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleWeave = (i: number) => {
    if (stage !== 'active' || woven.includes(i)) return;
    if (i !== woven.length) return;
    const next = [...woven, i];
    setWoven(next);
    if (next.length >= THREADS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Connection" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something tore.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Weave the first thread of connection.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap each thread to bridge the tear</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <svg width="260" height="220" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
              {/* Two halves */}
              <rect x="5" y="10" width="42" height="85" rx="3" fill="none" stroke={palette.primaryFaint} strokeWidth="0.4" opacity="0.2" />
              <rect x="53" y="10" width="42" height="85" rx="3" fill="none" stroke={palette.primaryFaint} strokeWidth="0.4" opacity="0.2" />
              {/* Tear line */}
              <line x1="50" y1="10" x2="50" y2="95" stroke={palette.primaryFaint} strokeWidth={safeSvgStroke(0.3)} strokeDasharray="2 2" opacity="0.15" />
              {/* Thread lines */}
              {THREADS.map((t, i) => {
                const isWoven = woven.includes(i);
                const isNext = i === woven.length;
                return (
                  <g key={i} onClick={() => handleWeave(i)} style={{ cursor: isNext ? 'pointer' : 'default' }}>
                    {/* Hit area */}
                    <rect x="15" y={t.y - 4} width="70" height="8" fill="transparent" />
                    <motion.line
                      x1="20" y1={t.y} x2="80" y2={t.y}
                      stroke={isWoven ? palette.accent : palette.primaryFaint}
                      strokeWidth={isWoven ? 1.2 : 0.4}
                      initial={{ opacity: 0.08 }}
                      animate={{ opacity: isWoven ? 0.6 : isNext ? 0.25 : 0.08 }}
                      strokeLinecap="round"
                    />
                    {isWoven && (
                      <motion.text initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                        x="50" y={t.y - 3} textAnchor="middle" fill={palette.textFaint} fontSize="3.2">
                        {t.label}
                      </motion.text>
                    )}
                  </g>
                );
              })}
            </svg>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {woven.length} of {THREADS.length} threads woven
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The tapestry won't return to what it was.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>It becomes something new. And it holds.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            One thread was enough to start.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}