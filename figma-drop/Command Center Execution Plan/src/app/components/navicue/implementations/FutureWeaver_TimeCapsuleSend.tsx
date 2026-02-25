/**
 * FUTURE WEAVER #3 — The Time Capsule (Send)
 * "You will forget how strong you are right now. Preserve the evidence."
 * ARCHETYPE: Pattern D (Type) — Type a message to your future self
 * ENTRY: Scene-first — recording device
 * STEALTH KBE: Writing and sending = Self-Continuity / Temporal Empathy (E)
 * WEB ADAPT: video → typed message
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'recording' | 'locked' | 'resonant' | 'afterglow';

export default function FutureWeaver_TimeCapsuleSend({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [msg, setMsg] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'tell your future self they survived this...',
    onAccept: (value: string) => {
      if (value.trim().length < 5) return;
      setMsg(value.trim());
      console.log(`[KBE:E] TimeCapsuleSend selfContinuity=confirmed temporalEmpathy=true msg="${value.trim()}"`);
      setStage('locked');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('recording'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '16px', height: '16px', borderRadius: '50%',
              border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
        )}
        {stage === 'recording' && (
          <motion.div key="rec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'hsla(0, 20%, 35%, 0.12)' }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Tell your future self they survived this. Lock it in a time capsule. Opens in 1 year.
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Lock & Send</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'locked' && (
          <motion.div key="lo" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px 14px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
              <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 6) }}>Sealed. Opens: 1 Year</span>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Locked. You will forget how strong you are right now. But the capsule remembers. The future version of you who needs this fire will find it.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-continuity. Research by Hal Hershfield shows that people who feel connected to their future selves make better decisions — saving more, exercising, investing in growth. Temporal empathy — caring about Future You as if they were a real person — bridges the gap between present sacrifice and future reward. Send the message. Future You needs the evidence.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sealed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}