/**
 * ZERO POINT #7 — The Dark Matter
 * "95% is invisible. Tap the empty space. It glows. Gravity."
 * STEALTH KBE: Interacting with "Empty" space = Spiritual Intelligence (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { VOID_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Faith', 'believing', 'Ocean');
type Stage = 'arriving' | 'galaxy' | 'revealed' | 'resonant' | 'afterglow';

export default function Void_DarkMatter({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState<Array<{ x: number; y: number }>>([]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('galaxy'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const tapSpace = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== 'galaxy') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const next = [...taps, { x, y }];
    setTaps(next);
    if (next.length >= 5) {
      console.log(`[KBE:B] DarkMatter taps=${next.length} trustInvisible=true spiritualIntelligence=true`);
      setStage('revealed');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Faith" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.05, 2) }} />
          </motion.div>
        )}
        {stage === 'galaxy' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div onClick={tapSpace}
              style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '50%', cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.02, 0),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }}>
              {/* Visible stars (5%) */}
              {[{x:80,y:40},{x:50,y:90},{x:120,y:70},{x:90,y:130},{x:40,y:50}].map((s,i) => (
                <div key={i} style={{ position:'absolute', left: s.x, top: s.y, width:'3px', height:'3px', borderRadius:'50%',
                  background: themeColor(TH.accentHSL, 0.15, 8) }} />
              ))}
              {/* Dark matter taps */}
              {taps.map((p,i) => (
                <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ position: 'absolute', left: p.x - 12, top: p.y - 12, width: '24px', height: '24px', borderRadius: '50%',
                    background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.06, 4)}, transparent)` }} />
              ))}
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
              95% is invisible. Tap the empty space.
            </div>
            <div style={{ fontSize: '11px', color: palette.textFaint, opacity: 0.4 }}>{taps.length}/5</div>
          </motion.div>
        )}
        {stage === 'revealed' && (
          <motion.div key="rv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 2 }}
              style={{ width: '120px', height: '120px', borderRadius: '50%',
                background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.08, 6)}, ${themeColor(TH.primaryHSL, 0.02, 0)})` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontSize: '11px' }}>Gravity.</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Dark matter comprises ~27% of the universe, dark energy ~68%. Only 5% is visible. What holds galaxies together is invisible. Trust the unseen support: the relationships, the habits, the love that operates below the threshold of perception.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Invisible.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}