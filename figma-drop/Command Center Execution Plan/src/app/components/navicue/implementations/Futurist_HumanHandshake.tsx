/**
 * FUTURIST #3 — The Human Handshake
 * "Emojis do not carry souls. Hear their voice."
 * INTERACTION: A screen with text bubbles stacking. Each tap
 * cracks the screen more — 5 cracks. At the final crack, a hand
 * reaches through the broken glass. "Call them." Connection
 * restored through prosody.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CRACK_COUNT = 5;
const TEXTS = ['hey', 'nm u?', 'ok', 'lol', 'k'];

// Crack paths — each progressively longer
const CRACKS = [
  'M 110,0 L 108,25 L 112,35',
  'M 0,90 L 20,88 L 35,92 L 48,87',
  'M 220,60 L 198,65 L 185,58 L 172,64',
  'M 80,180 L 85,158 L 78,145 L 84,130',
  'M 140,180 L 135,155 L 142,140 L 130,120 L 138,100',
];

export default function Futurist_HumanHandshake({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cracks, setCracks] = useState(0);
  const [handThrough, setHandThrough] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const crack = () => {
    if (stage !== 'active' || cracks >= CRACK_COUNT || handThrough) return;
    const next = cracks + 1;
    setCracks(next);
    if (next >= CRACK_COUNT) {
      addTimer(() => {
        setHandThrough(true);
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
      }, 1200);
    }
  };

  const t = cracks / CRACK_COUNT;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A screen between you...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Emojis do not carry souls. Hear their voice. Call them. Text is not connection.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to crack the screen open</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={crack}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: cracks >= CRACK_COUNT || handThrough ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(220, ${4 + t * 3}%, ${5 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Phone screen bezel */}
                <rect x="60" y="15" width="100" height="150" rx="8"
                  fill="none" stroke={`hsla(220, 8%, ${18 + t * 4}%, ${0.06 + t * 0.02})`}
                  strokeWidth="0.5" />

                {/* Text bubbles — shallow, soulless */}
                {!handThrough && TEXTS.map((txt, i) => {
                  const isLeft = i % 2 === 0;
                  const y = 30 + i * 24;
                  const dimmed = i < cracks;
                  return (
                    <motion.g key={i} initial={{ opacity: 0.4 }} animate={{ opacity: dimmed ? 0.03 : 0.4 }} transition={{ duration: 0.4 }}>
                      <rect x={isLeft ? 68 : 108} y={y} width={40} height={12} rx="5"
                        fill={isLeft
                          ? `hsla(220, 8%, ${15 + i}%, ${dimmed ? 0.02 : 0.05})`
                          : `hsla(210, ${10 + i * 2}%, ${20 + i * 2}%, ${dimmed ? 0.02 : 0.06})`
                        } />
                      <text x={isLeft ? 88 : 128} y={y + 8} textAnchor="middle" fontSize="4" fontFamily="monospace"
                        fill={`hsla(220, 6%, ${30 + i * 3}%, ${dimmed ? 0.02 : 0.12})`}>
                        {txt}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Crack lines */}
                {CRACKS.slice(0, cracks).map((d, i) => (
                  <motion.path key={`c-${i}`} d={d}
                    fill="none"
                    stroke={`hsla(0, 0%, ${30 + i * 4}%, ${0.06 + i * 0.02})`}
                    strokeWidth="0.5" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                ))}

                {/* Shatter particles */}
                {cracks >= CRACK_COUNT && !handThrough && Array.from({ length: 8 }, (_, i) => (
                  <motion.rect key={`shard-${i}`}
                    x={100 + (i - 4) * 8} y={80 + (i % 3) * 10}
                    width="3" height="3" rx="0.5"
                    fill={`hsla(220, 6%, 22%, ${0.04})`}
                    initial={{ opacity: 0.06, rotate: 0 }}
                    animate={{ opacity: 0, x: (i - 4) * 15, y: (i % 3 - 1) * 20 }}
                    transition={{ duration: 1 }}
                  />
                ))}

                {/* Hand reaching through */}
                {handThrough && (
                  <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 0.15, y: 0 }}
                    transition={{ duration: 2, ease: 'easeOut' }}>
                    <path d="M 95,110 C 93,100 96,92 101,90 C 104,88 106,90 107,92
                             C 108,88 111,86 114,86 C 118,86 120,89 120,93
                             C 121,89 124,88 127,89 C 130,90 132,94 131,98
                             C 133,96 136,97 137,100 C 138,103 137,107 135,109
                             L 126,122 C 122,128 116,132 109,133
                             C 102,132 96,128 93,122 Z"
                      fill="hsla(25, 12%, 40%, 0.08)"
                      stroke="hsla(25, 10%, 35%, 0.06)"
                      strokeWidth="0.4"
                    />
                    {/* Warmth radiating from hand */}
                    <circle cx="112" cy="108" r="20"
                      fill="hsla(25, 12%, 38%, 0.03)" />
                    <circle cx="112" cy="108" r="32"
                      fill="hsla(25, 10%, 35%, 0.015)" />
                  </motion.g>
                )}

                {/* "CALL THEM" */}
                {handThrough && (
                  <motion.text x="110" y="30" textAnchor="middle" fontSize="6.5" fontFamily="monospace"
                    fill="hsla(25, 15%, 45%, 0.15)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                    transition={{ delay: 1, duration: 2 }}>
                    CALL THEM
                  </motion.text>
                )}

                {/* Status */}
                {!handThrough && (
                  <text x="110" y="172" textAnchor="middle" fontSize="4.5" fontFamily="monospace"
                    fill={`hsla(220, ${8 + t * 6}%, ${25 + t * 8}%, ${0.06 + t * 0.04})`}>
                    {cracks === 0 ? 'text. no tone, no soul.' : `crack ${cracks}/${CRACK_COUNT}`}
                  </text>
                )}
              </svg>
            </div>
            <motion.div key={`${cracks}-${handThrough}`} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {cracks === 0 ? 'Text bubbles stacking. \"hey\" \"nm\" \"ok\" where is the soul?' : !handThrough && cracks < CRACK_COUNT ? `Crack ${cracks}. The screen is fracturing.` : handThrough ? 'The hand came through. Warmth, tone, presence.' : 'Screen shattered. Something is reaching through.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: CRACK_COUNT }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < cracks ? 'hsla(25, 15%, 45%, 0.5)' : palette.primaryFaint, opacity: i < cracks ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five cracks and the screen shattered. A hand reached through. Not a text. Not an emoji. A hand. Warm and real. The voice on the other end carries something no pixel can: tone, breath, presence.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Prosody perception. The brain needs tone of voice and pacing to fully regulate social safety. Text lacks this. Call them. Hear their voice. Emojis do not carry souls.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Screen. Crack. Hand.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}