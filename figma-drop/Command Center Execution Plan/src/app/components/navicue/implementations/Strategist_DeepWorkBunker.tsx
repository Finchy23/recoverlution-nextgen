/**
 * STRATEGIST #4 — The Deep Work Bunker
 * "Distraction is the enemy of excellence."
 * INTERACTION: A heavy vault door, slightly ajar. Each tap closes it
 * another segment — 5 locks engage: wifi off, phone off, email off,
 * door sealed, world gone. At final lock: dead silence. Flow begins.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LOCKS = ['wifi', 'phone', 'email', 'door', 'world'];
const LOCK_COUNT = LOCKS.length;

export default function Strategist_DeepWorkBunker({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [locked, setLocked] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const lockDown = () => {
    if (stage !== 'active' || locked >= LOCK_COUNT) return;
    const next = locked + 1;
    setLocked(next);
    if (next >= LOCK_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = locked / LOCK_COUNT;
  const sealed = t >= 1;
  const doorAngle = (1 - t) * 25; // 25° open → 0° shut
  const roomLight = 0.3 + t * 0.2; // slightly brighter inside as focus increases

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A vault door creaks...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Ninety minutes. No wifi. No world. Just you. Distraction is the enemy of excellence. Go deep. The gold is at the bottom of the mine.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to engage each lock</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={lockDown}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: locked >= LOCK_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(220, ${6 + t * 5}%, ${5 + t * 3}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Vault door frame */}
                <rect x="55" y="20" width="90" height="130" rx="4"
                  fill="none" stroke={`hsla(220, 10%, 22%, ${0.08 + t * 0.04})`} strokeWidth="1.5" />

                {/* Door — rotating shut */}
                <motion.g style={{ transformOrigin: '55px 85px' }}
                  animate={{ rotate: doorAngle }}
                  transition={{ type: 'spring', stiffness: 40, damping: 12 }}>
                  <rect x="55" y="20" width="88" height="130" rx="3"
                    fill={`hsla(220, ${8 + t * 6}%, ${12 + t * 5}%, ${0.1 + t * 0.08})`}
                    stroke={`hsla(220, 8%, 20%, ${0.06 + t * 0.03})`} strokeWidth="0.8" />

                  {/* Door handle */}
                  <circle cx="125" cy="85" r="6"
                    fill="none" stroke={`hsla(220, 10%, 28%, ${0.08 + t * 0.04})`} strokeWidth="0.8" />
                  <line x1="125" y1="79" x2="125" y2="85"
                    stroke={`hsla(220, 10%, 28%, ${0.08 + t * 0.04})`} strokeWidth="0.8" />

                  {/* Lock indicators on door */}
                  {LOCKS.map((lock, i) => {
                    const ly = 35 + i * 22;
                    const isLocked = i < locked;
                    return (
                      <g key={lock}>
                        <rect x="65" y={ly - 4} width="24" height="8" rx="1.5"
                          fill={isLocked ? `hsla(150, 15%, 30%, 0.06)` : `hsla(0, 8%, 18%, 0.04)`}
                          stroke={isLocked ? `hsla(150, 12%, 35%, 0.06)` : 'none'} strokeWidth="0.3" />
                        <text x="77" y={ly + 2} textAnchor="middle" fontSize="11" fontFamily="monospace"
                          fill={isLocked ? 'hsla(150, 15%, 42%, 0.12)' : 'hsla(0, 6%, 28%, 0.07)'}>
                          {lock} {isLocked ? '✕' : '○'}
                        </text>
                      </g>
                    );
                  })}
                </motion.g>

                {/* Light leak from gap (when door is open) */}
                {!sealed && (
                  <rect x="143" y="22" width={doorAngle * 0.5} height="126" rx="0"
                    fill={`hsla(42, 15%, 40%, ${(1 - t) * 0.04})`} />
                )}

                {/* Inner glow when sealed — focus light */}
                {sealed && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 2 }}>
                    <circle cx="100" cy="85" r="20"
                      fill={`hsla(42, 18%, 45%, 0.06)`} />
                    <text x="100" y="88" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(42, 15%, 45%, 0.12)">FLOW</text>
                  </motion.g>
                )}

                {/* Timer */}
                <text x="100" y="168" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(220, ${8 + t * 8}%, ${28 + t * 10}%, ${0.06 + t * 0.06})`}>
                  {sealed ? '90:00. Deep.' : `${locked}/${LOCK_COUNT} locked`}
                </text>
              </svg>
            </div>
            <motion.div key={locked} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {locked === 0 ? 'Door ajar. Light leaking. Distractions flooding.' : locked < LOCK_COUNT ? `${LOCKS[locked - 1]} killed. Door closing.` : 'Sealed. Dead silence. Flow begins.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: LOCK_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < locked ? 'hsla(220, 18%, 45%, 0.5)' : palette.primaryFaint, opacity: i < locked ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five locks engaged. Wifi, phone, email, door, world, all dead. The vault sealed. In the silence, flow appeared. The gold was at the bottom of the mine.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Flow state dynamics. Deep work requires the complete exclusion of attentional residue from task-switching. Ninety minutes unbroken. No residue. Pure depth.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Lock. Seal. Flow.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}