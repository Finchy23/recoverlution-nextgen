/**
 * AVIATOR #4 -- 1144. The Coffin Corner (High Altitude)
 * "Come down to where the air is thick."
 * INTERACTION: Flying high -- margin is razor thin -- descend to safer altitude
 * STEALTH KBE: Grounding -- psychological safety (B)
 *
 * COMPOSITOR: witness_ritual / Drift / social / believing / tap / 1144
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Aviator_CoffinCorner({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Drift',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1144,
        isSeal: false,
      }}
      arrivalText="High altitude. Thin margin."
      prompt="The higher you go, the narrower the margin. It is lonely at the top. Come down to where the air is thick. You have more room to maneuver."
      resonantText="Grounding. You descended. And the margin widened. The ego wanted altitude. The body needed air. Psychological safety is not retreat. It is choosing the altitude where you can actually breathe."
      afterglowCoda="Room to maneuver."
      onComplete={onComplete}
    >
      {(verse) => <CoffinCornerInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CoffinCornerInteraction({ verse }: { verse: any }) {
  const [altitude, setAltitude] = useState(45000);
  const [phase, setPhase] = useState<'high' | 'descending' | 'safe'>('high');
  const [wobble, setWobble] = useState(0);

  // Wobble at high altitude
  useEffect(() => {
    if (phase !== 'high') return;
    const interval = setInterval(() => setWobble(prev => prev + 1), 200);
    return () => clearInterval(interval);
  }, [phase]);

  const descend = useCallback(() => {
    if (phase !== 'high') return;
    setPhase('descending');
    const interval = setInterval(() => {
      setAltitude(prev => {
        const next = prev - 500;
        if (next <= 25000) {
          setPhase('safe');
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2000);
          return 25000;
        }
        return next;
      });
    }, 60);
  }, [phase, verse]);

  const margin = phase === 'safe' ? 80 : Math.max(5, 100 - (altitude - 25000) / 250);
  const dangerColor = altitude > 40000 ? verse.palette.shadow : altitude > 35000 ? 'hsla(40, 40%, 50%, 0.4)' : verse.palette.accent;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 120)}>
        {/* Altitude bands */}
        <div style={{ position: 'relative', width: 160, height: 120 }}>
          {/* Danger zone (top) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
            background: verse.palette.shadowFaint,
            borderRadius: '4px 4px 0 0',
            border: `1px solid ${verse.palette.shadowFaint}`,
          }} />
          {/* Safe zone (bottom) */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
            background: 'hsla(200, 25%, 40%, 0.1)',
            borderRadius: '0 0 4px 4px',
            border: `1px solid hsla(200, 25%, 45%, 0.15)`,
          }} />
          {/* Altitude pointer */}
          <motion.div
            animate={{ top: `${((45000 - altitude) / 20000) * 100}%` }}
            style={{
              position: 'absolute', left: -2, right: -2,
              height: 3, borderRadius: 2,
              background: dangerColor,
            }}
          />
        </div>

        {/* Margin indicator */}
        <div style={{ position: 'absolute', left: 55, top: 15, right: 10 }}>
          <span style={navicueStyles.annotation(verse.palette, 0.5)}>
            margin
          </span>
          <div style={{
            marginTop: 4, width: '100%', height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Narrow corridor */}
            <motion.div
              animate={{
                height: margin,
                background: dangerColor,
              }}
              style={{
                width: '80%', borderRadius: 3,
                border: `1px solid ${verse.palette.primaryGlow}`,
                opacity: 0.3,
              }}
            />
          </div>
        </div>

        {/* Plane dot */}
        <motion.div
          animate={{
            x: phase === 'high' ? [78, 82, 76] : 80,
            y: phase === 'high' ? [68, 72, 66] : 75,
          }}
          transition={phase === 'high' ? { repeat: Infinity, duration: 0.4 } : {}}
          style={{
            position: 'absolute',
            width: 8, height: 8, borderRadius: '50%',
            background: dangerColor,
            border: `1px solid ${verse.palette.primaryGlow}`,
          }}
        />

        {/* Stats */}
        <div style={{ position: 'absolute', bottom: 5, right: 10, textAlign: 'right' }}>
          <span style={{ ...navicueStyles.annotation(verse.palette, 0.5), display: 'block' }}>
            {(altitude / 1000).toFixed(0)}k ft
          </span>
          <span style={{
            ...navicueType.micro,
            color: dangerColor,
          }}>
            margin: {Math.round(margin)}%
          </span>
        </div>
      </div>

      {/* Action */}
      {phase === 'high' && (
        <motion.button onClick={descend}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          descend
        </motion.button>
      )}
      {phase === 'descending' && (
        <span style={navicueStyles.accentReadout(verse.palette, 0.6)}>
          descending...
        </span>
      )}
      {phase === 'safe' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          safe altitude
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'safe' ? 'psychological safety' : 'coffin corner'}
      </div>
    </div>
  );
}