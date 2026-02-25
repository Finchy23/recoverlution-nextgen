/**
 * SAGE #8 — The Mirror of Projection
 * "What you hate in them is a shadow in you."
 * Pattern D (Type) — Type a judgment, mirror flips it to self
 * STEALTH KBE: Acknowledging reflection = Shadow Integration / Psychological Insight (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SAGE_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Transcendent Wisdom', 'knowing', 'Practice');
type Stage = 'arriving' | 'judging' | 'flipped' | 'acknowledged' | 'resonant' | 'afterglow';

export default function Sage_MirrorOfProjection({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [judgment, setJudgment] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    onChange: (val: string) => setJudgment(val),
    onAccept: () => {
      if (!judgment.trim()) return;
      setStage('flipped');
    },
  });

  useEffect(() => { t(() => setStage('judging'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const acknowledge = () => {
    console.log(`[KBE:K] MirrorOfProjection judgment="${judgment.trim()}" shadowIntegration=confirmed psychologicalInsight=true`);
    setStage('acknowledged');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Transcendent Wisdom" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '26px', borderRadius: '10px 10px 0 0',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'judging' && (
          <motion.div key="j" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Type a judgment about someone. Something that bothers you about them.
            </div>
            <input type="text" value={judgment} onChange={(e) => typeInt.onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && typeInt.onAccept()}
              placeholder="They are..."
              autoFocus
              style={{ width: '180px', padding: '8px 12px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                color: palette.text, fontSize: '11px', outline: 'none', textAlign: 'center' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => typeInt.onAccept()}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                opacity: judgment.trim() ? 1 : 0.4 }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Judge</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'flipped' && (
          <motion.div key="f" initial={{ opacity: 0, rotateY: 180 }} animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The mirror flips: <span style={{ fontStyle: 'italic' }}>"I am {judgment.trim().replace(/^they are /i, '').replace(/^they're /i, '')}."</span>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>The world is a mirror. Own the shadow.</div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={acknowledge}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Yes, sometimes</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'acknowledged' && (
          <motion.div key="ack" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Owned. What you hate in them is a shadow in you. You said "{judgment}" — and the mirror showed it back. This is not blame. It is integration. The projection dissolves when you acknowledge the piece of yourself you were hiding. The mirror doesn{"'"}t lie. It just reflects what you refuse to see.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Projection and Shadow Work. Jung{"'"}s concept: "Everything that irritates us about others can lead us to an understanding of ourselves." Psychological projection (Freud, 1894): attributing one{"'"}s own unacceptable thoughts to others. Modern research (Baumeister, 1998): people who suppressed certain thoughts were more likely to perceive those same traits in others. The mirror technique reverses the arrow: "They are X" → "Where am I X?" Integration reduces reactivity.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Integrated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}