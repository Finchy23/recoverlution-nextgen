/**
 * SOCIAL PHYSICS #10 — The Diplomat's Seal (Conflict Transformation)
 * "Peace is not the absence of conflict. It is the mastery of it."
 * ARCHETYPE: Pattern A (Tap) — Two hands clasp, bridge materializes
 * ENTRY: Cold open — two open hands approach
 * STEALTH KBE: Completion = Conflict Transformation mastery
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'clasping' | 'sealed' | 'resonant' | 'afterglow';

export default function SocialPhysics_DiplomatSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [clasps, setClasps] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('clasping'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const clasp = () => {
    const next = clasps + 1;
    setClasps(next);
    if (next >= 3) {
      console.log(`[KBE:E] DiplomatSeal conflictTransformation=confirmed`);
      t(() => setStage('sealed'), 400);
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10500);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '40px' }}>
              <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: '24px', opacity: 0.3 }}>{'\u270b'}</motion.div>
              <motion.div animate={{ x: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: '24px', opacity: 0.3, transform: 'scaleX(-1)' }}>{'\u270b'}</motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'clasping' && (
          <motion.div key="cl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.1em' }}>
              clasp. clasp. clasp.
            </div>
            <div style={{ display: 'flex', gap: `${40 - clasps * 12}px`, alignItems: 'center' }}>
              <div style={{ fontSize: '28px', opacity: 0.4 + clasps * 0.15 }}>{'\u270b'}</div>
              <div style={{ fontSize: '28px', opacity: 0.4 + clasps * 0.15, transform: 'scaleX(-1)' }}>{'\u270b'}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < clasps ? themeColor(TH.accentHSL, 0.3, 10) : themeColor(TH.primaryHSL, 0.06, 4) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={clasp}
              style={{ padding: '14px 26px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 12) }}>clasp</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ fontSize: '28px' }}>{'\ud83e\udd1d'}</motion.div>
            {/* Bridge materializing */}
            <motion.div initial={{ width: '0px' }} animate={{ width: '140px' }} transition={{ duration: 1.5 }}
              style={{ height: '3px', borderRadius: '2px',
                background: `linear-gradient(to right, ${themeColor(TH.primaryHSL, 0.15, 8)}, ${themeColor(TH.accentHSL, 0.2, 10)}, ${themeColor(TH.primaryHSL, 0.15, 8)})` }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
              Peace is not the absence of conflict. It is the mastery of it.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Conflict transformation. Moving from "Winning" (zero-sum) to "Solving" (non-zero-sum) is the hallmark of secure attachment and high social agency. The firm clasp, not a handshake, but a lock, signifies mutual strength.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Mastered.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}