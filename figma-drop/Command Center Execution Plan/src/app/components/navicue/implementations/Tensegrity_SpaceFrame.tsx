/**
 * TENSEGRITY #6 -- 1156. The Space Frame
 * "Mass is lazy. Geometry is smart. Do more with less."
 * INTERACTION: Heavy solid column -- swap it for a lightweight truss -- stronger and lighter
 * STEALTH KBE: Efficiency -- strategic design (K)
 *
 * COMPOSITOR: poetic_precision / Lattice / work / knowing / tap / 1156
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tensegrity_SpaceFrame({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1156,
        isSeal: false,
      }}
      arrivalText="A heavy column. Solid. Massive."
      prompt="Mass is lazy. Geometry is smart. Do not use more material. Use better design. Do more with less."
      resonantText="Efficiency. The truss was lighter and stronger. Not because it had more material, but because it had better geometry. Strategic design is the intelligence of structure. Do more with less."
      afterglowCoda="Lighter. Stronger."
      onComplete={onComplete}
    >
      {(verse) => <SpaceFrameInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SpaceFrameInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'heavy' | 'swapping' | 'truss'>('heavy');

  const swap = useCallback(() => {
    if (phase !== 'heavy') return;
    setPhase('swapping');
    setTimeout(() => {
      setPhase('truss');
      setTimeout(() => verse.advance(), 2000);
    }, 800);
  }, [phase, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 110)}>
        <AnimatePresence mode="wait">
          {phase === 'heavy' && (
            <motion.div key="heavy" exit={{ opacity: 0, scale: 0.8 }}
              style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 10 }}>
              {/* Solid column */}
              <div style={{
                width: 40, height: 80,
                background: verse.palette.primaryFaint,
                border: `1px solid ${verse.palette.primaryGlow}`,
                borderRadius: 2,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <span style={{ ...navicueType.hint, fontSize: 11, color: verse.palette.textFaint, opacity: 0.4 }}>
                  solid
                </span>
                <span style={navicueStyles.shadowAnnotation(verse.palette, 0.4)}>
                  heavy
                </span>
              </div>
              {/* Weight label */}
              <span style={{
                display: 'block', textAlign: 'center', marginTop: 4,
                ...navicueType.hint, fontSize: 11, color: verse.palette.textFaint, opacity: 0.4,
              }}>
                mass: 100%
              </span>
            </motion.div>
          )}
          {(phase === 'swapping' || phase === 'truss') && (
            <motion.div key="truss"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 10 }}>
              {/* Space frame truss */}
              <svg width={60} height={80}>
                {/* Vertical edges */}
                <line x1={10} y1={5} x2={10} y2={75} stroke={verse.palette.accent} strokeWidth={1.5} opacity={0.4} />
                <line x1={50} y1={5} x2={50} y2={75} stroke={verse.palette.accent} strokeWidth={1.5} opacity={0.4} />
                {/* Diagonals (triangulation) */}
                <line x1={10} y1={5} x2={50} y2={25} stroke={verse.palette.accent} strokeWidth={1} opacity={0.3} />
                <line x1={50} y1={5} x2={10} y2={25} stroke={verse.palette.accent} strokeWidth={1} opacity={0.3} />
                <line x1={10} y1={25} x2={50} y2={45} stroke={verse.palette.accent} strokeWidth={1} opacity={0.3} />
                <line x1={50} y1={25} x2={10} y2={45} stroke={verse.palette.accent} strokeWidth={1} opacity={0.3} />
                <line x1={10} y1={45} x2={50} y2={65} stroke={verse.palette.accent} strokeWidth={1} opacity={0.3} />
                <line x1={50} y1={45} x2={10} y2={65} stroke={verse.palette.accent} strokeWidth={1} opacity={0.3} />
                {/* Horizontals */}
                <line x1={10} y1={25} x2={50} y2={25} stroke={verse.palette.accent} strokeWidth={1} opacity={0.25} />
                <line x1={10} y1={45} x2={50} y2={45} stroke={verse.palette.accent} strokeWidth={1} opacity={0.25} />
                <line x1={10} y1={65} x2={50} y2={65} stroke={verse.palette.accent} strokeWidth={1} opacity={0.25} />
                {/* Nodes */}
                {[[10,5],[50,5],[10,25],[50,25],[10,45],[50,45],[10,65],[50,65],[10,75],[50,75]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r={2} fill={verse.palette.accent} opacity={0.4} />
                ))}
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: 60 }}>
                <span style={{ ...navicueType.hint, fontSize: 11, color: verse.palette.accent, opacity: 0.5 }}>
                  mass: 30%
                </span>
                <span style={{ ...navicueType.hint, fontSize: 11, color: verse.palette.accent, opacity: 0.5 }}>
                  str: 120%
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action */}
      {phase === 'heavy' && (
        <motion.button onClick={swap}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          replace with truss
        </motion.button>
      )}
      {phase === 'swapping' && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          redesigning...
        </span>
      )}
      {phase === 'truss' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          lighter, stronger
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'truss' ? 'strategic design' : 'mass vs geometry'}
      </div>
    </div>
  );
}