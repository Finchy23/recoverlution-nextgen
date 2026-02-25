/**
 * LOVER #5 — The Listening Ear
 * "To be heard is indistinguishable from being loved."
 * INTERACTION: An audio waveform oscillates. A "speak" zone at the
 * bottom — when you tap it the waveform flatlines (you're talking,
 * not listening). Tap the "listen" zone — the waveform resumes,
 * taller with each successful listen. 5 listens to complete.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LISTEN_STEPS = 5;

export default function Lover_ListeningEar({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [listens, setListens] = useState(0);
  const [wavePhase, setWavePhase] = useState(0);
  const [flatlined, setFlatlined] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setWavePhase(p => p + 0.04); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const listen = () => {
    if (stage !== 'active' || listens >= LISTEN_STEPS) return;
    if (flatlined) {
      setFlatlined(false);
      const next = listens + 1;
      setListens(next);
      if (next >= LISTEN_STEPS) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
      }
    } else {
      setFlatlined(true);
    }
  };

  const t = listens / LISTEN_STEPS;
  const amp = flatlined ? 0.5 : (8 + listens * 6);

  // Build waveform path
  const buildWave = () => {
    const points: string[] = [];
    const w = 180;
    const cy = 80;
    for (let i = 0; i <= 60; i++) {
      const x = 10 + (i / 60) * w;
      const wave1 = Math.sin(wavePhase * 2 + i * 0.15) * amp;
      const wave2 = Math.sin(wavePhase * 1.3 + i * 0.22) * amp * 0.4;
      const y = cy + wave1 + wave2;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A waveform hums...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Do not fix it. Do not solve it. Just witness it. Offer your silence as a gift.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to toggle between speaking and listening</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={listen}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: listens >= LISTEN_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(350, ${8 + t * 10}%, ${7 + t * 2}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Waveform */}
                <motion.path
                  d={buildWave()}
                  fill="none"
                  stroke={flatlined ? 'hsla(0, 10%, 25%, 0.1)' : `hsla(350, ${20 + t * 15}%, ${40 + t * 10}%, ${0.15 + t * 0.1})`}
                  strokeWidth={flatlined ? 0.5 : 1 + t * 0.5}
                  strokeLinecap="round"
                />
                {/* Baseline */}
                <line x1="10" y1="80" x2="190" y2="80"
                  stroke="hsla(0, 0%, 25%, 0.06)" strokeWidth="0.3" strokeDasharray="2 4" />

                {/* Mode indicator */}
                <text x="100" y="135" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={flatlined ? 'hsla(0, 10%, 30%, 0.12)' : `hsla(350, 18%, 42%, ${0.12 + t * 0.08})`}>
                  {flatlined ? 'speaking. flatline.' : 'listening'}
                </text>

                {/* Flatline warning */}
                {flatlined && (
                  <motion.text x="100" y="20" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(0, 15%, 35%, 0.12)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}>
                    tap again to return to listening
                  </motion.text>
                )}

                {/* Completed */}
                {listens >= LISTEN_STEPS && (
                  <motion.text x="100" y="80" textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontFamily="monospace"
                    fill="hsla(350, 20%, 48%, 0.2)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    HEARD
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={`${listens}-${flatlined}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {listens === 0 && !flatlined ? 'The waveform. Soft. Tap to speak or listen.' : flatlined ? 'You spoke. The waveform died. Tap to listen again.' : listens < LISTEN_STEPS ? `Listened ${listens} time${listens > 1 ? 's' : ''}. The wave grows.` : 'Fully heard. The gift of silence.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: LISTEN_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < listens ? 'hsla(350, 22%, 50%, 0.5)' : palette.primaryFaint, opacity: i < listens ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You listened. The waveform swelled. Not one word of advice. Just witness. To be heard is indistinguishable from being loved.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Active constructive responding. The highest form of support is validation: "I see you," not advice. Capitalization builds. The silence was the gift.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Wave. Silence. Heard.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}