/**
 * INTERPRETER #8 — The Steel Man (The Strongest Case)
 * "Do not fight a weak opponent. Strengthen their point."
 * ARCHETYPE: Pattern D (Type) — Write a generous version of opponent's argument
 * ENTRY: Cold open — straw-man argument appears weak and flimsy
 * STEALTH KBE: Writing a generous version = Theory of Mind (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'straw' | 'active' | 'forged' | 'resonant' | 'afterglow';

const STRAW_ARGUMENT = "They just don't care about anyone but themselves.";

export default function Interpreter_SteelMan({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('straw');
  const [steelStrength, setSteelStrength] = useState(0); // 0-1 visual strength
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typer = useTypeInteraction({
    minLength: 15,
    onAccept: (text) => {
      console.log(`[KBE:K] SteelMan perspectiveTaking=true generousArgLength=${text.length}`);
      setStage('forged');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2600);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Visual strength grows with typed text length
  useEffect(() => {
    const len = typer.value.length;
    setSteelStrength(Math.min(1, len / 60));
  }, [typer.value]);

  const barWidth = 8 + steelStrength * 16; // straw = thin, steel = thick
  const barColor = steelStrength < 0.3
    ? themeColor(TH.primaryHSL, 0.1, 4)
    : steelStrength < 0.7
      ? themeColor(TH.primaryHSL, 0.15, 8)
      : themeColor(TH.accentHSL, 0.2, 10);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'straw' && (
          <motion.div key="st" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            {/* Straw-man visual — thin, fragile bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
              {[0.3, 0.5, 0.7, 0.4, 0.6].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: h * 80 }}
                  transition={{ delay: i * 0.15 }}
                  style={{ width: '6px', borderRadius: '2px',
                    background: themeColor(TH.primaryHSL, 0.08, 4),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 2)}` }} />
              ))}
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              "{STRAW_ARGUMENT}"
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a weak argument</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Do not fight a weak opponent. Strengthen their point. If you can respect their truth, you can disarm their rage.
            </div>
            {/* Strength indicator */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
              {[0.3, 0.5, 0.8, 0.4, 0.65].map((h, i) => (
                <motion.div key={i}
                  animate={{ width: barWidth, height: (h + steelStrength * 0.3) * 60 }}
                  transition={{ duration: 0.3 }}
                  style={{ borderRadius: '2px', background: barColor }} />
              ))}
            </div>
            {/* Type their best argument */}
            <textarea
              value={typer.value}
              onChange={(e) => typer.onChange(e.target.value)}
              placeholder="Write their strongest possible argument..."
              style={{ width: '100%', minHeight: '70px', padding: '12px', borderRadius: radius.sm, resize: 'none',
                background: themeColor(TH.primaryHSL, 0.04, 2), color: palette.text,
                border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 4)}`,
                fontFamily: 'inherit', fontSize: '13px', lineHeight: '1.6',
                outline: 'none' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.95 }}
                onClick={typer.submit}
                style={{ padding: '8px 20px', borderRadius: radius.full, cursor: 'pointer',
                  opacity: typer.value.length >= 15 ? 1 : 0.3,
                  background: themeColor(TH.accentHSL, 0.1, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 12) }}>forge steel</div>
              </motion.div>
              <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>
                {steelStrength < 0.3 ? 'straw' : steelStrength < 0.7 ? 'iron' : 'steel'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'forged' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Steel bars — thick, strong */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px' }}>
              {[0.6, 0.8, 1.0, 0.7, 0.9].map((h, i) => (
                <motion.div key={i} initial={{ height: 0 }} animate={{ height: h * 80 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ width: '20px', borderRadius: '2px',
                    background: themeColor(TH.accentHSL, 0.2, 10),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.15, 8)}` }} />
              ))}
            </div>
            <div style={{ ...navicueType.texture, color: themeColor(TH.accentHSL, 0.35, 10), textAlign: 'center',
              maxWidth: '260px', fontStyle: 'italic' }}>
              "{typer.value}"
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>steel-manned</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Perspective taking. The steel-man technique forces Theory of Mind {'\u2014'} modeling another person{"'"}s reasoning at its best, not its worst. It is the intellectual opposite of a straw man. Respect their argument to disarm their defense.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Forged.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}