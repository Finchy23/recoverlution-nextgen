/**
 * OUROBOROS #4 — The Snake Skin
 * "The serpent sheds and becomes. You have already become."
 * INTERACTION: Layers peel away as user taps. 5 skins shed,
 * each revealing a slightly different pattern beneath.
 * The final layer is the original — transformed.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SKINS = ['The mask you wore for others', 'The story you outgrew', 'The fear that served its purpose', 'The version that got you here', 'The skin that was always temporary'];

export default function Ouroboros_SnakeSkin({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [shed, setShed] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => { addTimer(() => setStage('present'), 1200); addTimer(() => setStage('active'), 3500); return () => { timersRef.current.forEach(clearTimeout); }; }, []);

  const peel = () => {
    if (stage !== 'active' || shed >= 5) return;
    const next = shed + 1;
    setShed(next);
    if (next >= 5) addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  const t = shed / 5;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (<motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Old skin loosening...</motion.div>)}
        {stage === 'present' && (<motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>Snakes shed skin 4-12 times per year. Each shedding is not loss; it is growth that demanded new form. You have already shed skins you cannot remember. You are shedding one now.</div><div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to shed each skin</div></motion.div>)}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={peel}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: shed >= 5 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden', background: `hsla(38, ${6 + t * 8}%, ${5 + t * 3}%, 0.9)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Layers — outer peels away, inner glows */}
                {Array.from({ length: 5 - shed }, (_, i) => {
                  const layerIdx = i + shed;
                  const r = 55 - i * 8;
                  return <circle key={`layer-${layerIdx}`} cx="110" cy="90" r={r} fill="none" stroke={`hsla(38, ${10 + i * 3}%, ${25 + i * 5}%, ${0.03 + i * 0.01})`} strokeWidth={1.5 - i * 0.2} strokeDasharray={`${3 + i} ${4 + i * 2}`} />;
                })}
                {/* Shed skins — drift outward */}
                {Array.from({ length: shed }, (_, i) => (
                  <motion.circle key={`shed-${i}`} cx="110" cy="90" r={55 + (i + 1) * 12}
                    fill="none" stroke={`hsla(38, 8%, 30%, ${0.015})`} strokeWidth="0.3" strokeDasharray="2 8"
                    initial={{ r: 55, opacity: 0.12 }} animate={{ r: 55 + (i + 1) * 12, opacity: 0.12 }}
                    transition={{ duration: 1.5 }} />
                ))}
                {/* Core — revealed */}
                <motion.circle cx="110" cy="90" r={15} fill={`hsla(38, ${15 + t * 12}%, ${25 + t * 15}%, ${t * 0.05})`} initial={{ r: 15 }} animate={{ r: 15 + t * 5 }} />
                <text x="110" y="170" textAnchor="middle" fontSize="11" fontFamily="monospace" fill={`hsla(38, 10%, 40%, ${0.05 + t * 0.04})`}>{shed}/5 SHED</text>
              </svg>
            </div>
            <motion.div key={shed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center', maxWidth: '260px' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>{shed === 0 ? 'Five skins to shed.' : SKINS[shed - 1]}</div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>{Array.from({ length: 5 }, (_, i) => (<div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < shed ? 'hsla(38, 22%, 50%, 0.5)' : palette.primaryFaint, opacity: i < shed ? 0.6 : 0.15 }} />))}</div>
          </motion.div>
        )}
        {stage === 'resonant' && (<motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}><div style={{ ...navicueType.prompt, color: palette.text }}>Five skins shed. The last layer is the first layer, transformed. You have not lost who you were. You have grown past the container that held it.</div><motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Ecdysis: the biological term for shedding skin. The snake is temporarily blind during the process; the old skin covers its eyes. Growth requires a moment of not seeing. Trust the shedding.</motion.div></motion.div>)}
        {stage === 'afterglow' && (<motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>Shed. Revealed. Renewed.</motion.div>)}
      </AnimatePresence>
    </NaviCueShell>
  );
}