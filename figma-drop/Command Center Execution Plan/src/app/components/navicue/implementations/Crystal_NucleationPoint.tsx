/**
 * CRYSTAL #8 -- 1128. The Nucleation Point
 * "One small act crystallizes the whole movement."
 * INTERACTION: Supercooled water -- drop a grain of sand -- instant crystallization
 * STEALTH KBE: Catalytic Action -- small actions matter (K)
 *
 * COMPOSITOR: science_x_soul / Glacier / work / knowing / tap / 1128
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Crystal_NucleationPoint({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Glacier',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1128,
        isSeal: false,
      }}
      arrivalText="Supercooled water. Liquid. Waiting."
      prompt="The change is ready. It just needs a starter. Be the grain of sand. One small act crystallizes the whole movement."
      resonantText="Catalytic Action. One grain. One instant. The entire bottle transformed. The change was already loaded. It just needed the smallest push. Small actions cascade."
      afterglowCoda="Crystallized."
      onComplete={onComplete}
    >
      {(verse) => <NucleationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NucleationInteraction({ verse }: { verse: any }) {
  const [dropped, setDropped] = useState(false);
  const [freezeProgress, setFreezeProgress] = useState(0);
  const [frozen, setFrozen] = useState(false);

  const dropGrain = useCallback(() => {
    if (dropped) return;
    setDropped(true);
  }, [dropped]);

  // Instant crystallization wave
  useEffect(() => {
    if (!dropped || frozen) return;
    const interval = setInterval(() => {
      setFreezeProgress(prev => {
        const next = prev + 3;
        if (next >= 100) {
          setFrozen(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2200);
        }
        return Math.min(next, 100);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [dropped, frozen, verse]);

  const freezePct = freezeProgress / 100;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Bottle */}
      <div style={navicueStyles.heroCssScene(verse.palette, 100 / 150)}>
        {/* Bottle outline */}
        <div style={{
          width: 50, height: 110,
          borderRadius: '8px 8px 12px 12px',
          border: `1px solid ${verse.palette.primaryGlow}`,
          opacity: 0.3,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Liquid / ice */}
          <motion.div
            animate={{
              background: frozen
                ? `linear-gradient(to bottom, hsla(200, 40%, 75%, 0.4), hsla(200, 50%, 65%, 0.5))`
                : `linear-gradient(to bottom, hsla(210, 30%, 55%, 0.15), hsla(210, 25%, 50%, 0.2))`,
            }}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '85%',
            }}
          />

          {/* Crystallization wave front */}
          {dropped && !frozen && (
            <motion.div
              animate={{ top: `${15 + freezeProgress * 0.7}%` }}
              style={{
                position: 'absolute', left: 0, right: 0,
                height: `${freezeProgress * 0.85}%`,
                bottom: 0,
                background: `linear-gradient(to bottom, transparent, hsla(200, 50%, 70%, 0.3))`,
              }}
            />
          )}

          {/* Crystal structures */}
          {freezePct > 0.3 && (
            <svg width={48} height={93} style={{ position: 'absolute', bottom: 0, left: 0 }}>
              {Array.from({ length: Math.floor(freezePct * 8) }).map((_, i) => {
                const cx = 10 + (i * 13 + 5) % 38;
                const cy = 80 - i * 10;
                return (
                  <polygon
                    key={i}
                    points={`${cx},${cy - 5} ${cx + 4},${cy} ${cx + 2},${cy + 5} ${cx - 2},${cy + 5} ${cx - 4},${cy}`}
                    fill="hsla(200, 40%, 70%, 0.2)"
                    stroke="hsla(200, 40%, 70%, 0.3)"
                    strokeWidth={0.5}
                  />
                );
              })}
            </svg>
          )}
        </div>

        {/* Grain of sand */}
        <AnimatePresence>
          {!dropped && (
            <motion.div
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute', top: 10, left: '50%',
                width: 5, height: 5, borderRadius: '50%',
                background: 'hsla(35, 40%, 50%, 0.6)',
                transform: 'translateX(-50%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Neck */}
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          width: 16, height: 15,
          border: `1px solid ${verse.palette.primaryGlow}`,
          borderBottom: 'none',
          borderRadius: '4px 4px 0 0',
          opacity: 0.3,
          transform: 'translateX(-50%)',
        }} />
      </div>

      {/* Action */}
      {!dropped ? (
        <motion.button onClick={dropGrain}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          drop the grain
        </motion.button>
      ) : frozen ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: 'hsla(200, 50%, 70%, 0.9)', fontSize: 11 }}>
          instant crystallization
        </motion.div>
      ) : (
        <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11, opacity: 0.6 }}>
          crystallizing...
        </span>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {frozen ? 'small actions matter' : dropped ? `${Math.round(freezeProgress)}%` : 'supercooled'}
      </div>
    </div>
  );
}