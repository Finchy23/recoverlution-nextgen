/**
 * AVIATOR #10 -- 1150. The Aviator Seal (The Proof)
 * "You rise by lowering the pressure above you."
 * INTERACTION: Observe -- airfoil wing section -- air moves faster over top creating lift
 * STEALTH KBE: Bernoulli's Principle -- create space and rise (E)
 *
 * COMPOSITOR: science_x_soul / Drift / night / embodying / observe / 1150
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Aviator_AviatorSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Drift',
        chrono: 'night',
        kbe: 'e',
        hook: 'observe',
        specimenSeed: 1150,
        isSeal: true,
      }}
      arrivalText="An airfoil. A wing section."
      prompt="You rise by lowering the pressure above you."
      resonantText="Bernoulli's Principle. Lift is generated not by pushing down, but by creating a vacuum above. Create space, and you will rise. The wing does not fight gravity. It invites the sky."
      afterglowCoda="Lift."
      onComplete={onComplete}
    >
      {(verse) => <AviatorSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AviatorSealInteraction({ verse }: { verse: any }) {
  const [observeTime, setObserveTime] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [flowPhase, setFlowPhase] = useState(0);
  const OBSERVE_TARGET = 6;

  // Flow animation
  useEffect(() => {
    const interval = setInterval(() => {
      setFlowPhase(prev => (prev + 0.03) % 1);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Observe timer
  useEffect(() => {
    if (revealed) return;
    const interval = setInterval(() => {
      setObserveTime(prev => {
        const next = prev + 0.1;
        if (next >= OBSERVE_TARGET) {
          setRevealed(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 3000);
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [revealed, verse]);

  const progressPct = Math.min(1, observeTime / OBSERVE_TARGET);

  // Airfoil shape + flow visualization
  const AIRFOIL_POINTS = 'M 20,55 Q 30,55 50,50 Q 80,40 120,38 Q 140,37 155,42 Q 140,42 120,45 Q 80,50 50,55 Q 30,57 20,55';

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 100)}>
        <svg viewBox="0 0 180 100" style={navicueStyles.heroSvg}>
          {/* Upper flow lines (faster, longer) */}
          {Array.from({ length: 5 }).map((_, i) => {
            const yBase = 15 + i * 5;
            const speed = 1.5 + (3 - Math.abs(i - 2)) * 0.3;
            const xOffset = ((flowPhase * speed * 180) % 200) - 20;
            return (
              <line key={`u${i}`}
                x1={0} y1={yBase}
                x2={180} y2={yBase}
                stroke={revealed ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.15)'}
                strokeWidth={0.8}
                strokeDasharray="8 12"
                strokeDashoffset={-xOffset}
                opacity={0.15 + progressPct * 0.15}
              />
            );
          })}

          {/* Lower flow lines (slower, shorter) */}
          {Array.from({ length: 3 }).map((_, i) => {
            const yBase = 60 + i * 6;
            const speed = 0.8;
            const xOffset = ((flowPhase * speed * 180) % 200) - 20;
            return (
              <line key={`l${i}`}
                x1={0} y1={yBase}
                x2={180} y2={yBase}
                stroke="hsla(200, 20%, 50%, 0.1)"
                strokeWidth={0.6}
                strokeDasharray="6 14"
                strokeDashoffset={-xOffset}
                opacity={0.1 + progressPct * 0.05}
              />
            );
          })}

          {/* Airfoil */}
          <path
            d={AIRFOIL_POINTS}
            fill={revealed
              ? `hsla(210, 25%, 50%, 0.25)`
              : `hsla(210, 15%, 45%, 0.2)`}
            stroke={revealed ? verse.palette.accent : verse.palette.primaryGlow}
            strokeWidth={revealed ? 1.5 : 1}
            opacity={0.6}
          />

          {/* Pressure labels */}
          {progressPct > 0.4 && (
            <>
              <text x={90} y={28} textAnchor="middle"
                style={navicueType.micro} fill={verse.palette.accent}
                opacity={progressPct * 0.5}>
                low pressure
              </text>
              <text x={90} y={72} textAnchor="middle"
                style={navicueType.micro} fill={verse.palette.textFaint}
                opacity={progressPct * 0.3}>
                high pressure
              </text>
            </>
          )}

          {/* Lift arrow */}
          {progressPct > 0.6 && (
            <g opacity={progressPct * 0.4}>
              <line x1={90} y1={48} x2={90} y2={32}
                stroke={verse.palette.accent} strokeWidth={1.5} />
              <polygon points="86,34 90,28 94,34"
                fill={verse.palette.accent} />
            </g>
          )}
        </svg>
      </div>

      {/* Status */}
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="observing"
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={navicueStyles.interactionHint(verse.palette)}>
              observe
            </span>
            <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progressPct * 100}%` }}
                style={{ height: '100%', background: verse.palette.accent, borderRadius: 1 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.accent }}>
              lift
            </span>
            <span style={navicueStyles.annotation(verse.palette)}>
              create space, and you will rise
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}