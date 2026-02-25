/**
 * MAGNUMOPUS #10 — The Opus Seal
 * "The work is the worker. The gold is you."
 * ARCHETYPE: Pattern D (Type) — Type the alchemical declaration.
 * The philosopher's stone was never the goal; the alchemist
 * was the experiment all along. Self-as-masterwork.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNUMOPUS_THEME, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Ember');
const TH = MAGNUMOPUS_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function MagnumOpus_OpusSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const typer = useTypeInteraction({
    acceptPhrases: ['the work is the worker', 'the gold is me', 'i am the stone', 'i am the opus', 'i am the gold'],
    onAccept: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'active') addTimer(() => inputRef.current?.focus(), 300);
  }, [stage]);

  const sealed = typer.accepted;
  const chars = typer.value.length;
  const glow = Math.min(chars / 20, 1);

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The great work nears completion...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The alchemist spent a lifetime searching for the philosopher{'\u2019'}s stone. The final revelation was always the same: the stone was the alchemist. The work is the worker. The gold is you.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>speak the final declaration</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            {/* The stone — glows as you type */}
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
              <svg width="100%" height="100%" viewBox="0 0 140 140">
                {/* Outer glow */}
                <motion.circle cx="70" cy="70" r={50 + glow * 10}
                  fill={themeColor(TH.accentHSL, glow * 0.04, 15)}
                  animate={{ r: [50 + glow * 10, 55 + glow * 10, 50 + glow * 10] }}
                  transition={{ duration: 3, repeat: Infinity }} />

                {/* Stone body */}
                <motion.circle cx="70" cy="70" r="30"
                  fill={`hsla(${TH.accentHSL[0]}, ${TH.accentHSL[1] + glow * 10}%, ${TH.accentHSL[2] + glow * 8}%, ${0.3 + glow * 0.5})`}
                  stroke={themeColor(TH.accentHSL, 0.1 + glow * 0.15, 20)}
                  strokeWidth="0.5" />

                {/* Facets — crystalline structure */}
                {Array.from({ length: 6 }, (_, i) => {
                  const a = (i / 6) * Math.PI * 2;
                  return (
                    <line key={i}
                      x1="70" y1="70"
                      x2={70 + Math.cos(a) * 28} y2={70 + Math.sin(a) * 28}
                      stroke={themeColor(TH.accentHSL, 0.04 + glow * 0.04, 15)}
                      strokeWidth="0.3" />
                  );
                })}

                {/* Inner light */}
                <circle cx="70" cy="70" r={6 + glow * 4}
                  fill={`hsla(${TH.accentHSL[0]}, ${TH.accentHSL[1] + 10}%, ${TH.accentHSL[2] + 20}%, ${0.1 + glow * 0.15})`} />

                {/* Sealed radiance */}
                {sealed && Array.from({ length: 8 }, (_, i) => {
                  const a = (i / 8) * Math.PI * 2;
                  return (
                    <motion.line key={i}
                      x1={70 + Math.cos(a) * 32} y1={70 + Math.sin(a) * 32}
                      x2={70 + Math.cos(a) * 50} y2={70 + Math.sin(a) * 50}
                      stroke={themeColor(TH.accentHSL, 0.08, 25)}
                      strokeWidth="0.5"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08 }} />
                  );
                })}
              </svg>
            </div>

            {/* Input */}
            <motion.div
              key={typer.shakeCount}
              animate={typer.status === 'rejected' ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
              transition={{ duration: 0.5 }}
              style={{ width: '100%' }}>
              <input
                ref={inputRef}
                type="text"
                value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && typer.submit()}
                placeholder="The work is the worker"
                disabled={typer.accepted}
                style={{
                  width: '100%', padding: '12px 16px', fontSize: '15px',
                  fontFamily: 'serif', fontStyle: 'italic', textAlign: 'center',
                  background: sealed
                    ? themeColor(TH.accentHSL, 0.08, 12)
                    : themeColor(TH.voidHSL, 0.5, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, sealed ? 0.2 : 0.05, 10)}`,
                  borderRadius: radius.sm,
                  color: sealed ? themeColor(TH.accentHSL, 0.7, 30) : palette.text,
                  outline: 'none', transition: 'all 0.5s ease',
                }}
              />
            </motion.div>

            {!sealed && chars > 3 && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  ...navicueType.hint, color: palette.textFaint }}>
                seal the opus
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The Magnum Opus is complete. The great work was never the stone. It was the alchemist. Every fire endured, every dissolution survived, every recombination chosen — that was you, becoming gold.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the gold is you</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The work is the worker.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}