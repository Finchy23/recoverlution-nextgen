/**
 * SHADOW WORKER #9 — The Integration Dialogue
 * "Internal war is exhausting. Negotiate a peace treaty."
 * ARCHETYPE: Pattern D (Type) — Type from Pusher, then reply as Slacker
 * ENTRY: Instruction-as-poetry — split screen
 * STEALTH KBE: Reaching compromise = Internal Harmony belief (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Ocean');
type Stage = 'arriving' | 'pusher' | 'slacker' | 'compromise' | 'resonant' | 'afterglow';

export default function Shadow_IntegrationDialogue({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pusherMsg, setPusherMsg] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const pusherType = useTypeInteraction({
    placeholder: 'why are you pushing so hard?',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      setPusherMsg(value.trim());
      setStage('slacker');
    },
    onChange: () => {},
  });

  const slackerType = useTypeInteraction({
    placeholder: 'why are you so tired?',
    onAccept: (value: string) => {
      if (value.trim().length < 3) return;
      console.log(`[KBE:B] IntegrationDialogue pusher="${pusherMsg}" slacker="${value.trim()}" internalHarmony=confirmed`);
      setStage('compromise');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('pusher'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '2px' }}>
            <div style={{ width: '30px', height: '40px', background: themeColor(TH.primaryHSL, 0.05, 3),
              borderRadius: '4px 0 0 4px', border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
            <div style={{ width: '30px', height: '40px', background: themeColor(TH.primaryHSL, 0.04, 2),
              borderRadius: '0 4px 4px 0', border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }} />
          </motion.div>
        )}
        {stage === 'pusher' && (
          <motion.div key="pu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The Pusher speaks. Why are you pushing so hard?
            </div>
            <div style={{ padding: '6px 10px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}` }}>
              <span style={{ fontSize: '11px', color: palette.textFaint, letterSpacing: '0.06em' }}>THE PUSHER</span>
            </div>
            <input {...pusherType.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={pusherType.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Send</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'slacker' && (
          <motion.div key="sl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              Pusher said: "{pusherMsg}"
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The Slacker replies. Why are you so tired?
            </div>
            <div style={{ padding: '6px 10px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
              <span style={{ fontSize: '11px', color: palette.textFaint, letterSpacing: '0.06em' }}>THE SLACKER</span>
            </div>
            <input {...slackerType.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.95 }} onClick={slackerType.submit}
              style={{ padding: '14px 24px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>Peace treaty</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'compromise' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Ceasefire. Both parts heard. Both parts valid. The war is over, not because one side won, but because they negotiated.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Internal harmony. The Pusher and the Slacker are at war inside you. Internal conflict is exhausting. Let the Pusher explain why it{"'"}s scared. Let the Slacker explain why it{"'"}s tired. Negotiate a peace treaty: integration, not domination.
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