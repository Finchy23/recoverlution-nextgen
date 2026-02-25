/**
 * ARCHITECT II #8 — The Doubt Dungeon
 * "Doubt is a tenant. It pays rent (Caution). Don't give it the penthouse keys."
 * Pattern A (Tap) — Visit doubt in the basement, acknowledge it, leave it there
 * STEALTH KBE: Acknowledging but containing = Compartmentalization / Self-Doubt Management (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { COGNITIVE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Structuring', 'knowing', 'Circuit');
type Stage = 'arriving' | 'visiting' | 'contained' | 'resonant' | 'afterglow';

const DOUBTS = ['I might fail', 'I\'m not ready', 'They\'ll judge me', 'What if it\'s wrong?'];

export default function Cognitive_DoubtDungeon({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [doubt, setDoubt] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('visiting'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const acknowledge = (d: string) => {
    if (stage !== 'visiting') return;
    setDoubt(d);
  };

  const leave = () => {
    if (!doubt) return;
    console.log(`[KBE:K] DoubtDungeon doubt="${doubt}" compartmentalization=confirmed selfDoubtManagement=true`);
    setStage('contained');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Structuring" kbe="knowing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '20px', height: '24px', borderRadius: '0 0 2px 2px',
              background: themeColor(TH.primaryHSL, 0.03, 1) }} />
          </motion.div>
        )}
        {stage === 'visiting' && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A dark basement. The Doubts live here. Visit them. Acknowledge one. Then leave — do not give them the penthouse keys.
            </div>
            {/* Dungeon */}
            <div style={{ width: '100px', height: '50px', borderRadius: '0 0 4px 4px',
              background: themeColor(TH.primaryHSL, 0.02, 0),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}`, borderTop: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '3px', padding: '6px' }}>
              {DOUBTS.map(d => (
                <motion.span key={d} whileTap={{ scale: 0.9 }} onClick={() => acknowledge(d)}
                  style={{ fontSize: '11px', cursor: 'pointer', padding: '12px 18px', borderRadius: '3px',
                    color: doubt === d ? themeColor(TH.accentHSL, 0.3, 10) : palette.textFaint,
                    background: doubt === d ? themeColor(TH.accentHSL, 0.04, 2) : 'transparent' }}>
                  {d}
                </motion.span>
              ))}
            </div>
            {doubt && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                whileTap={{ scale: 0.9 }} onClick={leave}
                style={immersiveTapPillThemed(TH.accentHSL).container}>
                <div style={immersiveTapPillThemed(TH.accentHSL).label}>Acknowledge & Leave</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'contained' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Acknowledged: "{doubt}" — and left in the basement. Doubt is a tenant. It pays rent in the form of Caution. You can let it live in the basement, but do not give it the keys to the penthouse. The skill is not eliminating doubt — it{"'"}s containing it. You visited. You listened. You went upstairs.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Healthy compartmentalization. Unlike pathological dissociation, healthy compartmentalization is the ability to contain distressing thoughts in one "room" while functioning in another. Albert Bandura{"'"}s self-efficacy research: the goal is not certainty — it{"'"}s action despite uncertainty. High performers don{"'"}t eliminate doubt; they domesticate it. The dungeon metaphor: doubt becomes a consultant, not a commander.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Contained.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}