/**
 * TRICKSTER #5 — The Avatar Swap
 * "You are overthinking. The dog is just wagging. Be the dog."
 * ARCHETYPE: Pattern A (Tap) + D (Type) — Choose avatar, respond as them
 * ENTRY: Instruction-as-poetry — "swap your perspective"
 * STEALTH KBE: Adopting simplified persona = Cognitive Flexibility (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'knowing', 'Storm');
type Stage = 'arriving' | 'choosing' | 'responding' | 'swapped' | 'resonant' | 'afterglow';

const AVATARS = [
  { name: 'Golden Retriever', glyph: '\u25CB', style: 'wag first, think never' },
  { name: 'House Cat', glyph: '\u25C7', style: 'stare blankly, walk away' },
  { name: '5-Year-Old', glyph: '\u25B3', style: 'ask "why?" forty-seven times' },
];

export default function Trickster_AvatarSwap({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [avatar, setAvatar] = useState<typeof AVATARS[0] | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'respond as them...',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      console.log(`[KBE:K] AvatarSwap avatar="${avatar?.name}" response="${value.trim()}" cognitiveFlexibility=confirmed`);
      setStage('swapped');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('choosing'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const pick = (a: typeof AVATARS[0]) => {
    setAvatar(a);
    setStage('responding');
  };

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="knowing" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '8px' }}>
            {AVATARS.map((a, i) => (
              <div key={i} style={{ width: '18px', height: '18px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.04 + i * 0.02, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
            ))}
          </motion.div>
        )}
        {stage === 'choosing' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You{"'"}re facing a crisis. Swap your avatar. Who handles this?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {AVATARS.map(a => (
                <motion.div key={a.name} whileTap={{ scale: 0.95, rotate: 2 }} onClick={() => pick(a)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                    borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.04, 2),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
                  <span style={{ fontSize: '14px', color: themeColor(TH.accentHSL, 0.2, 8) }}>{a.glyph}</span>
                  <div>
                    <div style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.4, 12) }}>{a.name}</div>
                    <div style={{ fontSize: '11px', color: palette.textFaint, fontStyle: 'italic' }}>{a.style}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'responding' && avatar && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.3, 10), textAlign: 'center' }}>
              You are now: {avatar.name}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              How would {avatar.name === 'Golden Retriever' ? 'he' : avatar.name === 'House Cat' ? 'she' : 'they'} handle your biggest worry?
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9, rotate: -2 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>As {avatar.name}</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'swapped' && (
          <motion.div key="sw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Simplicity is a superpower. The {avatar?.name} doesn{"'"}t overthink. Neither should you.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive flexibility. Perspective-shifting through absurd avatars activates the brain{"'"}s theory-of-mind network. When you think as a dog, a cat, or a child, you bypass your default anxiety loops. The answer was always simpler than you thought.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Swapped.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}