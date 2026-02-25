/**
 * HYDRODYNAMICIST #1 -- 1131. The Laminar Flow
 * "Turbulence is wasted energy. Streamline the ego."
 * INTERACTION: Turbulent water in a rough pipe -- drag to smooth it -- water becomes glass-like
 * STEALTH KBE: Smoothness -- efficiency (E)
 *
 * COMPOSITOR: sensory_cinema / Tide / morning / embodying / drag / 1131
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Hydrodynamicist_LaminarFlow({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Tide',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1131,
        isSeal: false,
      }}
      arrivalText="Turbulent water. Noisy."
      prompt="Turbulence is wasted energy. Laminar flow is silent, smooth, and fast. Stop splashing. Streamline the ego."
      resonantText="Smoothness. The water did not change. The pipe did. You removed the roughness that caused the chaos. Efficiency is not more force. It is less friction."
      afterglowCoda="Silent."
      onComplete={onComplete}
    >
      {(verse) => <LaminarFlowInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LaminarFlowInteraction({ verse }: { verse: any }) {
  const [smoothness, setSmoothness] = useState(0);
  const [done, setDone] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; vy: number }[]>([]);

  // Animate flow particles
  useEffect(() => {
    const interval = setInterval(() => {
      const turbulence = 1 - smoothness / 100;
      setParticles(prev => {
        const next = prev
          .map(p => ({
            ...p,
            x: p.x + 1.5,
            y: p.y + (Math.random() - 0.5) * turbulence * 8,
            vy: p.vy * 0.95,
          }))
          .filter(p => p.x < 200);
        if (Math.random() > 0.3) {
          const baseY = 50 + (Math.random() - 0.5) * (turbulence * 40);
          next.push({ id: Date.now() + Math.random(), x: 0, y: baseY, vy: (Math.random() - 0.5) * turbulence * 3 });
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [smoothness]);

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    const motion = Math.abs(info.delta.x) + Math.abs(info.delta.y);
    setSmoothness(prev => {
      const next = Math.min(100, prev + motion * 0.3);
      if (next >= 100 && !done) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, verse]);

  const pct = smoothness / 100;
  const turbulence = 1 - pct;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 200 / 100)}>
        {/* Pipe + flow */}
          {/* Pipe walls */}
          <div style={{
            position: 'absolute', top: 20, left: 0, right: 0, height: 1,
            background: verse.palette.primaryGlow,
            opacity: 0.15 + pct * 0.15,
            borderRadius: done ? 0 : turbulence * 3,
          }} />
          <div style={{
            position: 'absolute', bottom: 20, left: 0, right: 0, height: 1,
            background: verse.palette.primaryGlow,
            opacity: 0.15 + pct * 0.15,
          }} />

          {/* Flow particles */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              left: p.x, top: p.y,
              width: done ? 12 : 3 + turbulence * 4,
              height: done ? 1 : 2 + turbulence * 2,
              borderRadius: 1,
              background: done
                ? `hsla(200, 40%, 65%, 0.4)`
                : `hsla(200, ${Math.round(20 + pct * 30)}%, ${Math.round(40 + pct * 20)}%, ${0.2 + pct * 0.2})`,
            }} />
          ))}

          {/* Roughness indicators */}
          {!done && turbulence > 0.3 && Array.from({ length: Math.floor(turbulence * 6) }).map((_, i) => (
            <div key={`r${i}`} style={{
              position: 'absolute',
              left: 20 + i * 30, top: i % 2 === 0 ? 18 : 78,
              width: 4, height: 4,
              background: verse.palette.textFaint,
              opacity: turbulence * 0.2,
              borderRadius: 1,
            }} />
          ))}
        </div>

        {/* Drag area */}
        {!done ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <motion.div
              drag
              dragConstraints={{ top: -30, bottom: 30, left: -50, right: 50 }}
              dragElastic={0.05}
              dragMomentum={false}
              onDrag={handleDrag}
              style={{
                ...immersiveTapButton(verse.palette).base,
                cursor: 'grab',
                touchAction: 'none',
              }}
              whileTap={immersiveTapButton(verse.palette).active}
            >
              smooth the pipe
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: 'hsla(200, 40%, 65%, 0.9)', fontSize: 11 }}>
            laminar
          </motion.div>
        )}

        {!done && (
          <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${pct * 100}%` }}
              style={{ height: '100%', background: 'hsla(200, 40%, 60%, 0.5)', borderRadius: 2 }} />
          </div>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {done ? 'efficiency' : turbulence > 0.5 ? 'turbulent' : 'smoothing'}
        </div>
      </div>
  );
}