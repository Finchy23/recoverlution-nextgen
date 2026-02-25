/**
 * CONDUCTOR #8 -- 1218. The Switch (Conscious Control)
 * "You are not a generator running 24/7. Install the switch."
 * INTERACTION: Tap to toggle the switch Off/On. Off = dark quiet. On = light.
 * STEALTH KBE: Deactivation -- Restoration (E)
 *
 * COMPOSITOR: sacred_ordinary / Circuit / night / embodying / tap / 1218
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTap,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Conductor_Switch({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Circuit',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1218,
        isSeal: false,
      }}
      arrivalText="The light is stuck on."
      prompt="You are not a generator running 24/7. You are a lamp. Install the switch. Mastery is the ability to turn off."
      resonantText="Deactivation. The switch did not destroy the light. It gave you dominion over it. Restoration is the space between the on and the off. Without darkness, light has no meaning."
      afterglowCoda="Click."
      onComplete={onComplete}
    >
      {(verse) => <SwitchInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SwitchInteraction({ verse }: { verse: any }) {
  const [hasSwitch, setHasSwitch] = useState(false);
  const [isOn, setIsOn] = useState(true);
  const [toggleCount, setToggleCount] = useState(0);
  const [done, setDone] = useState(false);
  const [burnLevel, setBurnLevel] = useState(0.8);

  // Light is stuck on and burning before switch installed
  const burning = !hasSwitch;

  const installSwitch = useCallback(() => {
    if (hasSwitch) return;
    setHasSwitch(true);
    setIsOn(true);
  }, [hasSwitch]);

  const toggle = useCallback(() => {
    if (!hasSwitch || done) return;
    const next = !isOn;
    setIsOn(next);
    setToggleCount(prev => {
      const count = prev + 1;
      if (!next && count >= 2) {
        // Second time turning off = mastery demonstrated
        setDone(true);
        setTimeout(() => verse.advance(), 3000);
      }
      return count;
    });
  }, [hasSwitch, isOn, done, verse]);

  const tap = immersiveTap(verse.palette);
  const SCENE_W = 200;
  const SCENE_H = 160;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Light + switch scene */}
      <motion.div
        style={{
          ...tap.zone,
          position: 'relative',
          width: SCENE_W,
          height: SCENE_H,
          overflow: 'hidden',
          cursor: hasSwitch ? 'pointer' : 'default',
        }}
        onClick={hasSwitch ? toggle : undefined}
        whileTap={hasSwitch && !done ? { scale: 0.98 } : {}}
      >
        {/* Room darkness overlay */}
        <motion.div
          animate={{
            opacity: !isOn && hasSwitch ? 0.85 : 0,
          }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute', inset: 0,
            background: verse.palette.base,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Bulb */}
        <motion.div
          animate={{
            opacity: isOn ? safeOpacity(0.6) : safeOpacity(0.1),
            scale: isOn ? 1 : 0.9,
          }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: 20, left: '50%', transform: 'translateX(-50%)',
            width: 50, height: 50, borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${verse.palette.accent}, transparent 70%)`,
          }}
        />

        {/* Glow */}
        {isOn && (
          <motion.div
            animate={{
              opacity: burning
                ? [0.1, 0.2, 0.1]
                : [0.05, 0.08, 0.05],
              scale: burning ? [1, 1.1, 1] : 1,
            }}
            transition={{ repeat: Infinity, duration: burning ? 0.5 : 3 }}
            style={{
              position: 'absolute',
              top: -10, left: '50%', transform: 'translateX(-50%)',
              width: 120, height: 120, borderRadius: '50%',
              background: `radial-gradient(circle, ${verse.palette.accent}, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Burn warning (before switch) */}
        {burning && (
          <motion.span
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{
              position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
              ...navicueType.micro, color: verse.palette.shadow,
              whiteSpace: 'nowrap',
            }}
          >
            burning out
          </motion.span>
        )}

        {/* Switch (appears after install) */}
        {hasSwitch && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute', bottom: 15, left: '50%', transform: 'translateX(-50%)',
              width: 30, height: 48, borderRadius: 6,
              border: `1px solid ${verse.palette.primaryGlow}`,
              overflow: 'hidden',
              zIndex: 2,
            }}
          >
            <motion.div
              animate={{ y: isOn ? 0 : 24 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: '100%', height: 24,
                background: isOn ? verse.palette.accent : verse.palette.primary,
                opacity: safeOpacity(isOn ? 0.4 : 0.15),
                borderRadius: 4,
              }}
            />
          </motion.div>
        )}

        {/* Off state text */}
        {hasSwitch && !isOn && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5 }}
            style={{
              position: 'absolute', top: 55, left: '50%', transform: 'translateX(-50%)',
              ...navicueType.hint, color: verse.palette.textFaint,
              zIndex: 2, whiteSpace: 'nowrap',
            }}
          >
            quiet
          </motion.span>
        )}
      </motion.div>

      {/* Install switch button */}
      {!hasSwitch && (
        <motion.button
          style={{
            ...immersiveTap(verse.palette).zone,
            ...navicueType.choice,
            color: verse.palette.accent,
            border: `1px solid ${verse.palette.accentGlow}`,
            borderRadius: 8,
            padding: '14px 20px',
            boxShadow: `0 0 12px ${verse.palette.accentGlow}`,
            zIndex: 2,
            position: 'relative' as const,
          }}
          whileTap={{ scale: 0.97 }}
          onClick={installSwitch}
        >
          install the switch
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'mastery is the ability to turn off'
          : hasSwitch
            ? isOn
              ? 'tap to turn off'
              : 'tap to turn on'
            : 'the light cannot stop'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          restoration
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'deactivation' : 'control the current'}
      </div>
    </div>
  );
}
