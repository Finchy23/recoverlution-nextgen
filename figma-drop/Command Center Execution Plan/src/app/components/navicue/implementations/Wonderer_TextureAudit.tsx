/**
 * WONDERER #5 — The Texture Audit
 * "You are living in your head. Come down to your fingertips."
 * ARCHETYPE: Pattern C (Hold) — Hold/rub screen for sensory dwell
 * ENTRY: Scene-first — high-res texture
 * STEALTH KBE: >5s continuous contact = Sensory Grounding (E)
 * WEB ADAPTATION: Haptic → hold with visual grain response
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { WONDERER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'active' | 'grounded' | 'resonant' | 'afterglow';

const TEXTURES = [
  { name: 'Velvet', grain: 'soft, plush, yielding', hue: 270 },
  { name: 'Oak', grain: 'warm, ridged, ancient', hue: 35 },
  { name: 'River Stone', grain: 'cool, smooth, patient', hue: 200 },
];

export default function Wonderer_TextureAudit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [texture] = useState(() => TEXTURES[Math.floor(Math.random() * TEXTURES.length)]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] TextureAudit texture="${texture.name}" sensoryGrounding=confirmed sensoryDwell=true`);
      setStage('grounded');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => { t(() => setStage('active'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const grainLines = Array.from({ length: 12 }).map((_, i) => ({
    x: 10 + (i / 12) * 140, wiggle: Math.sin(i * 0.8) * 4,
    opacity: 0.03 + (hold.progress * 0.05),
  }));

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '60px', borderRadius: radius.xs,
              background: `hsla(${texture.hue}, 10%, 10%, 0.04)`,
              border: `1px solid hsla(${texture.hue}, 8%, 15%, 0.05)` }} />
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>{texture.name}</div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Don{"'"}t just look. Feel. Hold the surface.
            </div>
            {/* Texture surface */}
            <div {...hold.holdProps}
              style={{ width: '160px', height: '100px', borderRadius: radius.sm, cursor: 'pointer',
                userSelect: 'none', touchAction: 'none', position: 'relative', overflow: 'hidden',
                background: `hsla(${texture.hue}, ${8 + hold.progress * 4}%, ${6 + hold.progress * 4}%, 0.04)`,
                border: `1px solid hsla(${texture.hue}, ${6 + hold.progress * 4}%, ${12 + hold.progress * 4}%, 0.06)`,
                transition: 'all 0.3s' }}>
              {/* Grain lines that reveal with contact */}
              {grainLines.map((g, i) => (
                <div key={i} style={{ position: 'absolute',
                  left: `${g.x + g.wiggle}px`, top: 0, bottom: 0, width: '1px',
                  background: `hsla(${texture.hue}, 10%, 25%, ${g.opacity})`,
                  transition: 'opacity 0.5s' }} />
              ))}
              {hold.isHolding && (
                <motion.div animate={{ opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 1, repeat: Infinity }}
                  style={{ position: 'absolute', inset: 0,
                    background: `radial-gradient(circle at 50% 50%, hsla(${texture.hue}, 12%, 20%, 0.04), transparent)` }} />
              )}
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.25 + hold.progress * 0.1, 8),
              textAlign: 'center', fontStyle: 'italic' }}>
              {hold.isHolding ? texture.grain : 'touch and hold...'}
            </div>
            {hold.progress > 0 && (
              <div style={{ width: '100px', height: '3px', borderRadius: '1.5px',
                background: themeColor(TH.primaryHSL, 0.04, 2) }}>
                <div style={{ height: '100%', borderRadius: '1.5px', width: `${hold.progress * 100}%`,
                  background: themeColor(TH.accentHSL, 0.15 + hold.progress * 0.1, 8),
                  transition: 'width 0.2s' }} />
              </div>
            )}
          </motion.div>
        )}
        {stage === 'grounded' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Grounded. You left your head and arrived in your fingertips. The world has texture. Feel the grain. You{"'"}re here now.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Sensory grounding. Anxiety lives in the future; depression lives in the past; the senses live in the present. Five seconds of focused tactile attention activates the somatosensory cortex and pulls awareness from the default mode network{"'"}s rumination loops. The world is textured. Come down from your head to your fingertips.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Textured.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}