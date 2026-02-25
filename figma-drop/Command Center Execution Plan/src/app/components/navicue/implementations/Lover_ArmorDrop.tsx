/**
 * LOVER #1 — The Armor Drop
 * "You cannot be intimate and defended at the same time."
 * INTERACTION: A heavy chest plate hovers. Each tap loosens a strap —
 * buckle, shoulder, spine-clasp, heart-guard, final release. The armor
 * clatters down with a settling animation. Silence. Beneath: exposed skin-tone warmth.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Self-Compassion', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const STRAP_STEPS = 5;
const STRAP_LABELS = ['buckle loosened', 'shoulder strap freed', 'spine-clasp released', 'heart-guard unlatched', 'armor falls'];

export default function Lover_ArmorDrop({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [straps, setStraps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const loosen = () => {
    if (stage !== 'active' || straps >= STRAP_STEPS) return;
    const next = straps + 1;
    setStraps(next);
    if (next >= STRAP_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = straps / STRAP_STEPS;
  const dropped = t >= 1;
  const armorY = dropped ? 130 : 40;
  const armorOpacity = dropped ? 0.06 : (0.2 - t * 0.08);
  const warmth = t * 0.15;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Self-Compassion" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Something heavy waits...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You cannot be intimate and defended at the same time. The risk is the price of admission.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to loosen each strap</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={loosen}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: straps >= STRAP_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '200px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(15, ${12 + warmth * 80}%, ${7 + warmth * 5}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Warmth glow beneath — grows as armor loosens */}
                <defs>
                  <radialGradient id={`${svgId}-loverWarmth`} cx="50%" cy="45%">
                    <stop offset="0%" stopColor={`hsla(15, 35%, 45%, ${warmth})`} />
                    <stop offset="70%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="200" height="180" fill={`url(#${svgId}-loverWarmth)`} />

                {/* Chest plate — descends when dropped */}
                <motion.g
                  animate={{ y: armorY - 40, opacity: armorOpacity }}
                  transition={{ type: 'spring', stiffness: dropped ? 200 : 60, damping: dropped ? 8 : 15 }}>
                  {/* Main plate */}
                  <path d="M 65 40 Q 100 30, 135 40 L 130 100 Q 100 110, 70 100 Z"
                    fill={`hsla(210, 6%, 22%, ${armorOpacity})`}
                    stroke={`hsla(210, 8%, 28%, ${armorOpacity * 0.4})`} strokeWidth="0.8" />
                  {/* Ridge lines */}
                  <line x1="100" y1="35" x2="100" y2="105" stroke={`hsla(210, 5%, 25%, ${armorOpacity * 0.3})`} strokeWidth="0.4" />
                  <line x1="80" y1="45" x2="78" y2="95" stroke={`hsla(210, 5%, 25%, ${armorOpacity * 0.2})`} strokeWidth="0.3" />
                  <line x1="120" y1="45" x2="122" y2="95" stroke={`hsla(210, 5%, 25%, ${armorOpacity * 0.2})`} strokeWidth="0.3" />
                  {/* Straps — disappearing one by one */}
                  {straps < 1 && <line x1="63" y1="45" x2="55" y2="42" stroke="hsla(30, 10%, 30%, 0.12)" strokeWidth="1.5" />}
                  {straps < 2 && <line x1="137" y1="45" x2="145" y2="42" stroke="hsla(30, 10%, 30%, 0.12)" strokeWidth="1.5" />}
                  {straps < 3 && <line x1="100" y1="108" x2="100" y2="118" stroke="hsla(30, 10%, 30%, 0.1)" strokeWidth="1" />}
                  {straps < 4 && (
                    <circle cx="100" cy="65" r="8" fill="none" stroke="hsla(210, 8%, 28%, 0.08)" strokeWidth="0.5" />
                  )}
                </motion.g>

                {/* Exposed warmth — visible when armor drops */}
                {dropped && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: 2 }}>
                    <ellipse cx="100" cy="70" rx="30" ry="35"
                      fill="hsla(15, 25%, 40%, 0.06)" />
                    <text x="100" y="75" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill="hsla(15, 20%, 45%, 0.15)">
                      undefended
                    </text>
                  </motion.g>
                )}

                {/* Clatter marks — impact lines on floor */}
                {dropped && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} transition={{ delay: 0.2, duration: 0.5 }}>
                    {[85, 100, 115].map((x, i) => (
                      <line key={i} x1={x} y1="152" x2={x + (i - 1) * 3} y2="158"
                        stroke="hsla(210, 6%, 30%, 0.08)" strokeWidth="0.5" />
                    ))}
                  </motion.g>
                )}

                {/* Silence text */}
                {dropped && (
                  <motion.text x="100" y="172" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill="hsla(15, 15%, 40%, 0.12)" letterSpacing="3"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ delay: 1, duration: 2 }}>
                    silence
                  </motion.text>
                )}
              </svg>
            </div>
            <motion.div key={straps} initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {straps === 0 ? 'The armor. Heavy. Waiting.' : STRAP_LABELS[straps - 1]}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '5px' }}>
              {Array.from({ length: STRAP_STEPS }, (_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < straps ? 'hsla(15, 25%, 50%, 0.5)' : palette.primaryFaint, opacity: i < straps ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The armor on the floor. Heavy silence. Beneath it, warmth. You entered the room without your defense. The risk is the price of admission.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Vagal brake release. Disengaging the social defense system allows facial expressivity and co-regulation. Vulnerability is not weakness; it is the nervous system choosing connection over protection.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Armor. Floor. Warmth.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}