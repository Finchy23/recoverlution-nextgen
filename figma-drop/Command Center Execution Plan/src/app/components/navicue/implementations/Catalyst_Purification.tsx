/**
 * CATALYST #7 -- 1067. The Purification (Distill)
 * "Heat the situation until only the truth remains."
 * INTERACTION: Hold to boil away mud, then catch the vapor
 * STEALTH KBE: Essentialism -- positive extraction (B)
 *
 * COMPOSITOR: poetic_precision / Glacier / work / believing / hold / 1067
 */
import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Catalyst_Purification({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Glacier',
        chrono: 'work',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1067,
        isSeal: false,
      }}
      arrivalText="Muddy water. Clouded with noise."
      prompt="The mud stays behind. The spirit rises. Heat the situation until only the truth remains. Catch the vapor."
      resonantText="Essentialism. You boiled away the drama and collected the lesson. Purification is not denial. It is distillation to what matters."
      afterglowCoda="Catch the vapor."
      onComplete={onComplete}
    >
      {(verse) => <PurificationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PurificationInteraction({ verse }: { verse: any }) {
  const [boiling, setBoiling] = useState(false);
  const [heatProgress, setHeatProgress] = useState(0);
  const [steamRising, setSteamRising] = useState(false);
  const [caught, setCaught] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (boiling && !steamRising) {
      intervalRef.current = setInterval(() => {
        setHeatProgress(prev => {
          const next = prev + 0.02;
          if (next >= 1) {
            setSteamRising(true);
            setBoiling(false);
            return 1;
          }
          return next;
        });
      }, 100);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [boiling, steamRising]);

  const handleCatch = () => {
    setCaught(true);
    setTimeout(() => verse.advance(), 2200);
  };

  const mudOpacity = Math.max(0, 0.4 - heatProgress * 0.4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Distillation apparatus */}
      <div style={navicueStyles.heroCssScene(verse.palette, 200 / 140)}>
        {/* Flask */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 20,
          width: 70,
          height: 80,
          borderRadius: '4px 4px 35px 35px',
          border: `1px solid ${verse.palette.primaryGlow}`,
          overflow: 'hidden',
        }}>
          {/* Mud layer */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: `hsla(25, 30%, 25%, ${mudOpacity})`,
            }}
          />
          {/* Liquid */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${80 - heatProgress * 40}%`,
              background: `hsla(200, 20%, 40%, ${0.2 - heatProgress * 0.15})`,
            }}
          />
          {/* Bubbles */}
          {boiling && [0, 1, 2].map(i => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: verse.palette.primaryGlow,
                left: 15 + i * 18,
              }}
              animate={{ y: [-10, -50], opacity: [0.4, 0] }}
              transition={{ duration: 1 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11 }}>
              {heatProgress > 0.5 ? 'mud' : 'muddy water'}
            </span>
          </div>
        </div>

        {/* Steam path */}
        {steamRising && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            style={{
              position: 'absolute',
              top: 20,
              left: 55,
              width: 90,
              height: 1,
              background: verse.palette.primaryGlow,
            }}
          />
        )}

        {/* Steam particles rising */}
        {(heatProgress > 0.3 || steamRising) && [0, 1, 2].map(i => (
          <motion.div
            key={`steam-${i}`}
            style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: verse.palette.accent,
              opacity: 0.2,
              left: 45 + i * 8,
            }}
            animate={{
              y: [60, -20],
              x: steamRising ? [0, 60 + i * 10] : [0, 0],
              opacity: [0.3, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}

        {/* Collection vessel */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 10,
          width: 60,
          height: 60,
          borderRadius: '4px 4px 30px 30px',
          border: `1px solid ${caught ? verse.palette.accent : verse.palette.primaryGlow}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.4s',
        }}>
          {caught && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.3, y: 0 }}
              style={{
                position: 'absolute',
                bottom: 4,
                left: 4,
                right: 4,
                height: '40%',
                borderRadius: '0 0 26px 26px',
                background: `linear-gradient(to top, ${verse.palette.accent}40, transparent)`,
              }}
            />
          )}
          <span style={{ ...navicueType.hint, color: caught ? verse.palette.accent : verse.palette.textFaint, fontSize: 11 }}>
            {caught ? 'pure' : 'catch here'}
          </span>
        </div>
      </div>

      {/* Controls */}
      {!steamRising && !caught && (
        <button
          onPointerDown={() => setBoiling(true)}
          onPointerUp={() => setBoiling(false)}
          onPointerLeave={() => setBoiling(false)}
          style={{
            ...immersiveTapButton(verse.palette).base,
            background: boiling ? verse.palette.primaryFaint : 'transparent',
          }}
        >
          {boiling ? 'heating...' : 'hold to boil'}
        </button>
      )}

      {steamRising && !caught && (
        <motion.button onClick={handleCatch}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          catch the vapor
        </motion.button>
      )}
    </div>
  );
}