/**
 * MYSTIC #9 — The Net of Indra
 * "You are not a part of the universe. You are the universe in a point."
 * Pattern A (Tap) — Web of jewels; zoom into one; see the whole web reflected
 * STEALTH KBE: Understanding fractal nature = Holographic Insight / Interconnection (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Non-Dual Awareness', 'knowing', 'Practice');
type Stage = 'arriving' | 'web' | 'zoomed' | 'fractal' | 'resonant' | 'afterglow';

const JEWELS = [
  { x: 40, y: 10 }, { x: 15, y: 30 }, { x: 65, y: 30 },
  { x: 25, y: 55 }, { x: 55, y: 55 }, { x: 40, y: 75 },
];
const THREADS = [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[1,2],[3,4],[0,5]];

export default function Mystic_NetOfIndra({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selected, setSelected] = useState(-1);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('web'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const selectJewel = (idx: number) => {
    if (stage !== 'web') return;
    setSelected(idx);
    setStage('zoomed');
    t(() => {
      console.log(`[KBE:K] NetOfIndra holographicInsight=confirmed interconnection=true jewel=${idx}`);
      setStage('fractal');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }, 2000);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.06, 3) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'web' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Indra{"'"}s Net — infinite jewels, each reflecting every other. Tap one to zoom in.
            </div>
            <svg width="100" height="90" viewBox="0 0 80 85" style={{ overflow: 'visible' }}>
              {THREADS.map(([a,b], i) => (
                <line key={`t${i}`} x1={JEWELS[a].x} y1={JEWELS[a].y} x2={JEWELS[b].x} y2={JEWELS[b].y}
                  stroke={themeColor(TH.accentHSL, 0.04, 2)} strokeWidth="0.5" />
              ))}
              {JEWELS.map((j, i) => (
                <g key={i} onClick={() => selectJewel(i)} style={{ cursor: 'pointer' }}>
                  <motion.circle cx={j.x} cy={j.y} r="5"
                    animate={{ opacity: [0.06, 0.1, 0.06] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    fill={themeColor(TH.accentHSL, 0.08, 4)} />
                  <circle cx={j.x} cy={j.y} r="2" fill={themeColor(TH.accentHSL, 0.12, 8)} />
                </g>
              ))}
            </svg>
          </motion.div>
        )}
        {stage === 'zoomed' && (
          <motion.div key="z" initial={{ scale: 1 }} animate={{ scale: 2 }}
            transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <motion.div animate={{ boxShadow: [`0 0 8px ${themeColor(TH.accentHSL, 0.04, 3)}`, `0 0 16px ${themeColor(TH.accentHSL, 0.08, 5)}`, `0 0 8px ${themeColor(TH.accentHSL, 0.04, 3)}`] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '16px', height: '16px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.1, 5) }} />
            <span style={{ fontSize: '11px', color: palette.textFaint }}>Zooming...</span>
          </motion.div>
        )}
        {stage === 'fractal' && (
          <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Inside the jewel: the entire web again. Infinite reflections. Holographic universe. The whole is contained in every part. You are not a part of the universe. You are the universe in a point. Each jewel reflects every other jewel, and each reflection contains every other reflection. This is not poetry. It is the mathematical structure of a hologram — and increasingly, the structure of reality itself.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Indra{"'"}s Net and the holographic principle. The Avatamsaka Sutra describes an infinite net of jewels, each reflecting all others — a metaphor for radical interconnection. David Bohm{"'"}s "implicate order": each part of the universe contains information about the whole. The holographic principle in physics ({"'"}t Hooft, Susskind): the information content of a volume of space can be encoded on its boundary. Fractals (Mandelbrot): self-similar patterns at every scale. The universe appears to be holographic from both mystical and physical perspectives.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Infinite.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}