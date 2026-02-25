/**
 * ARCHITECT #4 -- The Environment Sweep
 * "Your environment dictates your defaults. Design the stage."
 * INTERACTION: A radar scan reveals triggers in your space.
 * Remove one trigger. Add one beauty. Redesign the defaults.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Attention Shift', 'embodying', 'InventorySpark');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const ITEMS = [
  { label: 'a bottle on the counter', type: 'trigger' },
  { label: 'the phone by the bed', type: 'trigger' },
  { label: 'old messages left open', type: 'trigger' },
  { label: 'a plant in the corner', type: 'beauty' },
  { label: 'a candle unlit', type: 'beauty' },
  { label: 'a photo of someone safe', type: 'beauty' },
];

export default function Architect_EnvironmentSweep({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [scanAngle, setScanAngle] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [removed, setRemoved] = useState<number | null>(null);
  const [added, setAdded] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const animRef = useRef<number>(0);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); cancelAnimationFrame(animRef.current); };
  }, []);

  // Radar sweep
  useEffect(() => {
    if (stage !== 'active') return;
    let frame = 0;
    const tick = () => {
      frame++;
      const angle = (frame * 1.5) % 360;
      setScanAngle(angle);
      // Reveal items at certain angles
      const revealAt = [30, 90, 150, 210, 270, 330];
      revealAt.forEach((a, i) => {
        if (Math.abs(angle - a) < 5 && !revealed.includes(i)) {
          setRevealed(prev => [...prev, i]);
        }
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [stage, revealed]);

  const handleItem = (i: number) => {
    if (stage !== 'active') return;
    const item = ITEMS[i];
    if (item.type === 'trigger' && removed === null) {
      setRemoved(i);
      if (added !== null) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      }
    } else if (item.type === 'beauty' && added === null) {
      setAdded(i);
      if (removed !== null) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      }
    }
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Attention Shift" kbe="embodying" form="InventorySpark" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Scanning the room.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your environment dictates your defaults.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>remove one trigger, add one beauty</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '0 24px' }}>
            {/* Radar */}
            <div style={{ width: '160px', height: '160px', borderRadius: '50%', border: `1px solid ${palette.primaryFaint}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: '50%', height: '2px', background: `linear-gradient(90deg, ${palette.accent}, transparent)`, transformOrigin: '0 50%', transform: `rotate(${scanAngle}deg)`, opacity: 0.6 }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `conic-gradient(from ${scanAngle}deg, ${palette.accentGlow}, transparent 30%)`, opacity: 0.15 }} />
            </div>
            {/* Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '320px' }}>
              {ITEMS.map((item, i) => {
                if (!revealed.includes(i)) return null;
                const isRemoved = removed === i;
                const isAdded = added === i;
                const isTrigger = item.type === 'trigger';
                return (
                  <motion.button key={i} onClick={() => handleItem(i)} initial={{ opacity: 0, x: -10 }} animate={{ opacity: isRemoved ? 0.2 : 1, x: 0, textDecoration: isRemoved ? 'line-through' : 'none' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '14px 16px', background: isAdded ? palette.primaryFaint : 'rgba(255,255,255,0.02)', border: `1px solid ${isTrigger ? 'rgba(255,100,100,0.15)' : palette.primaryFaint}`, borderRadius: radius.sm, cursor: (isRemoved || isAdded) ? 'default' : 'pointer', textAlign: 'left', ...navicueType.hint, color: isAdded ? palette.accent : palette.text }}>
                    {isRemoved ? '(removed) ' : isAdded ? '+ ' : ''}{item.label}
                  </motion.button>
                );
              })}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {removed !== null ? '1 removed' : '0 removed'} · {added !== null ? '1 added' : '0 added'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The stage is redesigned.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Your defaults just shifted.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Design the world you walk through.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}