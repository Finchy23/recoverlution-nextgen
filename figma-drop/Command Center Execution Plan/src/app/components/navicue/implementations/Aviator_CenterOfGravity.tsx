/**
 * AVIATOR #7 -- 1147. The Center of Gravity
 * "Move the weight forward. Balance the load."
 * INTERACTION: Tail-heavy plane (unstable) -- drag weight forward -- stable
 * STEALTH KBE: Temporal Focus -- future orientation (K)
 *
 * COMPOSITOR: sacred_ordinary / Drift / night / knowing / drag / 1147
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Aviator_CenterOfGravity({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'night',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1147,
        isSeal: false,
      }}
      arrivalText="Tail-heavy. Unstable."
      prompt="If the weight is behind you, you are unstable. Move the weight forward. Balance the load."
      resonantText="Temporal Focus. You shifted the weight from past to future. The plane stabilized. You do not fly by looking backward. Future orientation is the center of gravity that keeps you level."
      afterglowCoda="Balanced."
      onComplete={onComplete}
    >
      {(verse) => <CenterOfGravityInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CenterOfGravityInteraction({ verse }: { verse: any }) {
  const [weightPos, setWeightPos] = useState(80); // 0=nose, 100=tail; starts tail-heavy
  const [done, setDone] = useState(false);
  const TARGET_MIN = 40;
  const TARGET_MAX = 55;

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    setWeightPos(prev => {
      const next = Math.max(10, Math.min(90, prev + info.delta.x * 0.4));
      if (next >= TARGET_MIN && next <= TARGET_MAX) {
        setDone(true);
        setTimeout(() => verse.advance(), 2000);
      }
      return next;
    });
  }, [done, verse]);

  const isStable = weightPos >= TARGET_MIN && weightPos <= TARGET_MAX;
  const instability = Math.abs(weightPos - 47) / 50;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 80)}>
        {/* Fuselage */}
        <div style={{ position: 'relative', width: 180, height: 80 }}>
          {/* Labels */}
          <span style={{
            position: 'absolute', top: 0, right: 5,
            ...navicueStyles.annotation(verse.palette, 0.3),
          }}>nose (future)</span>
          <span style={{
            position: 'absolute', top: 0, left: 5,
            ...navicueStyles.annotation(verse.palette, 0.3),
          }}>tail (past)</span>

          {/* Fuselage */}
          <motion.div
            animate={{
              rotate: done ? 0 : (weightPos - 47) * 0.15,
            }}
            style={{
              position: 'absolute', top: 30, left: 20, right: 20,
              height: 16, borderRadius: '4px 12px 12px 4px',
              background: `hsla(210, 15%, 45%, ${done ? 0.35 : 0.2})`,
              border: `1px solid ${verse.palette.primaryGlow}`,
              transformOrigin: '50% 50%',
              transition: 'background 0.3s',
            }}
          >
            {/* CG safe zone */}
            <div style={{
              position: 'absolute',
              left: `${TARGET_MIN}%`, width: `${TARGET_MAX - TARGET_MIN}%`,
              top: -2, bottom: -2,
              background: 'hsla(120, 20%, 40%, 0.1)',
              borderRadius: 2,
            }} />
          </motion.div>

          {/* Weight block */}
          {!done ? (
            <motion.div
              drag="x"
              dragConstraints={{ left: -50, right: 50 }}
              dragElastic={0.05}
              dragMomentum={false}
              onDrag={handleDrag}
              animate={{ left: `${100 - weightPos}%` }}
              style={{
                position: 'absolute', top: 25,
                width: 16, height: 26, borderRadius: 3,
                background: isStable ? verse.palette.accent : 'hsla(30, 25%, 40%, 0.4)',
                border: `1px solid ${verse.palette.primaryGlow}`,
                opacity: 0.5,
                cursor: 'grab', touchAction: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>CG</span>
            </motion.div>
          ) : (
            <div style={{
              position: 'absolute', top: 25, left: `${100 - weightPos}%`,
              width: 16, height: 26, borderRadius: 3,
              background: verse.palette.accent,
              opacity: 0.3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>CG</span>
            </div>
          )}

          {/* Stability indicator */}
          <div style={{
            position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
            ...navicueType.micro,
            color: isStable ? verse.palette.accent : verse.palette.shadow,
            opacity: 0.5,
          }}>
            {done ? 'stable' : instability > 0.5 ? 'unstable' : 'adjusting'}
          </div>
        </div>

        {/* Status */}
        {done ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={navicueStyles.accentHint(verse.palette)}>
            balanced
          </motion.div>
        ) : (
          <span style={navicueStyles.interactionHint(verse.palette)}>
            drag the weight forward
          </span>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {done ? 'future orientation' : 'tail-heavy'}
        </div>
      </div>
    </div>
  );
}