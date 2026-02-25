/**
 * SYNTHESIS #10 -- The Synthesis Seal (Self-Complexity)
 * "You are many. You are one."
 * ARCHETYPE: Pattern A (Tap) -- Kaleidoscope turning
 * ENTRY: Cold open -- spinning pattern
 * STEALTH KBE: Completion = Self-Complexity buffering
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SYNTHESIS_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'embodying', 'Cosmos');
type Stage = 'arriving' | 'turning' | 'sealed' | 'resonant' | 'afterglow';

const FACETS = ['Shadow', 'Light', 'Child', 'Elder', 'Lover', 'Warrior'];

export default function Synthesis_SynthesisSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [turns, setTurns] = useState(0);
  const [rotation, setRotation] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('turning'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const turn = () => {
    if (stage !== 'turning') return;
    const next = turns + 1;
    setTurns(next);
    setRotation(r => r + 60);
    if (next >= FACETS.length) {
      console.log(`[KBE:E] SynthesisSeal selfComplexity=confirmed facets=${FACETS.length} turns=${next}`);
      setStage('sealed');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="embodying" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ width: '24px', height: '24px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
          </motion.div>
        )}
        {stage === 'turning' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A kaleidoscope. Each turn reveals a facet of you. Turn it until all facets align.
            </div>
            {/* Kaleidoscope */}
            <motion.div animate={{ rotate: rotation }} transition={{ type: 'spring', stiffness: 100 }}
              style={{ position: 'relative', width: '80px', height: '80px' }}>
              {FACETS.map((f, i) => {
                const angle = (i / FACETS.length) * Math.PI * 2 - Math.PI / 2;
                const x = 40 + Math.cos(angle) * 28;
                const y = 40 + Math.sin(angle) * 28;
                const revealed = i < turns;
                return (
                  <div key={f} style={{
                    position: 'absolute', left: x - 10, top: y - 10,
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: revealed ? themeColor(TH.accentHSL, 0.06 + i * 0.01, 3 + i) : themeColor(TH.primaryHSL, 0.02, 1),
                    border: `1px solid ${revealed ? themeColor(TH.accentHSL, 0.1 + i * 0.02, 5 + i) : themeColor(TH.primaryHSL, 0.04, 2)}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.4s',
                  }}>
                    <span style={{ fontSize: '6px', color: revealed ? themeColor(TH.accentHSL, 0.25, 8) : palette.textFaint }}>
                      {revealed ? f : '?'}
                    </span>
                  </div>
                );
              })}
              <div style={{ position: 'absolute', inset: '20px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
            </motion.div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={turn}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>
                Turn ({turns}/{FACETS.length})
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Sealed. All facets revealed. Shadow, Light, Child, Elder, Lover, Warrior. You are many. You are one. The kaleidoscope doesn{"'"}t choose one pattern; it holds them all. Self-complexity is not confusion; it{"'"}s the mark of an integrated person. Every turn revealed another you. They were all there all along.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Self-complexity. Patricia Linville{"'"}s self-complexity theory: people with more distinct self-aspects (roles, relationships, activities) are more resilient to stress because a threat to one aspect doesn{"'"}t collapse the whole identity. The kaleidoscope is a self-complexity buffer. Jung{"'"}s individuation: integrating Shadow and Light, Anima and Animus, into a whole Self. You are not one thing. You are a kaleidoscope. The Synthesis Seal: hold all of it. Be many. Be one.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Synthesized.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
