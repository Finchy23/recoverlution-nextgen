/**
 * KINETICIST #4 -- 1114. The Terminal Velocity
 * "Stop fighting the air. Relax into the fall."
 * INTERACTION: Falling fast -- tap to push harder (nothing changes) -- stop tapping -- wind becomes music
 * STEALTH KBE: Acceptance -- flow (B)
 *
 * COMPOSITOR: koan_paradox / Storm / night / believing / tap / 1114
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Kineticist_TerminalVelocity({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Storm',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1114,
        isSeal: false,
      }}
      arrivalText="Falling. The wind screams."
      prompt="You cannot go faster than the physics allow. Stop fighting the air. Relax into the fall. The speed is fixed; the style is yours."
      resonantText="Acceptance. You stopped pushing. And the screaming stopped. The speed did not change. But the experience transformed. Flow is not faster. Flow is frictionless."
      afterglowCoda="Max speed. Your style."
      onComplete={onComplete}
    >
      {(verse) => <TerminalVelocityInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TerminalVelocityInteraction({ verse }: { verse: any }) {
  const [pushCount, setPushCount] = useState(0);
  const [pushing, setPushing] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [windLines, setWindLines] = useState<{ id: number; y: number; speed: number }[]>([]);
  const lastPushRef = useRef(0);
  const PUSH_THRESHOLD = 4; // must push 4 times then stop

  // Wind lines animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWindLines(prev => {
        const next = prev
          .map(w => ({ ...w, y: w.y + w.speed }))
          .filter(w => w.y < 200);
        if (Math.random() > 0.4) {
          next.push({ id: Date.now(), y: -10, speed: 3 + Math.random() * 4 });
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Detect acceptance (stop pushing after threshold)
  useEffect(() => {
    if (pushCount < PUSH_THRESHOLD || accepted) return;
    const check = setInterval(() => {
      if (Date.now() - lastPushRef.current > 2500) {
        setAccepted(true);
        clearInterval(check);
        setTimeout(() => verse.advance(), 2500);
      }
    }, 300);
    return () => clearInterval(check);
  }, [pushCount, accepted, verse]);

  const push = useCallback(() => {
    if (accepted) return;
    lastPushRef.current = Date.now();
    setPushing(true);
    setPushCount(prev => prev + 1);
    setTimeout(() => setPushing(false), 200);
  }, [accepted]);

  const chaos = !accepted;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 150)}>
        {/* Wind lines */}
        {windLines.map(w => (
          <motion.div
            key={w.id}
            style={{
              position: 'absolute',
              left: 20 + (w.id % 140),
              top: w.y,
              width: 1,
              height: chaos ? 8 + Math.random() * 12 : 16,
              background: chaos
                ? 'hsla(0, 0%, 60%, 0.3)'
                : verse.palette.accent,
              opacity: chaos ? 0.3 : 0.15,
            }}
          />
        ))}

        {/* Falling figure */}
        <motion.div
          animate={{
            x: chaos ? [88, 92, 86, 90] : 90,
            rotate: chaos && pushing ? [-5, 5, -3] : 0,
          }}
          transition={chaos ? { repeat: Infinity, duration: 0.3 } : { duration: 1 }}
          style={{
            position: 'absolute',
            left: 80, top: '40%',
            width: 16, height: 16, borderRadius: '50%',
            background: accepted ? verse.palette.accent : verse.palette.textFaint,
            opacity: accepted ? 0.8 : 0.5,
            border: `1px solid ${verse.palette.primaryGlow}`,
          }}
        />

        {/* Speed readout */}
        <span style={{
          position: 'absolute', bottom: 8, right: 8,
          ...navicueStyles.annotation(verse.palette, 0.4),
        }}>
          {accepted ? 'terminal velocity' : pushing ? 'still terminal velocity' : 'max speed'}
        </span>
      </div>

      {/* Controls */}
      {!accepted ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <motion.button onClick={push}
            style={immersiveTapButton(verse.palette).base}
            whileTap={immersiveTapButton(verse.palette).active}>
            push harder
          </motion.button>
          {pushCount >= PUSH_THRESHOLD && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              style={navicueStyles.annotation(verse.palette)}
            >
              ...or stop pushing
            </motion.span>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <span style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
            flowing
          </span>
          <span style={navicueStyles.annotation(verse.palette)}>
            the wind became music
          </span>
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {accepted ? 'flow' : `pushed ${pushCount}x (no change)`}
      </div>
    </div>
  );
}