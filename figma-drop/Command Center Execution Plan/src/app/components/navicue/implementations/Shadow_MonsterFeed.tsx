/**
 * SHADOW WORKER #4 — The Monster Feed
 * "The demon is a guardian gone feral. Don't kill it. Feed it. Give it a job."
 * ARCHETYPE: Pattern A (Tap) + Pattern D (Type) — Choose Feed, then type role
 * ENTRY: Cold open — dark growling creature
 * STEALTH KBE: Assigning a role = Internal Integration (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'arriving' | 'growling' | 'feeding' | 'tamed' | 'resonant' | 'afterglow';

export default function Shadow_MonsterFeed({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [role, setRole] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'what role for this energy?',
    onAccept: (value: string) => {
      if (value.trim().length < 2) return;
      setRole(value.trim());
      console.log(`[KBE:B] MonsterFeed role="${value.trim()}" internalIntegration=confirmed`);
      setStage('tamed');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('growling'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const feed = () => { if (stage === 'growling') setStage('feeding'); };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
              style={{ width: '30px', height: '24px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.08, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 5)}` }} />
          </motion.div>
        )}
        {stage === 'growling' && (
          <motion.div key="gr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A dark creature growls. It is hungry.
            </div>
            <motion.div animate={{ scale: [1, 1.08, 1], rotate: [-2, 2, -2] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ width: '40px', height: '30px', borderRadius: '10px',
                background: themeColor(TH.primaryHSL, 0.08, 3),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.12, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: 'hsla(0, 20%, 35%, 0.3)' }}>grr</span>
            </motion.div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => {}}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer', opacity: 0.4,
                  background: 'hsla(0, 18%, 28%, 0.04)', border: '1px solid hsla(0, 15%, 30%, 0.08)' }}>
                <div style={{ ...navicueType.choice, color: 'hsla(0, 20%, 35%, 0.3)', fontSize: '11px' }}>Starve</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={feed}
                style={{ padding: '14px 16px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12), fontSize: '11px' }}>Feed</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'feeding' && (
          <motion.div key="fe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '40px', height: '30px', borderRadius: radius.md,
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.25, 8) }}>{'\u2661'}</span>
            </motion.div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              Fed. Calmer now. Give it a role: what job for this energy?
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
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Assign</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'tamed' && (
          <motion.div key="ta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Integrated. The monster is now your {role || 'guardian'}. Same energy, new job.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Internal integration. The demon is just a guardian gone feral from neglect. Don{"'"}t kill it. Feed it, give it a job. Anger makes a great sentry. Anxiety makes a great radar. Every shadow part has a gift when integrated.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Tamed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}