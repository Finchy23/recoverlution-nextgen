/**
 * MEANING MAKER #2 — The Legacy Letter
 * "You are gathering data for the archive. What must they know?"
 * ARCHETYPE: Pattern D (Type) — Write one sentence of hard-won advice
 * ENTRY: Scene-first — yellowed envelope
 * STEALTH KBE: Engaging in trans-generational thinking = Legacy Mode (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MEANING_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Cosmos');
type Stage = 'arriving' | 'envelope' | 'written' | 'resonant' | 'afterglow';

export default function Meaning_LegacyLetter({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [letter, setLetter] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'one truth they must know...',
    onAccept: (value: string) => {
      if (value.trim().length < 5) return;
      setLetter(value.trim());
      console.log(`[KBE:B] LegacyLetter advice="${value.trim()}" generativity=confirmed legacyMode=true`);
      setStage('written');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('envelope'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '60px', height: '40px', borderRadius: '3px',
              background: themeColor(TH.accentHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }} />
        )}
        {stage === 'envelope' && (
          <motion.div key="en" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            {/* Envelope */}
            <div style={{ width: '160px', height: '90px', borderRadius: radius.xs, position: 'relative',
              background: themeColor(TH.accentHSL, 0.03, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <div style={{ fontSize: '7px', color: themeColor(TH.primaryHSL, 0.1, 5), fontStyle: 'italic' }}>To:</div>
              <div style={{ fontSize: '9px', color: themeColor(TH.accentHSL, 0.25, 10), fontStyle: 'italic' }}>
                My Great-Grandchild
              </div>
              <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                width: '0', height: '0',
                borderLeft: '30px solid transparent', borderRight: '30px solid transparent',
                borderTop: `20px solid ${themeColor(TH.accentHSL, 0.04, 3)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              One sentence of advice you learned the hard way. What must they know?
            </div>
            <input {...typeInt.inputProps}
              style={{ width: '100%', padding: '10px 14px', borderRadius: radius.md,
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, fontSize: '13px', outline: 'none', fontFamily: 'inherit' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={typeInt.submit}
              style={{ padding: '10px 22px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Seal</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'written' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '280px' }}>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 12), fontStyle: 'italic',
              textAlign: 'center' }}>
              "{letter}"
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Sealed. You just shifted from survival mode to legacy mode. You{"'"}re not just living for today — you{"'"}re gathering data for the archive.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Generativity — Erikson{"'"}s seventh stage of psychosocial development. The shift from "What do I get?" to "What do I leave?" Trans-generational thinking — writing to someone who doesn{"'"}t exist yet — activates the brain{"'"}s longest time horizon, pulling you out of survival mode and into legacy mode. You are not just living. You are archiving.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Archived.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}