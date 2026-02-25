/**
 * MENTAT #2 — The Speed Read (The Gist)
 * "You are drowning in data. What is the headline?"
 * ARCHETYPE: Pattern D (Type) — Type the headline of your worry
 * ENTRY: Scene-first — wall of scrolling text
 * STEALTH KBE: Brevity (<5 words) = Cognitive Compression / Signal Detection (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'knowing', 'Circuit');
type Stage = 'arriving' | 'scrolling' | 'distilled' | 'resonant' | 'afterglow';

export default function Mentat_SpeedRead({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [headline, setHeadline] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    onChange: (val: string) => setHeadline(val),
    onAccept: () => {
      if (!headline.trim()) return;
      const wordCount = headline.trim().split(/\s+/).length;
      console.log(`[KBE:K] SpeedRead headline="${headline.trim()}" words=${wordCount} compression=${wordCount <= 5}`);
      setStage('distilled');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    },
  });

  useEffect(() => { t(() => setStage('scrolling'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ width: '40px', height: '30px', overflow: 'hidden' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '40px', height: '2px', background: themeColor(TH.primaryHSL, 0.03, 1),
                marginBottom: '4px', borderRadius: '1px' }} />
            ))}
          </motion.div>
        )}
        {stage === 'scrolling' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A wall of text. Anxiety. Overthinking. Noise. What is the headline?
            </div>
            {/* Scrolling text wall */}
            <div style={{ width: '140px', height: '50px', overflow: 'hidden', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}` }}>
              <motion.div animate={{ y: [0, -30, -60, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                {[0, 1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{ width: `${60 + Math.random() * 60}px`, height: '2px',
                    background: themeColor(TH.primaryHSL, 0.025, 1), margin: '4px 6px', borderRadius: '1px' }} />
                ))}
              </motion.div>
            </div>
            <input type="text" value={headline} onChange={(e) => typeInt.onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && typeInt.onAccept()}
              placeholder="The headline (≤5 words)"
              style={{ width: '160px', padding: '6px 10px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                color: palette.text, fontSize: '11px', outline: 'none', textAlign: 'center' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => typeInt.onAccept()}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                opacity: headline.trim() ? 1 : 0.4 }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Distill</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'distilled' && (
          <motion.div key="di" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px 16px', borderRadius: radius.sm,
              background: themeColor(TH.accentHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}` }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: themeColor(TH.accentHSL, 0.35, 12) }}>{headline}</span>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              That{"'"}s the headline. The rest was filler. You were drowning in data; now you have the signal. Ignore the noise. One clear sentence cuts through a thousand worries.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cognitive compression. George Miller{"'"}s "magical number seven" (±2): working memory can hold 5-9 chunks. Anxiety overloads this capacity with noise. The remedy is compression: distilling complex worries into a single headline. This is what editors do, what leaders do, what therapists do: "What is the one sentence?" Brevity is not simplification; it{"'"}s signal extraction.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Distilled.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}