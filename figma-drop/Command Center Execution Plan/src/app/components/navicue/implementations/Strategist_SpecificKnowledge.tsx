/**
 * STRATEGIST #8 — The Specific Knowledge
 * "No one can compete with you on being you."
 * INTERACTION: A DNA double helix, slowly rotating. Each tap
 * highlights a base pair — a unique trait. 5 traits illuminated.
 * The strand glows brighter as uniqueness compounds. Your play
 * that looks like work to others.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const TRAITS = 5;
const TRAIT_LABELS = ['curiosity', 'obsession', 'pattern', 'voice', 'play'];

export default function Strategist_SpecificKnowledge({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [found, setFound] = useState(0);
  const [helixPhase, setHelixPhase] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const tick = () => { setHelixPhase(p => p + 0.015); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const findTrait = () => {
    if (stage !== 'active' || found >= TRAITS) return;
    const next = found + 1;
    setFound(next);
    if (next >= TRAITS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    }
  };

  const t = found / TRAITS;

  // DNA helix points
  const buildHelix = () => {
    const strandA: string[] = [];
    const strandB: string[] = [];
    const basePairs: { x1: number; y1: number; x2: number; y2: number; idx: number }[] = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const prog = i / steps;
      const y = 20 + prog * 130;
      const phase = helixPhase + prog * Math.PI * 2;
      const xA = 100 + Math.sin(phase) * 25;
      const xB = 100 + Math.sin(phase + Math.PI) * 25;
      strandA.push(`${xA},${y}`);
      strandB.push(`${xB},${y}`);
      // Base pairs at regular intervals
      if (i % 6 === 3) {
        const pairIdx = Math.floor(i / 6);
        basePairs.push({ x1: xA, y1: y, x2: xB, y2: y, idx: pairIdx });
      }
    }
    return {
      pathA: `M ${strandA.join(' L ')}`,
      pathB: `M ${strandB.join(' L ')}`,
      basePairs,
    };
  };

  const { pathA, pathB, basePairs } = buildHelix();

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A strand spirals...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>What can you do that no one else can do? Double down on that. No one can compete with you on being you. Find your play that looks like work to others.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to illuminate each trait</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={findTrait}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: found >= TRAITS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(270, ${5 + t * 6}%, ${7 + t * 2}%, 0.3)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Helix glow */}
                <defs>
                  <radialGradient id={`${svgId}-helixGlow`} cx="50%" cy="50%">
                    <stop offset="0%" stopColor={`hsla(270, ${15 + t * 15}%, ${35 + t * 12}%, ${t * 0.06})`} />
                    <stop offset="70%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="100" cy="85" r="60" fill={`url(#${svgId}-helixGlow)`} />

                {/* Strand A */}
                <path d={pathA} fill="none"
                  stroke={`hsla(270, ${12 + t * 10}%, ${30 + t * 10}%, ${0.08 + t * 0.06})`}
                  strokeWidth={0.6 + t * 0.3} strokeLinecap="round" />
                {/* Strand B */}
                <path d={pathB} fill="none"
                  stroke={`hsla(270, ${12 + t * 10}%, ${30 + t * 10}%, ${0.06 + t * 0.04})`}
                  strokeWidth={0.6 + t * 0.3} strokeLinecap="round" />

                {/* Base pairs — lit up when found */}
                {basePairs.map((bp, i) => {
                  const lit = i < found;
                  return (
                    <g key={i}>
                      <line x1={bp.x1} y1={bp.y1} x2={bp.x2} y2={bp.y2}
                        stroke={lit ? `hsla(${270 + i * 18}, ${18 + i * 3}%, ${42 + i * 3}%, 0.15)` : 'hsla(270, 6%, 20%, 0.03)'}
                        strokeWidth={lit ? 0.8 : 0.3} />
                      {/* Trait label */}
                      {lit && i < TRAIT_LABELS.length && (
                        <motion.text
                          x={(bp.x1 + bp.x2) / 2} y={bp.y1 - 5}
                          textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                          fill={`hsla(${270 + i * 18}, 15%, 45%, 0.12)`}
                          initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                          transition={{ delay: 0.2 }}>
                          {TRAIT_LABELS[i]}
                        </motion.text>
                      )}
                    </g>
                  );
                })}

                {/* Uniqueness label */}
                {t >= 1 && (
                  <motion.text x="100" y="164" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(270, 18%, 48%, 0.18)" letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.18 }} transition={{ delay: 0.3, duration: 1.5 }}>
                    SPECIFIC
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={found} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {found === 0 ? 'A helix. Rotating. Traits hidden.' : found < TRAITS ? `"${TRAIT_LABELS[found - 1]}" illuminated. ${TRAITS - found} traits remain.` : 'Five traits lit. Your specific knowledge. Uncompetable.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: TRAITS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < found ? `hsla(${270 + i * 18}, 18%, 45%, 0.5)` : palette.primaryFaint, opacity: i < found ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five base pairs illuminated. Curiosity, obsession, pattern, voice, play: your specific knowledge, coded into the helix. No one can compete with you on being you.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Signature strengths. Aligning work with innate traits produces highest engagement and lowest burnout. Find your play that looks like work to everyone else.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Helix. Traits. Specific.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}