/**
 * OUROBOROS #7 — The Echo Origin
 * "Your first word echoes in your last. Listen."
 * INTERACTION: Sound waves ripple outward then return. 5 echoes,
 * each returning slightly transformed. The last echo matches
 * the first — the signal has traveled the full circle.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Ouroboros_EchoOrigin({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [echoes, setEchoes] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => { addTimer(() => setStage('present'), 1200); addTimer(() => setStage('active'), 3500); return () => { timersRef.current.forEach(clearTimeout); }; }, []);

  const echo = () => {
    if (stage !== 'active' || echoes >= 5) return;
    const next = echoes + 1;
    setEchoes(next);
    if (next >= 5) addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  const t = echoes / 5;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (<motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>A sound returns...</motion.div>)}
        {stage === 'present' && (<motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>Your first word echoes in your last. Every sound you have ever made is still traveling outward, bouncing off walls you will never see, returning in forms you cannot recognize. Listen for the echo of who you were.</div><div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to send each echo</div></motion.div>)}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={echo}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: echoes >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(210, ${6 + t * 6}%, ${5 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Echo rings — outward */}
                {Array.from({ length: echoes }, (_, i) => (
                  <motion.circle key={`echo-${i}`} cx="110" cy="90" fill="none"
                    stroke={`hsla(210, ${12 + i * 4}%, ${35 + i * 6}%, ${0.04 + i * 0.01})`}
                    strokeWidth={0.5}
                    initial={{ r: 5, opacity: 0.12 }} animate={{ r: 20 + i * 16, opacity: 0.12 + i * 0.01 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }} />
                ))}
                {/* Return echoes — inward (appear after outward) */}
                {echoes >= 3 && Array.from({ length: echoes - 2 }, (_, i) => (
                  <motion.circle key={`return-${i}`} cx="110" cy="90" fill="none"
                    stroke={`hsla(38, ${15 + i * 4}%, ${35 + i * 6}%, ${0.03 + i * 0.01})`}
                    strokeWidth={0.4}
                    strokeDasharray="2 4"
                    initial={{ r: 70 - i * 10, opacity: 0 }} animate={{ r: 20 + i * 5, opacity: 0.12 + i * 0.01 }}
                    transition={{ duration: 2, delay: 0.5, ease: 'easeIn' }} />
                ))}
                {/* Central point */}
                <motion.circle cx="110" cy="90" r={3 + t * 3}
                  fill={`hsla(210, ${12 + t * 10}%, ${30 + t * 12}%, ${0.04 + t * 0.03})`}
                  initial={{ r: 3 }}
                  animate={{ r: 3 + t * 3 }} />
                <text x="110" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace" fill={`hsla(210, 10%, 40%, ${0.05 + t * 0.04})`}>ECHO {echoes}/5</text>
              </svg>
            </div>
            <motion.div key={echoes} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {echoes === 0 ? 'Five sounds sent. Five echoes returned.' : echoes === 1 ? 'The first sound. It travels outward.' : echoes === 2 ? 'The second echo. Already changing.' : echoes === 3 ? 'The return begins. Transformed.' : echoes === 4 ? 'Almost home. Almost the same.' : 'The last echo matches the first. You have heard yourself return.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>{Array.from({ length: 5 }, (_, i) => (<div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < echoes ? 'hsla(210, 22%, 50%, 0.5)' : palette.primaryFaint, opacity: i < echoes ? 0.6 : 0.15 }} />))}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (<motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>Five echoes sent. Five echoes returned. The last sounds like the first, but you can hear the journey in it. Echo is not repetition. Echo is memory made audible. You are the echo of everything you have been.</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Acoustic physics: an echo returns in 0.1 seconds from 17 meters. Light from the edge of the observable universe: 13.8 billion years. The universe is the longest echo. You are a brief, bright sound in it.</motion.div></motion.div>)}
        {stage === 'afterglow' && (<motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>Sent. Traveled. Returned. Heard.</motion.div>)}
      </AnimatePresence>
    </NaviCueShell>
  );
}