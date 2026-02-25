/**
 * FUTURE WEAVER #6 — The Legacy Seed
 * "You are planting shade for people you will never meet."
 * ARCHETYPE: Pattern A (Tap) — Plant acorn, watch time-lapse
 * ENTRY: Scene-first — bare earth
 * STEALTH KBE: Engaging with long-term sim = Generativity / Transcendence (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'earth' | 'growing' | 'grown' | 'resonant' | 'afterglow';

export default function FutureWeaver_LegacySeed({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [growth, setGrowth] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('earth'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const plant = () => {
    if (stage !== 'earth') return;
    console.log(`[KBE:B] LegacySeed generativity=confirmed transcendence=true`);
    setStage('growing');
  };

  useEffect(() => {
    if (stage !== 'growing') return;
    const iv = setInterval(() => {
      setGrowth(prev => {
        if (prev >= 100) {
          clearInterval(iv);
          setStage('grown');
          t(() => setStage('resonant'), 5000);
          t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
          return 100;
        }
        return prev + 2;
      });
    }, 60);
    return () => clearInterval(iv);
  }, [stage]);

  const treeH = growth * 0.5;
  const canopyR = Math.max(0, (growth - 40) * 0.3);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '8px', height: '8px', borderRadius: '50%',
              background: themeColor(TH.primaryHSL, 0.06, 3) }} />
        )}
        {stage === 'earth' && (
          <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '80px', height: '20px', borderRadius: '0 0 8px 8px',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.06, 3) }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px' }}>
              An acorn. Plant it.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={plant}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Plant</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'growing' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '100px', height: '70px', position: 'relative' }}>
              {/* Trunk */}
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: `${3 + growth * 0.03}px`, height: `${treeH}px`,
                background: themeColor(TH.primaryHSL, 0.06 + growth * 0.001, 3),
                borderRadius: '1px', transition: 'all 0.1s' }} />
              {/* Canopy */}
              {canopyR > 0 && (
                <div style={{ position: 'absolute', bottom: `${treeH - 5}px`, left: '50%',
                  transform: 'translate(-50%, 0)',
                  width: `${canopyR * 2}px`, height: `${canopyR * 1.5}px`,
                  borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.04 + growth * 0.0005, 3),
                  transition: 'all 0.1s' }} />
              )}
              {/* Swing appears at 80% */}
              {growth > 80 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ position: 'absolute', bottom: `${treeH - 15}px`, left: '60%',
                    fontSize: '11px', color: themeColor(TH.accentHSL, 0.2, 8) }}>⛹</motion.div>
              )}
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {growth < 30 ? 'Sprouting...' : growth < 60 ? 'Growing...' : growth < 90 ? 'Decades pass...' : 'A swing appears.'}
            </div>
          </motion.div>
        )}
        {stage === 'grown' && (
          <motion.div key="gr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            An oak. A swing. A child laughing in shade you planted. You are planting for people you will never meet. The act is small. The shadow is long.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Generativity. The Greek proverb: "A society grows great when old men plant trees whose shade they know they shall never sit in." Cathedral thinking — starting something you won{"'"}t see finished — is the highest form of optimism. Research shows that people who engage in generative behavior have lower mortality risk and higher life satisfaction. Plant it.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Planted.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}