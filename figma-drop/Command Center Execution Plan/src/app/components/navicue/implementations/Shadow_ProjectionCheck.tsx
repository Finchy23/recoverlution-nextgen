/**
 * SHADOW WORKER #1 — The Projection Check (The Mirror)
 * "You do not hate them. You hate the part of yourself they represent."
 * ARCHETYPE: Pattern D (Type) + Pattern A (Tap) — Type name, then Yes/No ownership
 * ENTRY: Reverse reveal — type triggers mirror
 * STEALTH KBE: Fast "Yes" = Self-Awareness (K); "No" = Defense
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Ocean');
type Stage = 'arriving' | 'typing' | 'mirror' | 'owned' | 'resonant' | 'afterglow';

export default function Shadow_ProjectionCheck({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [trait, setTrait] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const mirrorTime = useRef(0);

  const typeInt = useTypeInteraction({
    placeholder: 'what trait irritates you?',
    onAccept: (value: string) => {
      if (value.trim().length < 2) return;
      setTrait(value.trim());
      setStage('mirror');
      mirrorTime.current = Date.now();
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('typing'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const own = (answer: boolean) => {
    if (stage !== 'mirror') return;
    const latency = Date.now() - mirrorTime.current;
    console.log(`[KBE:K] ProjectionCheck trait="${trait}" owned=${answer} latencyMs=${latency} selfAwareness=${answer && latency < 5000}`);
    setStage('owned');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '40px', height: '50px', borderRadius: radius.xs,
              border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
              background: themeColor(TH.primaryHSL, 0.03, 2) }} />
        )}
        {stage === 'typing' && (
          <motion.div key="typ" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Think of someone who irritates you. What trait do you hate in them?
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={typeInt.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Look</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'mirror' && (
          <motion.div key="mir" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ width: '60px', height: '70px', borderRadius: radius.xs,
              border: `1px solid ${themeColor(TH.accentHSL, 0.12, 6)}`,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8), fontStyle: 'italic' }}>you</span>
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              "{trait}": do you have this trait in yourself?
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => own(true)}
                style={{ padding: '14px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Yes</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => own(false)}
                style={{ padding: '14px 20px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                <div style={{ ...navicueType.choice, color: palette.textFaint }}>No</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'owned' && (
          <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            They are the screen. You are the projector. The trait is yours to integrate.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Projection. You don{"'"}t hate them. You hate the part of yourself they represent. They are the screen; you are the projector. Owning the trait quickly signals self-awareness. Defending against it signals the shadow is still running the show.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Seen.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}