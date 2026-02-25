/**
 * DIPLOMAT #9 — The Common Ground
 * "Beneath the argument, shared ground exists."
 * INTERACTION: Layers of disagreement stack on screen. Tap each layer
 * to peel it away — revealing what's shared underneath. Position,
 * then interest, then value, then humanity.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Values Clarification', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const LAYERS = [
  { surface: 'What we disagree about', beneath: 'Different positions. Same landscape.' },
  { surface: 'What we both want', beneath: 'To be heard. To be safe. To matter.' },
  { surface: 'What we both fear', beneath: 'Being dismissed. Being alone. Being wrong.' },
  { surface: 'What we both are', beneath: 'Human. Afraid. Trying.' },
];

export default function Diplomat_CommonGround({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [peeled, setPeeled] = useState<number[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePeel = (i: number) => {
    if (stage !== 'active' || peeled.includes(i)) return;
    if (i !== peeled.length) return;
    const next = [...peeled, i];
    setPeeled(next);
    if (next.length >= LAYERS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Values Clarification" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The surface is loud.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Beneath the argument, shared ground.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>peel each layer to find what's underneath</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '300px' }}>
            {/* Stacked layers — top to bottom, peel from top */}
            {LAYERS.map((layer, i) => {
              const isPeeled = peeled.includes(i);
              const isNext = i === peeled.length;
              const depth = LAYERS.length - i;
              return (
                <motion.button key={i} onClick={() => handlePeel(i)}
                  animate={{
                    opacity: isPeeled ? 0.9 : isNext ? 0.5 : 0.15,
                    y: isPeeled ? 0 : 0,
                    scale: isPeeled ? 1 : 0.97,
                  }}
                  whileHover={isNext ? { scale: 1.02, opacity: 0.7 } : undefined}
                  style={{ width: '100%', padding: '16px', background: isPeeled ? `rgba(255,255,255,${0.01 + depth * 0.008})` : 'rgba(255,255,255,0.02)', border: `1px solid ${isPeeled ? palette.accent : palette.primaryFaint}`, borderRadius: radius.md, cursor: isNext ? 'pointer' : 'default', textAlign: 'center', transition: 'border-color 0.8s' }}>
                  <AnimatePresence mode="wait">
                    {!isPeeled ? (
                      <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                        style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {layer.surface}
                      </motion.div>
                    ) : (
                      <motion.div key="b" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 0.6, y: 0 }} transition={{ duration: 0.8 }}>
                        <div style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', opacity: 0.5 }}>
                          {layer.surface}
                        </div>
                        <div style={{ ...navicueType.texture, color: palette.text, fontSize: '12px', fontStyle: 'italic' }}>
                          {layer.beneath}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3, marginTop: '8px' }}>
              {peeled.length} of {LAYERS.length} layers peeled
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Human. Afraid. Trying.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The common ground was always there. Beneath everything.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Start here. Build up.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}