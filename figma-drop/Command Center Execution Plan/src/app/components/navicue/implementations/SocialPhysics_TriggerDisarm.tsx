/**
 * SOCIAL PHYSICS #8 — The Trigger Disarm
 * "They didn't hurt you. They touched a bruise you already had."
 * ARCHETYPE: Pattern A (Tap) — Choose between external blame and internal fuse
 * ENTRY: Cold open — bomb with fizzing fuse
 * STEALTH KBE: Selecting internal fuse = Ownership / Internalization (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'active' | 'disarmed' | 'resonant' | 'afterglow';

export default function SocialPhysics_TriggerDisarm({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [fuseLength, setFuseLength] = useState(1);
  const [choice, setChoice] = useState<'internal' | 'external' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Fuse burning animation
  useEffect(() => {
    if (stage !== 'active') return;
    const id = window.setInterval(() => setFuseLength(f => Math.max(0.1, f - 0.02)), 100);
    return () => clearInterval(id);
  }, [stage]);

  const snip = (target: 'internal' | 'external') => {
    if (stage !== 'active') return;
    setChoice(target);
    const ownership = target === 'internal';
    console.log(`[KBE:B] TriggerDisarm target=${target} ownership=${ownership}`);
    setStage('disarmed');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.08, 4),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }} />
            <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 0.5, repeat: Infinity }}
              style={{ width: '3px', height: '20px', background: 'hsla(30, 60%, 50%, 0.4)', borderRadius: '2px' }} />
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Cut the fuse. Which one is real?
            </div>
            {/* Bomb + fuse */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 0.4, repeat: Infinity }}
                style={{ width: '3px', height: `${fuseLength * 30}px`, background: 'hsla(30, 60%, 50%, 0.5)',
                  borderRadius: '2px', transition: 'height 0.1s' }} />
              <div style={{ width: '50px', height: '50px', borderRadius: '50%',
                background: themeColor(TH.primaryHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.12, 6)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '11px', color: themeColor(TH.primaryHSL, 0.2, 8), textAlign: 'center', padding: '4px' }}>
                  I{"'"}m not enough
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => snip('internal')}
                style={{ padding: '14px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.3, 10), fontSize: '11px' }}>My bruise</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => snip('external')}
                style={{ padding: '14px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.3, 10), fontSize: '11px' }}>
                  Their fault
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'disarmed' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                background: choice === 'internal' ? themeColor(TH.accentHSL, 0.1, 6) : themeColor(TH.primaryHSL, 0.06, 3),
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '16px' }}>{choice === 'internal' ? '\u2702' : '\u00d7'}</div>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.8 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'internal'
                ? 'You found the real fuse. The bomb is harmless now.'
                : 'The external cut didn\'t reach the real wire. The bruise was already there.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Internalization. They did not hurt you. They activated a pre-existing wound. Identifying the internal trigger instead of blaming the external stimulus is the shift from victimhood to ownership.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Disarmed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}