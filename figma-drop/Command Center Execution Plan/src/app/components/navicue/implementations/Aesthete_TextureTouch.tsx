/**
 * AESTHETE #5 -- The Texture Touch
 * "Your skin is a set of eyes. Feel the grain."
 * INTERACTION: Abstract texture fields -- moss, stone, velvet, sand.
 * Stroke each one (drag across) and haptic patterns change. Each
 * swipe shifts you from rumination into somatosensory presence.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TEXTURES = [
  { name: 'moss', color: 'hsla(120, 25%, 30%, 0.6)', desc: 'soft, damp, yielding', pattern: 'radial' },
  { name: 'stone', color: 'hsla(220, 8%, 40%, 0.5)', desc: 'cool, grained, ancient', pattern: 'angular' },
  { name: 'velvet', color: 'hsla(280, 30%, 25%, 0.5)', desc: 'deep, plush, resistant', pattern: 'wave' },
  { name: 'sand', color: 'hsla(40, 35%, 55%, 0.4)', desc: 'warm, fine, shifting', pattern: 'dots' },
];

export default function Aesthete_TextureTouch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [texIdx, setTexIdx] = useState(0);
  const [touching, setTouching] = useState(false);
  const [touchProgress, setTouchProgress] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const moveCountRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePointerDown = () => {
    if (stage !== 'active') return;
    setTouching(true);
    moveCountRef.current = 0;
  };
  const handlePointerMove = () => {
    if (!touching) return;
    moveCountRef.current += 1;
    const p = Math.min(1, moveCountRef.current / 30);
    setTouchProgress(p);
  };
  const handlePointerUp = () => {
    if (!touching) return;
    setTouching(false);
    if (touchProgress >= 0.8) {
      const next = [...completed, texIdx];
      setCompleted(next);
      if (next.length >= TEXTURES.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2000);
      } else {
        setTexIdx(prev => prev + 1);
        setTouchProgress(0);
      }
    } else {
      setTouchProgress(0);
    }
  };

  const current = TEXTURES[texIdx];

  const renderPattern = (tex: typeof TEXTURES[0]) => {
    const elements: JSX.Element[] = [];
    if (tex.pattern === 'radial') {
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const r = 15 + Math.random() * 40;
        elements.push(<circle key={i} cx={100 + Math.cos(angle) * r} cy={80 + Math.sin(angle) * r} r={2 + Math.random() * 3} fill={tex.color} opacity={0.3} />);
      }
    } else if (tex.pattern === 'angular') {
      for (let i = 0; i < 12; i++) {
        const x = 20 + Math.random() * 160;
        const y = 10 + Math.random() * 140;
        elements.push(<rect key={i} x={x} y={y} width={4 + Math.random() * 8} height={2 + Math.random() * 4} fill={tex.color} opacity={0.25} transform={`rotate(${Math.random() * 45}, ${x}, ${y})`} />);
      }
    } else if (tex.pattern === 'wave') {
      for (let i = 0; i < 6; i++) {
        const y = 20 + i * 25;
        elements.push(<path key={i} d={`M 10 ${y} Q 55 ${y - 10}, 100 ${y} Q 145 ${y + 10}, 190 ${y}`} fill="none" stroke={tex.color} strokeWidth="1.5" opacity={0.25} />);
      }
    } else {
      for (let i = 0; i < 50; i++) {
        elements.push(<circle key={i} cx={10 + Math.random() * 180} cy={5 + Math.random() * 150} r={0.5 + Math.random() * 1.5} fill={tex.color} opacity={0.2} />);
      }
    }
    return elements;
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Preparing the surface...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Your skin is a set of eyes. Get out of your head and into your fingertips.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>stroke the texture and feel the grain</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            {/* Texture field */}
            <motion.div key={texIdx}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              style={{ width: '200px', height: '160px', borderRadius: radius.md, border: `1px solid ${touching ? current.color : palette.primaryFaint}`, overflow: 'hidden', cursor: 'grab', touchAction: 'none', position: 'relative', background: `${current.color.replace(/[\d.]+\)$/, '0.05)')}` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {renderPattern(current)}
              </svg>
              {/* Touch trail glow */}
              {touching && (
                <motion.div
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${current.color}, transparent)`, opacity: touchProgress * 0.3 }}
                />
              )}
            </motion.div>
            {/* Texture name + description */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.hint, color: current.color, fontSize: '11px', opacity: 0.5 }}>{current.name}</div>
              <div style={{ ...navicueType.texture, color: palette.textFaint, fontSize: '11px', fontStyle: 'italic', opacity: 0.35, marginTop: '2px' }}>{current.desc}</div>
            </div>
            {/* Progress */}
            <div style={{ width: '100%', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${touchProgress * 100}%` }} style={{ height: '100%', background: current.color, opacity: 0.5 }} />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {TEXTURES.map((t, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: completed.includes(i) ? t.color : palette.primaryFaint, opacity: completed.includes(i) ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Present. In the fingertips.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The somatosensory cortex woke up. Rumination went quiet.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Grain felt. Mind stilled.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}