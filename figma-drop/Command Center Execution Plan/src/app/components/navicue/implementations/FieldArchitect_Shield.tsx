/**
 * FIELD ARCHITECT #4 -- 1104. The Shield (Diamagnetism)
 * "Just bend it. Let it pass around you."
 * INTERACTION: Hostile beam approaches -- tap to activate bismuth shield -- beam bends around
 * STEALTH KBE: Boundaries -- psychological immunity (B)
 *
 * COMPOSITOR: koan_paradox / Stellar / night / believing / tap / 1104
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function FieldArchitect_Shield({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Stellar',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1104,
        isSeal: false,
      }}
      arrivalText="A hostile beam. Approaching."
      prompt="You do not need to fight the negativity. Just bend it. Let it pass around you. Be the stone in the river."
      resonantText="Boundaries. The beam did not stop. It bent. You did not fight, absorb, or run. You simply existed with enough density that the hostility had to go around."
      afterglowCoda="Untouched."
      onComplete={onComplete}
    >
      {(verse) => <ShieldInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ShieldInteraction({ verse }: { verse: any }) {
  const [shieldActive, setShieldActive] = useState(false);
  const [beamPhase, setBeamPhase] = useState<'approaching' | 'bending' | 'passed'>('approaching');
  const [beamX, setBeamX] = useState(-40);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Beam approaches
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setBeamX(prev => {
        if (beamPhase === 'passed') return prev;
        const next = prev + 1.2;
        if (next > 220) {
          clearInterval(intervalRef.current);
          if (shieldActive) {
            setBeamPhase('passed');
            setTimeout(() => verse.advance(), 2000);
          }
        }
        return Math.min(next, 220);
      });
    }, 30);
    return () => clearInterval(intervalRef.current);
  }, [beamPhase, shieldActive, verse]);

  // Detect beam near shield
  useEffect(() => {
    if (shieldActive && beamX > 60 && beamX < 140 && beamPhase === 'approaching') {
      setBeamPhase('bending');
    }
    if (shieldActive && beamX >= 140 && beamPhase === 'bending') {
      setBeamPhase('passed');
      setTimeout(() => verse.advance(), 2000);
    }
  }, [beamX, shieldActive, beamPhase, verse]);

  const activateShield = useCallback(() => {
    if (shieldActive) return;
    setShieldActive(true);
  }, [shieldActive]);

  const shieldCenter = 100;
  const beamBending = shieldActive && beamX > 50 && beamX < 150;
  const beamCurveY = beamBending ? Math.sin((beamX - 50) / 100 * Math.PI) * 35 : 0;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 200 / 120)}>
        <svg viewBox="0 0 200 120" style={navicueStyles.heroSvg}>
          {beamPhase !== 'passed' ? (
            <>
              {/* Beam path */}
              <line
                x1={0} y1={60}
                x2={Math.min(beamX, shieldActive ? 55 : 200)} y2={60}
                stroke="hsla(0, 50%, 55%, 0.6)"
                strokeWidth={3}
              />
              {shieldActive && beamX > 50 && (
                <>
                  {/* Upper bend */}
                  <path
                    d={`M 55,60 Q ${shieldCenter},${60 - 40} ${Math.min(beamX, 200)},60`}
                    fill="none"
                    stroke="hsla(0, 50%, 55%, 0.4)"
                    strokeWidth={1.5}
                  />
                  {/* Lower bend */}
                  <path
                    d={`M 55,60 Q ${shieldCenter},${60 + 40} ${Math.min(beamX, 200)},60`}
                    fill="none"
                    stroke="hsla(0, 50%, 55%, 0.4)"
                    strokeWidth={1.5}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {/* Passed beams (split) */}
              <path d={`M 0,60 L 55,60 Q ${shieldCenter},20 200,55`} fill="none" stroke="hsla(0, 40%, 55%, 0.2)" strokeWidth={1} />
              <path d={`M 0,60 L 55,60 Q ${shieldCenter},100 200,65`} fill="none" stroke="hsla(0, 40%, 55%, 0.2)" strokeWidth={1} />
            </>
          )}
        </svg>

        {/* Shield */}
        <AnimatePresence>
          {shieldActive && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 0.5,
                boxShadow: beamPhase === 'passed'
                  ? `0 0 24px ${verse.palette.accent}`
                  : `0 0 12px ${verse.palette.accent}`,
              }}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: 50, height: 50, borderRadius: '50%',
                border: `1px solid ${verse.palette.accent}`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* You (center) */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 8, height: 8, borderRadius: '50%',
          background: verse.palette.accent,
          transform: 'translate(-50%, -50%)',
          opacity: 0.7,
        }} />
      </div>

      {/* Action */}
      {!shieldActive ? (
        <motion.button onClick={activateShield}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          activate shield
        </motion.button>
      ) : beamPhase === 'passed' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
        >
          untouched
        </motion.div>
      ) : (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          shield active
        </span>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {beamPhase === 'passed' ? 'immune' : shieldActive ? 'bending negativity' : 'hostile incoming'}
      </div>
    </div>
  );
}