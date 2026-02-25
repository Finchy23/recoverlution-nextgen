/**
 * TRANSMUTER #7 -- 1087. The Amalgam (The Mix)
 * "You are too rigid. Add some mercury. The mixture creates a mirror."
 * INTERACTION: Drag mercury (Play) into silver (Work) -- they combine into a mirror
 * STEALTH KBE: Synthesis -- integrated living (K)
 *
 * COMPOSITOR: pattern_glitch / Ember / social / knowing / drag / 1087
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Transmuter_Amalgam({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Ember',
        chrono: 'social',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1087,
        isSeal: false,
      }}
      arrivalText="Silver and mercury. Separate."
      prompt="You are too rigid. Add some mercury. The mixture creates a surface that reflects the world."
      resonantText="Synthesis. Work became playful. Play became meaningful. The mirror reflects everything because it contains both."
      afterglowCoda="Flow."
      onComplete={onComplete}
    >
      {(verse) => <AmalgamInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AmalgamInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'separate' | 'mixing' | 'mirror'>('separate');

  const handleDragEnd = useCallback((_: any, info: any) => {
    if (phase !== 'separate') return;
    // Drag mercury (left) to the right toward silver
    if (info.offset.x > 60) {
      setPhase('mixing');
      setTimeout(() => {
        setPhase('mirror');
        setTimeout(() => verse.advance(), 2200);
      }, 1800);
    }
  }, [phase, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {phase === 'separate' && (
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {/* Mercury (Play) -- draggable */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 100 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05 }}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: `1px solid ${verse.palette.primaryGlow}`,
              background: `radial-gradient(circle at 35% 35%, hsla(210, 20%, 60%, 0.25), hsla(200, 15%, 40%, 0.15))`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              touchAction: 'none',
              gap: 2,
            }}
          >
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>mercury</span>
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.5 }}>play</span>
          </motion.div>

          {/* Silver (Work) -- target */}
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            border: `1px solid ${verse.palette.primaryGlow}`,
            background: `linear-gradient(135deg, hsla(0, 0%, 55%, 0.15), hsla(0, 0%, 40%, 0.1))`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}>
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>silver</span>
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.5 }}>work</span>
          </div>
        </div>
      )}

      {phase === 'mixing' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: [0.7, 1.1, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: '30%',
            border: `1px solid ${verse.palette.primaryGlow}`,
            background: `radial-gradient(circle, hsla(210, 20%, 55%, 0.25), hsla(0, 0%, 40%, 0.15))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.span
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10 }}
          >
            mixing...
          </motion.span>
        </motion.div>
      )}

      {phase === 'mirror' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: `1px solid hsla(0, 0%, 70%, 0.4)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Mirror reflection effect */}
          <motion.div
            animate={{ x: [-30, 30, -30] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, transparent 30%, hsla(0, 0%, 80%, 0.12) 50%, transparent 70%)`,
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}>
            <span style={{ ...navicueType.hint, color: 'hsla(0, 0%, 75%, 0.7)', fontSize: 11 }}>
              mirror
            </span>
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 9 }}>
              flow
            </span>
          </div>
        </motion.div>
      )}

      {/* Instruction */}
      {phase === 'separate' && (
        <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.4, fontSize: 10 }}>
          drag mercury into silver
        </div>
      )}
    </div>
  );
}