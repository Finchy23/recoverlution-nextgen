/**
 * FUTURE WEAVER #7 — The Worst-Case Simulator
 * "Fear lives in the vague. Reality is concrete."
 * ARCHETYPE: Pattern D (Type) — Enter fear cloud, type survival plan
 * ENTRY: Scene-first — dark cloud
 * STEALTH KBE: Having a plan = Catastrophizing Management (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'cloud' | 'inside' | 'cleared' | 'resonant' | 'afterglow';

export default function FutureWeaver_WorstCaseSimulator({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [plan, setPlan] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'your survival plan...',
    onAccept: (value: string) => {
      if (value.trim().length < 5) return;
      setPlan(value.trim());
      console.log(`[KBE:K] WorstCaseSimulator plan="${value.trim()}" catastrophizingManagement=confirmed`);
      setStage('cleared');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('cloud'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const enter = () => {
    if (stage !== 'cloud') return;
    setStage('inside');
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '30px', height: '20px', borderRadius: '10px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
        )}
        {stage === 'cloud' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '60px', height: '40px', borderRadius: radius.xl,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>FEAR</span>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px' }}>
              A dark cloud. Enter it. See the worst case.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={enter}
              style={{ padding: '14px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
              <div style={{ ...navicueType.choice, color: palette.textFaint }}>Enter</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'inside' && (
          <motion.div key="in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You{"'"}re inside. The worst case is visible now. It{"'"}s concrete. Type your survival plan.
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic', textAlign: 'center' }}>
              "I can handle this."
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Simulate</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'cleared' && (
          <motion.div key="cle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            The cloud vanishes. You looked the monster in the eye and made a plan. Fear lives in the vague — reality is concrete. Once you see the worst case and know you can handle it, the fear loses its power. You{"'"}re free.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Catastrophizing management. Seneca{"'"}s premeditatio malorum — the deliberate visualization of worst cases — is one of Stoicism{"'"}s most powerful tools. Tim Ferriss{"'"} "Fear Setting" exercise: define the fear, plan the prevention, plan the repair. Research shows that concretizing fear (making it specific) reduces its emotional valence by up to 40%. Look the monster in the eye.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Free.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}