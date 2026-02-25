/**
 * ELEMENTAL #9 — The Salt Cleanse
 * "Sweat, tears, or the sea. The cure for anything is salt water."
 * INTERACTION: Ocean spray builds across the screen. Three channels
 * of salt: tears (tap to release), sweat (hold to exert), the sea
 * (let it wash over). Each completes a cleansing cycle.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Somatic Regulation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const CHANNELS = [
  { name: 'tears', icon: '◦', instruction: 'Let it flow.', action: 'tap to release', color: 'hsla(200, 30%, 55%, 0.5)' },
  { name: 'sweat', icon: '·', instruction: 'Exert yourself.', action: 'hold to sweat', color: 'hsla(30, 40%, 50%, 0.5)' },
  { name: 'the sea', icon: '○', instruction: 'Let it wash over.', action: 'tap to surrender', color: 'hsla(195, 35%, 45%, 0.5)' },
];

export default function Elemental_SaltCleanse({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [channelIdx, setChannelIdx] = useState(0);
  const [releasing, setReleasing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleAction = () => {
    if (stage !== 'active' || completed.includes(channelIdx)) return;
    if (channelIdx === 1) {
      // Sweat — hold-based (simulate with clicks building)
      setReleasing(true);
      startRef.current = Date.now();
      const tick = () => {
        const p = Math.min(1, (Date.now() - startRef.current) / 3000);
        setProgress(p);
        if (p >= 1) { finishChannel(); } else { rafRef.current = requestAnimationFrame(tick); }
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // Tap-based
      setReleasing(true);
      setProgress(0);
      let p = 0;
      const tick = () => {
        p += 0.015;
        setProgress(Math.min(1, p));
        if (p >= 1) { finishChannel(); } else { rafRef.current = requestAnimationFrame(tick); }
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const handleUp = () => {
    if (channelIdx === 1 && releasing && progress < 1) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setReleasing(false);
    }
  };

  const finishChannel = () => {
    const next = [...completed, channelIdx];
    setCompleted(next);
    setReleasing(false);
    if (next.length >= CHANNELS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    } else {
      addTimer(() => { setChannelIdx(prev => prev + 1); setProgress(0); }, 1500);
    }
  };

  const current = CHANNELS[channelIdx];

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Salt water rising...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Sweat, tears, or the sea. The cure for anything is salt water.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>three channels of salt; let it flow</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerDown={handleAction} onPointerUp={handleUp} onPointerLeave={handleUp}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: 'pointer', touchAction: 'none', width: '100%', maxWidth: '280px' }}>
            {/* Salt field */}
            <motion.div key={channelIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ position: 'relative', width: '200px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: `linear-gradient(180deg, hsla(200, 20%, 12%, 0.3), ${current.color.replace(/[\d.]+\)$/, '0.1)')})` }}>
              {/* Channel visual */}
              <svg width="100%" height="100%" viewBox="0 0 200 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Drops / spray based on progress */}
                {Array.from({ length: Math.floor(progress * 20) }, (_, i) => {
                  const dx = 30 + Math.sin(i * 3.1 + channelIdx) * 70;
                  const dy = 20 + Math.cos(i * 2.7) * 50 + i * 3;
                  return <circle key={i} cx={dx} cy={dy} r={1 + Math.random() * 2} fill={current.color} opacity={0.2 + progress * 0.15} />;
                })}
                {/* Wave lines for sea */}
                {channelIdx === 2 && (
                  <>
                    {[80, 95, 110, 125].map((y, i) => (
                      <motion.path key={i}
                        d={`M 0 ${y} Q 50 ${y - 5 - progress * 8}, 100 ${y} Q 150 ${y + 5 + progress * 8}, 200 ${y}`}
                        fill="none" stroke={current.color} strokeWidth="0.8"
                        initial={{ opacity: 0.1 }}
                        animate={{ opacity: 0.1 + progress * 0.2 }}
                      />
                    ))}
                  </>
                )}
              </svg>
              {/* Channel icon */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '28px', opacity: 0.3 + progress * 0.2 }}>
                {current.icon}
              </div>
              {/* Instruction */}
              {releasing && progress > 0.3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                  style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                  {current.instruction}
                </motion.div>
              )}
            </motion.div>
            {/* Channel label */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.hint, color: current.color, fontSize: '11px', opacity: 0.6 }}>{current.name}</div>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.3, marginTop: '2px' }}>{completed.includes(channelIdx) ? 'cleansed' : current.action}</div>
            </div>
            {/* Progress */}
            <div style={{ width: '100%', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${progress * 100}%` }} style={{ height: '100%', background: current.color }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {CHANNELS.map((c, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: completed.includes(i) ? c.color : palette.primaryFaint, opacity: completed.includes(i) ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Salt heals everything. Let it flow.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Somatic release. Stress hormones expelled. Tears, sweat, the sea. All salt. All medicine.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Cleansed. Three salts. Whole.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}