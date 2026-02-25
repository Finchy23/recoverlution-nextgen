/**
 * BIOGRAPHER #5 — The Antagonist Audit (Perspective Taking)
 * "A flat villain is boring. Give them depth. What is their wound?"
 * ARCHETYPE: Pattern A (Tap) — Tap to generate the antagonist's backstory
 * ENTRY: Reverse reveal — profile silhouette appears, then context
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'arriving' | 'active' | 'generated' | 'resonant' | 'afterglow';

const BACKSTORIES = [
  { wound: 'They were abandoned early.', fear: 'They are terrified of being left behind.', drive: 'Control is how they feel safe.' },
  { wound: 'They were humiliated publicly.', fear: 'They cannot bear to be seen as weak.', drive: 'Aggression is their armor, not their nature.' },
  { wound: 'They were never chosen.', fear: 'They are scared that they don\'t matter.', drive: 'Attention-seeking is a survival strategy.' },
  { wound: 'They lost someone they couldn\'t protect.', fear: 'They are paralyzed by helplessness.', drive: 'Over-control is their grief response.' },
];

export default function Biographer_AntagonistAudit({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [story, setStory] = useState<typeof BACKSTORIES[0] | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const generate = () => {
    if (story) return;
    const pick = BACKSTORIES[Math.floor(Math.random() * BACKSTORIES.length)];
    setStory(pick);
    setStage('generated');
    t(() => setStage('resonant'), 7000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.1, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.25 }}>a silhouette</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.1, 4),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A flat villain is boring. Give them depth. What is their wound? You don't have to forgive them {'\u2014'} but you must understand the plot.
            </div>
            <motion.div onClick={generate} whileTap={{ scale: 0.96 }}
              style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer' }}>
              <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>generate their backstory</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'generated' && story && (
          <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.12, 6),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }} />
            {[
              { label: 'THE WOUND', text: story.wound },
              { label: 'THE FEAR', text: story.fear },
              { label: 'THE DRIVE', text: story.drive },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 1 }}
                style={{ width: '100%', padding: '10px 14px', borderRadius: radius.sm,
                  background: themeColor(TH.primaryHSL, 0.05, 2),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.04, 4)}` }}>
                <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                  color: themeColor(TH.accentHSL, 0.2, 8), marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', fontFamily: 'serif', fontStyle: 'italic',
                  color: palette.text }}>{item.text}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Perspective Taking. Constructing a Theory of Mind for an aggressor reduces physiological arousal and depersonalizes the conflict. You do not have to forgive. But the plot makes more sense now.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Understood the plot.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}