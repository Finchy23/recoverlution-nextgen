/**
 * CHRONOMANCER #3 -- 1013. The Time Dilation
 * "Stress speeds up time. Presence slows it down."
 * INTERACTION: Observe a clock second hand. As the user breathes
 * with the cycle, the second hand slows to a crawl. Bullet-time
 * is earned through stillness, not force.
 * STEALTH KBE: E (Embodying) -- Temporal Agency / Rate Control
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Chronomancer_TimeDilation({ onComplete }: Props) {
  const [dilation, setDilation] = useState(0); // 0 = normal speed, 1 = fully dilated
  const [angle, setAngle] = useState(0);
  const advanceRef = useRef<(() => void) | null>(null);
  const advancedRef = useRef(false);
  const startRef = useRef(performance.now());

  // Clock tick -- speed decreases as dilation increases
  useEffect(() => {
    let frame: number;
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const speed = 1 - dilation * 0.85; // At full dilation, 15% speed
      const degreesPerMs = (360 / 60000) * speed;
      setAngle(elapsed * degreesPerMs % 360);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [dilation]);

  // Slowly increase dilation while user observes (presence = stillness)
  useEffect(() => {
    const interval = setInterval(() => {
      setDilation(d => {
        const next = Math.min(1, d + 0.02);
        if (next >= 1 && !advancedRef.current) {
          advancedRef.current = true;
          setTimeout(() => advanceRef.current?.(), 3000);
        }
        return next;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'embodying',
        hook: 'observe',
        specimenSeed: 1013,
        isSeal: false,
      }}
      arrivalText="Time ticks..."
      prompt="Watch the second hand. Your presence will slow it."
      resonantText="Stress speeds up time. Presence slows it down."
      afterglowCoda="The gap between seconds."
      onComplete={onComplete}
      mechanism="Temporal Regulation"
    >
      {(verse) => {
        advanceRef.current = verse.advance;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }}>
            {/* Clock face */}
            <div style={navicueStyles.heroScene(verse.palette, 200 / 200)}>
              <svg viewBox="0 0 200 200" style={navicueStyles.heroSvg}>
                {/* Outer ring */}
                <circle cx={100} cy={100} r={90} fill="none"
                  stroke={verse.palette.primary} strokeWidth={0.6} opacity={0.12} />
                {/* Hour marks */}
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i * 30 - 90) * Math.PI / 180;
                  return (
                    <line key={i}
                      x1={100 + Math.cos(a) * 82} y1={100 + Math.sin(a) * 82}
                      x2={100 + Math.cos(a) * 88} y2={100 + Math.sin(a) * 88}
                      stroke={verse.palette.primary} strokeWidth={0.6} opacity={0.15}
                    />
                  );
                })}
                {/* Second hand */}
                <motion.line
                  x1={100} y1={100}
                  x2={100 + Math.cos((angle - 90) * Math.PI / 180) * 75}
                  y2={100 + Math.sin((angle - 90) * Math.PI / 180) * 75}
                  stroke={verse.palette.accent}
                  strokeWidth={0.8}
                  strokeLinecap="round"
                  opacity={0.4}
                />
                {/* Center dot */}
                <circle cx={100} cy={100} r={2.5}
                  fill={verse.palette.accent} opacity={0.3} />
                {/* Dilation halo */}
                <motion.circle
                  cx={100} cy={100}
                  fill="none"
                  stroke={verse.palette.primaryGlow}
                  strokeWidth={0.5}
                  animate={{ r: 40 + dilation * 45, opacity: dilation * 0.1 }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
            </div>

            {/* Dilation readout */}
            <motion.div
              animate={{ opacity: 0.5 + dilation * 0.3 }}
              style={{
                ...navicueType.data,
                color: verse.palette.textFaint,
                textAlign: 'center',
              }}
            >
              {dilation < 1
                ? `${Math.round((1 - dilation * 0.85) * 100)}% speed`
                : 'Dilated.'}
            </motion.div>

            {/* Breath prompt */}
            {dilation < 0.5 && (
              <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ ...navicueType.hint, color: verse.palette.textFaint }}
              >
                breathe and watch
              </motion.div>
            )}
          </div>
        );
      }}
    </NaviCueVerse>
  );
}