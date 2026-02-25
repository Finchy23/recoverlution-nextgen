/**
 * ETHICIST #2 — The Eulogy Test
 * "You are carving your name in the memory of the world every day."
 * ARCHETYPE: Pattern D (Type) — Carve a word into stone
 * ENTRY: Scene-first — stone tablet
 * STEALTH KBE: Choosing Virtue over Skill = Legacy Thinking / Character over Competence (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'carving' | 'carved' | 'resonant' | 'afterglow';

export default function Ethicist_EulogyTest({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [word, setWord] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    onChange: (val: string) => setWord(val),
    onAccept: () => {
      if (!word.trim()) return;
      console.log(`[KBE:B] EulogyTest word="${word.trim()}" legacyThinking=confirmed characterOverCompetence=true`);
      setStage('carved');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('carving'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '40px', height: '30px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
        )}
        {stage === 'carving' && (
          <motion.div key="ca" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A stone tablet. "They were ___." You have a chisel. Carve the word.
            </div>
            {/* Tablet */}
            <div style={{ width: '120px', height: '60px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.035, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', fontStyle: 'italic', letterSpacing: '1px',
                color: word ? themeColor(TH.accentHSL, 0.3, 10) : themeColor(TH.primaryHSL, 0.05, 3) }}>
                {word || '___'}
              </span>
            </div>
            <input type="text" value={word} onChange={(e) => typeInt.onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && typeInt.onAccept()}
              placeholder="e.g. Honest"
              style={{ width: '120px', padding: '6px 10px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                color: palette.text, fontSize: '11px', outline: 'none', textAlign: 'center' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => typeInt.onAccept()}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                opacity: word.trim() ? 1 : 0.4 }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Carve ✎</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'carved' && (
          <motion.div key="cv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '120px', height: '60px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.035, 2),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', fontStyle: 'italic', letterSpacing: '1px',
                color: themeColor(TH.accentHSL, 0.35, 12) }}>{word}</span>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              Carved in stone. Every day, your actions chisel this word into the memory of the world. Is the chisel sharp? Is the hand steady? The eulogy test: not what you achieved, but who you were.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Legacy thinking. David Brooks{"'"} distinction between "résumé virtues" (skills, achievements) and "eulogy virtues" (character traits people remember). Research on moral identity (Aquino & Reed): when "being a good person" is central to self-concept, ethical behavior becomes more automatic. The eulogy test reframes daily decisions: "Is this action consistent with the word I want carved on my stone?"
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Carved.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}