/**
 * MYCELIUM #1 — The Invisible Thread
 * "You didn't make this coffee. 1,000 people made it for you."
 * INTERACTION: A single coffee cup in the center. Tap it and lines of
 * light trace backwards — farmer, trucker, roaster, barista — each
 * node pulsing as the chain of hands is revealed. Interdependence made visible.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Values Clarification', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CHAIN = [
  { role: 'You', icon: '○', distance: 0 },
  { role: 'The barista', icon: '◑', distance: 1 },
  { role: 'The roaster', icon: '◐', distance: 2 },
  { role: 'The truck driver', icon: '▣', distance: 3 },
  { role: 'The farmer', icon: '◇', distance: 4 },
  { role: 'The rain', icon: '·', distance: 5 },
  { role: 'The soil', icon: '▪', distance: 6 },
];

export default function Mycelium_InvisibleThread({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [revealed, setRevealed] = useState(0);
  const [tracing, setTracing] = useState(false);
  const timersRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startTrace = () => {
    if (tracing || stage !== 'active') return;
    setTracing(true);
    setRevealed(1);
    let count = 1;
    intervalRef.current = window.setInterval(() => {
      count++;
      setRevealed(count);
      if (count >= CHAIN.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }, 900);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Values Clarification" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Look closer...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You didn't make this alone. A thousand hands brought it to you.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to trace the thread</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startTrace}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '280px', cursor: tracing ? 'default' : 'pointer' }}>
            {/* Chain visualization — vertical thread */}
            {CHAIN.map((node, i) => {
              const isVisible = i < revealed;
              const isCurrent = i === revealed - 1;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  {/* Connecting thread line */}
                  {i > 0 && (
                    <motion.div
                      animate={{ height: isVisible ? '16px' : '0px', opacity: isVisible ? 0.3 : 0 }}
                      transition={{ duration: 0.6 }}
                      style={{ width: '1px', background: `linear-gradient(to bottom, ${palette.accent}, ${palette.primaryFaint})` }}
                    />
                  )}
                  {/* Node */}
                  <motion.div
                    animate={{ opacity: isVisible ? (isCurrent ? 0.9 : 0.6) : (i === 0 && !tracing ? 0.5 : 0.08), scale: isCurrent ? 1.05 : 1 }}
                    transition={{ duration: 0.6 }}
                    style={{ width: '100%', padding: '10px 16px', borderRadius: radius.md, border: `1px solid ${isVisible ? palette.accent : palette.primaryFaint}`, background: isCurrent ? 'rgba(255,255,255,0.02)' : 'transparent', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: isCurrent ? `0 0 12px ${palette.accentGlow}` : 'none' }}>
                    <span style={{ fontSize: '14px', opacity: isVisible ? 0.6 : 0.15, width: '20px', textAlign: 'center', color: palette.text }}>{node.icon}</span>
                    <div>
                      <div style={{ ...navicueType.texture, color: isVisible ? palette.text : palette.textFaint, fontSize: '12px', fontStyle: 'italic' }}>{node.role}</div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            {!tracing && (
              <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginTop: '8px' }}>tap the cup</motion.div>
            )}
            {tracing && revealed < CHAIN.length && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3, marginTop: '4px' }}>{revealed} of {CHAIN.length} hands</div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>A thousand hands. One cup.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Drink their labor. You were never alone.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Connected. Always.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}