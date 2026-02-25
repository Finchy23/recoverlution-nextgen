/**
 * ALCHEMIST IV #9 - The Love Amplifier
 * "Love is not finite. It acts like a wave."
 * Pattern C (Hold) - Hold to broadcast Metta; waves expand outward
 * STEALTH KBE: Sustained broadcast = Prosocial Embodiment (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveHoldPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Emotional Regulation', 'embodying', 'Ember');
type Stage = 'arriving' | 'broadcasting' | 'amplified' | 'resonant' | 'afterglow';

export default function AlchemistIV_LoveAmplifier({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const hold = useHoldInteraction({
    duration: 5000,
    onComplete: () => {
      console.log(`[KBE:E] LoveAmplifier metta=confirmed prosocialEmbodiment=true broadcastDuration=5s`);
      setStage('amplified');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('broadcasting'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '18px', borderRadius: '1px',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'broadcasting' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A radio tower. You are broadcasting Metta - loving-kindness. Hold to send the signal outward.
            </div>
            {/* Tower with expanding waves */}
            <div style={{ position: 'relative', width: '80px', height: '70px' }}>
              {/* Tower */}
              <div style={{ position: 'absolute', left: '38px', bottom: 0, width: '4px', height: '40px',
                background: themeColor(TH.accentHSL, 0.06, 3), borderRadius: '1px' }} />
              <div style={{ position: 'absolute', left: '30px', bottom: '36px', width: '20px', height: '2px',
                background: themeColor(TH.accentHSL, 0.08, 4), borderRadius: '1px' }} />
              {/* Expanding waves */}
              {hold.progress > 0 && [1, 2, 3].map(i => (
                <motion.div key={i}
                  animate={{ scale: [0.5, 1 + i * 0.3], opacity: [hold.progress * 0.06, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  style={{ position: 'absolute', left: '28px', top: '16px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    border: `1px solid ${themeColor(TH.accentHSL, 0.06 * hold.progress, 4)}` }} />
              ))}
            </div>
            <motion.div {...hold.holdProps}
              style={immersiveHoldPillThemed(TH.accentHSL).container(hold.progress)}>
              <div style={immersiveHoldPillThemed(TH.accentHSL).label(hold.progress)}>
                {hold.isHolding ? `Broadcasting... ${Math.round(hold.progress * 100)}%` : 'Hold to Broadcast'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'amplified' && (
          <motion.div key="am" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Signal sent. The waves expand outward. Love is not finite - it acts like a wave. Send it out and it hits the horizon and bounces back. The Metta practice: first to yourself, then to a loved one, then to a stranger, then to a difficult person, then to all beings. The signal strengthens with each broadcast.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Loving-kindness meditation. Fredrickson{"'"}s research: 6 weeks of Metta meditation increases positive emotions, social connectedness, and vagal tone (a biomarker of social resilience). It literally rewires the vagus nerve. The "broaden-and-build" theory: positive emotions broaden attention and build durable personal resources. Love is not just an emotion - it{"'"}s a skill with measurable physiological effects.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Amplified.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}