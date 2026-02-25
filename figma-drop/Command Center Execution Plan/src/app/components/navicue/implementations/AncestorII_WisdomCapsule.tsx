/**
 * ANCESTOR II #3 -- The Wisdom Capsule
 * "Your voice will be a ghost one day. Make it a friendly ghost."
 * Pattern D (Type) -- Record a truth for the year 2124; waveform preserved in amber
 * STEALTH KBE: Recording message for future = Self-Transcendence / Generative State (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Transgenerational Meaning', 'embodying', 'Ember');
type Stage = 'arriving' | 'recording' | 'preserved' | 'resonant' | 'afterglow';

export default function AncestorII_WisdomCapsule({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'A truth for the year 2124...',
    onAccept: (val: string) => {
      console.log(`[KBE:E] WisdomCapsule selfTranscendence=confirmed generativeState=true length=${val.length}`);
      setStage('preserved');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('recording'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 4) }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'recording' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A recording device. What does the year 2124 need to hear from you? Your voice will be a ghost one day. Make it a friendly ghost.
            </div>
            <input type="text" value={typeInt.value}
              onChange={(e) => typeInt.onChange(e.target.value)}
              placeholder={typeInt.placeholder}
              style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: '10px', fontSize: '11px',
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, outline: 'none', fontFamily: 'inherit' }} />
            {typeInt.value.length > 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.9 }}
                onClick={() => typeInt.onAccept(typeInt.value)}
                style={immersiveTapPillThemed(TH.accentHSL).container}>
                <div style={immersiveTapPillThemed(TH.accentHSL).label}>Seal in Amber</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'preserved' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Preserved. Your truth is sealed in amber, preserved for 2124. Your voice will be a ghost one day. You chose to make it a friendly ghost. What the future needs to hear from you is not a prediction or a warning. It is the truth as you know it, now, in this body, in this life. That specificity is what makes it timeless.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="rs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Self-transcendence and legacy. Viktor Frankl{"'"}s "self-transcendence": meaning is found by directing attention beyond the self to something greater. Time capsule psychology (Peetz & Wilson): writing messages to the future increases present-moment meaning and long-term identity coherence. The Voyager Golden Record (1977): Carl Sagan{"'"}s team encoded human knowledge for potential extraterrestrial contact, the ultimate wisdom capsule. The act of recording for the future forces you to distill what matters from what{"'"}s merely urgent.
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