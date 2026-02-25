/**
 * CATALYST #5 -- 1065. The Solvent (Dissolve)
 * "Dissolve it. Be fluid for a moment. Remold the clay."
 * INTERACTION: Drag curiosity onto rigid structure to dissolve, then reshape
 * STEALTH KBE: Plasticity -- growth mindset (B)
 *
 * COMPOSITOR: pattern_glitch / Glacier / night / believing / drag / 1065
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const SHAPES = ['rigid box', 'open circle', 'flowing wave'];

export default function Catalyst_Solvent({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Glacier',
        chrono: 'night',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1065,
        isSeal: false,
      }}
      arrivalText="A rigid structure. Old identity."
      prompt="You are stuck in a shape that no longer fits. Dissolve it. Be fluid for a moment. Remold the clay before it hardens."
      resonantText="Plasticity. The willingness to dissolve is the prerequisite of growth. The old form was not wrong. It was simply outgrown."
      afterglowCoda="Remold the clay."
      onComplete={onComplete}
    >
      {(verse) => <SolventInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SolventInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'solid' | 'dissolving' | 'goo' | 'remolded'>('solid');
  const [selectedShape, setSelectedShape] = useState<number | null>(null);

  const handlePour = () => {
    setPhase('dissolving');
    setTimeout(() => setPhase('goo'), 2000);
  };

  const handleRemold = (idx: number) => {
    setSelectedShape(idx);
    setPhase('remolded');
    setTimeout(() => verse.advance(), 2200);
  };

  return (
    <div style={navicueType.interactionContainer()}>
      {/* Structure visual */}
      <div style={{
        width: 140,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <motion.div
          key={phase}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          style={{
            width: 80,
            height: 80,
            border: `1.5px solid ${verse.palette.primary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {phase === 'solid' && (
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
              old shape
            </span>
          )}

          {phase === 'dissolving' && (
            <motion.div
              key="dissolving"
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 0.6, 0.3], borderRadius: ['0%', '20%', '50%'], scale: [1, 1.1, 0.9] }}
              transition={{ duration: 2 }}
              style={{
                width: 80,
                height: 80,
                background: verse.palette.primaryFaint,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
                dissolving...
              </span>
            </motion.div>
          )}

          {phase === 'goo' && (
            <motion.div
              key="goo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, scale: [0.8, 1.05, 0.95, 1] }}
              style={{
                width: 100,
                height: 40,
                borderRadius: 20,
                background: `linear-gradient(90deg, ${verse.palette.primaryFaint}, ${verse.palette.primaryGlow})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ ...navicueType.hint, color: verse.palette.text }}>
                fluid
              </span>
            </motion.div>
          )}

          {phase === 'remolded' && (
            <motion.div
              key="remolded"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: selectedShape === 2 ? '40%' : selectedShape === 1 ? '50%' : 8,
                border: `1.5px solid ${verse.palette.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ ...navicueType.hint, color: verse.palette.accent }}>
                {SHAPES[selectedShape || 0]}
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Actions */}
      {phase === 'solid' && (
        <motion.button onClick={handlePour}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          pour curiosity
        </motion.button>
      )}

      {phase === 'goo' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
            choose a new shape
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {SHAPES.map((s, i) => (
              <button key={s} onClick={() => handleRemold(i)} style={{
                ...navicueType.hint,
                color: verse.palette.accent,
                cursor: 'pointer',
                fontSize: 10,
                padding: '6px 10px',
              }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}