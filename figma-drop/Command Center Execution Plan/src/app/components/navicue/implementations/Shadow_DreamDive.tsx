/**
 * SHADOW WORKER #7 — The Dream Dive
 * "The subconscious speaks in images, not words. What does it feel like?"
 * ARCHETYPE: Pattern A (Tap) — Catch a symbol, choose emotional association
 * ENTRY: Scene-first — deep blue ocean
 * STEALTH KBE: Speed of association = Intuitive Access (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SHADOW_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'knowing', 'Ocean');
type Stage = 'arriving' | 'diving' | 'decoding' | 'decoded' | 'resonant' | 'afterglow';

const SYMBOLS = [
  { glyph: '\u2726', name: 'Snake', emotions: ['Fear', 'Transformation', 'Power'] },
  { glyph: '\u25B3', name: 'House', emotions: ['Safety', 'Confinement', 'Belonging'] },
  { glyph: '\u25CB', name: 'Tooth', emotions: ['Loss', 'Vulnerability', 'Growth'] },
];

export default function Shadow_DreamDive({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [symbol, setSymbol] = useState<typeof SYMBOLS[0] | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const catchTime = useRef(0);

  useEffect(() => { t(() => setStage('diving'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const catchSymbol = (s: typeof SYMBOLS[0]) => {
    if (stage !== 'diving') return;
    setSymbol(s);
    setStage('decoding');
    catchTime.current = Date.now();
  };

  const decode = (emotion: string) => {
    const latency = Date.now() - catchTime.current;
    console.log(`[KBE:K] DreamDive symbol=${symbol?.name} emotion=${emotion} latencyMs=${latency} intuitiveAccess=${latency < 4000}`);
    setStage('decoded');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="knowing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '50px', borderRadius: radius.sm,
              background: 'hsla(220, 20%, 12%, 0.15)' }} />
        )}
        {stage === 'diving' && (
          <motion.div key="div" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You dive deep. Symbols float past. Catch one.
            </div>
            <div style={{ display: 'flex', gap: '18px' }}>
              {SYMBOLS.map((s, i) => (
                <motion.div key={i} whileTap={{ scale: 0.9 }} onClick={() => catchSymbol(s)}
                  animate={{ y: [0, -6, 0] }} transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.05, 3),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '16px', color: themeColor(TH.accentHSL, 0.2, 8) }}>{s.glyph}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'decoding' && symbol && (
          <motion.div key="dec" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}>
              {symbol.name}. What does it feel like?
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {symbol.emotions.map((em) => (
                <motion.div key={em} whileTap={{ scale: 0.95 }} onClick={() => decode(em)}
                  style={{ padding: '8px 14px', borderRadius: radius.lg, cursor: 'pointer',
                    background: themeColor(TH.accentHSL, 0.05, 3),
                    border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}` }}>
                  <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.35, 10), fontSize: '11px' }}>{em}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'decoded' && (
          <motion.div key="dd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
            Decoded. The subconscious speaks in images. You heard it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Symbolic fluency. The subconscious speaks in images, not words. Don{"'"}t literalize the symbol. Feel it. A snake can be fear or transformation. Speed of emotional association reveals how freely you access your intuitive depths.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Decoded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}