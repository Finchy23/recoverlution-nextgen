/**
 * MATERIALIST #1 -- 1031. The First Brick
 * "The hologram castle flickers. The brick is real."
 * INTERACTION: Tap the grid floor to place the first brick.
 * The hologram fades as the real foundation begins. One brick. Real.
 * STEALTH KBE: E (Embodying) -- Materialization / First Action
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueInteraction, immersiveTap } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Materialist_FirstBrick({ onComplete }: Props) {
  const [placed, setPlaced] = useState(false);

  const handlePlace = useCallback((advance: () => void) => {
    setPlaced(true);
    setTimeout(() => advance(), 2500);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Ember',
        chrono: 'morning',
        kbe: 'embodying',
        hook: 'tap',
        specimenSeed: 1031,
        isSeal: false,
      }}
      arrivalText="A vision shimmers..."
      prompt="The castle is a hologram. Tap the ground to place the first real brick."
      resonantText="Thought is the blueprint. Action is the brick."
      afterglowCoda="One brick."
      onComplete={onComplete}
      mechanism="Materialization"
    >
      {(verse) => (
        <div style={{ ...navicueInteraction.interactionWrapper, gap: 20 }}>
          {/* Scene -- the entire visualization is the tap target */}
          <motion.div
            style={{
              ...immersiveTap(verse.palette).zone,
              position: 'relative',
              width: 280,
              height: 240,
              cursor: placed ? 'default' : 'pointer',
            }}
            onClick={placed ? undefined : () => handlePlace(verse.advance)}
            whileTap={placed ? {} : { scale: 0.97 }}
          >
            <svg viewBox="0 0 280 240" style={{ width: '100%', height: '100%' }}>
              {/* Hologram castle -- fades when brick is placed */}
              <motion.g
                initial={{ opacity: 0.14 }}
                animate={{ opacity: placed ? 0.02 : [0.1, 0.16, 0.1] }}
                transition={placed
                  ? { duration: 2 }
                  : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }
              >
                <rect x={100} y={25} width={80} height={65} rx={2}
                  fill="none" stroke={verse.palette.accent} strokeWidth={0.6} strokeDasharray="4 4" />
                <rect x={108} y={14} width={22} height={16} rx={1}
                  fill="none" stroke={verse.palette.accent} strokeWidth={0.4} strokeDasharray="2 3" />
                <rect x={150} y={14} width={22} height={16} rx={1}
                  fill="none" stroke={verse.palette.accent} strokeWidth={0.4} strokeDasharray="2 3" />
                <line x1={140} y1={55} x2={140} y2={90}
                  stroke={verse.palette.accent} strokeWidth={0.3} strokeDasharray="2 2" />
              </motion.g>

              {/* Grid floor */}
              {Array.from({ length: 7 }, (_, i) => (
                <line key={`h${i}`}
                  x1={40} y1={160 + i * 12} x2={240} y2={160 + i * 12}
                  stroke={verse.palette.primary} strokeWidth={0.3} opacity={0.06} />
              ))}
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`v${i}`}
                  x1={40 + i * 20} y1={160} x2={40 + i * 20} y2={230}
                  stroke={verse.palette.primary} strokeWidth={0.3} opacity={0.06} />
              ))}

              {/* Placed brick */}
              {placed && (
                <motion.rect
                  x={120} y={200} width={44} height={22} rx={3}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, y: 170 }}
                  animate={{ opacity: 0.3, y: 200 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              )}

              {/* Impact ripple */}
              {placed && (
                <motion.ellipse
                  cx={142} cy={222}
                  fill="none" stroke={verse.palette.accent} strokeWidth={0.5}
                  initial={{ rx: 5, ry: 2, opacity: 0.25 }}
                  animate={{ rx: 50, ry: 10, opacity: 0 }}
                  transition={{ duration: 1.5, delay: 0.4 }}
                />
              )}

              {/* "tap here" pulse indicator */}
              {!placed && (
                <motion.circle
                  cx={142} cy={200} r={15}
                  fill="none" stroke={verse.palette.accent} strokeWidth={0.5}
                  animate={{ r: [15, 22, 15], opacity: [0.15, 0.06, 0.15] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </svg>
          </motion.div>

          {/* Status */}
          {placed ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ delay: 0.8, duration: 1.5 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, fontStyle: 'italic', textAlign: 'center' }}
            >
              Real. Heavy. Yours.
            </motion.div>
          ) : (
            <span style={{ ...navicueInteraction.tapHint, color: verse.palette.textFaint }}>
              tap the ground
            </span>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}