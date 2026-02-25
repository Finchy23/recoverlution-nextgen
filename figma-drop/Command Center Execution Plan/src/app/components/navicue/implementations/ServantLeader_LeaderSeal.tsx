/**
 * SERVANT LEADER #10 — The Leader's Seal (The Proof)
 * "Leadership is a shield, not a sword. Take the hit."
 * INTERACTION: A shield materialises piece by piece. Each tap adds
 * a layer — the shield grows stronger. Impact marks appear but the
 * shield holds. You protect the team. Self-sacrifice signal.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('witness_ritual', 'Exposure', 'embodying', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const LAYERS = [
  { label: 'The frame. Outline only.', opacity: 0.2 },
  { label: 'First layer. Taking shape.', opacity: 0.3 },
  { label: 'Reinforced. Stronger now.', opacity: 0.4 },
  { label: 'Hardened. Impact-tested.', opacity: 0.5 },
  { label: 'The Shield. Unbreakable.', opacity: 0.65 },
];

export default function ServantLeader_LeaderSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [layer, setLayer] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const forge = () => {
    if (stage !== 'active' || layer >= LAYERS.length - 1) return;
    const next = layer + 1;
    setLayer(next);
    if (next >= LAYERS.length - 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
    }
  };

  const t = layer / (LAYERS.length - 1);
  const current = LAYERS[layer];
  const shieldFill = `hsla(220, ${15 + t * 20}%, ${25 + t * 15}%, ${current.opacity})`;
  const shieldStroke = `hsla(220, ${15 + t * 15}%, ${35 + t * 15}%, ${0.3 + t * 0.25})`;

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Exposure" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A shield forms...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Leadership is a shield, not a sword. I protect the team. Take the hit.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to forge the shield</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={forge}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', cursor: layer >= LAYERS.length - 1 ? 'default' : 'pointer', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '190px', height: '170px', borderRadius: radius.md, overflow: 'hidden', background: 'hsla(220, 10%, 8%, 0.25)' }}>
              <svg width="100%" height="100%" viewBox="0 0 190 170" style={{ position: 'absolute', inset: 0 }}>
                {/* Shield shape — heraldic */}
                <motion.path
                  d="M 95 20 L 145 40 L 145 90 Q 145 130, 95 150 Q 45 130, 45 90 L 45 40 Z"
                  fill={shieldFill}
                  stroke={shieldStroke}
                  strokeWidth={1.5 + t}
                  animate={{ fill: shieldFill, stroke: shieldStroke }}
                  transition={{ duration: 0.8 }}
                />
                {/* Inner field lines — structure */}
                {t > 0.25 && (
                  <motion.path
                    d="M 95 35 L 135 50 L 135 88 Q 135 120, 95 137 Q 55 120, 55 88 L 55 50 Z"
                    fill="none" stroke={`hsla(220, 20%, 40%, ${(t - 0.25) * 0.2})`}
                    strokeWidth="0.5"
                    initial={{ opacity: 0 }} animate={{ opacity: (t - 0.25) * 0.25 }}
                  />
                )}
                {/* Central emblem — cross/star */}
                {t > 0.5 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: (t - 0.5) * 0.6 }} transition={{ duration: 1 }}>
                    <line x1="95" y1="60" x2="95" y2="110" stroke={`hsla(220, 20%, 50%, ${(t - 0.5) * 0.3})`} strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="70" y1="85" x2="120" y2="85" stroke={`hsla(220, 20%, 50%, ${(t - 0.5) * 0.3})`} strokeWidth="1.5" strokeLinecap="round" />
                  </motion.g>
                )}
                {/* Impact marks — battle-tested */}
                {layer >= 3 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 0.5 }}>
                    <line x1="65" y1="55" x2="72" y2="62" stroke="hsla(0, 0%, 40%, 0.15)" strokeWidth="0.8" />
                    <line x1="120" y1="70" x2="125" y2="76" stroke="hsla(0, 0%, 40%, 0.12)" strokeWidth="0.6" />
                    <circle cx="80" cy="100" r="2" fill="none" stroke="hsla(0, 0%, 40%, 0.1)" strokeWidth="0.5" />
                  </motion.g>
                )}
                {/* People behind shield — protected */}
                {t > 0.5 && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: (t - 0.5) * 0.25 }} transition={{ delay: 0.3 }}>
                    {[155, 165, 175].map((x, i) => (
                      <g key={i}>
                        <circle cx={x} cy={70 + i * 15} r="3" fill={`hsla(45, 20%, 45%, ${(t - 0.5) * 0.2})`} />
                        <rect x={x - 2} y={73 + i * 15} width="4" height="8" rx="1" fill={`hsla(45, 20%, 42%, ${(t - 0.5) * 0.15})`} />
                      </g>
                    ))}
                  </motion.g>
                )}
                {/* Glow at completion */}
                {layer >= LAYERS.length - 1 && (
                  <motion.ellipse cx="95" cy="85" rx="55" ry="70"
                    fill="hsla(220, 25%, 50%, 0.02)"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.05 }}
                    transition={{ duration: 2 }}
                  />
                )}
              </svg>
            </div>
            <motion.div key={layer} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: layer >= LAYERS.length - 1 ? 'normal' : 'italic', fontWeight: layer >= LAYERS.length - 1 ? 500 : 400 }}>
                {current.label}
              </div>
            </motion.div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {LAYERS.map((_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i <= layer ? `hsla(220, ${20 + i * 5}%, ${35 + i * 5}%, 0.5)` : palette.primaryFaint, opacity: i <= layer ? 0.6 : 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, fontWeight: 500 }}>The shield holds. Not a sword, but a shield. The team is protected. Leadership is sacrifice.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Self-sacrifice signal transmitted. Costly signaling complete. Maximal loyalty and trust earned.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Shield. Serve. Protect.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}