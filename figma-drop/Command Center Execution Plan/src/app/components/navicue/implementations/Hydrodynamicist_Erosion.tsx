/**
 * HYDRODYNAMICIST #4 -- 1134. The Erosion (Persistence)
 * "The water wins. Not by force, but by time. Keep dripping."
 * INTERACTION: Hold drip button -- drops fall -- time speeds up -- canyon forms
 * STEALTH KBE: Consistency -- persistence (B)
 *
 * COMPOSITOR: witness_ritual / Tide / night / believing / hold / 1134
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Hydrodynamicist_Erosion({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Tide',
        chrono: 'night',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1134,
        isSeal: false,
      }}
      arrivalText="A cliff face. A single drop."
      prompt="The rock is hard. The water is soft. The water wins. Not by force, but by time. Keep dripping."
      resonantText="Consistency. One drop. Then another. Then a million. The canyon did not appear suddenly. It appeared certainly. Persistence is the softest force and the strongest."
      afterglowCoda="Canyon."
      onComplete={onComplete}
    >
      {(verse) => <ErosionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ErosionInteraction({ verse }: { verse: any }) {
  const [holding, setHolding] = useState(false);
  const [drops, setDrops] = useState(0);
  const [erosion, setErosion] = useState(0);
  const [done, setDone] = useState(false);
  const [dropAnim, setDropAnim] = useState(0);
  const EROSION_TARGET = 100;

  useEffect(() => {
    if (!holding || done) return;
    const speed = Math.max(30, 200 - drops * 3); // accelerates over time
    const interval = setInterval(() => {
      setDrops(prev => prev + 1);
      setDropAnim(prev => prev + 1);
      setErosion(prev => {
        const next = Math.min(EROSION_TARGET, prev + 0.8 + drops * 0.05);
        if (next >= EROSION_TARGET) {
          setDone(true);
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2200);
        }
        return next;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [holding, done, drops, verse]);

  const startHold = useCallback(() => { if (!done) setHolding(true); }, [done]);
  const endHold = useCallback(() => setHolding(false), []);

  const erosionPct = erosion / EROSION_TARGET;
  const canyonDepth = erosionPct * 40;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 130)}>
        {/* Cliff face */}
        <div style={{
          position: 'absolute', bottom: 0, left: 30, right: 30,
          height: 60,
          background: 'hsla(30, 15%, 30%, 0.3)',
          borderRadius: '4px 4px 0 0',
          border: `1px solid ${verse.palette.primaryGlow}`,
          opacity: 0.4,
          overflow: 'hidden',
        }}>
          {/* Canyon groove */}
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            width: 6 + erosionPct * 10,
            height: canyonDepth,
            background: 'hsla(30, 10%, 20%, 0.3)',
            borderRadius: '0 0 4px 4px',
            transform: 'translateX(-50%)',
            transition: 'all 0.2s',
          }} />
        </div>

        {/* Drip source */}
        <div style={{
          position: 'absolute', top: 20, left: '50%',
          width: 12, height: 6,
          background: 'hsla(200, 30%, 50%, 0.2)',
          borderRadius: '0 0 6px 6px',
          transform: 'translateX(-50%)',
        }} />

        {/* Falling drops */}
        {holding && !done && (
          <motion.div
            key={dropAnim}
            initial={{ y: 26, opacity: 0.6 }}
            animate={{ y: 68, opacity: 0.2 }}
            transition={{ duration: Math.max(0.15, 0.5 - drops * 0.005) }}
            style={{
              position: 'absolute', left: '50%',
              width: 3, height: 6,
              background: 'hsla(200, 40%, 55%, 0.5)',
              borderRadius: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        )}

        {/* Time indicator */}
        <span style={{
          position: 'absolute', top: 5, right: 5,
          ...navicueStyles.annotation(verse.palette, 0.3),
        }}>
          {drops < 10 ? 'drip' : drops < 30 ? 'drip drip' : drops < 60 ? 'years...' : 'millennia'}
        </span>
      </div>

      {/* Action */}
      {!done ? (
        <motion.button
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          {holding ? `dripping (${drops})` : 'drip'}
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          carved
        </motion.div>
      )}

      {!done && (
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${erosionPct * 100}%` }}
            style={{ height: '100%', background: 'hsla(200, 40%, 55%, 0.5)', borderRadius: 2 }} />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'persistence' : `erosion: ${Math.round(erosion)}%`}
      </div>
    </div>
  );
}