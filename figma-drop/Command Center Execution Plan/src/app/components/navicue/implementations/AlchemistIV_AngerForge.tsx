/**
 * ALCHEMIST IV #1 - The Anger Forge
 * "Anger is just heat. Use it to forge something useful."
 * Pattern A (Tap) - Hammer anger into sword (Justice) or shield (Boundaries)
 * STEALTH KBE: Selecting forge over throw = Sublimation / Constructive Channeling (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Emotional Regulation', 'believing', 'Ember');
type Stage = 'arriving' | 'heated' | 'forged' | 'resonant' | 'afterglow';

export default function AlchemistIV_AngerForge({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('heated'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const forge = (item: string) => {
    if (stage !== 'heated') return;
    setChoice(item);
    console.log(`[KBE:B] AngerForge choice="${item}" sublimation=confirmed constructiveChanneling=true`);
    setStage('forged');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 1.5, repeat: Infinity }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '6px', borderRadius: '3px',
              background: 'hsla(0, 25%, 30%, 0.06)' }} />
          </motion.div>
        )}
        {stage === 'heated' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A glowing red bar of iron - anger. Raw heat on the anvil. Forge it into something useful.
            </div>
            {/* Glowing bar */}
            <motion.div animate={{ opacity: [0.06, 0.1, 0.06] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ width: '80px', height: '10px', borderRadius: '2px',
                background: 'linear-gradient(90deg, hsla(0, 30%, 30%, 0.08), hsla(25, 30%, 35%, 0.1), hsla(0, 30%, 30%, 0.08))' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ label: 'Forge Shield', sub: 'Boundaries', icon: '⊞' }, { label: 'Forge Sword', sub: 'Justice', icon: '⊕' }].map(opt => (
                <motion.div key={opt.label} whileTap={{ scale: 0.9 }} onClick={() => forge(opt.label)}
                  style={{ padding: '12px 14px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.06, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '12px' }}>{opt.icon}</span>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 12) }}>{opt.label}</span>
                  <span style={{ fontSize: '11px', color: palette.textFaint }}>{opt.sub}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'forged' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Forged: {choice}. Anger is just heat. Do not let it burn the house down - use it to forge something useful. The Stoics called it sublimation: transforming destructive energy into constructive action. What do you need to protect? The forge doesn{"'"}t care about the fire{"'"}s origin. It only cares about the shape.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Sublimation. Freud identified sublimation as the highest defense mechanism: redirecting socially unacceptable impulses into socially acceptable actions. Modern research confirms: anger channeled into assertive boundary-setting produces better outcomes than either suppression (health costs) or venting (escalation). The forge metaphor is literal: heat + pressure + direction = useful tool.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Forged.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}