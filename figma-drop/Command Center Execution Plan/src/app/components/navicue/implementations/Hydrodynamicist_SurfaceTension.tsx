/**
 * HYDRODYNAMICIST #7 -- 1137. The Surface Tension
 * "Break the tension. Connect."
 * INTERACTION: Perfect water sphere on a leaf -- tap to break the tension -- it spreads and connects
 * STEALTH KBE: Vulnerability -- openness (B)
 *
 * COMPOSITOR: pattern_glitch / Tide / social / believing / tap / 1137
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Hydrodynamicist_SurfaceTension({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Tide',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1137,
        isSeal: false,
      }}
      arrivalText="A drop of water. A perfect sphere. Holding itself together."
      prompt="You are holding yourself together too tight. The sphere is safe but lonely. Break the tension. Connect."
      resonantText="Vulnerability. The sphere broke. And instead of loss, there was connection. The water touched the leaf. The surface was not a shield. It was a wall. Openness is not weakness. It is contact."
      afterglowCoda="Connected."
      onComplete={onComplete}
    >
      {(verse) => <SurfaceTensionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SurfaceTensionInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'sphere' | 'breaking' | 'spread'>('sphere');

  const breakTension = useCallback(() => {
    if (phase !== 'sphere') return;
    setPhase('breaking');
    setTimeout(() => {
      setPhase('spread');
      setTimeout(() => verse.advance(), 2200);
    }, 800);
  }, [phase, verse]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 120)}>
        {/* Leaf */}
        <div style={{
          position: 'absolute', bottom: 25, left: 30, right: 30,
          height: 30,
          background: 'hsla(120, 25%, 35%, 0.15)',
          borderRadius: '50% 50% 0 0',
          border: `1px solid hsla(120, 20%, 40%, 0.2)`,
        }}>
          {/* Leaf vein */}
          <div style={{
            position: 'absolute', top: 8, left: '50%',
            width: 1, height: 18,
            background: 'hsla(120, 20%, 40%, 0.15)',
            transform: 'translateX(-50%)',
          }} />
        </div>

        {/* Water drop / spread */}
        <AnimatePresence mode="wait">
          {phase === 'sphere' && (
            <motion.div
              key="sphere"
              animate={{
                boxShadow: '0 0 8px hsla(200, 40%, 60%, 0.2)',
              }}
              style={{
                position: 'absolute', bottom: 40,
                width: 28, height: 28, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, hsla(200, 50%, 70%, 0.5), hsla(200, 40%, 50%, 0.3))`,
                border: '1px solid hsla(200, 40%, 60%, 0.25)',
              }}
            >
              {/* Highlight */}
              <div style={{
                position: 'absolute', top: 6, left: 8,
                width: 5, height: 3, borderRadius: '50%',
                background: 'hsla(0, 0%, 90%, 0.25)',
              }} />
            </motion.div>
          )}
          {phase === 'breaking' && (
            <motion.div
              key="breaking"
              initial={{ borderRadius: '50%', width: 28, height: 28 }}
              animate={{ borderRadius: '30%', width: 40, height: 16, opacity: 0.5 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute', bottom: 38,
                background: 'hsla(200, 45%, 60%, 0.35)',
              }}
            />
          )}
          {phase === 'spread' && (
            <motion.div
              key="spread"
              initial={{ width: 40, opacity: 0.3 }}
              animate={{ width: 80, opacity: 0.5 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute', bottom: 35,
                height: 6, borderRadius: 3,
                background: `linear-gradient(to right, transparent, hsla(200, 45%, 60%, 0.3), hsla(200, 45%, 60%, 0.4), hsla(200, 45%, 60%, 0.3), transparent)`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Connection lines (spread phase) */}
        {phase === 'spread' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.4 }}
            style={{
              position: 'absolute', bottom: 30, left: 20, right: 20,
              height: 1,
              background: `linear-gradient(to right, transparent, ${verse.palette.accent}, transparent)`,
            }}
          />
        )}

        {/* Action */}
        {phase === 'sphere' && (
          <motion.button onClick={breakTension}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            touch
          </motion.button>
        )}
        {phase === 'breaking' && (
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
            breaking...
          </span>
        )}
        {phase === 'spread' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
            connected
          </motion.div>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {phase === 'spread' ? 'openness' : phase === 'sphere' ? 'isolated' : 'surrendering'}
        </div>
      </div>
    </div>
  );
}