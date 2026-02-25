/**
 * FULCRUM #2 -- 1202. The Long Lever (Distance)
 * "You are trying to lift a mountain in a day. Extend the handle."
 * INTERACTION: Tap to choose short lever (Today) or long lever (5 Years)
 * STEALTH KBE: Patience -- Long-Term Orientation (B)
 *
 * COMPOSITOR: sacred_ordinary / Drift / social / believing / tap / 1202
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Fulcrum_LongLever({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1202,
        isSeal: false,
      }}
      arrivalText="A mountain. A lever."
      prompt="You are trying to lift a mountain in a day. Extend the handle. Time is the lever. If you push for five years, the mountain is a feather."
      resonantText="Patience. The mountain did not shrink. Your lever grew. Long-term orientation is not passivity. It is physics with a wider timeline."
      afterglowCoda="Extend the timeline."
      onComplete={onComplete}
    >
      {(verse) => <LeverInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function LeverInteraction({ verse }: { verse: any }) {
  const [choice, setChoice] = useState<'short' | 'long' | null>(null);
  const [lifting, setLifting] = useState(false);
  const [result, setResult] = useState<'stuck' | 'flies' | null>(null);

  const btn = immersiveTapButton(verse.palette);

  const handleChoice = (c: 'short' | 'long') => {
    if (choice) return;
    setChoice(c);
    setLifting(true);

    if (c === 'short') {
      setTimeout(() => {
        setResult('stuck');
        setLifting(false);
      }, 1200);
    } else {
      setTimeout(() => {
        setResult('flies');
        setLifting(false);
        setTimeout(() => verse.advance(), 2500);
      }, 1800);
    }
  };

  const SCENE_W = 260;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Physics visualization */}
      <div style={{
        position: 'relative', width: SCENE_W, height: 130,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}>
        {/* Mountain */}
        <motion.div
          animate={{
            y: result === 'flies' ? -50 : 0,
            opacity: result === 'flies' ? 0.15 : safeOpacity(0.35),
            scale: result === 'flies' ? 0.6 : 1,
          }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            bottom: 20, right: 30,
            width: 0, height: 0,
            borderLeft: '40px solid transparent',
            borderRight: '40px solid transparent',
            borderBottom: `60px solid ${verse.palette.primary}`,
            opacity: 0.35,
          }}
        />

        {/* Lever */}
        <motion.div
          animate={{
            width: choice === 'long' ? 200 : choice === 'short' ? 80 : 120,
            rotate: result === 'flies' ? -15 : result === 'stuck' ? 2 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            bottom: 20, left: 20,
            height: 2,
            background: verse.palette.primary,
            opacity: safeOpacity(0.3),
            transformOrigin: '85% 100%',
          }}
        />

        {/* Fulcrum */}
        <div style={{
          position: 'absolute',
          bottom: 8, right: 60,
          width: 0, height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: `10px solid ${verse.palette.accent}`,
          opacity: safeOpacity(0.5),
        }} />

        {/* Ground */}
        <div style={{
          position: 'absolute', bottom: 18, left: 0, right: 0,
          height: 1, background: verse.palette.primary, opacity: 0.08,
        }} />

        {/* Timeline labels */}
        <AnimatePresence>
          {choice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              style={{
                position: 'absolute', bottom: 28, left: 20,
                ...navicueType.micro, color: verse.palette.textFaint,
              }}
            >
              {choice === 'short' ? 'today' : '5 years'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shake on failure */}
        {result === 'stuck' && (
          <motion.div
            key="stuck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6, x: [0, -3, 3, -2, 0] }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute', bottom: 50, left: 25,
              ...navicueType.micro, color: verse.palette.shadow,
            }}
          >
            impossible lift
          </motion.div>
        )}
      </div>

      {/* Choice buttons */}
      {!choice && (
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button
            style={btn.base}
            whileTap={btn.active}
            onClick={() => handleChoice('short')}
          >
            short lever (today)
          </motion.button>
          <motion.button
            style={{ ...btn.base, color: verse.palette.accent, border: `1px solid ${verse.palette.accentGlow}` }}
            whileTap={btn.active}
            onClick={() => handleChoice('long')}
          >
            long lever (5 years)
          </motion.button>
        </div>
      )}

      {/* After wrong choice, offer retry */}
      {result === 'stuck' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ ...btn.base, color: verse.palette.accent, border: `1px solid ${verse.palette.accentGlow}` }}
          whileTap={btn.active}
          onClick={() => {
            setChoice(null);
            setResult(null);
            setLifting(false);
            handleChoice('long');
          }}
        >
          extend the timeline
        </motion.button>
      )}

      {/* Hint */}
      <span style={navicueStyles.interactionHint(verse.palette)}>
        {result === 'flies'
          ? 'the mountain is a feather'
          : result === 'stuck'
            ? 'the lever is too short'
            : 'choose your timeline'}
      </span>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {result === 'flies' ? 'patience' : 'which lever?'}
      </div>
    </div>
  );
}
