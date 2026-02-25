/**
 * TRANSMUTER #1 -- 1081. The Lead Weight (Grief to Compassion)
 * "Lead is heavy. Do not carry it. Burn it."
 * INTERACTION: Drag the lead block into the furnace -- it melts and pours out as gold
 * STEALTH KBE: Sublimation -- post-traumatic growth (B)
 *
 * COMPOSITOR: witness_ritual / Ember / work / believing / drag / 1081
 */
import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Transmuter_LeadWeight({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Ember',
        chrono: 'work',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1081,
        isSeal: false,
      }}
      arrivalText="A dull, heavy block. Grief."
      prompt="Lead is heavy. Do not carry it. Burn it. The heat changes the structure. The heaviest pain becomes the purest gold."
      resonantText="Sublimation. You did not remove the weight. You transformed it. The mass remains but the element has changed. Compassion has the same density as grief."
      afterglowCoda="Everything is fuel."
      onComplete={onComplete}
    >
      {(verse) => <LeadWeightInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LeadWeightInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'ready' | 'dragging' | 'furnace' | 'melting' | 'gold'>('ready');
  const [dragY, setDragY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback((_: any, info: any) => {
    if (info.offset.y > 80) {
      setPhase('furnace');
      setTimeout(() => setPhase('melting'), 800);
      setTimeout(() => {
        setPhase('gold');
        setTimeout(() => verse.advance(), 2000);
      }, 2800);
    }
  }, [verse]);

  return (
    <div ref={containerRef} style={navicueStyles.interactionContainer()}>
      {/* Lead block */}
      <AnimatePresence mode="wait">
        {(phase === 'ready' || phase === 'dragging') && (
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 120 }}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 0.95 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              width: 100,
              height: 70,
              borderRadius: 6,
              border: `1px solid ${verse.palette.textFaint}`,
              background: `linear-gradient(135deg, hsla(0, 0%, 30%, 0.3), hsla(0, 0%, 22%, 0.4))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              touchAction: 'none',
            }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
              Grief
            </span>
          </motion.div>
        )}

        {phase === 'furnace' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              width: 100,
              height: 70,
              borderRadius: 6,
              border: `1px solid ${verse.palette.accent}`,
              background: `linear-gradient(135deg, hsla(20, 80%, 30%, 0.4), hsla(30, 90%, 20%, 0.5))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 10 }}>
              heating...
            </span>
          </motion.div>
        )}

        {phase === 'melting' && (
          <motion.div
            initial={{ borderRadius: 6 }}
            animate={{ borderRadius: 35, height: 50, width: 50 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            style={{
              width: 100,
              height: 70,
              border: `1px solid ${verse.palette.accent}`,
              background: `radial-gradient(circle, hsla(40, 85%, 55%, 0.5), hsla(30, 80%, 30%, 0.4))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 10 }}
            >
              melting
            </motion.span>
          </motion.div>
        )}

        {phase === 'gold' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: `1px solid hsla(45, 70%, 55%, 0.6)`,
              background: `radial-gradient(circle, hsla(45, 80%, 55%, 0.35), hsla(40, 60%, 35%, 0.2))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ ...navicueType.hint, color: 'hsla(45, 70%, 65%, 0.9)', fontSize: 11 }}>
              Compassion
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Furnace target */}
      {(phase === 'ready' || phase === 'dragging') && (
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            width: 120,
            height: 44,
            borderRadius: 8,
            border: `1px dashed ${verse.palette.primaryGlow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10 }}>
            furnace
          </span>
        </motion.div>
      )}

      {/* Instruction */}
      {phase === 'ready' && (
        <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.5, fontSize: 10 }}>
          drag the grief into the fire
        </div>
      )}
    </div>
  );
}