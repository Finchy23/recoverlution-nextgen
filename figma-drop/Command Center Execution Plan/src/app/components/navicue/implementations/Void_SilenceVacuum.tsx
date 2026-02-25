/**
 * ZERO POINT #6 — The Silence Vacuum
 * "The worry is loud. The jar is strong. Seal it."
 * STEALTH KBE: Externalization — seeing worry "contained" = Cognitive Defusion (K)
 * Web: useTypeInteraction — type the worry, then seal it in a jar.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('koan_paradox', 'Externalization', 'knowing', 'Ocean');
type Stage = 'arriving' | 'open' | 'sealed' | 'resonant' | 'afterglow';

export default function Void_SilenceVacuum({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [worry, setWorry] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typing = useTypeInteraction({
    onAccept: (text: string) => {
      setWorry(text);
      console.log(`[KBE:K] SilenceVacuum worryLength=${text.length} cognitiveDefusion=true externalized=true`);
      setStage('sealed');
      t(() => setStage('resonant'), 6000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 14000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('open'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Externalization" kbe="knowing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '14px', height: '18px', borderRadius: radius.xs, border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
          </motion.div>
        )}
        {stage === 'open' && (
          <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            {/* Jar icon */}
            <div style={{ width: '50px', height: '60px', borderRadius: '0 0 12px 12px',
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 4)}`, borderTop: 'none',
              background: themeColor(TH.primaryHSL, 0.02, 0) }}>
              <div style={{ width: '54px', height: '8px', marginLeft: '-3px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.05, 3),
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Type your worry into the jar.
            </div>
            <textarea
              value={typing.value}
              onChange={(e) => typing.onChange(e.target.value)}
              placeholder="My worry is..."
              style={{ width: '220px', height: '50px', resize: 'none', borderRadius: radius.sm, padding: '8px',
                background: themeColor(TH.primaryHSL, 0.02, 0), color: palette.text,
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}`,
                fontSize: '10px', fontFamily: 'inherit', outline: 'none' }} />
            <motion.div whileTap={{ scale: 0.95 }}
              onClick={() => { if (typing.value.length > 3) typing.submit(); }}
              style={{ padding: '6px 16px', borderRadius: radius.md, cursor: typing.value.length > 3 ? 'pointer' : 'default',
                opacity: typing.value.length > 3 ? 1 : 0.3,
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', color: palette.textFaint }}>SEAL THE JAR</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div initial={{ scale: 1 }} animate={{ scale: 0.6, opacity: 0.3 }} transition={{ duration: 4 }}
              style={{ width: '50px', height: '60px', borderRadius: '0 0 12px 12px',
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 4)}`,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint, opacity: 0.4 }}>sealed</span>
            </motion.div>
            <motion.div initial={{ height: '20px' }} animate={{ height: '2px' }} transition={{ duration: 3 }}
              style={{ width: '80px', borderRadius: '2px', background: themeColor(TH.accentHSL, 0.06, 3), overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', color: palette.textFaint, opacity: 0.3, whiteSpace: 'nowrap', overflow: 'hidden' }}>{worry}</div>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.textFaint, textAlign: 'center', opacity: 0.5, fontSize: '11px' }}>
              The silence is louder than the scream.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Cognitive defusion (Hayes, ACT therapy): when you externalize a thought, write it, name it, contain it, it loses its grip. The worry is not you. It is a signal. Put it on the shelf. The silence is louder than the scream.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Sealed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}