/**
 * FUTURIST #8 — The Mono-Task
 * "Multitasking is a myth. Do one thing brilliantly."
 * INTERACTION: A grid of app icons. Each tap dims one icon — 5 taps.
 * A spotlight contracts around the surviving single icon.
 * At the end: only one icon remains, glowing. Everything else is black.
 * Single-tasking restores IQ.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Circuit');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const DIM_STEPS = 5;
const ICONS = [
  { label: 'Mail', x: 45, y: 40, hue: 210 },
  { label: 'Chat', x: 90, y: 40, hue: 160 },
  { label: 'Feed', x: 135, y: 40, hue: 200 },
  { label: 'News', x: 180, y: 40, hue: 0 },
  { label: 'Video', x: 45, y: 80, hue: 350 },
  { label: 'Work', x: 90, y: 80, hue: 42 }, // The survivor
  { label: 'Music', x: 135, y: 80, hue: 280 },
  { label: 'Shop', x: 180, y: 80, hue: 30 },
  { label: 'Maps', x: 45, y: 120, hue: 120 },
  { label: 'Cal', x: 90, y: 120, hue: 190 },
  { label: 'Pics', x: 135, y: 120, hue: 320 },
  { label: 'Game', x: 180, y: 120, hue: 260 },
];

// Which icons dim at each step (indices)
const DIM_ORDER = [
  [0, 3, 11],   // step 1: Mail, News, Game
  [2, 7],       // step 2: Feed, Shop
  [4, 6],       // step 3: Video, Music
  [1, 10],      // step 4: Chat, Pics
  [8, 9],       // step 5: Maps, Cal
];
const SURVIVOR = 5; // "Work" stays

export default function Futurist_MonoTask({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [dimmed, setDimmed] = useState(0);
  const [dimmedSet, setDimmedSet] = useState<Set<number>>(new Set());
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const dim = () => {
    if (stage !== 'active' || dimmed >= DIM_STEPS) return;
    const next = dimmed + 1;
    setDimmed(next);
    const newSet = new Set(dimmedSet);
    DIM_ORDER[dimmed].forEach(i => newSet.add(i));
    setDimmedSet(newSet);
    if (next >= DIM_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = dimmed / DIM_STEPS;
  const full = t >= 1;
  const spotlightR = full ? 22 : 100 - t * 70;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Twelve things at once...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Multitasking is a myth. It is just rapid switching that makes you stupid. One app. One goal. Everything else is noise.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to dim the distractions</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={dim}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: dimmed >= DIM_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '170px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(0, 0%, ${3 + (1 - t) * 2}%, 0.95)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Spotlight mask */}
                <defs>
                  <radialGradient id={`${svgId}-spotMono`} cx="40.9%" cy="47.1%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset={`${Math.max(10, spotlightR)}%`} stopColor="transparent" />
                    <stop offset={`${Math.min(100, spotlightR + 20)}%`} stopColor="hsla(0,0%,2%,0.85)" />
                  </radialGradient>
                </defs>

                {/* App icons */}
                {ICONS.map((icon, i) => {
                  const isDimmed = dimmedSet.has(i);
                  const isSurvivor = i === SURVIVOR;
                  return (
                    <motion.g key={i}
                      initial={{ opacity: 0.35 }}
                      animate={{
                        opacity: isDimmed ? 0.015 : isSurvivor && full ? 0.8 : 0.35 - t * 0.15
                      }}
                      transition={{ duration: 0.6 }}>
                      <rect x={icon.x - 12} y={icon.y - 12} width="24" height="24" rx="5"
                        fill={`hsla(${icon.hue}, ${isSurvivor && full ? 18 : 10}%, ${isSurvivor && full ? 30 : 15}%, ${isDimmed ? 0.01 : isSurvivor && full ? 0.12 : 0.05})`}
                        stroke={`hsla(${icon.hue}, ${8}%, ${20}%, ${isDimmed ? 0 : 0.04})`}
                        strokeWidth={safeSvgStroke(0.3)} />
                      <text x={icon.x} y={icon.y + 2} textAnchor="middle" fontSize="4" fontFamily="monospace"
                        fill={`hsla(${icon.hue}, ${8}%, ${isDimmed ? 12 : isSurvivor && full ? 50 : 30}%, ${isDimmed ? 0.02 : isSurvivor && full ? 0.25 : 0.1})`}>
                        {icon.label}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Spotlight vignette overlay */}
                {t > 0 && (
                  <rect x="0" y="0" width="220" height="170" fill={`url(#${svgId}-spotMono)`} />
                )}

                {/* Survivor glow */}
                {full && (
                  <motion.circle cx={ICONS[SURVIVOR].x} cy={ICONS[SURVIVOR].y}
                    r="20" fill="hsla(42, 15%, 35%, 0.04)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}
                    transition={{ duration: 2 }}
                  />
                )}

                {/* IQ readout */}
                <text x="195" y="162" textAnchor="end" fontSize="3.5" fontFamily="monospace"
                  fill={`hsla(0, 0%, ${20 + t * 12}%, ${0.04 + t * 0.03})`}>
                  focus: {Math.round(t * 100)}%
                </text>

                {/* Status */}
                <text x="15" y="162" fontSize="4.5" fontFamily="monospace"
                  fill={`hsla(${full ? 42 : 0}, ${6 + t * 8}%, ${22 + t * 10}%, ${0.05 + t * 0.04})`}>
                  {full ? 'one thing. brilliantly.' : `${12 - dimmedSet.size} apps active`}
                </text>
              </svg>
            </div>
            <motion.div key={dimmed} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {dimmed === 0 ? 'Twelve icons. Twelve distractions. Your IQ is leaking.' : dimmed < DIM_STEPS ? `${DIM_ORDER[dimmed - 1].length} more gone dark. Spotlight tightening.` : 'One icon left. Everything else is black. Do one thing brilliantly.'}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: DIM_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < dimmed ? 'hsla(42, 18%, 45%, 0.5)' : palette.primaryFaint, opacity: i < dimmed ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Twelve icons became one. The spotlight closed in. Mail, gone. Feed, gone. Chat, news, video, music, shop, maps, calendar, pictures, game, all gone. One icon. One goal. One hundred percent focus. Do one thing brilliantly.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Switch cost effect. Every time you switch tasks, you lose approximately twenty percent of cognitive efficiency due to attentional residue. Single-tasking restores IQ.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Twelve. One. Brilliant.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}