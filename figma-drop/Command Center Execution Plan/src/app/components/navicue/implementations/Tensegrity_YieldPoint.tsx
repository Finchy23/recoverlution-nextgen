/**
 * TENSEGRITY #8 -- 1158. The Yield Point
 * "Know your yield point. Respect the limit."
 * INTERACTION: Steel bar -- hold to bend -- stop before the snap
 * STEALTH KBE: Boundaries -- self-preservation (B)
 *
 * COMPOSITOR: science_x_soul / Lattice / social / believing / hold / 1158
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tensegrity_YieldPoint({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'social',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1158,
        isSeal: false,
      }}
      arrivalText="A steel bar. Bending."
      prompt="Know your yield point. If you bend past it, you do not bounce back; you break. Respect the limit."
      resonantText="Boundaries. You stopped before the snap. The bar sprang back. You knew the limit and you honored it. Self-preservation is not cowardice. It is the intelligence of steel."
      afterglowCoda="Sprang back."
      onComplete={onComplete}
    >
      {(verse) => <YieldPointInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function YieldPointInteraction({ verse }: { verse: any }) {
  const [bend, setBend] = useState(0); // 0-100; yield at 75, snap at 90
  const [holding, setHolding] = useState(false);
  const [phase, setPhase] = useState<'bending' | 'released' | 'snapped'>('bending');
  const YIELD_POINT = 75;
  const SNAP_POINT = 90;

  useEffect(() => {
    if (!holding || phase !== 'bending') return;
    const interval = setInterval(() => {
      setBend(prev => {
        const next = prev + 0.8;
        if (next >= SNAP_POINT) {
          setPhase('snapped');
          clearInterval(interval);
        }
        return Math.min(next, SNAP_POINT);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [holding, phase]);

  const startHold = useCallback(() => {
    if (phase !== 'bending') return;
    setHolding(true);
  }, [phase]);

  const release = useCallback(() => {
    if (phase !== 'bending') return;
    setHolding(false);
    if (bend > 30 && bend < SNAP_POINT) {
      setPhase('released');
      setTimeout(() => {
        setBend(0);
        setTimeout(() => verse.advance(), 1200);
      }, 600);
    }
  }, [phase, bend, verse]);

  const bendPct = bend / 100;
  const inDanger = bend > YIELD_POINT;
  const barAngle = bendPct * 25;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Bar */}
      <div style={navicueStyles.heroScene(verse.palette, 160 / 80)}>
        <svg viewBox="0 0 160 80" style={navicueStyles.heroSvg}>
          {/* Bar under stress */}
          <motion.div
            animate={{
              rotate: phase === 'snapped' ? 45 : phase === 'released' ? 0 : barAngle,
            }}
            transition={phase === 'released' ? { type: 'spring', stiffness: 200, damping: 10 } : {}}
            style={{
              position: 'absolute', left: 28, top: 36,
              width: 100, height: 6, borderRadius: 2,
              background: phase === 'snapped' ? verse.palette.shadowFaint
                : inDanger ? `hsla(${Math.round(40 - (bend - YIELD_POINT) * 3)}, 35%, 45%, 0.4)`
                : 'hsla(210, 15%, 50%, 0.35)',
              border: `1px solid ${verse.palette.primaryGlow}`,
              transformOrigin: '0% 50%',
            }}
          >
            {/* Crack (near snap) */}
            {phase === 'snapped' && (
              <div style={{
                position: 'absolute', top: -2, left: '30%',
                width: 2, height: 10,
                background: verse.palette.accent,
                transform: 'rotate(30deg)',
              }} />
            )}
          </motion.div>

          {/* Yield zone indicator */}
          <div style={{
            position: 'absolute', right: 10, top: 10,
            ...navicueType.micro,
            color: inDanger ? verse.palette.shadow : verse.palette.textFaint,
            opacity: 0.5,
          }}>
            {phase === 'snapped' ? 'broken' : phase === 'released' ? 'elastic' : `${Math.round(bend)}%`}
          </div>

          {/* Yield point marker */}
          <div style={{
            position: 'absolute', bottom: 5, left: 28 + YIELD_POINT,
            width: 1, height: 8,
            background: verse.palette.accentGlow,
          }} />
          <span style={{
            position: 'absolute', bottom: 0, left: 28 + YIELD_POINT - 8,
            ...navicueType.micro, color: 'hsla(40, 40%, 50%, 0.4)',
          }}>yield</span>
        </svg>
      </div>

      {/* Action */}
      {phase === 'bending' && (() => {
        const btn = immersiveHoldButton(verse.palette);
        return (
          <motion.div
            onPointerDown={startHold}
            onPointerUp={release}
            onPointerLeave={release}
            animate={holding ? btn.holding : {}}
            transition={{ duration: 0.2 }}
            style={{
              ...btn.base,
              borderColor: inDanger ? verse.palette.accent : btn.base.borderColor,
            }}
          >
            <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
              <circle {...btn.progressRing.track} />
              <circle {...btn.progressRing.fill(bendPct)} />
            </svg>
            <div style={btn.label}>{holding ? (inDanger ? 'danger...' : 'bending...') : 'hold to bend'}</div>
          </motion.div>
        );
      })()}
      {phase === 'snapped' && (
        <span style={navicueStyles.shadowAnnotation(verse.palette, 0.6)}>
          snapped. past the yield point.
        </span>
      )}
      {phase === 'released' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          sprang back
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'released' ? 'self-preservation' : phase === 'snapped' ? 'plastic deformation' : 'boundaries'}
      </div>
    </div>
  );
}