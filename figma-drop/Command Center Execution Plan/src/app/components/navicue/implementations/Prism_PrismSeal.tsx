/**
 * PRISM #10 — The Prism Seal
 * "The light is not yours. You just hold the glass steady."
 * ARCHETYPE: Pattern D (Type) — Declaration: "I am the vessel"
 * ENTRY: Ambient Fade — crystal + text arrive together
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { PRISM_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'resonant' | 'afterglow';

export default function Prism_PrismSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const typer = useTypeInteraction({
    acceptPhrases: ['i am the vessel', 'i hold the glass', 'i am the prism', 'i am the glass', 'i am the conduit'],
    onAccept: () => t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000),
  });

  useEffect(() => {
    t(() => inputRef.current?.focus(), 1500);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const g = Math.min(typer.value.length / 16, 1);
  const SPEC = [0, 30, 60, 120, 200, 270, 310];

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* Rotating crystal */}
            <svg width="140" height="140" viewBox="0 0 140 140">
              <motion.g style={{ transformOrigin: '70px 70px' }}
                animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                <polygon points="70,20 100,50 100,90 70,120 40,90 40,50"
                  fill={themeColor(TH.primaryHSL, 0.08 + g * 0.06, 10)}
                  stroke={themeColor(TH.accentHSL, 0.1 + g * 0.1, 15)} strokeWidth="0.5" />
                {/* Spectrum rays */}
                {SPEC.map((hue, i) => (
                  <motion.line key={i} x1="70" y1="70"
                    x2={70 + Math.cos((i / SPEC.length) * Math.PI * 2) * (40 + g * 20)}
                    y2={70 + Math.sin((i / SPEC.length) * Math.PI * 2) * (40 + g * 20)}
                    stroke={`hsla(${hue}, 40%, 50%, ${0.04 + g * 0.08})`}
                    strokeWidth={0.5 + g} />
                ))}
              </motion.g>
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The light is not yours. You just hold the glass steady.
            </div>
            <motion.div key={typer.shakeCount}
              animate={typer.status === 'rejected' ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              style={{ width: '100%' }}>
              <input ref={inputRef} type="text" value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && typer.submit()}
                placeholder="I am the vessel"
                disabled={typer.accepted}
                style={{ width: '100%', padding: '12px 16px', fontSize: '15px', fontFamily: 'serif', fontStyle: 'italic',
                  textAlign: 'center', background: themeColor(TH.voidHSL, 0.5, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, typer.accepted ? 0.2 : 0.05, 10)}`, borderRadius: radius.sm,
                  color: palette.text, outline: 'none' }} />
            </motion.div>
            {!typer.accepted && typer.value.length > 3 && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', ...navicueType.hint, color: palette.textFaint }}>
                seal
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text }}>
            Transpersonal psychology. The shift from "I am the creator of energy" to "I am a conduit for energy" reduces ego-fatigue and performance anxiety. You are the vessel. The light passes through.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>I am the vessel.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}