/**
 * MYSTIC #6 — The Dance of Shiva
 * "Creation and Destruction are the same energy. Just dance."
 * Pattern A (Tap) — Figure dances, creating (green) and destroying (red); accept both
 * STEALTH KBE: Accepting destroy phase = Radical Acceptance / Equanimity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'creating' | 'destroying' | 'danced' | 'resonant' | 'afterglow';

export default function Mystic_DanceOfShiva({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [phase, setPhase] = useState<'create' | 'destroy'>('create');
  const [cycles, setCycles] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('creating'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const dance = () => {
    if (stage !== 'creating' && stage !== 'destroying') return;
    if (phase === 'create') {
      setPhase('destroy');
      setStage('destroying');
    } else {
      const next = cycles + 1;
      setCycles(next);
      if (next >= 2) {
        console.log(`[KBE:B] DanceOfShiva equanimity=confirmed radicalAcceptance=true cycles=${next}`);
        setStage('danced');
        t(() => setStage('resonant'), 5500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
      } else {
        setPhase('create');
        setStage('creating');
      }
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <div style={{ width: '10px', height: '18px', borderRadius: '5px 5px 2px 2px',
                background: themeColor(TH.accentHSL, 0.04, 2) }} />
            </motion.div>
          </motion.div>
        )}
        {(stage === 'creating' || stage === 'destroying') && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              {phase === 'create' ? 'The left hand creates.' : 'The right hand destroys. Both are holy.'}
            </div>
            {/* Dancing figure */}
            <motion.div
              animate={{ rotate: phase === 'create' ? [0, 10, 0] : [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}>
              <svg width="40" height="50" viewBox="0 0 40 50">
                <circle cx="20" cy="8" r="5" fill={themeColor(TH.accentHSL, 0.06, 4)} />
                <line x1="20" y1="13" x2="20" y2="30" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1.5" />
                <line x1="20" y1="18" x2={phase === 'create' ? '8' : '32'} y2="12"
                  stroke={phase === 'create' ? 'hsla(140, 15%, 30%, 0.08)' : 'hsla(0, 15%, 30%, 0.08)'} strokeWidth="1.5" />
                <line x1="20" y1="18" x2={phase === 'create' ? '32' : '8'} y2="12"
                  stroke={phase === 'create' ? 'hsla(140, 15%, 30%, 0.08)' : 'hsla(0, 15%, 30%, 0.08)'} strokeWidth="1.5" />
                <line x1="20" y1="30" x2="12" y2="45" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1.5" />
                <line x1="20" y1="30" x2="28" y2="45" stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1.5" />
              </svg>
            </motion.div>
            <div style={{ fontSize: '11px', color: phase === 'create' ? 'hsla(140, 15%, 35%, 0.3)' : 'hsla(0, 15%, 35%, 0.3)' }}>
              {phase === 'create' ? '◉ Creating' : '◉ Destroying'}
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={dance}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>
                {phase === 'create' ? 'Now Destroy' : 'Now Create'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'danced' && (
          <motion.div key="dd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Danced. Creation and destruction are the same energy expressed in opposite directions. Shiva{"'"}s cosmic dance (Nataraja) is not a battle — it is a rhythm. Birth, death, rebirth. Expansion, contraction, expansion. Do not cling to the birth. Do not fear the death. Just dance. The equanimity is not indifference. It is the deepest acceptance of how things are.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Nataraja (The Dance of Shiva). In Hindu cosmology, Shiva{"'"}s dance simultaneously creates and destroys the universe. Fritjof Capra ({"'"}The Tao of Physics{"'"}) drew parallels to quantum field theory: particles are constantly created and annihilated. Equanimity (upekkha in Pali): the balanced mind that doesn{"'"}t grasp at pleasure or recoil from pain. Research (Desbordes, 2012): long-term meditators show reduced amygdala reactivity to both positive and negative stimuli — not numbness, but balanced responsiveness.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Dancing.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}