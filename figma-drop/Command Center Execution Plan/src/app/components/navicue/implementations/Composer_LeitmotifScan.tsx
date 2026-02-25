/**
 * COMPOSER #3 — The Leitmotif Scan
 * "Your life has a soundtrack. Identify the melody."
 * ARCHETYPE: Pattern A (Tap) — Select recurring theme from timeline symbols
 * ENTRY: Scene-first — timeline with repeating symbols
 * STEALTH KBE: Theme selection = Self-Concept Clarity / Narrative Identity (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COMPOSER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'knowing', 'Theater');
type Stage = 'arriving' | 'scanning' | 'identified' | 'resonant' | 'afterglow';

const SYMBOLS = [
  { icon: '†', label: 'A Sword' },
  { icon: '◻', label: 'A Book' },
  { icon: '♥', label: 'A Heart' },
];
const THEMES = ['Resilience', 'Curiosity', 'Connection', 'Creation', 'Freedom'];

export default function Composer_LeitmotifScan({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('scanning'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (theme: string) => {
    if (stage !== 'scanning') return;
    setChosen(theme);
    console.log(`[KBE:K] LeitmotifScan theme="${theme}" narrativeIdentity=confirmed selfConceptClarity=true`);
    setStage('identified');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="knowing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '10px' }}>
            {SYMBOLS.map((s, i) => (
              <span key={i} style={{ fontSize: '12px', opacity: 0.3 }}>{s.icon}</span>
            ))}
          </motion.div>
        )}
        {stage === 'scanning' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Your timeline. Repeating symbols. What is the recurring theme?
            </div>
            {/* Timeline */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '1px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
              {[0, 2, 1, 0, 2, 1, 0].map((si, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '11px', opacity: 0.4 + (i % 3) * 0.1 }}>{SYMBOLS[si].icon}</span>
                  <div style={{ width: '1px', height: '6px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
                </div>
              ))}
              <div style={{ width: '40px', height: '1px', background: themeColor(TH.primaryHSL, 0.04, 2) }} />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {THEMES.map(th => (
                <motion.div key={th} whileTap={{ scale: 0.9 }} onClick={() => choose(th)}
                  style={{ padding: '12px 18px', borderRadius: radius.md, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.05, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }}>
                  <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.35, 10) }}>{th}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'identified' && (
          <motion.div key="id" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Your leitmotif: {chosen}. It plays in every scene — the triumphs and the failures. Now that you hear it, you can develop it intentionally. The melody was always there. You just named it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Narrative identity. Dan McAdams{"'"} research: we are the stories we tell ourselves about ourselves. Identifying your recurring theme — your leitmotif — is the foundation of Self-Concept Clarity. People with clear self-concepts have higher self-esteem, lower anxiety, and more consistent behavior. Name the melody. Then compose it deliberately.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Named.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}