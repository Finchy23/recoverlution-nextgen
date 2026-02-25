/**
 * FUTURIST #6 — The Deep Read
 * "Scanning is not reading. It is hunting. Stop hunting. Feast."
 * INTERACTION: Screen goes black. A single word appears at center.
 * Each tap reveals the next phrase — 5 phrases building one paragraph.
 * Each phrase lingers. No scrolling. No skimming. At the end:
 * the full paragraph glows. Deep reading restored.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PHRASES = [
  'The mind that reads deeply',
  'does not merely decode words.',
  'It builds cathedrals of meaning',
  'inside the silence between sentences.',
  'This is how empathy is made.',
];

export default function Futurist_DeepRead({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [revealed, setRevealed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const reveal = () => {
    if (stage !== 'active' || revealed >= PHRASES.length) return;
    const next = revealed + 1;
    setRevealed(next);
    if (next >= PHRASES.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 4000);
    }
  };

  const t = revealed / PHRASES.length;
  const full = t >= 1;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Darkness. One word...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Scanning is not reading. It is hunting. Stop hunting. Feast on the idea. Read this. Slowly. Do not skim.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to reveal each phrase, slowly</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={reveal}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: revealed >= PHRASES.length ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: 'hsla(0, 0%, 2%, 0.4)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Each phrase — appears one at a time, centered */}
                {PHRASES.map((phrase, i) => {
                  if (i >= revealed) return null;
                  const y = 45 + i * 22;
                  const isCurrent = i === revealed - 1;
                  const age = (revealed - i) / PHRASES.length;
                  return (
                    <motion.text key={i}
                      x="110" y={y} textAnchor="middle"
                      fontSize="5.5" fontFamily="Georgia, serif"
                      fill={`hsla(0, 0%, ${35 + (isCurrent ? 20 : age * 8)}%, ${isCurrent ? 0.3 : 0.08 + age * 0.06})`}
                      letterSpacing="0.3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isCurrent ? 0.3 : 0.08 + age * 0.06 }}
                      transition={{ duration: 2 }}>
                      {phrase}
                    </motion.text>
                  );
                })}

                {/* Full paragraph glow */}
                {full && (
                  <motion.rect x="30" y="30" width="160" height="120" rx="6"
                    fill="hsla(0, 0%, 20%, 0.02)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.02 }}
                    transition={{ duration: 3 }}
                  />
                )}

                {/* Reading depth indicator */}
                <rect x="20" y="165" width="180" height="1" rx="0.5"
                  fill="hsla(0, 0%, 12%, 0.04)" />
                <motion.rect x="20" y="165" width={180 * t} height="1" rx="0.5"
                  fill={`hsla(0, 0%, ${25 + t * 15}%, ${0.04 + t * 0.04})`}
                  initial={{ width: 0 }}
                  animate={{ width: 180 * t }}
                  transition={{ type: 'spring', stiffness: 30 }}
                />

                {/* Status */}
                <text x="110" y="175" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(0, 0%, ${20 + t * 12}%, ${0.04 + t * 0.03})`}>
                  {full ? 'deeply read' : revealed === 0 ? 'black page. waiting.' : `phrase ${revealed}/${PHRASES.length}`}
                </text>
              </svg>
            </div>
            <motion.div key={revealed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {revealed === 0 ? 'Black screen. One phrase at a time. No skimming allowed.' : revealed < PHRASES.length ? `"${PHRASES[revealed - 1]}" sit with it.` : 'Five phrases. One paragraph. Deeply read. Empathy built.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: PHRASES.length }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < revealed ? 'hsla(0, 0%, 50%, 0.4)' : palette.primaryFaint, opacity: i < revealed ? 0.5 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five phrases on a black screen. Each one lingered. You could not skim. You could not hunt. You had to feast. The mind that reads deeply does not merely decode; it builds cathedrals of meaning inside the silence between sentences.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Linear reading versus tabular reading. Deep reading builds cognitive patience and empathy, capabilities that atrophy with rapid screen scanning. Stop hunting. Feast.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Black. Phrase. Cathedral.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}