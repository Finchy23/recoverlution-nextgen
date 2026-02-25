/**
 * AESTHETE #2 -- The Color Soak
 * "Drink the color. Let it saturate your optic nerve."
 * INTERACTION: The screen floods with International Klein Blue --
 * pure, deep, unbroken pigment. No text, no gradient. Hold still
 * and let it soak through you. Then it slowly shifts to the next hue.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const COLORS = [
  { name: 'Klein Blue', hue: 'hsl(225, 90%, 30%)', instruction: 'Let it saturate your optic nerve.' },
  { name: 'Cerulean', hue: 'hsl(197, 70%, 45%)', instruction: 'Breathe through your eyes.' },
  { name: 'Vermillion', hue: 'hsl(8, 80%, 42%)', instruction: 'Feel the warmth rise.' },
  { name: 'Viridian', hue: 'hsl(160, 55%, 30%)', instruction: 'Let the green settle you.' },
];

const SOAK_TIME = 4500;

export default function Aesthete_ColorSoak({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [colorIdx, setColorIdx] = useState(0);
  const [soaking, setSoaking] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const startSoak = () => {
    if (soaking || stage !== 'active') return;
    setSoaking(true);
    setProgress(0);
    startRef.current = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - startRef.current) / SOAK_TIME);
      setProgress(p);
      if (p >= 1) {
        const next = colorIdx + 1;
        if (next >= COLORS.length) {
          addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
        } else {
          setColorIdx(next);
          setSoaking(false);
          setProgress(0);
        }
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const current = COLORS[colorIdx];

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Preparing pigment...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Drink the color. Do not name it. Feel it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to begin the soak</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startSoak}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: soaking ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Color field */}
            <motion.div
              key={colorIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: soaking ? 0.85 : 0.2 }}
              transition={{ duration: soaking ? 2 : 0.5 }}
              style={{ width: '220px', height: '180px', borderRadius: radius.lg, background: current.hue, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* Pure pigment -- no decorations when soaking */}
              {!soaking && (
                <div style={{ ...navicueType.hint, color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                  tap to soak
                </div>
              )}
              {soaking && progress > 0.7 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
                  style={{ ...navicueType.texture, color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontStyle: 'italic', textAlign: 'center', padding: '0 20px' }}>
                  {current.instruction}
                </motion.div>
              )}
            </motion.div>
            {/* Color name */}
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: 0.4 }}>
              {current.name}
            </div>
            {/* Soak progress */}
            {soaking && (
              <div style={{ width: '100%', height: '2px', background: palette.primaryFaint, borderRadius: '1px', overflow: 'hidden' }}>
                <motion.div animate={{ width: `${progress * 100}%` }} style={{ height: '100%', background: current.hue, opacity: 0.6 }} />
              </div>
            )}
            {/* Progress dots */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {COLORS.map((c, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i <= colorIdx && (i < colorIdx || (soaking && progress >= 1)) ? c.hue : palette.primaryFaint, opacity: i < colorIdx ? 0.6 : i === colorIdx ? 0.4 : 0.1 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Saturated. The color lives in you now.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Light enters. Chemistry shifts. Beauty is utility.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Color soaked. Nerve settled.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}