/**
 * BENDER #8 — The Invisible Hand
 * "Don't carry the water. Build a pipeline."
 * ARCHETYPE: Pattern A (Tap × 5) — Each tap automates one chess piece.
 * Pieces start moving by themselves. At 5: the whole board plays alone.
 * Choice architecture. Design the default.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Metacognition', 'believing', 'Practice');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const AUTO_STEPS = 5;
// Chess pieces that get automated
const PIECES = [
  { x: 35, y: 110, type: '♟', label: 'habits' },
  { x: 75, y: 90, type: '♜', label: 'systems' },
  { x: 115, y: 70, type: '♞', label: 'defaults' },
  { x: 155, y: 50, type: '♝', label: 'environment' },
  { x: 95, y: 35, type: '♛', label: 'pipeline' },
];

export default function Bender_InvisibleHand({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [automated, setAutomated] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const automate = () => {
    if (stage !== 'active' || automated >= AUTO_STEPS) return;
    const next = automated + 1;
    setAutomated(next);
    if (next >= AUTO_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = automated / AUTO_STEPS;

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The board is setting itself...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Don't carry the water. Build a pipeline. Design the default so you cannot fail. Set the system up so it works while you sleep.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to automate each piece</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={automate}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: automated >= AUTO_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 3) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Chessboard grid (simplified) */}
                {Array.from({ length: 5 }, (_, r) =>
                  Array.from({ length: 5 }, (_, c) => (
                    <rect key={`${r}-${c}`} x={20 + c * 32} y={20 + r * 24} width="32" height="24"
                      fill={(r + c) % 2 === 0 ? themeColor(TH.primaryHSL, 0.02, 5) : 'transparent'}
                      stroke={themeColor(TH.primaryHSL, 0.02)} strokeWidth={safeSvgStroke(0.3)} />
                  ))
                )}

                {/* Chess pieces */}
                {PIECES.map((piece, i) => {
                  const isAuto = i < automated;
                  return (
                    <motion.g key={i}
                      initial={{ y: 0 }}
                      animate={isAuto ? { y: [0, -3, 0, -2, 0] } : {}}
                      transition={isAuto ? { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' } : {}}>
                      {/* Piece */}
                      <text x={piece.x} y={piece.y} textAnchor="middle" fontSize={i === 4 ? '16' : '12'}
                        fill={isAuto
                          ? themeColor(TH.accentHSL, 0.16, 15)
                          : themeColor(TH.primaryHSL, 0.06, 10)
                        }>
                        {piece.type}
                      </text>
                      {/* Automation glow */}
                      {isAuto && (
                        <motion.circle cx={piece.x} cy={piece.y - 5} r="10"
                          fill={themeColor(TH.accentHSL, 0.03, 8)}
                          initial={{ r: 10, opacity: 0.12 }}
                          animate={{ r: [10, 13, 10], opacity: [0.03, 0.04, 0.03] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      {/* Label */}
                      <text x={piece.x} y={piece.y + 12} textAnchor="middle" fontSize="3" fontFamily="monospace"
                        fill={themeColor(TH.primaryHSL, isAuto ? 0.08 : 0.04, 10)}>
                        {piece.label}
                      </text>
                    </motion.g>
                  );
                })}

                {/* Connection lines between automated pieces */}
                {automated >= 2 && PIECES.slice(0, automated).map((piece, i) => {
                  if (i === 0) return null;
                  const prev = PIECES[i - 1];
                  return (
                    <motion.line key={`conn-${i}`}
                      x1={prev.x} y1={prev.y - 5} x2={piece.x} y2={piece.y - 5}
                      stroke={themeColor(TH.accentHSL, 0.04, 10)}
                      strokeWidth="0.4" strokeDasharray="2 1"
                      initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
                    />
                  );
                })}

                <text x="100" y="152" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'AUTONOMOUS. it plays while you sleep' : `automated: ${automated}/${AUTO_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {automated === 0 ? 'Five pieces on the board. All waiting for you to move them.' : automated < AUTO_STEPS ? `${PIECES[automated - 1].label} automated. It moves on its own now.` : 'The whole board plays itself. The pipeline is built.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: AUTO_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < automated ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five automations. Habits, automated. Systems, automated. Defaults, environment, pipeline, all moving on their own. Connected by invisible threads. The board plays itself now. You are not carrying water. You built the pipeline. It works while you sleep.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Choice architecture. Designing the environment so the desired behavior is the automatic default option removes the need for willpower. Build the pipeline.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Piece. Automate. Sleep.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}