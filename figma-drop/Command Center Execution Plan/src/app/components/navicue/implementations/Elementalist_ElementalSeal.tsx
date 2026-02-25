/**
 * ELEMENTALIST #10 — The Elemental Seal (Biophilia)
 * "You are the world, becoming aware of itself."
 * ARCHETYPE: Pattern A (Tap) — Four elements merge into Aether
 * ENTRY: Cold open — swirling elements
 * STEALTH KBE: Completion = Biophilia confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ELEMENTALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'swirling' | 'merged' | 'resonant' | 'afterglow';

const ELEMENTS = [
  { name: 'Earth', hue: 35, angle: 0 },
  { name: 'Air', hue: 195, angle: 90 },
  { name: 'Fire', hue: 25, angle: 180 },
  { name: 'Water', hue: 210, angle: 270 },
];

export default function Elementalist_ElementalSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('swirling'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const merge = () => {
    if (stage !== 'swirling') return;
    console.log(`[KBE:K] ElementalSeal biophilia=confirmed elementalIntegration=true`);
    setStage('merged');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="knowing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2, rotate: 360 }}
            transition={{ rotate: { duration: 6, repeat: Infinity, ease: 'linear' } }}
            style={{ width: '30px', height: '30px', borderRadius: '50%',
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 2)}` }} />
        )}
        {stage === 'swirling' && (
          <motion.div key="sw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                style={{ width: '100%', height: '100%', position: 'relative' }}>
                {ELEMENTS.map((el, i) => {
                  const rad = (el.angle * Math.PI) / 180;
                  const x = 40 + Math.cos(rad) * 28 - 8;
                  const y = 40 + Math.sin(rad) * 28 - 8;
                  return (
                    <div key={i} style={{ position: 'absolute', left: `${x}px`, top: `${y}px`,
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: `hsla(${el.hue}, 15%, 25%, 0.06)`,
                      border: `1px solid hsla(${el.hue}, 15%, 30%, 0.08)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '11px', color: `hsla(${el.hue}, 12%, 35%, 0.2)` }}>{el.name[0]}</span>
                    </div>
                  );
                })}
              </motion.div>
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              Earth, Air, Fire, Water. Swirling. Merge them.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={merge}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Merge → Aether</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'merged' && (
          <motion.div key="me" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{ width: '24px', height: '24px', transform: 'rotate(45deg)',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.04, 3)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
              Aether. The fifth element. Earth, Air, Fire, Water — all merged into a single diamond of awareness. You are not separate from nature. You ARE nature. You are the world, becoming aware of itself.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Biophilia. E.O. Wilson{"'"}s hypothesis: humans have an innate tendency to seek connections with nature and other forms of life. The evidence is robust — exposure to natural environments reduces cortisol, blood pressure, and rumination more effectively than urban environments. You are biology, not technology. Your body responds to earth, air, fire, and water because you are made of them.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Elemental.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}