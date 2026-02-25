/**
 * BENDER #10 — The Bender's Seal (The Proof)
 * "I am the cause."
 * ARCHETYPE: Pattern A (Tap × 5) — A fingerprint at center.
 * Each tap expands it — the ridges become spiral arms.
 * Fingerprint → galaxy. "You are not a passenger. You are the driver."
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BENDER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'IdentityKoan');
const TH = BENDER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const EXPAND_STEPS = 5;

// Spiral arm generator
function spiralPoints(cx: number, cy: number, maxR: number, turns: number, offset: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const angle = (i / 80) * turns * Math.PI * 2 + offset;
    const r = (i / 80) * maxR;
    pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
  }
  return `M ${pts.join(' L ')}`;
}

export default function Bender_BenderSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [expanded, setExpanded] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const expand = () => {
    if (stage !== 'active' || expanded >= EXPAND_STEPS) return;
    const next = expanded + 1;
    setExpanded(next);
    if (next >= EXPAND_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 6000); }, 4000);
    }
  };

  const t = expanded / EXPAND_STEPS;
  const maxR = 15 + t * 65;
  const turns = 2 + t * 1.5;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A fingerprint forming...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>You are not a passenger. You are the driver. Drive. I am the cause.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to expand, fingerprint to galaxy</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={expand}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: expanded >= EXPAND_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '190px', borderRadius: '50%', overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 190 190" style={{ position: 'absolute', inset: 0 }}>
                {/* Spiral arms — fingerprint ridges that become galaxy arms */}
                {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((offset, i) => (
                  <motion.path key={i}
                    d={spiralPoints(95, 95, maxR, turns, offset)}
                    fill="none"
                    stroke={themeColor(
                      i % 2 === 0 ? TH.accentHSL : TH.primaryHSL,
                      0.05 + t * 0.06,
                      10 + t * 10
                    )}
                    strokeWidth={safeSvgStroke(0.3)}
                    strokeLinecap="round"
                    initial={{ d: spiralPoints(95, 95, maxR, turns, offset) }}
                    animate={{ d: spiralPoints(95, 95, maxR, turns, offset) }}
                    transition={{ type: 'spring', stiffness: 30 }}
                  />
                ))}

                {/* Additional fingerprint ridges — concentric ellipses at low t */}
                {t < 0.6 && Array.from({ length: 5 }, (_, i) => (
                  <ellipse key={`ridge-${i}`} cx="95" cy="95"
                    rx={8 + i * 4} ry={6 + i * 3}
                    fill="none"
                    stroke={themeColor(TH.primaryHSL, 0.03 * (1 - t), 8)}
                    strokeWidth="0.5"
                    transform={`rotate(${15 + i * 5}, 95, 95)`}
                  />
                ))}

                {/* Stars — appear as galaxy forms */}
                {t > 0.4 && Array.from({ length: Math.floor(t * 30) }, (_, i) => {
                  const angle = (i / 30) * Math.PI * 2 + i * 0.7;
                  const r = 20 + (i * 7 + i * i) % (maxR - 10);
                  return (
                    <motion.circle key={`star-${i}`}
                      cx={95 + Math.cos(angle) * r * 0.8}
                      cy={95 + Math.sin(angle) * r * 0.8}
                      r={0.3 + (i % 3) * 0.2}
                      fill={themeColor(TH.accentHSL, 0.06 + (i % 4) * 0.02, 20)}
                      initial={{ opacity: 0 }} animate={{ opacity: safeOpacity(0.06 + (i % 4) * 0.02) }}
                      transition={{ delay: i * 0.05, duration: 0.8 }}
                    />
                  );
                })}

                {/* Core — fingerprint whorl / galactic center */}
                <motion.circle cx="95" cy="95" r={3 + t * 5}
                  fill={themeColor(TH.accentHSL, 0.06 + t * 0.06, 15)}
                  initial={{ r: 3 }}
                  animate={{ r: 3 + t * 5 }}
                />

                {/* "I AM THE CAUSE" at full expansion */}
                {t >= 1 && (
                  <motion.text x="95" y="180" textAnchor="middle" fontSize="5" fontFamily="monospace" fontWeight="bold"
                    fill={themeColor(TH.accentHSL, 0.14, 18)} letterSpacing="2"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.14 }}
                    transition={{ delay: 0.5, duration: 2 }}>
                    I AM THE CAUSE
                  </motion.text>
                )}
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {expanded === 0 ? 'A fingerprint. Tiny, unique, yours.' : expanded < EXPAND_STEPS ? `Expansion ${expanded}. Ridges becoming spiral arms.` : 'Galaxy. The fingerprint became the cosmos. You are the cause.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: EXPAND_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < expanded ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>Five expansions. A fingerprint, tiny, unique, yours, grew. The ridges became spiral arms. The whorl became a galactic center. Stars appeared. Your thumbprint became the universe. I am the cause. You are not a passenger. You are the driver. Drive.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>High agency. The personality trait associated with the conviction that one's actions determine outcomes. The direct opposite of learned helplessness. You are the cause.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center', fontWeight: 500 }}>
            Print. Galaxy. Cause.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}