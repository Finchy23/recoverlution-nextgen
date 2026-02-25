/**
 * CRYSTAL #1 -- 1121. The Lattice (Structure)
 * "The difference between dust and diamond is not the material. It is the structure."
 * INTERACTION: Tap the chaotic atoms directly to compress them into a lattice
 * STEALTH KBE: Structural Organization -- cognitive structuring (K)
 *
 * COMPOSITOR: witness_ritual / Glacier / morning / knowing / tap / 1121
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTap } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Crystal_Lattice({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Glacier',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1121,
        isSeal: false,
      }}
      arrivalText="Carbon atoms. Dust. No structure."
      prompt="The difference between dust and diamond is not the material. It is the structure. Organize your chaos."
      resonantText="Structural Organization. The atoms were always there. They just needed pressure to find their places. You did not add anything. You arranged what already existed."
      afterglowCoda="Diamond."
      onComplete={onComplete}
    >
      {(verse) => <LatticeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

interface Atom { id: number; x: number; y: number; tx: number; ty: number; }

function LatticeInteraction({ verse }: { verse: any }) {
  const COUNT = 16;
  const [pressure, setPressure] = useState(0);
  const [crystallized, setCrystallized] = useState(false);
  const REQUIRED_TAPS = 6;

  // Chaotic positions + target lattice positions
  const [atoms] = useState<Atom[]>(() => {
    const cx = 110, cy = 100;
    return Array.from({ length: COUNT }, (_, i) => {
      const seed = 1121 + i;
      const chaosAngle = ((seed * 137) % 360) * (Math.PI / 180);
      const chaosR = 25 + (seed % 55);
      const col = i % 4, row = Math.floor(i / 4);
      const offset = row % 2 === 0 ? 0 : 15;
      return {
        id: i,
        x: cx + Math.cos(chaosAngle) * chaosR + ((seed * 3) % 24 - 12),
        y: cy + Math.sin(chaosAngle) * chaosR + ((seed * 7) % 24 - 12),
        tx: cx - 45 + col * 30 + offset,
        ty: cy - 45 + row * 30,
      };
    });
  });

  const compressionFactor = Math.min(1, pressure / REQUIRED_TAPS);

  const applyPressure = useCallback(() => {
    if (crystallized) return;
    const next = pressure + 1;
    setPressure(next);
    if (next >= REQUIRED_TAPS) {
      setTimeout(() => {
        setCrystallized(true);
        setTimeout(() => verse.advance(), 2200);
      }, 600);
    }
  }, [pressure, crystallized, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Atom field -- the tap target IS the visualization */}
      <motion.div
        style={{
          ...immersiveTap(verse.palette).zone,
          position: 'relative',
          width: 220,
          height: 200,
          cursor: crystallized ? 'default' : 'pointer',
        }}
        onClick={applyPressure}
        whileTap={crystallized ? {} : { scale: 0.96 }}
      >
        {/* Atoms */}
        {atoms.map(a => {
          const curX = a.x + (a.tx - a.x) * compressionFactor;
          const curY = a.y + (a.ty - a.y) * compressionFactor;
          return (
            <motion.div
              key={a.id}
              animate={{
                left: curX - 5,
                top: curY - 5,
                scale: crystallized ? [1, 1.15, 1] : 1,
              }}
              transition={{
                left: { duration: 0.5, ease: 'easeOut' },
                top: { duration: 0.5, ease: 'easeOut' },
                scale: crystallized ? { delay: a.id * 0.04, duration: 0.6 } : {},
              }}
              style={{
                position: 'absolute',
                width: 10, height: 10, borderRadius: '50%',
                background: crystallized
                  ? verse.palette.accent
                  : verse.palette.primary,
                opacity: crystallized ? 0.7 : 0.2 + compressionFactor * 0.25,
              }}
            />
          );
        })}

        {/* Bond lines (emerge during compression) */}
        <svg width={220} height={200} style={{
          position: 'absolute', top: 0, left: 0, pointerEvents: 'none',
        }}>
          {compressionFactor > 0.3 && atoms.map((a, i) => {
            const curAx = a.x + (a.tx - a.x) * compressionFactor;
            const curAy = a.y + (a.ty - a.y) * compressionFactor;
            return atoms.filter((b, j) => {
              if (j <= i) return false;
              const dx = a.tx - b.tx;
              const dy = a.ty - b.ty;
              return Math.sqrt(dx * dx + dy * dy) < 38;
            }).map(b => {
              const curBx = b.x + (b.tx - b.x) * compressionFactor;
              const curBy = b.y + (b.ty - b.y) * compressionFactor;
              return (
                <line
                  key={`${a.id}-${b.id}`}
                  x1={curAx} y1={curAy}
                  x2={curBx} y2={curBy}
                  stroke={verse.palette.accent}
                  strokeWidth={0.6}
                  opacity={Math.max(0, (compressionFactor - 0.3) * 0.4)}
                />
              );
            });
          })}
        </svg>

        {/* Pressure wave on tap */}
        {pressure > 0 && !crystallized && (
          <motion.div
            key={pressure}
            initial={{ scale: 0.3, opacity: 0.25 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              width: 60, height: 60, borderRadius: '50%',
              border: `1px solid ${verse.palette.accent}`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </motion.div>

      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <AnimatePresence mode="wait">
          {crystallized ? (
            <motion.span
              key="done"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.7, y: 0 }}
              style={{ ...navicueType.hint, color: verse.palette.accent }}
            >
              diamond
            </motion.span>
          ) : (
            <motion.span
              key="status"
              style={{ ...navicueInteraction.tapHint, color: verse.palette.textFaint }}
            >
              {pressure === 0 ? 'tap to compress' : `pressure ${pressure} of ${REQUIRED_TAPS}`}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}