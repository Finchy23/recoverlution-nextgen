/**
 * LOVER #9 — The Partner Breath
 * "When you breathe together, your HRV aligns."
 * INTERACTION: Two breathing rings, offset in rhythm. A real-time timer
 * runs. You tap to nudge your ring closer to the other's rhythm.
 * Over 5 taps the phase offset shrinks to zero. Synchronized.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } = navicueQuickstart('relational_ghost', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SYNC_STEPS = 5;

export default function Lover_PartnerBreath({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [synced, setSynced] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setBreathPhase(p => p + 0.025); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const nudge = () => {
    if (stage !== 'active' || synced >= SYNC_STEPS) return;
    const next = synced + 1;
    setSynced(next);
    if (next >= SYNC_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = synced / SYNC_STEPS;
  // Ring A breathes at base rate, Ring B has phase offset that shrinks
  const phaseOffset = Math.PI * (1 - t); // π → 0
  const breathA = Math.sin(breathPhase) * 0.5 + 0.5; // 0–1
  const breathB = Math.sin(breathPhase + phaseOffset) * 0.5 + 0.5;
  const rA = 30 + breathA * 12;
  const rB = 30 + breathB * 12;
  const syncGlow = t * (1 - Math.abs(breathA - breathB));

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Two rhythms...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Match their rhythm. When you breathe together, you become one biological system.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to nudge your breath closer</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={nudge}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: synced >= SYNC_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden',
              background: `hsla(350, ${8 + syncGlow * 20}%, ${7 + syncGlow * 4}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
                {/* Sync glow */}
                <defs>
                  <radialGradient id={`${svgId}-breathGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(350, 25%, 45%, ${syncGlow * 0.1})`} />
                    <stop offset="80%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="95" fill={`url(#${svgId}-breathGlow)`} />

                {/* Ring A — rose, left-center */}
                <circle cx={85} cy="100" r={rA}
                  fill="none"
                  stroke={`hsla(350, 22%, 45%, ${0.1 + breathA * 0.08 + syncGlow * 0.06})`}
                  strokeWidth={0.8 + breathA * 0.4} />
                {/* Ring B — amber, right-center */}
                <circle cx={115} cy="100" r={rB}
                  fill="none"
                  stroke={`hsla(25, 22%, 48%, ${0.1 + breathB * 0.08 + syncGlow * 0.06})`}
                  strokeWidth={0.8 + breathB * 0.4} />

                {/* Overlap zone — visible when close to sync */}
                {t > 0.3 && (
                  <ellipse cx="100" cy="100" rx={Math.min(rA, rB) * 0.4 * t} ry={Math.min(rA, rB) * 0.5 * t}
                    fill={`hsla(0, 20%, 45%, ${syncGlow * 0.05})`} />
                )}

                {/* Phase indicator */}
                <text x="100" y="165" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(350, 15%, 40%, ${0.08 + syncGlow * 0.08})`}>
                  {t >= 1 ? 'synchronized' : `offset: ${Math.round((1 - t) * 100)}%`}
                </text>

                {/* Labels */}
                <text x="65" y="60" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill="hsla(350, 15%, 40%, 0.1)">you</text>
                <text x="135" y="60" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill="hsla(25, 15%, 42%, 0.1)">them</text>

                {/* Synced label */}
                {t >= 1 && (
                  <motion.text x="100" y="100" textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontFamily="monospace"
                    fill="hsla(350, 20%, 50%, 0.2)" letterSpacing="1"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: 2 }}>
                    ONE
                  </motion.text>
                )}
              </svg>
            </div>
            <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
              {synced === 0 ? 'Two rhythms. Out of sync.' : synced < SYNC_STEPS ? `Nudging closer... ${Math.round(t * 100)}% aligned.` : 'Breathing as one system.'}
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: SYNC_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < synced ? 'hsla(350, 20%, 48%, 0.5)' : palette.primaryFaint, opacity: i < synced ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The rings breathe as one. Phase offset: zero. Heart rate variability aligned. Two nervous systems became one biological system.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Bio-behavioral synchrony. Physical synchronization fosters emotional empathy and prosocial behavior. The breath is the bridge.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Two. Sync. One.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}