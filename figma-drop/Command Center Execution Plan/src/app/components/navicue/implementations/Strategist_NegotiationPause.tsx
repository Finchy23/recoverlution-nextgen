/**
 * STRATEGIST #5 — The Negotiation Pause
 * "Silence is leverage. He who speaks first loses."
 * INTERACTION: A silence meter — a horizontal bar filling with
 * stillness. You must NOT tap for 10 seconds. A pressure gauge
 * rises. If you hold silence for the full duration, the other
 * party concedes. The silence did the work.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SILENCE_MS = 10000;
const PHASES = 5; // visual checkpoints

export default function Strategist_NegotiationPause({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [counting, setCounting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const startSilence = () => {
    if (counting || completed) return;
    setCounting(true);
    setFailed(false);
    startRef.current = performance.now();
    const tick = () => {
      const el = performance.now() - startRef.current;
      setElapsed(el);
      if (el >= SILENCE_MS) {
        setCompleted(true);
        setCounting(false);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const breakSilence = () => {
    if (!counting || completed) return;
    setCounting(false);
    setFailed(true);
    setElapsed(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // Allow retry after a beat
    addTimer(() => setFailed(false), 1500);
  };

  const handleClick = () => {
    if (stage !== 'active') return;
    if (!counting && !completed) {
      startSilence();
    } else if (counting) {
      breakSilence();
    }
  };

  const t = Math.min(elapsed / SILENCE_MS, 1);
  const checkpoints = Math.floor(t * PHASES);
  const pressureLevel = t;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            An offer hangs in the air...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>They just made an offer. Do not speak. Wait ten seconds. Silence is leverage. He who speaks first loses. Let the silence do the work.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap once to begin, then hold silence</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClick}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: completed ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(0, 0%, ${5 + t * 3}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Silence meter bar — background */}
                <rect x="30" y="75" width="160" height="12" rx="3"
                  fill="hsla(0, 0%, 12%, 0.06)" />
                {/* Silence fill */}
                <motion.rect x="30" y="75" width={t * 160} height="12" rx="3"
                  fill={`hsla(${completed ? 150 : 42}, ${12 + t * 12}%, ${30 + t * 12}%, ${0.1 + t * 0.08})`}
                  animate={{ width: t * 160 }}
                />

                {/* Checkpoint markers */}
                {Array.from({ length: PHASES }, (_, i) => {
                  const cx = 30 + ((i + 1) / PHASES) * 160;
                  const reached = i < checkpoints;
                  return (
                    <circle key={i} cx={cx} cy="81" r="2"
                      fill={reached ? `hsla(150, 15%, 42%, 0.12)` : 'hsla(0, 0%, 18%, 0.04)'} />
                  );
                })}

                {/* Seconds display */}
                <text x="110" y="60" textAnchor="middle" fontSize="14" fontFamily="monospace" fontWeight="300"
                  fill={`hsla(0, 0%, ${25 + t * 15}%, ${0.1 + t * 0.1})`}>
                  {counting ? `${(elapsed / 1000).toFixed(1)}s` : completed ? '10.0s' : '0.0s'}
                </text>

                {/* Pressure gauge — right side */}
                <g>
                  <rect x="200" y="30" width="6" height="80" rx="2"
                    fill="hsla(0, 0%, 12%, 0.03)" />
                  <rect x="200" y={30 + (1 - pressureLevel) * 80} width="6" height={pressureLevel * 80} rx="2"
                    fill={`hsla(0, ${8 + pressureLevel * 12}%, ${25 + pressureLevel * 10}%, ${0.06 + pressureLevel * 0.06})`} />
                  <text x="203" y="25" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(0, 6%, 28%, 0.06)">tension</text>
                </g>

                {/* "They speak" label */}
                {completed && (
                  <motion.text x="110" y="115" textAnchor="middle" fontSize="5.5" fontFamily="monospace"
                    fill="hsla(150, 15%, 45%, 0.15)" letterSpacing="1"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 0.5, duration: 1.5 }}>
                    they concede
                  </motion.text>
                )}

                {/* Failed — broke silence */}
                {failed && (
                  <motion.text x="110" y="115" textAnchor="middle" fontSize="5" fontFamily="monospace"
                    fill="hsla(0, 15%, 40%, 0.15)"
                    initial={{ opacity: 0.15 }} animate={{ opacity: 0 }} transition={{ duration: 1.5 }}>
                    you spoke first. try again
                  </motion.text>
                )}

                {/* Instruction */}
                {!counting && !completed && !failed && (
                  <text x="110" y="115" textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                    fill="hsla(0, 0%, 28%, 0.08)">
                    tap to begin. then: silence.
                  </text>
                )}

                {/* Warning if counting */}
                {counting && (
                  <text x="110" y="105" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={`hsla(0, ${8 + pressureLevel * 8}%, ${28 + pressureLevel * 8}%, ${0.06 + pressureLevel * 0.04})`}>
                    do not tap. hold silence
                  </text>
                )}
              </svg>
            </div>
            <motion.div key={`${counting}-${completed}-${failed}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {!counting && !completed && !failed ? 'An offer on the table. The urge to respond.' : counting ? 'Silence building. Pressure rising. Hold.' : completed ? 'Ten seconds of nothing. They filled it.' : 'Broke too soon. Reset.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: PHASES }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < checkpoints ? 'hsla(42, 20%, 48%, 0.5)' : palette.primaryFaint, opacity: i < checkpoints ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Ten seconds of silence. The pressure built. You held. They filled the void, often with concessions. The silence did the work.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Social pressure regulation. Silence creates tension that the other party rushes to fill. He who speaks first loses. Leverage lives in the pause.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Offer. Silence. Concede.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}