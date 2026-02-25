/**
 * TIME CAPSULE #3 — The Rage Vault
 * "Do not send the angry text. Send it here."
 * ARCHETYPE: Pattern D (Type) — Type the rage into the vault
 * ENTRY: Instruction as Poetry — no explicit hints, the vault IS the affordance
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'active' | 'resonant' | 'afterglow';

export default function TimeCapsule_RageVault({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    minLength: 8,
    onAccept: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <svg width="120" height="140" viewBox="0 0 120 140">
              <rect x="15" y="10" width="90" height="120" rx="6" fill={themeColor(TH.primaryHSL, 0.1, 3)}
                stroke={themeColor(TH.accentHSL, 0.12, 5)} strokeWidth="1" />
              <motion.rect x="15" y="10" width="90" height="6" rx="3"
                fill={themeColor(TH.accentHSL, 0.2, 5)}
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 2, repeat: Infinity }} />
              <circle cx="60" cy="70" r="12" fill="none"
                stroke={themeColor(TH.accentHSL, 0.1, 5)} strokeWidth="0.5" />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>
              the vault is open
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Scream into the vault. Whatever you would say to them right now, say it here. The door locks for 24 hours. If you still mean it tomorrow, the vault opens.
            </div>
            <div style={{ position: 'relative', width: '260px' }}>
              <textarea
                value={typeInt.value}
                onChange={e => typeInt.onChange(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); typeInt.submit(); } }}
                placeholder=""
                rows={4}
                style={{
                  width: '100%', padding: '12px', borderRadius: radius.sm, resize: 'none',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
                  color: palette.text, fontFamily: 'inherit', fontSize: '13px',
                  outline: 'none',
                }} />
            </div>
            {typeInt.value.length > 0 && typeInt.value.length < 8 && (
              <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>keep going</div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Locked. The steel is thick and the timer is counting. The amygdala fires for twenty minutes; then the rational mind wakes up. Tomorrow you{'\u2019'}ll read this and either laugh or be glad you never sent it.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Cooling.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}