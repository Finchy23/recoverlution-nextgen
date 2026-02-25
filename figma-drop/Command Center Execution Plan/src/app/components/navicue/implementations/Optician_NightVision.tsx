/**
 * OPTICIAN #9 — The Night Vision (Dark Adaptation)
 * "Do not fear the dark. Adapt to it. Switch sensors."
 * ARCHETYPE: Pattern D (Type) — Toggle night mode, then type a hidden strength
 * ENTRY: Scene-first — pitch black screen, then toggle reveals
 * STEALTH KBE: Resource identification — can user name a strength in darkness? (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { OPTICIAN_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Practice');
type Stage = 'dark' | 'toggle' | 'active' | 'revealed' | 'resonant' | 'afterglow';

export default function Optician_NightVision({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('dark');
  const [nightMode, setNightMode] = useState(false);
  const [strength, setStrength] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const type = useTypeInteraction({
    minLength: 3,
    onAccept: (text: string) => {
      setStrength(text.trim());
      console.log(`[KBE:K] NightVision resourceIdentified="${text.trim()}" length=${text.trim().length}`);
      setStage('revealed');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
  });

  useEffect(() => {
    t(() => setStage('toggle'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const enableNight = () => {
    setNightMode(true);
    t(() => setStage('active'), 800);
  };

  const nightGreen = 'hsla(120, 40%, 25%, 1)';
  const nightGreenFaint = 'hsla(120, 30%, 18%, 0.5)';

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'dark' && (
          <motion.div key="dk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>darkness</motion.div>
          </motion.div>
        )}
        {stage === 'toggle' && (
          <motion.div key="tog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Do not fear the dark. Adapt to it. Switch sensors. What can you see now that you couldn{'\u2019'}t see in the light?
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={enableNight}
              style={{ padding: '12px 20px', borderRadius: radius.full, cursor: 'pointer',
                background: 'hsla(120, 20%, 12%, 0.3)',
                border: '1px solid hsla(120, 30%, 20%, 0.2)' }}>
              <div style={{ ...navicueType.choice, color: nightGreenFaint }}>enable night vision</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: nightGreen, textAlign: 'center' }}>
              The dark is full of information. Name one strength hidden in a dark time.
            </div>
            <input
              value={type.value}
              onChange={(e) => type.onChange(e.target.value)}
              placeholder="a strength found in darkness"
              style={{ width: '240px', padding: '10px 16px', borderRadius: radius.sm,
                background: 'hsla(120, 15%, 8%, 0.4)', border: '1px solid hsla(120, 25%, 18%, 0.3)',
                color: nightGreen, fontSize: '14px', fontFamily: 'monospace',
                outline: 'none', textAlign: 'center' }} />
            {type.value.length >= 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={type.submit}
                style={{ padding: '12px 20px', borderRadius: radius.full, cursor: 'pointer',
                  background: 'hsla(120, 20%, 12%, 0.3)',
                  border: '1px solid hsla(120, 25%, 18%, 0.2)' }}>
                <div style={{ ...navicueType.hint, color: nightGreenFaint }}>confirm</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'revealed' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <motion.div animate={{ textShadow: [`0 0 0px ${nightGreen}`, `0 0 12px ${nightGreen}`, `0 0 0px ${nightGreen}`] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ ...navicueType.prompt, color: nightGreen, textAlign: 'center' }}>
              {strength}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: nightGreenFaint }}>visible only in the dark</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Post-traumatic growth. Some resources are only forged in adversity: resilience, empathy, perspective. Dark adaptation isn{'\u2019'}t about the dark getting lighter. It{'\u2019'}s about your sensors getting stronger.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Adapted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}