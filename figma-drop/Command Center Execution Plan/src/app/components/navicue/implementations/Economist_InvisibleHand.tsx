/**
 * ECONOMIST #9 -- 1349. The Invisible Hand
 * "Trust the market. Order will emerge."
 * INTERACTION: Try to control chaotic dots (fail). Let go. They self-organize.
 * STEALTH KBE: Trust -- Spontaneous Order (B)
 *
 * COMPOSITOR: sacred_ordinary / Drift / morning / believing / tap / 1349
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Economist_InvisibleHand({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1349,
        isSeal: false,
      }}
      arrivalText="Chaos in the market."
      prompt="Self-interest organizes the system. Trust the market. Trust the people to pursue their own good. Order will emerge."
      resonantText="Trust. You stepped back and the market organized itself. Spontaneous order: complex systems do not require a central controller. They require freedom and feedback."
      afterglowCoda="Order emerges."
      onComplete={onComplete}
    >
      {(verse) => <InvisibleHandInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

interface Agent { x: number; y: number; vx: number; vy: number; type: 'buyer' | 'seller'; }

function InvisibleHandInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'chaos' | 'controlled' | 'released' | 'order'>('chaos');
  const W = 220, H = 150;
  const NUM = 16;

  const agentsRef = useRef<Agent[]>(
    Array.from({ length: NUM }).map((_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      type: i < NUM / 2 ? 'buyer' : 'seller',
    }))
  );
  const [agents, setAgents] = useState(agentsRef.current);

  useEffect(() => {
    const interval = setInterval(() => {
      const mode = phase;
      agentsRef.current = agentsRef.current.map((a, i, arr) => {
        let ax = 0, ay = 0;

        if (mode === 'controlled') {
          // Center force (trying to control -- makes it worse)
          ax += (W / 2 - a.x) * 0.01;
          ay += (H / 2 - a.y) * 0.01;
          // But chaotic jitter
          ax += (Math.random() - 0.5) * 1.5;
          ay += (Math.random() - 0.5) * 1.5;
        } else if (mode === 'released' || mode === 'order') {
          // Self-organizing: buyers seek sellers, form pairs
          const opposite = arr.filter(o => o.type !== a.type);
          if (opposite.length > 0) {
            // Find nearest opposite
            let nearest = opposite[0];
            let minD = Infinity;
            for (const o of opposite) {
              const d = Math.hypot(a.x - o.x, a.y - o.y);
              if (d < minD) { minD = d; nearest = o; }
            }
            if (minD > 15) {
              ax += (nearest.x - a.x) * 0.02;
              ay += (nearest.y - a.y) * 0.02;
            }
          }
          // Slight separation from same type
          for (const o of arr) {
            if (o === a || o.type !== a.type) continue;
            const d = Math.hypot(a.x - o.x, a.y - o.y);
            if (d < 25 && d > 0) {
              ax += (a.x - o.x) / d * 0.2;
              ay += (a.y - o.y) / d * 0.2;
            }
          }
        } else {
          // Chaos -- random drift
          ax += (Math.random() - 0.5) * 0.8;
          ay += (Math.random() - 0.5) * 0.8;
        }

        let vx = a.vx + ax;
        let vy = a.vy + ay;
        vx *= 0.92; vy *= 0.92; // friction

        const speed = Math.hypot(vx, vy);
        if (speed > 3) { vx = (vx / speed) * 3; vy = (vy / speed) * 3; }

        let x = a.x + vx, y = a.y + vy;
        if (x < 5) { x = 5; vx *= -0.5; }
        if (x > W - 5) { x = W - 5; vx *= -0.5; }
        if (y < 5) { y = 5; vy *= -0.5; }
        if (y > H - 5) { y = H - 5; vy *= -0.5; }

        return { ...a, x, y, vx, vy };
      });
      setAgents([...agentsRef.current]);
    }, 40);
    return () => clearInterval(interval);
  }, [phase]);

  const handleControl = () => {
    if (phase !== 'chaos') return;
    setPhase('controlled');
  };

  const handleRelease = () => {
    if (phase !== 'controlled') return;
    setPhase('released');
    setTimeout(() => {
      setPhase('order');
      setTimeout(() => verse.advance(), 3000);
    }, 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>market</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'order' ? verse.palette.accent
            : phase === 'controlled' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'order' ? 'organized'
            : phase === 'released' ? 'self-organizing...'
              : phase === 'controlled' ? 'worse'
                : 'chaos'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x={0} y={0} width={W} height={H} rx={6}
            fill={verse.palette.primary} opacity={safeOpacity(0.02)} />

          {agents.map((a, i) => (
            <g key={i}>
              {a.type === 'buyer' ? (
                <circle cx={a.x} cy={a.y} r={5}
                  fill={phase === 'order' ? verse.palette.accent : verse.palette.primary}
                  opacity={safeOpacity(phase === 'order' ? 0.25 : 0.12)} />
              ) : (
                <rect x={a.x - 4} y={a.y - 4} width={8} height={8} rx={1}
                  fill={phase === 'order' ? verse.palette.accent : verse.palette.primary}
                  opacity={safeOpacity(phase === 'order' ? 0.25 : 0.12)} />
              )}
            </g>
          ))}

          {/* Pairing lines (in order phase) */}
          {(phase === 'released' || phase === 'order') && (
            <g>
              {agents.filter(a => a.type === 'buyer').map((buyer, i) => {
                const sellers = agents.filter(a => a.type === 'seller');
                if (i >= sellers.length) return null;
                const seller = sellers[i];
                const d = Math.hypot(buyer.x - seller.x, buyer.y - seller.y);
                if (d > 30) return null;
                return (
                  <line key={`pair-${i}`}
                    x1={buyer.x} y1={buyer.y} x2={seller.x} y2={seller.y}
                    stroke={verse.palette.accent} strokeWidth={0.5}
                    opacity={safeOpacity(0.12)} />
                );
              })}
            </g>
          )}

          {/* Legend */}
          <g opacity={0.2}>
            <circle cx={12} cy={H - 10} r={3}
              fill={verse.palette.primary} />
            <text x={20} y={H - 7} fill={verse.palette.textFaint}
              style={{ fontSize: '6px' }}>buyer</text>
            <rect x={50} y={H - 13} width={6} height={6} rx={1}
              fill={verse.palette.primary} />
            <text x={60} y={H - 7} fill={verse.palette.textFaint}
              style={{ fontSize: '6px' }}>seller</text>
          </g>
        </svg>
      </div>

      {phase === 'chaos' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleControl}>
          try to control
        </motion.button>
      )}

      {phase === 'controlled' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleRelease}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        >
          step back
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'order' ? 'buyers found sellers. order emerged.'
          : phase === 'released' ? 'self-interest organizes the system...'
            : phase === 'controlled' ? 'control makes it worse. step back.'
              : 'chaos. buyers and sellers scattered.'}
      </span>

      {phase === 'order' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          spontaneous order
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'order' ? 'trust' : 'trust the market'}
      </div>
    </div>
  );
}
