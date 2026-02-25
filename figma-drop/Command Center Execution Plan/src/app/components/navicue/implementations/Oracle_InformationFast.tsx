/**
 * ORACLE #4 — The Information Fast
 * "Stop collecting opinions. You already know."
 * ARCHETYPE: Pattern A (Tap × 5) — Five noisy information streams.
 * Each tap removes one. As noise drops, a single clear signal emerges.
 * Decision Fatigue.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ORACLE_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
const TH = ORACLE_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STREAMS = [
  { label: 'NEWS FEED', y: 22, hue: 0 },
  { label: 'OPINIONS', y: 48, hue: 30 },
  { label: 'METRICS', y: 74, hue: 200 },
  { label: 'COMPARISONS', y: 100, hue: 280 },
  { label: 'NOISE', y: 126, hue: 60 },
];

export default function Oracle_InformationFast({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [removed, setRemoved] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const remove = () => {
    if (stage !== 'active' || removed >= STREAMS.length) return;
    const next = removed + 1;
    setRemoved(next);
    if (next >= STREAMS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = removed / STREAMS.length;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            So much noise...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stop collecting opinions. You already know. Every additional input is diluting the signal. Fast from information. Let clarity rise.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to cut each stream and find the signal</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={remove}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: removed >= STREAMS.length ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '220px', height: '155px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 220 155" style={{ position: 'absolute', inset: 0 }}>
                {/* Information streams */}
                {STREAMS.map((stream, i) => {
                  const alive = i >= removed;
                  return alive ? (
                    <motion.g key={i} exit={{ opacity: 0, x: -30 }}>
                      {/* Stream bar */}
                      <rect x="15" y={stream.y} width="190" height="18" rx="3"
                        fill={`hsla(${stream.hue}, 10%, 12%, 0.04)`}
                        stroke={`hsla(${stream.hue}, 10%, 20%, 0.03)`} strokeWidth="0.3" />
                      {/* Moving noise inside */}
                      {Array.from({ length: 12 }, (_, j) => (
                        <motion.rect key={j} x={20 + j * 15} y={stream.y + 4} width={8} height={10} rx="1"
                          fill={`hsla(${stream.hue}, 8%, 18%, ${0.02 + Math.sin(j * 1.5) * 0.01})`}
                          animate={{ opacity: [0.02, 0.04, 0.02] }}
                          transition={{ duration: 1 + j * 0.2, repeat: Infinity }}
                        />
                      ))}
                      <text x="110" y={stream.y + 13} textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={`hsla(${stream.hue}, 10%, 28%, 0.06)`}>
                        {stream.label}
                      </text>
                    </motion.g>
                  ) : (
                    /* Cut stream — strikethrough */
                    <g key={i}>
                      <rect x="15" y={stream.y} width="190" height="18" rx="3"
                        fill={themeColor(TH.voidHSL, 0.02)} />
                      <line x1="15" y1={stream.y + 9} x2="205" y2={stream.y + 9}
                        stroke="hsla(0, 15%, 30%, 0.06)" strokeWidth="0.5" />
                      <text x="110" y={stream.y + 13} textAnchor="middle" fontSize="11" fontFamily="monospace"
                        fill={themeColor(TH.primaryHSL, 0.025, 8)} textDecoration="line-through">
                        {stream.label}
                      </text>
                    </g>
                  );
                })}

                {/* The signal — emerges as noise drops */}
                {t > 0.4 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: t * 0.12 }}>
                    <text x="110" y="80" textAnchor="middle" fontSize={5 + t * 4} fontFamily="Georgia, serif"
                      fontStyle="italic" fontWeight="500"
                      fill={themeColor(TH.accentHSL, t * 0.12, 18)}>
                      you already know
                    </text>
                  </motion.g>
                )}

                <text x="110" y="150" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'SILENCE. the signal is clear' : `streams remaining: ${STREAMS.length - removed}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {removed === 0 ? 'Five streams of noise. News, opinions, metrics, comparisons, noise.' : removed < STREAMS.length ? `Cut "${STREAMS[removed - 1].label}." ${STREAMS.length - removed} remain.` : 'All streams cut. Silence. The signal: you already know.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: STREAMS.length }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < removed ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five taps. News feed, cut. Opinions, cut. Metrics, cut. Comparisons, cut. Noise, cut. And in the silence, one sentence emerged: "you already know." Every additional input was diluting the signal. The answer was always there. Fast from information. Let clarity rise.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Decision fatigue. Research shows that increasing information beyond a threshold degrades decision quality. The brain's pattern-matching already has the answer. Stop collecting. Decide.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Noise. Cut. Know.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}