/**
 * PRISM #8 — Bioluminescence
 * "There is no sun here. Make your own."
 * ARCHETYPE: Pattern E (Hold) — Hold in darkness to generate your own light
 * ENTRY: Instruction as Poetry — the darkness IS the instruction
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'dark' | 'active' | 'resonant' | 'afterglow';

export default function Prism_Bioluminescence({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('dark');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const hold = useHoldInteraction({
    maxDuration: 6000,
    onComplete: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500),
  });

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const h = hold.tension;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'dark' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.textFaint, textAlign: 'center' }}>
            There is no sun here.
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div {...hold.holdProps}
              style={{ ...hold.holdProps.style, width: '180px', height: '180px', borderRadius: '50%', overflow: 'hidden',
                background: themeColor(TH.voidHSL, 0.98, 0), position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 180 180">
                {/* Deep sea darkness */}
                <rect width="180" height="180" fill={themeColor(TH.voidHSL, 0.95, 0)} />
                {/* Creature body */}
                <motion.ellipse cx="90" cy="95" rx={20 + h * 5} ry={15 + h * 3}
                  fill={`hsla(200, 30%, ${8 + h * 12}%, ${0.3 + h * 0.3})`}
                  stroke={`hsla(200, 40%, ${20 + h * 25}%, ${h * 0.2})`} strokeWidth="0.5" />
                {/* Bioluminescent glow */}
                <motion.circle cx="90" cy="90" r={5 + h * 30}
                  fill={`hsla(200, 50%, ${30 + h * 20}%, ${h * 0.08})`} />
                {/* Light organ */}
                <motion.circle cx="90" cy="85" r={3 + h * 4}
                  fill={`hsla(195, 60%, ${40 + h * 20}%, ${0.1 + h * 0.4})`} />
                {/* Tentacle lights */}
                {h > 0.3 && Array.from({ length: Math.floor(h * 6) }, (_, i) => {
                  const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
                  const r = 25 + h * 10;
                  return (
                    <motion.circle key={i}
                      cx={90 + Math.cos(a) * r} cy={95 + Math.sin(a) * r}
                      r={1.5} fill={`hsla(195, 50%, ${50 + i * 3}%, ${0.1 + h * 0.15})`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08 }} />
                  );
                })}
                {/* Ambient particles */}
                {Array.from({ length: 6 }, (_, i) => (
                  <motion.circle key={`p-${i}`}
                    cx={30 + i * 25} cy={20 + (i * 37) % 140} r="0.8"
                    fill={`hsla(200, 30%, 30%, ${0.03 + h * 0.02})`}
                    initial={{ cy: 20 + (i * 37) % 140 }}
                    animate={{ cy: [20 + (i * 37) % 140, 10 + (i * 37) % 140] }}
                    transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, repeatType: 'reverse' }} />
                ))}
              </svg>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              When the external world goes dark, the internal light must turn on. You are the generator. Glow.
            </div>
            {!hold.completed && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
                {hold.isHolding ? 'glowing...' : 'hold to generate light'}
              </div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Internal locus of control. In environments of high uncertainty, self-generated hope is the primary predictor of resilience. There was no sun. You made your own.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Make your own light.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}