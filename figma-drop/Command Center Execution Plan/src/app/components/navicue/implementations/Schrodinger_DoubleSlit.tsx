/**
 * SCHRODINGER #9 — The Double Slit (The Audience)
 * "If you are watching, you are a particle. If no one is watching, you are a wave."
 * ARCHETYPE: Pattern D (Type) — Type a journal entry with private/witnessed toggle
 * ENTRY: Instruction-as-poetry — the toggle appears first
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SCHRODINGER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Stellar');
type Stage = 'arriving' | 'active' | 'resonant' | 'afterglow';

const PROMPTS = {
  private: 'Write what you would never say out loud.',
  witnessed: 'Write as if someone you respect is reading over your shoulder.',
};

export default function Schrodinger_DoubleSlit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [mode, setMode] = useState<'private' | 'witnessed'>('private');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const type = useTypeInteraction({
    onAccept: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 6000);
    },
    minLength: 8,
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const toggle = () => setMode(m => m === 'private' ? 'witnessed' : 'private');

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>
            particle or wave?
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {mode === 'private'
                ? 'No one is watching. You are a wave: fluid, honest, unobserved.'
                : 'Someone is watching. You are a particle; solid, precise, performing.'}
            </div>
            <motion.div onClick={toggle} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', gap: '2px', borderRadius: radius.lg, overflow: 'hidden', cursor: 'pointer',
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 8)}` }}>
              <div style={{ padding: '6px 14px', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.08em',
                background: mode === 'private' ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.06, 2),
                color: mode === 'private' ? themeColor(TH.accentHSL, 0.4, 18) : palette.textFaint }}>
                PRIVATE
              </div>
              <div style={{ padding: '6px 14px', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.08em',
                background: mode === 'witnessed' ? themeColor(TH.accentHSL, 0.12, 8) : themeColor(TH.primaryHSL, 0.06, 2),
                color: mode === 'witnessed' ? themeColor(TH.accentHSL, 0.4, 18) : palette.textFaint }}>
                WITNESSED
              </div>
            </motion.div>
            <div style={{ width: '100%', maxWidth: '280px' }}>
              <textarea
                value={type.value}
                onChange={(e) => type.onChange(e.target.value)}
                placeholder={PROMPTS[mode]}
                style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: radius.md, resize: 'none',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 6)}`,
                  color: palette.text, fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
            </div>
            {type.value.length >= 8 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={type.submit}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>observe</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Audience Effect. Your behavior changes when you believe you are being observed; that's the double slit. Notice how the words shifted between modes. Both versions are you. One is the wave. One is the particle.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Wave and particle.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}