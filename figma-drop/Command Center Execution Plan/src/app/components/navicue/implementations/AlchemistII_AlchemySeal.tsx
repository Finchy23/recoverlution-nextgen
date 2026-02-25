/**
 * ALCHEMIST II #10 -- The Alchemy Seal (The Proof)
 * "I do not get rid of my darkness. I use it."
 * INTERACTION: A lead cube sits in center. Each tap transmutes it --
 * edges round, surface brightens, weight lifts -- until it becomes
 * a golden sphere. Lead into gold. Click.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'embodying', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PHASES = [
  { label: 'Lead. Heavy. Dark. Raw.', roundness: 2, hue: 220, sat: 5, light: 25, opacity: 0.4 },
  { label: 'Heating. Edges softening.', roundness: 8, hue: 210, sat: 8, light: 30, opacity: 0.45 },
  { label: 'Transmuting. Color shifts.', roundness: 18, hue: 180, sat: 12, light: 35, opacity: 0.5 },
  { label: 'Brightening. Weight lifting.', roundness: 30, hue: 50, sat: 30, light: 42, opacity: 0.55 },
  { label: 'Gold. Radiant. Transformed.', roundness: 40, hue: 45, sat: 55, light: 52, opacity: 0.65 },
];

export default function AlchemistII_AlchemySeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [phaseIdx, setPhaseIdx] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const transmute = () => {
    if (stage !== 'active' || phaseIdx >= PHASES.length - 1) return;
    const next = phaseIdx + 1;
    setPhaseIdx(next);
    if (next >= PHASES.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const current = PHASES[phaseIdx];
  const t = phaseIdx / (PHASES.length - 1);
  const fillColor = `hsla(${current.hue}, ${current.sat}%, ${current.light}%, ${current.opacity})`;
  const glowColor = `hsla(${current.hue}, ${current.sat + 10}%, ${current.light + 15}%, ${t * 0.15})`;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The crucible heats...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>I do not get rid of my darkness. I use it.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to transmute</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={transmute}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: phaseIdx >= PHASES.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(30, 10%, 8%, 0.2)' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Alchemical circle -- background sigil */}
                <circle cx="100" cy="80" r="55" fill="none"
                  stroke={`hsla(${current.hue}, 15%, 25%, ${0.06 + t * 0.06})`}
                  strokeWidth={safeSvgStroke(0.3)} strokeDasharray="3 8" />
                <circle cx="100" cy="80" r="65" fill="none"
                  stroke={`hsla(${current.hue}, 10%, 20%, ${0.04 + t * 0.04})`}
                  strokeWidth={safeSvgStroke(0.3)} />
                {/* Triangle within circle */}
                <polygon points="100,30 145,110 55,110" fill="none"
                  stroke={`hsla(${current.hue}, 12%, 25%, ${0.05 + t * 0.05})`}
                  strokeWidth={safeSvgStroke(0.3)} />
                {/* The transmuting object */}
                <motion.rect
                  x={100 - 20} y={80 - 20} width="40" height="40"
                  rx={current.roundness}
                  fill={fillColor}
                  stroke={`hsla(${current.hue}, ${current.sat + 5}%, ${current.light + 10}%, ${0.2 + t * 0.2})`}
                  strokeWidth="1"
                  initial={{
                    rx: current.roundness,
                    fill: fillColor,
                  }}
                  animate={{
                    rx: current.roundness,
                    fill: fillColor,
                  }}
                  transition={{ duration: 1, type: 'spring' }}
                />
                {/* Glow */}
                <motion.circle cx="100" cy="80" r={25 + t * 10}
                  fill={glowColor}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: t * 0.15 }}
                />
                {/* Light reflection on gold */}
                {t > 0.5 && (
                  <motion.ellipse cx="92" cy="72" rx="4" ry="3"
                    fill={`hsla(45, 60%, 80%, ${(t - 0.5) * 0.3})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.5) * 0.3 }}
                  />
                )}
                {/* Floating particles -- transmutation energy */}
                {t > 0 && Array.from({ length: Math.floor(t * 8) }, (_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const dist = 30 + Math.sin(Date.now() * 0.001 + i) * 5;
                  return (
                    <circle key={i}
                      cx={100 + Math.cos(angle) * dist}
                      cy={80 + Math.sin(angle) * dist}
                      r={1}
                      fill={`hsla(${current.hue}, ${current.sat + 20}%, ${current.light + 20}%, ${t * 0.3})`}
                    />
                  );
                })}
              </svg>
              {/* Phase indicator */}
              <div style={{ position: 'absolute', top: '8px', right: '10px', fontFamily: 'monospace', fontSize: '11px', color: fillColor, opacity: 0.4 }}>
                {t < 1 ? 'Pb → Au' : '✦ Au'}
              </div>
            </div>
            <motion.div key={phaseIdx} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: phaseIdx < PHASES.length - 1 ? 'italic' : 'normal', fontWeight: phaseIdx >= PHASES.length - 1 ? 500 : 400 }}>{current.label}</div>
            </motion.div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {PHASES.map((_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i <= phaseIdx ? `hsla(${PHASES[i].hue}, ${PHASES[i].sat}%, ${PHASES[i].light}%, 0.6)` : palette.primaryFaint, opacity: i <= phaseIdx ? 0.7 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Lead into gold. I do not get rid of my darkness. I use it.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Emotional granularity mastered. Every darkness precisely identified. Every one useful.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Lead. Gold. Transmuted.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}