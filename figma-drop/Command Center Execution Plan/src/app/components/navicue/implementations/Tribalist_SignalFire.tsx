/**
 * TRIBALIST #1 — The Signal Fire
 * "Do not hide your weirdness. It is your signal."
 * ARCHETYPE: Pattern A (Tap) — Strike a match, distant fires appear
 * ENTRY: Cold open — dark screen
 * STEALTH KBE: Choosing "Vulnerable" message over "Safe" = Courage (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRIBALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'dark' | 'lit' | 'choosing' | 'burning' | 'resonant' | 'afterglow';

export default function Tribalist_SignalFire({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('dark');
  const [fires, setFires] = useState(0);
  const [choice, setChoice] = useState<'safe' | 'vulnerable' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('lit'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const light = () => {
    if (stage !== 'lit') return;
    setStage('choosing');
  };

  const send = (type: 'safe' | 'vulnerable') => {
    setChoice(type);
    console.log(`[KBE:B] SignalFire messageType=${type} authenticityRisk=${type === 'vulnerable'}`);
    setStage('burning');
    // Distant fires respond
    t(() => setFires(1), 800);
    t(() => setFires(2), 1400);
    t(() => setFires(type === 'vulnerable' ? 4 : 1), 2000);
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'dark' && (
          <motion.div key="dk" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.hint, color: palette.textFaint, textAlign: 'center' }}>
            darkness
          </motion.div>
        )}
        {stage === 'lit' && (
          <motion.div key="lt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              They can only find you if you burn bright.
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={light}
              style={{ padding: '12px 24px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Strike the match</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'choosing' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '6px', height: '16px', borderRadius: '3px',
                background: themeColor(TH.accentHSL, 0.4, 15),
                boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.15, 10)}` }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>What signal do you send?</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => send('safe')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.3, 10), fontSize: '11px' }}>Safe</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => send('vulnerable')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15), fontSize: '11px' }}>Vulnerable</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'burning' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: '8px', height: '20px', borderRadius: radius.xs,
                background: themeColor(TH.accentHSL, 0.5, 18),
                boxShadow: `0 0 16px ${themeColor(TH.accentHSL, 0.2, 12)}` }} />
            <div style={{ display: 'flex', gap: '30px' }}>
              {Array.from({ length: fires }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                  style={{ width: '3px', height: '8px', borderRadius: '2px',
                    background: themeColor(TH.accentHSL, 0.3, 10) }} />
              ))}
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'vulnerable'
                ? 'The distant fires burn brighter. Your tribe sees you.'
                : 'A few dim lights. The safe signal barely reaches.'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Authenticity risk. If you dim your light, your tribe cannot see you. Vulnerability is the signal that attracts the right people and repels the wrong ones. The brighter you burn, the more fires answer.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Burning.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}