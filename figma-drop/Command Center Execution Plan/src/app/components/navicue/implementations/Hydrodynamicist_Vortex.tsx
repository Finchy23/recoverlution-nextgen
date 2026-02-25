/**
 * HYDRODYNAMICIST #6 -- 1136. The Vortex (The Drain)
 * "Spiral in. Circle the drain to clear the mind."
 * INTERACTION: Drag/trace a spiral inward -- speed increases -- centering
 * STEALTH KBE: Centering -- somatic discharge (E)
 *
 * COMPOSITOR: sacred_ordinary / Tide / morning / embodying / drag / 1136
 */
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Hydrodynamicist_Vortex({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Tide',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1136,
        isSeal: false,
      }}
      arrivalText="Water draining. A spiral forming."
      prompt="The vortex is the fastest way to move energy. Spiral in. Stop thinking in straight lines. Circle the drain to clear the mind."
      resonantText="Centering. You spiraled inward and the noise left. The vortex did not destroy. It organized. Somatic discharge is the body's drain. Let the turbulence spiral out."
      afterglowCoda="Clear."
      onComplete={onComplete}
    >
      {(verse) => <VortexInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function VortexInteraction({ verse }: { verse: any }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [spiralAngle, setSpiralAngle] = useState(0);
  const lastAngleRef = useRef(0);
  const centerRef = useRef({ x: 80, y: 80 });

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    const dx = info.point.x - centerRef.current.x;
    const dy = info.point.y - centerRef.current.y;
    const angle = Math.atan2(dy, dx);
    const angleDiff = Math.abs(angle - lastAngleRef.current);
    lastAngleRef.current = angle;

    if (angleDiff > 0.05 && angleDiff < 3) {
      setSpiralAngle(prev => prev + angleDiff);
      setProgress(prev => {
        const next = Math.min(100, prev + angleDiff * 5);
        if (next >= 100 && !done) {
          setDone(true);
          setTimeout(() => verse.advance(), 2200);
        }
        return next;
      });
    }
  }, [done, verse]);

  const pct = progress / 100;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 160)}>
          {/* Spin rings */}
        <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Spiral rings */}
          {[1, 2, 3, 4, 5].map(r => {
            const visible = pct > (r - 1) / 5;
            const radius = 15 + (5 - r) * 12;
            return (
              <motion.div
                key={r}
                animate={{
                  rotate: spiralAngle * (6 - r) * 15,
                  opacity: visible ? 0.1 + pct * 0.2 : 0.05,
                  scale: done ? 0.9 : 1,
                }}
                transition={done ? { duration: 0.5 } : { duration: 0 }}
                style={{
                  position: 'absolute',
                  width: radius * 2, height: radius * 2,
                  borderRadius: '50%',
                  border: `1px solid ${done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.3)'}`,
                }}
              />
            );
          })}

          {/* Center point */}
          <motion.div
            animate={{
              scale: done ? [1, 1.3, 1] : 0.5 + pct * 0.5,
              background: done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.3)',
            }}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              zIndex: 2,
            }}
          />

          {/* Drag handle */}
          {!done && (
            <motion.div
              drag
              dragConstraints={{ top: -70, bottom: 70, left: -70, right: 70 }}
              dragElastic={0.05}
              dragMomentum={false}
              onDrag={handleDrag}
              style={{
                position: 'absolute',
                top: 20, right: 20,
                width: 24, height: 24, borderRadius: '50%',
                border: `1px solid ${verse.palette.primaryGlow}`,
                cursor: 'grab', touchAction: 'none',
                opacity: 0.4, zIndex: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>~</span>
            </motion.div>
          )}

          {/* Water particles spiraling */}
          {pct > 0.2 && Array.from({ length: Math.floor(pct * 6) }).map((_, i) => {
            const a = spiralAngle + (i * Math.PI * 2) / 6;
            const r = 30 * (1 - pct * 0.5) + i * 4;
            return (
              <motion.div
                key={i}
                animate={{
                  x: Math.cos(a) * r + 72,
                  y: Math.sin(a) * r + 72,
                }}
                style={{
                  position: 'absolute',
                  width: 3, height: 3, borderRadius: '50%',
                  background: 'hsla(200, 40%, 55%, 0.3)',
                }}
              />
            );
          })}
        </div>

        {/* Status */}
        {done ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
            centered
          </motion.div>
        ) : (
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
            trace the spiral inward
          </span>
        )}

        {!done && (
          <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
            <motion.div animate={{ width: `${pct * 100}%` }}
              style={{ height: '100%', background: 'hsla(200, 40%, 55%, 0.4)', borderRadius: 1 }} />
          </div>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {done ? 'somatic discharge' : 'spiral in'}
        </div>
      </div>
    </div>
  );
}