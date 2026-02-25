/**
 * MAGNUMOPUS #8 — The Tincture
 * "What color is your transformation right now?"
 * ARCHETYPE: Pattern D (Type) — Name the color of your current
 * alchemical stage. Black (grieving), white (clarity), yellow (dawn),
 * red (passion). Any answer accepted — the naming is the practice.
 * Affect Labeling — naming the emotional state to regulate it.
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

const COLOR_MAP: Record<string, [number, number, number]> = {
  black: [0, 0, 6], dark: [0, 0, 8], night: [240, 8, 5],
  white: [0, 0, 40], light: [0, 0, 35], silver: [0, 0, 32],
  yellow: [48, 30, 35], gold: [48, 35, 38], amber: [38, 28, 30],
  red: [8, 35, 28], crimson: [350, 30, 25], fire: [15, 35, 30],
  blue: [220, 20, 22], green: [140, 18, 18], purple: [280, 18, 20],
};

function getColorHSL(text: string): [number, number, number] {
  const lower = text.toLowerCase().trim();
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return [30, 20, 18]; // default amber
}

export default function MagnumOpus_Tincture({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [colorHSL, setColorHSL] = useState<[number, number, number]>([30, 20, 18]);
  const timersRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const typer = useTypeInteraction({
    minLength: 2,
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

  // Live color preview
  useEffect(() => {
    if (typer.value.length >= 2) {
      setColorHSL(getColorHSL(typer.value));
    }
  }, [typer.value]);

  const tc = (a: number, lo = 0) => `hsla(${colorHSL[0]}, ${colorHSL[1]}%, ${Math.min(100, colorHSL[2] + lo)}%, ${a})`;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Color bleeds through...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The alchemists tracked their progress by color. Black for destruction, white for purification, yellow for awakening, red for completion. What color is your transformation right now?
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>name the color</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            {/* Color swatch — reacts to input */}
            <motion.div
              animate={{ backgroundColor: tc(typer.value.length >= 2 ? 0.85 : 0.3) }}
              transition={{ duration: 0.6 }}
              style={{ width: '120px', height: '120px', borderRadius: '50%',
                border: `1px solid ${tc(0.1, 15)}`,
                backgroundColor: 'rgba(0,0,0,0)' }}>
              {typer.accepted && (
                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ fontSize: '7px', fontFamily: 'monospace', letterSpacing: '0.12em',
                    color: tc(0.3, 35), textTransform: 'uppercase' }}>
                  {typer.value}
                </motion.div>
              )}
            </motion.div>

            {/* Alchemical stage markers */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: '●', color: 'hsla(0,0%,6%,0.12)', name: 'nigredo' },
                { label: '●', color: 'hsla(0,0%,40%,0.12)', name: 'albedo' },
                { label: '●', color: 'hsla(48,30%,35%,0.12)', name: 'citrinitas' },
                { label: '●', color: 'hsla(8,35%,28%,0.12)', name: 'rubedo' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: s.color }} />
                  <div style={{ fontSize: '5px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.08, 8), letterSpacing: '0.05em' }}>
                    {s.name}
                  </div>
                </div>
              ))}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={typer.value}
              onChange={e => typer.onChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && typer.submit()}
              placeholder="black, white, yellow, red..."
              disabled={typer.accepted}
              style={{
                width: '100%', padding: '12px 16px', fontSize: '15px',
                fontFamily: 'serif', fontStyle: 'italic', textAlign: 'center',
                background: typer.accepted ? tc(0.08) : themeColor(TH.voidHSL, 0.5, 3),
                border: `1px solid ${tc(typer.accepted ? 0.15 : 0.05, 10)}`,
                borderRadius: radius.sm, color: palette.text, outline: 'none',
                transition: 'all 0.5s ease',
              }}
            />

            {!typer.accepted && typer.value.length >= 2 && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  ...navicueType.hint, color: palette.textFaint }}>
                name it
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You named it. Neuroscience calls this affect labeling: the act of naming an emotion reduces its intensity by up to 50%. The alchemists did the same with color. Name the stage, and you can move through it.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>naming the stage moves you through it</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Name the color.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}