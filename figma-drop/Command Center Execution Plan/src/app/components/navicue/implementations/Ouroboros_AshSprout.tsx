/**
 * OUROBOROS #6 — The Ash Sprout
 * "From ash, the first green thing."
 * INTERACTION: A pile of ash. User taps 5 times. Each tap stirs
 * ash, revealing warmth beneath. A tiny sprout emerges from the
 * center. Growth from destruction. The phoenix principle.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function Ouroboros_AshSprout({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [stirs, setStirs] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => { addTimer(() => setStage('present'), 1200); addTimer(() => setStage('active'), 3500); return () => { timersRef.current.forEach(clearTimeout); }; }, []);

  const stir = () => {
    if (stage !== 'active' || stirs >= 5) return;
    const next = stirs + 1;
    setStirs(next);
    if (next >= 5) addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  const t = stirs / 5;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (<motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ash settles...</motion.div>)}
        {stage === 'present' && (<motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>After the fire, ash. In the ash, warmth. In the warmth, the impossible: green. Forest ecologists call it fire succession. The first sprout after wildfire is the bravest thing on earth.</div><div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to stir the ash</div></motion.div>)}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={stir}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: stirs >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(0, ${4 + t * 4}%, ${5 + t * 2}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Ash layer */}
                <rect x="30" y="110" width="160" height="50" rx="4" fill={`hsla(0, 0%, ${12 + t * 5}%, ${0.06 - t * 0.02})`} />
                {/* Ember glow — revealed with stirs */}
                {stirs > 0 && <motion.ellipse cx="110" cy="125" rx={20 + t * 15} ry={8 + t * 5} fill={`hsla(25, ${20 + t * 15}%, ${25 + t * 12}%, ${t * 0.04})`} initial={{ opacity: 0 }} animate={{ opacity: t * 0.04 }} />}
                {/* Scattered ash particles — stir outward */}
                {Array.from({ length: stirs * 4 }, (_, i) => (
                  <motion.circle key={`ash-${i}`} cx={80 + (i * 13) % 60} cy={115 + (i * 7) % 20} r={0.5 + Math.random()} fill={`hsla(0, 0%, ${30 + i * 3}%, ${0.02})`}
                    initial={{ y: 0 }} animate={{ y: -(i % 4) * 3 - 2 }} transition={{ duration: 0.8 }} />
                ))}
                {/* Sprout — appears at stir 3+ */}
                {stirs >= 3 && (
                  <motion.g initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ duration: 0.8 }} style={{ transformOrigin: '110px 120px' }}>
                    <motion.path d="M 110,120 C 110,110 109,100 110,90" fill="none" stroke={`hsla(120, ${15 + t * 10}%, ${30 + t * 10}%, ${0.05 + t * 0.04})`} strokeWidth={0.8 + t} strokeLinecap="round"
                      initial={{ d: 'M 110,120 C 110,110 109,100 110,90' }}
                      animate={{ d: stirs >= 5 ? 'M 110,120 C 110,105 109,90 110,75' : 'M 110,120 C 110,110 109,100 110,90' }} />
                    {stirs >= 4 && <motion.ellipse cx="106" cy={stirs >= 5 ? 78 : 92} rx="5" ry="3" fill={`hsla(120, 18%, 35%, ${0.04 + t * 0.02})`} transform={`rotate(-20, 106, ${stirs >= 5 ? 78 : 92})`} initial={{ scale: 0 }} animate={{ scale: 1 }} />}
                    {stirs >= 5 && <motion.ellipse cx="114" cy="82" rx="5" ry="3" fill={`hsla(120, 18%, 35%, ${0.04 + t * 0.02})`} transform="rotate(20, 114, 82)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />}
                  </motion.g>
                )}
              </svg>
            </div>
            <motion.div key={stirs} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center', maxWidth: '260px' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {stirs === 0 ? 'Grey ash. Everything burned.' : stirs === 1 ? 'Warmth beneath. Embers remain.' : stirs === 2 ? 'The ash stirs. Something lives below.' : stirs === 3 ? 'Green. Impossible green.' : stirs === 4 ? 'Growing. Already growing.' : 'The first leaf. From absolute ash.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>{Array.from({ length: 5 }, (_, i) => (<div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < stirs ? 'hsla(120, 20%, 45%, 0.5)' : palette.primaryFaint, opacity: i < stirs ? 0.6 : 0.15 }} />))}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (<motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>Five stirs. Ash to ember to sprout. The pyrophyte, the fire-loving plant, needs destruction to germinate. Some seeds only open in flames. Your worst moments may be your best seeds.</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Post-traumatic growth research: 70% of trauma survivors report at least one domain of significant positive change. The sprout from the ash is not metaphor. It is measurement.</motion.div></motion.div>)}
        {stage === 'afterglow' && (<motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>Ash. Ember. Sprout. Green.</motion.div>)}
      </AnimatePresence>
    </NaviCueShell>
  );
}