/**
 * INTUITION #3 — The Shiver Scan (The Truth)
 * "Truth feels like expansion. Lie feels like contraction."
 * Pattern A (Tap) — Tap body map where you feel it
 * STEALTH KBE: Locating sensation = Interoceptive Awareness (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { INTUITION_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Intuitive Intelligence', 'embodying', 'Practice');
type Stage = 'arriving' | 'scanning' | 'located' | 'resonant' | 'afterglow';
const ZONES = [
  { id: 'head', label: 'Head', y: 8, color: 'hsla(200, 15%, 30%, 0.06)' },
  { id: 'chest', label: 'Chest', y: 30, color: 'hsla(15, 15%, 30%, 0.06)' },
  { id: 'stomach', label: 'Stomach', y: 50, color: 'hsla(38, 15%, 30%, 0.06)' },
  { id: 'neck', label: 'Neck', y: 20, color: 'hsla(265, 12%, 28%, 0.06)' },
];

export default function Intuition_ShiverScan({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [zone, setZone] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => { t(() => setStage('scanning'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tap = (z: string) => {
    if (stage !== 'scanning') return;
    setZone(z);
    console.log(`[KBE:E] ShiverScan zone=${z} interoceptiveAwareness=confirmed somaticLocalization=true`);
    setStage('located');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Intuitive Intelligence" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <svg width="20" height="50" viewBox="0 0 20 50"><ellipse cx="10" cy="25" rx="6" ry="20" fill="none" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" /></svg>
          </motion.div>
        )}
        {stage === 'scanning' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Think about the choice. Where do you feel it? Tap the zone. Does it expand or contract?
            </div>
            <svg width="60" height="100" viewBox="0 0 60 100">
              <ellipse cx="30" cy="50" rx="16" ry="40" fill="none" stroke={themeColor(TH.primaryHSL, 0.04, 2)} strokeWidth="1" />
              {ZONES.map(z => (
                <g key={z.id} onClick={() => tap(z.id)} style={{ cursor: 'pointer' }}>
                  <circle cx="30" cy={z.y + 10} r="8" fill={z.color} stroke={themeColor(TH.accentHSL, 0.08, 4)} strokeWidth="1" />
                  <text x="30" y={z.y + 13} textAnchor="middle" fill={themeColor(TH.accentHSL, 0.2, 6)} fontSize="5">{z.label}</text>
                </g>
              ))}
            </svg>
          </motion.div>
        )}
        {stage === 'located' && (
          <motion.div key="lo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {zone}. You located it. Truth feels like expansion — warmth, openness, a subtle yes. Lies feel like contraction — tightness, cold, a closing. You just read the thermal map of your own body. That sensation IS data. Interoception: the ability to sense the internal state of your body. You have it. Use it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Interoception. A.D. Craig{"'"}s research: the insula cortex processes internal bodily signals, and people with higher interoceptive accuracy make better intuitive decisions. The expansion/contraction heuristic maps to parasympathetic (safe/approach) vs. sympathetic (threat/avoid) activation. Training interoceptive awareness improves emotional regulation, decision-making, and self-awareness.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Located.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
