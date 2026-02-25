/**
 * SHAPESHIFTER #10 — The Shifter Seal
 * "I contain multitudes."
 * ARCHETYPE: Pattern D (Type) — A prism refracting light.
 * Type "I contain multitudes" to seal. Whitman's declaration.
 * Self-Complexity as superpower — the more selves, the more resilient.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHAPESHIFTER_THEME, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'believing', 'Practice');
const TH = SHAPESHIFTER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const REFRACTION_COLORS = [
  { hue: 0, label: 'courage' },
  { hue: 30, label: 'warmth' },
  { hue: 60, label: 'clarity' },
  { hue: 180, label: 'depth' },
  { hue: 240, label: 'mystery' },
  { hue: 300, label: 'magic' },
];

export default function ShapeShifter_ShifterSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const typer = useTypeInteraction({
    acceptPhrases: ['i contain multitudes', 'i am multitudes', 'i contain everything'],
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') typer.submit();
  };

  const sealed = typer.accepted;
  const typing = typer.value.length;

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Light enters a prism...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              White light looks simple until it hits a prism. Then you see it contains every color. You look simple too. Declare what you contain.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>speak the declaration</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            {/* Prism with refraction */}
            <div style={{ position: 'relative', width: '200px', height: '140px' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 140">
                {/* Incoming white light beam */}
                <line x1="0" y1="60" x2="70" y2="65"
                  stroke={themeColor(TH.primaryHSL, 0.08, 15)} strokeWidth="1" />

                {/* The prism */}
                <polygon points="70,30 130,30 100,110"
                  fill={themeColor(TH.accentHSL, sealed ? 0.06 : 0.03, 10)}
                  stroke={themeColor(TH.accentHSL, sealed ? 0.15 : 0.08, 15)}
                  strokeWidth="0.5" />

                {/* Refracted beams — fan out from prism, intensity grows with typing */}
                {REFRACTION_COLORS.map((c, i) => {
                  const beamAlpha = sealed ? 0.12 : Math.min(typing / 20, 1) * 0.06;
                  const angle = -30 + i * 12;
                  const endX = 130 + Math.cos((angle * Math.PI) / 180) * 70;
                  const endY = 60 + Math.sin((angle * Math.PI) / 180) * 70;
                  return (
                    <motion.line key={i}
                      x1="115" y1="60"
                      x2={endX} y2={endY}
                      stroke={`hsla(${c.hue}, 15%, 40%, ${beamAlpha})`}
                      strokeWidth={sealed ? 1.5 : 0.8}
                      animate={{ opacity: beamAlpha > 0 ? 1 : 0 }}
                      transition={{ duration: 0.5, delay: i * 0.08 }} />
                  );
                })}

                {/* Refraction labels — appear on seal */}
                {sealed && REFRACTION_COLORS.map((c, i) => {
                  const angle = -30 + i * 12;
                  const lx = 140 + Math.cos((angle * Math.PI) / 180) * 55;
                  const ly = 60 + Math.sin((angle * Math.PI) / 180) * 55;
                  return (
                    <motion.text key={`l-${i}`} x={lx} y={ly}
                      textAnchor="start" fontSize="11" fontFamily="serif" fontStyle="italic"
                      fill={`hsla(${c.hue}, 12%, 45%, 0.4)`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}>
                      {c.label}
                    </motion.text>
                  );
                })}
              </svg>
            </div>

            {/* Input field */}
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
                onKeyDown={handleKeyDown}
                placeholder="I contain multitudes"
                disabled={typer.accepted}
                style={{
                  width: '100%', padding: '12px 16px', fontSize: '15px',
                  fontFamily: 'serif', fontStyle: 'italic', textAlign: 'center',
                  background: sealed
                    ? themeColor(TH.accentHSL, 0.06, 12)
                    : themeColor(TH.voidHSL, 0.5, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, sealed ? 0.15 : 0.05, 10)}`,
                  borderRadius: radius.sm,
                  color: sealed ? themeColor(TH.accentHSL, 0.7, 25) : palette.text,
                  outline: 'none', transition: 'all 0.5s ease', letterSpacing: '0.02em',
                }}
              />
            </motion.div>

            {!sealed && typer.value.length > 3 && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  ...navicueType.hint, color: palette.textFaint }}>
                declare it
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              {'\u201C'}I contain multitudes.{'\u201D'} Whitman knew. You are not one color. You are the full spectrum passing through a prism. Every color is yours.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>self-complexity is resilience</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>I contain multitudes.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}