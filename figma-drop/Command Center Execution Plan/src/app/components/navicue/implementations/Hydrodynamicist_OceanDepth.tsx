/**
 * HYDRODYNAMICIST #9 -- 1139. The Ocean Depth (Stillness)
 * "When the surface is crazy, go down."
 * INTERACTION: Stormy surface -- drag/scroll down to dive -- chaos fades, silence grows
 * STEALTH KBE: Depth -- inner peace (E)
 *
 * COMPOSITOR: sensory_cinema / Tide / night / embodying / drag / 1139
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Hydrodynamicist_OceanDepth({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Tide',
        chrono: 'night',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1139,
        isSeal: false,
      }}
      arrivalText="The surface. A storm."
      prompt="The weather is only skin deep. The ocean is mostly quiet. When the surface is crazy, go down. The silence is holding you."
      resonantText="Depth. You dove. And the storm became a memory. At 1000 meters, nothing moves. The chaos was never the whole ocean. It was just the skin. Inner peace lives below the weather."
      afterglowCoda="Silence."
      onComplete={onComplete}
    >
      {(verse) => <OceanDepthInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function OceanDepthInteraction({ verse }: { verse: any }) {
  const [depth, setDepth] = useState(0); // 0-1000
  const [done, setDone] = useState(false);

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    // Downward drag increases depth
    if (info.delta.y > 0) {
      setDepth(prev => {
        const next = Math.min(1000, prev + info.delta.y * 3);
        if (next >= 1000 && !done) {
          setDone(true);
          setTimeout(() => verse.advance(), 2500);
        }
        return next;
      });
    }
  }, [done, verse]);

  const depthPct = depth / 1000;
  const chaos = 1 - depthPct;
  const silence = depthPct;

  // Color shifts from stormy surface to deep dark blue
  const bg = `hsla(210, ${Math.round(20 + silence * 20)}%, ${Math.round(30 - depthPct * 15)}%, ${0.1 + depthPct * 0.1})`;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Ocean column */}
      <div style={{
        ...navicueStyles.heroCssScene(verse.palette, 160 / 160),
        overflow: 'hidden',
      }}>
        {/* Water layers */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`layer${i}`}
            style={{
              position: 'absolute',
              top: i * 16,
              left: 0,
              width: '100%',
              height: 16,
              background: `hsla(210, ${Math.round(20 + (i / 10) * 20)}%, ${Math.round(30 - (i / 10) * 15)}%, ${0.1 + (i / 10) * 0.1})`,
            }}
          />
        ))}

        {/* Depth indicator (diver) */}
        <motion.div
          animate={{ y: depthPct * 130 }}
          style={{
            position: 'absolute', left: '50%', top: 10,
            width: 10, height: 10, borderRadius: '50%',
            background: done ? verse.palette.accent : 'hsla(200, 40%, 60%, 0.5)',
            border: `1px solid ${done ? verse.palette.accent : verse.palette.primaryGlow}`,
            transform: 'translateX(-50%)',
            opacity: 0.6 + silence * 0.3,
          }}
        />

        {/* Depth meter */}
        <div style={{
          position: 'absolute', right: 8, top: 8, bottom: 8,
          width: 3, borderRadius: 2,
          background: 'hsla(0, 0%, 50%, 0.1)',
        }}>
          <motion.div
            animate={{ height: `${depthPct * 100}%` }}
            style={{
              width: '100%', borderRadius: 2,
              background: verse.palette.accent,
              opacity: 0.3,
            }}
          />
        </div>

        {/* Depth labels */}
        <span style={{
          position: 'absolute', top: 5, left: 8,
          ...navicueStyles.annotation(verse.palette),
          opacity: chaos * 0.4,
        }}>
          {chaos > 0.5 ? 'noise' : 'fading...'}
        </span>
        <span style={{
          position: 'absolute', bottom: 5, left: 8,
          ...navicueStyles.annotation(verse.palette),
          opacity: silence * 0.4,
        }}>
          {silence > 0.5 ? 'silence' : 'deepening...'}
        </span>
      </div>

      {/* Action */}
      {!done ? (
        <motion.div
          drag="y"
          dragConstraints={{ top: -20, bottom: 60 }}
          dragElastic={0.1}
          dragMomentum={false}
          onDrag={handleDrag}
          style={{
            ...immersiveTapButton(verse.palette).base,
            cursor: 'grab',
            touchAction: 'none',
          }}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          dive deeper
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          silence
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'inner peace' : depthPct > 0.5 ? 'quieting...' : 'stormy surface'}
      </div>
    </div>
  );
}