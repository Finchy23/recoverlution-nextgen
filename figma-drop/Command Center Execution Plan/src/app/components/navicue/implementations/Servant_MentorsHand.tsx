/**
 * SERVANT #8 — The Mentor's Hand
 * "You climbed the mountain. Now send the elevator back down."
 * ARCHETYPE: Pattern D (Type) — Type a lesson to pass down
 * ENTRY: Scene-first — cliff edge, hand reaching up
 * STEALTH KBE: Sharing wisdom = Mentor Archetype / Generativity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'cliff' | 'shared' | 'resonant' | 'afterglow';

export default function Servant_MentorsHand({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lesson, setLesson] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'a lesson from your climb...',
    onAccept: (value: string) => {
      if (value.trim().length < 5) return;
      setLesson(value.trim());
      console.log(`[KBE:K] MentorsHand lesson="${value.trim()}" generativity=confirmed mentorArchetype=true`);
      setStage('shared');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('cliff'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '40px', height: '30px', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '20px',
                borderRadius: '4px 4px 0 0',
                background: themeColor(TH.primaryHSL, 0.04, 2) }} />
            </motion.div>
        )}
        {stage === 'cliff' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* Cliff with hand reaching */}
            <div style={{ width: '100px', height: '60px', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '30px',
                borderRadius: '6px 6px 0 0',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                borderTop: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
              {/* You at top */}
              <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
                width: '6px', height: '10px', borderRadius: '2px',
                background: themeColor(TH.accentHSL, 0.1, 5) }} />
              {/* Hand reaching up from below */}
              <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ position: 'absolute', bottom: '28px', left: '55%',
                  width: '4px', height: '10px', borderRadius: '2px 2px 0 0',
                  background: themeColor(TH.primaryHSL, 0.08, 4) }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You climbed the mountain. A hand reaches up. Pull them up. Share one lesson from your climb.
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={{ padding: '10px 22px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Pull up</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'shared' && (
          <motion.div key="sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', maxWidth: '260px' }}>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 12), fontStyle: 'italic',
              textAlign: 'center' }}>
              "{lesson}"
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Pulled up. Your experience became their map. Send the elevator back down. That{"'"}s the real summit.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Mentor Archetype. Erikson{"'"}s generativity — the concern for establishing and guiding the next generation — is the hallmark of mature adulthood. Your hard-won lessons are not just your story; they{"'"}re someone else{"'"}s shortcut. The mountain you climbed built the map. Sharing it doesn{"'"}t diminish your climb; it multiplies its value. Send the elevator back down.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Mentor.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}