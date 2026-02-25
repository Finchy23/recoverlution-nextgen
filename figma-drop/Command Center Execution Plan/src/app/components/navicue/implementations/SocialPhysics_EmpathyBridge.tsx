/**
 * SOCIAL PHYSICS #5 — The Empathy Bridge
 * "You cannot shout across the canyon. Build the bridge first."
 * ARCHETYPE: Pattern A (Tap/Sequence) — Place 3 planks in correct order
 * ENTRY: Scene-first — chasm with two figures
 * STEALTH KBE: Placing Validation first = Relational Intelligence (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SOCIALPHYSICS_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'knowing', 'Hearth');
type Stage = 'arriving' | 'active' | 'built' | 'collapsed' | 'resonant' | 'afterglow';
type Plank = 'Validation' | 'Explanation' | 'Defense';
const PLANKS: Plank[] = ['Explanation', 'Defense', 'Validation'];

export default function SocialPhysics_EmpathyBridge({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [placed, setPlaced] = useState<Plank[]>([]);
  const [available, setAvailable] = useState<Plank[]>([...PLANKS]);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const placePlank = (p: Plank) => {
    if (stage !== 'active') return;
    const next = [...placed, p];
    setPlaced(next);
    setAvailable(available.filter(x => x !== p));

    if (next.length === 3) {
      const success = next[0] === 'Validation';
      console.log(`[KBE:K] EmpathyBridge order=${next.join(',')} validationFirst=${success} relationalIntelligence=${success}`);
      if (success) {
        setStage('built');
        t(() => setStage('resonant'), 4500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
      } else {
        setStage('collapsed');
        t(() => { setPlaced([]); setAvailable([...PLANKS]); setStage('active'); }, 2500);
      }
    }
  };

  const plankColor = (p: Plank) => {
    if (p === 'Validation') return themeColor(TH.accentHSL, 0.15, 10);
    if (p === 'Defense') return themeColor([0, 20, 35], 0.1, 4);
    return themeColor(TH.primaryHSL, 0.1, 6);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="knowing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '80px', alignItems: 'center' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.15, 8) }} />
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: themeColor(TH.primaryHSL, 0.12, 6) }} />
            </div>
            <div style={{ width: '80px', height: '3px', background: themeColor(TH.primaryHSL, 0.05, 3) }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the chasm</div>
          </motion.div>
        )}
        {(stage === 'active' || stage === 'collapsed') && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            {stage === 'collapsed' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ ...navicueType.hint, color: 'hsla(0, 40%, 45%, 0.5)', textAlign: 'center' }}>
                The bridge collapsed. Defense first breaks trust. Try again.
              </motion.div>
            )}
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Place the planks to cross. Order matters.
            </div>
            {/* Bridge visualization */}
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '60px', height: '10px', borderRadius: '3px',
                  background: placed[i] ? plankColor(placed[i]) : themeColor(TH.primaryHSL, 0.04, 2),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {placed[i] && <span style={{ fontSize: '11px', color: themeColor(TH.accentHSL, 0.4, 12) }}>{placed[i]}</span>}
                </div>
              ))}
            </div>
            {/* Available planks */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {available.map(p => (
                <motion.div key={p} whileTap={{ scale: 0.95 }} onClick={() => placePlank(p)}
                  style={{ padding: '8px 16px', borderRadius: radius.lg, cursor: 'pointer',
                    background: plankColor(p),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 8)}` }}>
                  <div style={{ ...navicueType.choice, color: palette.text, fontSize: '11px' }}>{p}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'built' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {placed.map((p, i) => (
                <motion.div key={i} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.3 }}
                  style={{ width: '60px', height: '10px', borderRadius: '3px', background: plankColor(p) }} />
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              Validate first. Then explain. Then, if needed, defend. The bridge holds.
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Relational intelligence. Validation before explanation is the cornerstone of non-violent communication. The sequence matters: feelings acknowledged first create the safety needed for understanding.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Bridged.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}