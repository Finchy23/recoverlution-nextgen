/**
 * PHENOMENOLOGIST #1 — The Raw Data
 * "Stop seeing 'chair.' See 'brown rectangle.'"
 * INTERACTION: Simulated camera feed that progressively blurs until
 * objects dissolve into abstract shapes and colors. Each tap increases
 * blur — labels fade, raw shapes emerge. See before naming.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Ocean');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const BLUR_STEPS = [
  { blur: 0, label: '"Chair." "Face." "Wall."', hint: 'the labeling mind sees...' },
  { blur: 4, label: '"Brown rectangle." "Light pattern."', hint: 'names dissolving...' },
  { blur: 10, label: '"Warm shape." "Cool edge."', hint: 'just data now...' },
  { blur: 20, label: '"Color. Form. Light."', hint: 'raw perception.' },
  { blur: 35, label: '"..."', hint: 'before the word.' },
];

// Simulated "scene" — abstract rectangles representing objects
const SCENE_OBJECTS = [
  { x: 20, y: 25, w: 55, h: 70, color: 'hsla(25, 35%, 40%, 0.6)', label: 'chair' },
  { x: 95, y: 15, w: 40, h: 40, color: 'hsla(200, 30%, 55%, 0.5)', label: 'face' },
  { x: 150, y: 40, w: 60, h: 80, color: 'hsla(120, 20%, 35%, 0.4)', label: 'plant' },
  { x: 60, y: 100, w: 80, h: 25, color: 'hsla(35, 25%, 50%, 0.5)', label: 'table' },
  { x: 10, y: 110, w: 30, h: 30, color: 'hsla(0, 30%, 45%, 0.4)', label: 'cup' },
];

export default function Phenomenologist_RawData({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [step, setStep] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const blur = () => {
    if (stage !== 'active' || step >= BLUR_STEPS.length - 1) return;
    const next = step + 1;
    setStep(next);
    if (next >= BLUR_STEPS.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const current = BLUR_STEPS[step];
  const blurAmount = current.blur;
  const labelOpacity = Math.max(0, 1 - step * 0.3);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Defocusing...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Stop seeing "chair." See "brown rectangle." Stop seeing "face." See "pattern of light."</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to dissolve the labels</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={blur}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: step >= BLUR_STEPS.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            {/* Scene with progressive blur */}
            <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 10%, 15%, 0.4)' }}>
              <motion.svg width="100%" height="100%" viewBox="0 0 220 150"
                animate={{ filter: `blur(${blurAmount}px)` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: 0 }}>
                {/* Background gradient */}
                <rect x="0" y="0" width="220" height="150" fill="hsla(220, 8%, 18%, 0.3)" />
                <rect x="0" y="95" width="220" height="55" fill="hsla(25, 10%, 22%, 0.2)" />
                {/* Objects */}
                {SCENE_OBJECTS.map((obj, i) => (
                  <g key={i}>
                    <rect x={obj.x} y={obj.y} width={obj.w} height={obj.h} rx="3" fill={obj.color} />
                  </g>
                ))}
                {/* Light patches — ambient */}
                <ellipse cx="180" cy="20" rx="25" ry="15" fill="hsla(45, 30%, 60%, 0.08)" />
                <ellipse cx="50" cy="60" rx="20" ry="30" fill="hsla(200, 20%, 50%, 0.06)" />
              </motion.svg>
              {/* Labels overlay — fade with blur */}
              <motion.div animate={{ opacity: labelOpacity }} transition={{ duration: 1 }}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {SCENE_OBJECTS.map((obj, i) => (
                  <div key={i} style={{ position: 'absolute', left: `${obj.x + obj.w / 2}px`, top: `${obj.y - 8}px`, transform: 'translateX(-50%)', fontSize: '11px', color: 'hsla(0, 0%, 70%, 0.4)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    {obj.label}
                  </div>
                ))}
              </motion.div>
            </div>
            {/* Current label */}
            <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>{current.label}</div>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', marginTop: '4px', opacity: 0.4 }}>{current.hint}</div>
            </motion.div>
            {/* Progress */}
            <div style={{ display: 'flex', gap: '5px' }}>
              {BLUR_STEPS.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i <= step ? 'hsla(220, 30%, 55%, 0.5)' : palette.primaryFaint, opacity: i <= step ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Before the word, there was only light and shape. You went back there.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The prediction machine paused. Sensory novelty. Rumination interrupted.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Before the label. Just data.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}