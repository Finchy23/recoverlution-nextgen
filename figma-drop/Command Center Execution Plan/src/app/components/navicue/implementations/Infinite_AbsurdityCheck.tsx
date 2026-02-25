/**
 * INFINITE PLAYER #2 — The Absurdity Check
 * "Look how hard you are trying to hold up the sky. Let it fall."
 * INTERACTION: A block of serious text. Each tap adds an absurd
 * overlay — clown nose, party hat, googly eyes, confetti, honk.
 * 5 taps. The serious problem becomes ridiculous.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const ABSURD_STEPS = 5;
const OVERLAYS = ['clown nose', 'party hat', 'googly eyes', 'confetti', 'honk'];

export default function Infinite_AbsurdityCheck({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [absurd, setAbsurd] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const addAbsurdity = () => {
    if (stage !== 'active' || absurd >= ABSURD_STEPS) return;
    const next = absurd + 1;
    setAbsurd(next);
    if (next >= ABSURD_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = absurd / ABSURD_STEPS;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A very serious problem...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Look how hard you are trying to hold up the sky. Let it fall. A clown nose on your serious problem.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to add absurdity</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={addAbsurdity}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: absurd >= ABSURD_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(0, ${t * 4}%, ${5 + t * 3}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* "Serious problem" document */}
                <rect x="35" y="20" width="130" height="90" rx="3"
                  fill={`hsla(220, 5%, 10%, ${0.05 * (1 - t * 0.3)})`}
                  stroke={`hsla(220, 5%, 18%, ${0.04 * (1 - t * 0.3)})`} strokeWidth="0.3" />
                {/* Text lines */}
                {Array.from({ length: 5 }, (_, i) => (
                  <rect key={i} x="45" y={30 + i * 12} width={80 + (i % 3) * 15} height="3" rx="1"
                    fill={`hsla(220, 4%, 16%, ${0.04 * (1 - t * 0.2)})`} />
                ))}
                {/* Header */}
                <text x="100" y="28" textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                  fill={`hsla(220, 6%, 22%, ${0.06 * (1 - t * 0.3)})`}>
                  URGENT PROBLEM
                </text>

                {/* Clown nose — absurd >= 1 */}
                {absurd >= 1 && (
                  <motion.circle cx="100" cy="65" r="8"
                    fill="hsla(0, 40%, 35%, 0.12)"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  />
                )}
                {/* Party hat — absurd >= 2 */}
                {absurd >= 2 && (
                  <motion.polygon points="100,10 88,35 112,35"
                    fill="hsla(280, 25%, 30%, 0.1)"
                    stroke="hsla(45, 20%, 35%, 0.08)" strokeWidth="0.4"
                    initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                  />
                )}
                {/* Googly eyes — absurd >= 3 */}
                {absurd >= 3 && (
                  <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <circle cx="82" cy="52" r="7" fill="hsla(0, 0%, 90%, 0.15)" />
                    <circle cx="82" cy="54" r="3.5" fill="hsla(0, 0%, 10%, 0.12)" />
                    <circle cx="118" cy="52" r="7" fill="hsla(0, 0%, 90%, 0.15)" />
                    <circle cx="120" cy="53" r="3.5" fill="hsla(0, 0%, 10%, 0.12)" />
                  </motion.g>
                )}
                {/* Confetti — absurd >= 4 */}
                {absurd >= 4 && Array.from({ length: 20 }, (_, i) => (
                  <motion.rect key={`conf-${i}`}
                    x={20 + (i * 37 + i * i) % 160} y={10 + (i * 23 + i * 7) % 130}
                    width={2 + i % 3} height={1.5}
                    rx="0.5"
                    fill={`hsla(${(i * 47) % 360}, ${20 + i % 15}%, ${35 + i % 15}%, ${0.1 + (i % 4) * 0.02})`}
                    transform={`rotate(${i * 30}, ${20 + (i * 37 + i * i) % 160}, ${10 + (i * 23 + i * 7) % 130})`}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 0.12, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.5 }}
                  />
                ))}
                {/* HONK — absurd >= 5 */}
                {absurd >= 5 && (
                  <motion.text x="100" y="130" textAnchor="middle" fontSize="12" fontFamily="Impact, sans-serif"
                    fill="hsla(45, 25%, 40%, 0.15)" letterSpacing="3"
                    initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 0.15 }}
                    transition={{ type: 'spring', stiffness: 150 }}>
                    HONK
                  </motion.text>
                )}

                <text x="100" y="152" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(${t > 0.5 ? 45 : 220}, ${6 + t * 8}%, ${20 + t * 10}%, ${0.04 + t * 0.03})`}>
                  absurdity: {Math.round(t * 100)}%
                </text>
              </svg>
            </div>
            <motion.div key={absurd} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {absurd === 0 ? 'URGENT PROBLEM. Very serious. Very important.' : `Added: ${OVERLAYS[absurd - 1]}. ${absurd < ABSURD_STEPS ? 'More absurdity needed.' : 'The problem is now ridiculous.'}`}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: ABSURD_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < absurd ? 'hsla(45, 22%, 50%, 0.5)' : palette.primaryFaint, opacity: i < absurd ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five absurdities. A clown nose. A party hat. Googly eyes. Confetti. HONK. The URGENT PROBLEM is now ridiculous. Look how hard you were trying to hold up the sky. Let it fall. It was never that heavy.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Humor as coping. Humor distances the ego from the threat, reducing the stress response. The problem didn't change. Your relationship to it did.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Serious. Clown nose. HONK.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}