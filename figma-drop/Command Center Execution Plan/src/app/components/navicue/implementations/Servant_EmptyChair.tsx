/**
 * SERVANT #3 — The Empty Chair
 * "Loneliness is a famine. You have the bread. Break it."
 * ARCHETYPE: Pattern D (Type) — Type a name for the empty chair
 * ENTRY: Scene-first — dinner table with empty chair
 * STEALTH KBE: Naming someone = Prosocial Action / Embodied Generosity (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SERVANT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'table' | 'invited' | 'resonant' | 'afterglow';

export default function Servant_EmptyChair({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [name, setName] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'who needs an invitation?',
    onAccept: (value: string) => {
      if (value.trim().length < 2) return;
      setName(value.trim());
      console.log(`[KBE:E] EmptyChair invited="${value.trim()}" prosocialAction=confirmed embodiedGenerosity=true`);
      setStage('invited');
      t(() => setStage('resonant'), 4500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
    },
    onChange: () => {},
  });

  useEffect(() => { t(() => setStage('table'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '10px', height: i === 2 ? '8px' : '12px',
                  borderRadius: '2px',
                  background: i === 2 ? 'transparent' : themeColor(TH.primaryHSL, 0.04, 2),
                  border: i === 2 ? `1px dashed ${themeColor(TH.primaryHSL, 0.04, 2)}` : `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
              ))}
            </motion.div>
        )}
        {stage === 'table' && (
          <motion.div key="tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {/* Table */}
            <div style={{ width: '160px', height: '50px', borderRadius: radius.xs, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              {/* Two occupied chairs */}
              <div style={{ width: '12px', height: '14px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              <div style={{ width: '12px', height: '14px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.06, 3) }} />
              {/* Empty chair */}
              <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '12px', height: '14px', borderRadius: '3px',
                  border: `1px dashed ${themeColor(TH.accentHSL, 0.12, 6)}`,
                  background: 'transparent' }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              One chair is empty. Who needs an invitation?
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
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Invite</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'invited' && (
          <motion.div key="inv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {name} sits down. The chair is full. Loneliness is a famine, and you have the bread. You just broke it. Reach out to them today — the invitation matters more than the meal.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Prosocial action. The U.S. Surgeon General declared loneliness an epidemic — its health impact equals smoking 15 cigarettes a day. But the cure isn{"'"}t complex. It{"'"}s one invitation, one text, one "thinking of you." Embodied generosity — turning intention into action — activates both the giver{"'"}s and receiver{"'"}s oxytocin systems. Who is hungry today?
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Full.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}