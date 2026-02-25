/**
 * MYCELIUM #9 — The Dunbar Sorter
 * "You only have bandwidth for 5 inner circle people. Who are they?"
 * INTERACTION: Concentric circles — 150, 50, 15, 5. Type names and
 * place them into the tightest ring possible. Prioritize the signal.
 * Curate for depth over breadth.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const RINGS = [
  { label: '5', desc: 'your inner circle', radius: 28, color: palette.accent },
  { label: '15', desc: 'close friends', radius: 50, color: 'hsla(160, 30%, 50%, 0.4)' },
  { label: '50', desc: 'good friends', radius: 72, color: 'hsla(200, 25%, 45%, 0.3)' },
  { label: '150', desc: 'meaningful contacts', radius: 92, color: 'hsla(220, 20%, 40%, 0.2)' },
];

export default function Mycelium_DunbarSorter({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState<{ name: string; ring: number }[]>([]);
  const [input, setInput] = useState('');
  const [selectedRing, setSelectedRing] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const placePerson = () => {
    if (!input.trim() || stage !== 'active') return;
    const next = [...placed, { name: input.trim(), ring: selectedRing }];
    setPlaced(next);
    setInput('');
    if (next.length >= 5) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
    }
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Sorting the signal...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You only have bandwidth for 5 inner circle people.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>who are they? prioritize the signal</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            {/* Concentric rings */}
            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {[...RINGS].reverse().map((ring, ri) => {
                const i = RINGS.length - 1 - ri;
                const isSelected = selectedRing === i;
                return (
                  <motion.div key={i}
                    onClick={() => setSelectedRing(i)}
                    animate={{ borderColor: isSelected ? ring.color : 'rgba(255,255,255,0.06)' }}
                    whileHover={{ borderColor: ring.color }}
                    style={{ position: 'absolute', width: `${ring.radius * 2}px`, height: `${ring.radius * 2}px`, borderRadius: '50%', border: `1.5px solid rgba(255,255,255,0.06)`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Ring label */}
                    <div style={{ position: 'absolute', top: '2px', ...navicueType.hint, color: ring.color, fontSize: '11px', opacity: isSelected ? 0.6 : 0.2 }}>{ring.label}</div>
                  </motion.div>
                );
              })}
              {/* Placed people */}
              {placed.map((p, i) => {
                const ring = RINGS[p.ring];
                const angle = (i / Math.max(placed.length, 1)) * Math.PI * 2 - Math.PI / 2;
                const r = ring.radius * 0.7;
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;
                return (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ring.color, boxShadow: `0 0 6px ${ring.color}` }} />
                    <div style={{ ...navicueType.hint, color: palette.text, fontSize: '11px', opacity: 0.5, whiteSpace: 'nowrap' }}>{p.name}</div>
                  </motion.div>
                );
              })}
            </div>
            {/* Ring selector labels */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {RINGS.map((ring, i) => (
                <motion.button key={i} onClick={() => setSelectedRing(i)}
                  animate={{ opacity: selectedRing === i ? 0.7 : 0.25 }}
                  style={{ padding: '12px 18px', borderRadius: radius.md, border: `1px solid ${ring.color}`, background: 'transparent', cursor: 'pointer', ...navicueType.hint, color: ring.color, fontSize: '11px' }}>
                  {ring.desc}
                </motion.button>
              ))}
            </div>
            {/* Input */}
            {placed.length < 5 && (
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && placePerson()}
                  placeholder="name someone..."
                  style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${RINGS[selectedRing].color}`, borderRadius: radius.sm, color: palette.text, fontSize: '12px', outline: 'none', fontFamily: 'inherit' }}
                />
                <motion.button onClick={placePerson} whileHover={{ scale: 1.05 }}
                  style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.accent}`, borderRadius: radius.sm, color: palette.accent, fontSize: '11px', cursor: 'pointer' }}>
                  place
                </motion.button>
              </div>
            )}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{placed.length} of 5 placed</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five. That's your bandwidth. Guard it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Curate for depth. Not everyone fits in the inner ring.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Signal prioritized. Depth chosen.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}