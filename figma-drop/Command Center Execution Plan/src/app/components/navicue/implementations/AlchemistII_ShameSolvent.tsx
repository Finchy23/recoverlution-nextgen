/**
 * ALCHEMIST II #8 -- The Shame Solvent
 * "Shame cannot survive being seen. Show it to one person. Watch it evaporate."
 * INTERACTION: A dark stain on fabric. Each tap applies a drop of
 * "Truth" (light) to the stain. It dissolves, spreading into clarity.
 * Isolation → connection. The biological antidote.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Self-Compassion', 'embodying', 'Ember');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DROPS = 5;

export default function AlchemistII_ShameSolvent({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [applied, setApplied] = useState(0);
  const [dropPoints, setDropPoints] = useState<{ x: number; y: number }[]>([]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const applyTruth = () => {
    if (stage !== 'active' || applied >= DROPS) return;
    const next = applied + 1;
    setApplied(next);
    setDropPoints(prev => [...prev, {
      x: 90 + Math.random() * 40,
      y: 60 + Math.random() * 30,
    }]);
    if (next >= DROPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
    }
  };

  const dissolved = applied / DROPS;
  const stainOpacity = Math.max(0, 0.4 - dissolved * 0.4);

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A dark stain...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Shame cannot survive being seen. Show it to one person. Watch it evaporate.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to apply truth</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={applyTruth}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: applied >= DROPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '150px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(270, 10%, 10%, 0.4)' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 150" style={{ position: 'absolute', inset: 0 }}>
                {/* Fabric texture -- weave lines */}
                {Array.from({ length: 12 }, (_, i) => (
                  <g key={`w${i}`}>
                    <line x1={0} y1={i * 13} x2={220} y2={i * 13}
                      stroke="hsla(270, 5%, 18%, 0.1)" strokeWidth={safeSvgStroke(0.3)} />
                    {/* Inner rectangle */}
                    <rect x="90" y="45" width="60" height="30" rx="4" fill="none"
                      stroke="hsla(270, 5%, 18%, 0.08)" strokeWidth={safeSvgStroke(0.3)} />
                  </g>
                ))}
                {/* Dark stain -- dissolves */}
                <motion.ellipse cx="110" cy="75" rx={45} ry={30}
                  fill={`hsla(280, 15%, 10%, ${stainOpacity})`}
                  initial={{ opacity: stainOpacity }}
                  animate={{ opacity: stainOpacity }}
                  transition={{ duration: 0.8 }}
                />
                <motion.ellipse cx="105" cy="70" rx={30} ry={20}
                  fill={`hsla(280, 20%, 8%, ${stainOpacity * 1.2})`}
                  initial={{ opacity: stainOpacity * 1.2 }}
                  animate={{ opacity: stainOpacity * 1.2 }}
                />
                {/* Edge of stain -- ragged */}
                <motion.ellipse cx="125" cy="80" rx={20} ry={15}
                  fill={`hsla(280, 12%, 12%, ${stainOpacity * 0.8})`}
                  initial={{ opacity: stainOpacity * 0.8 }}
                  animate={{ opacity: stainOpacity * 0.8 }}
                />
                {/* Truth drops -- light expanding */}
                {dropPoints.map((dp, i) => (
                  <motion.g key={i}>
                    <motion.circle cx={dp.x} cy={dp.y} r={3}
                      fill="hsla(45, 50%, 70%, 0.4)"
                      initial={{ r: 2, opacity: 0.6 }}
                      animate={{ r: 15 + i * 3, opacity: 0 }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                    <motion.circle cx={dp.x} cy={dp.y} r={2}
                      fill="hsla(45, 60%, 75%, 0.3)"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                    />
                  </motion.g>
                ))}
                {/* Clarity glow -- appears as stain dissolves */}
                {dissolved > 0.5 && (
                  <motion.ellipse cx="110" cy="75" rx={30} ry={20}
                    fill={`hsla(45, 30%, 60%, ${(dissolved - 0.5) * 0.06})`}
                    initial={{ opacity: 0 }} animate={{ opacity: (dissolved - 0.5) * 0.08 }}
                    transition={{ duration: 1.5 }}
                  />
                )}
              </svg>
              {/* Label */}
              <div style={{ position: 'absolute', bottom: '8px', right: '10px', fontFamily: 'monospace', fontSize: '11px', color: `hsla(45, 30%, 55%, ${dissolved * 0.4})` }}>
                {applied > 0 ? `truth × ${applied}` : ''}
              </div>
            </div>
            <motion.div key={applied} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {applied === 0 ? 'The dark stain on the fabric.' : applied < DROPS ? `Truth applied. Dissolving...` : 'Dissolved. The fabric is clean.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: DROPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < applied ? 'hsla(45, 50%, 65%, 0.5)' : palette.primaryFaint, opacity: i < applied ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Shame evaporated under the light. It could not survive being seen.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Social safety buffering. Connection is the biological antidote. Threat response downregulated.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Seen. Dissolved. Clean.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}