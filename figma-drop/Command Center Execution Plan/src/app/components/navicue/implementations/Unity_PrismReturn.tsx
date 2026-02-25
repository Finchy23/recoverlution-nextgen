/**
 * OMEGA #1 — The Prism Return
 * "The many become the One. White light."
 * STEALTH KBE: Merging separate strands of Self = Integrated Identity (K)
 * Web: Drag color bands together via taps
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Synthesis', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'spectrum' | 'merged' | 'resonant' | 'afterglow';

const COLORS = [
  { label: 'Work', hue: 0 },
  { label: 'Love', hue: 300 },
  { label: 'Play', hue: 60 },
  { label: 'Spirit', hue: 240 },
  { label: 'Body', hue: 120 },
];

export default function Unity_PrismReturn({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [merged, setMerged] = useState<string[]>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('spectrum'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const mergeColor = (label: string) => {
    if (stage !== 'spectrum' || merged.includes(label)) return;
    const next = [...merged, label];
    setMerged(next);
    if (next.length >= COLORS.length) {
      console.log(`[KBE:K] PrismReturn merged=[${next}] integratedIdentity=true synthesis=true`);
      setStage('merged');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Synthesis" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '4px', background: 'linear-gradient(90deg, hsla(0,60%,50%,0.1), hsla(60,60%,50%,0.1), hsla(120,60%,50%,0.1), hsla(240,60%,50%,0.1), hsla(300,60%,50%,0.1))' }} />
          </motion.div>
        )}
        {stage === 'spectrum' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Bring the colors back to the source. The many become the One.
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {COLORS.map(c => {
                const done = merged.includes(c.label);
                return (
                  <motion.div key={c.label} whileTap={done ? {} : { scale: 0.85 }} onClick={() => mergeColor(c.label)}
                    animate={done ? { opacity: 0, scale: 0.3, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
                    style={{ padding: '5px 12px', borderRadius: '10px', cursor: done ? 'default' : 'pointer',
                      background: `hsla(${c.hue}, 45%, 40%, ${done ? 0 : 0.15})`,
                      border: `1px solid hsla(${c.hue}, 45%, 50%, ${done ? 0 : 0.25})` }}>
                    <span style={{ fontSize: '11px', color: done ? 'transparent' : `hsla(${c.hue}, 45%, 65%, 0.8)` }}>{c.label}</span>
                  </motion.div>
                );
              })}
            </div>
            {/* Center convergence point */}
            <div style={{ width: `${12 + merged.length * 8}px`, height: `${12 + merged.length * 8}px`, borderRadius: '50%', transition: 'all 0.5s',
              background: merged.length > 0 ? `hsla(0, 0%, ${50 + merged.length * 10}%, ${0.05 + merged.length * 0.04})` : themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.accentHSL, 0.04 + merged.length * 0.02, 3)}` }} />
          </motion.div>
        )}
        {stage === 'merged' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ duration: 2 }}
              style={{ width: '60px', height: '60px', borderRadius: '50%',
                background: `radial-gradient(circle, hsla(0, 0%, 90%, 0.15), hsla(0, 0%, 70%, 0.03))`,
                boxShadow: '0 0 40px hsla(0, 0%, 90%, 0.08)' }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontSize: '11px' }}>White light.</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Newton{"'"}s prism (1666): white light contains all colors. Separation is analysis. Reunion is synthesis. Integration is not losing the parts; it{"'"}s remembering they were always one beam. You have lived all the colors. Now bring them home.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>One.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}