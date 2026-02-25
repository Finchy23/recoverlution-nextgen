/**
 * RESONATOR #5 -- 1025. The Feedback Loop (The Howl)
 * "You are looping your own anxiety. Step back from the speaker."
 * INTERACTION: Drag the mic away from the speaker to kill the screech
 * STEALTH KBE: Disengagement -- somatic distancing (E)
 *
 * COMPOSITOR: pattern_glitch / Ocean / work / embodying / drag / 1025
 */
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { useDragInteraction } from '../interactions/useDragInteraction';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Resonator_FeedbackLoop({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Ocean',
        chrono: 'work',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1025,
        isSeal: false,
      }}
      arrivalText="A screech builds."
      prompt="You are obsessing. That is just audio feedback. You are looping your own anxiety back into yourself. Step back from the speaker."
      resonantText="The feedback loop. When output becomes input without attenuation, amplitude explodes. The antidote is distance. Not avoidance. Distance. Enough space for the signal to decay before it re-enters."
      afterglowCoda="Clarity returns."
      onComplete={onComplete}
    >
      {(verse) => <FeedbackLoopInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FeedbackLoopInteraction({ verse }: { verse: any }) {
  const [distance, setDistance] = useState(0); // 0 = too close, 1 = far enough
  const [resolved, setResolved] = useState(false);

  const drag = useDragInteraction({
    axis: 'horizontal',
    onDragMove: (x) => {
      setDistance(x);
      if (x > 0.85 && !resolved) {
        setResolved(true);
        setTimeout(() => verse.advance(), 2000);
      }
    },
  });

  const screechIntensity = Math.max(0, 1 - distance * 1.2);
  const chaos = screechIntensity;

  // Feedback screech waveform -- gets calmer with distance
  const screechPath = useMemo(() => {
    return Array.from({ length: 60 }, (_, x) => {
      const px = x * 4;
      const amplitude = chaos * 25;
      const freq1 = Math.sin(px * 0.15) * amplitude;
      const freq2 = Math.sin(px * 0.23 + 1.3) * amplitude * 0.6;
      const py = 40 + freq1 + freq2;
      return `${x === 0 ? 'M' : 'L'} ${px} ${py}`;
    }).join(' ');
  }, [chaos]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Screech visualization */}
      <svg width="240" height="80" viewBox="0 0 240 80">
        <motion.path
          d={screechPath}
          fill="none"
          stroke={chaos > 0.5 ? verse.palette.accent : verse.palette.primary}
          strokeWidth={0.5 + chaos * 1}
          animate={{ opacity: [0.1 + chaos * 0.15, 0.2 + chaos * 0.15] }}
          transition={{ duration: 0.3 + (1 - chaos) * 1.5, repeat: Infinity, repeatType: 'reverse' }}
        />
        {/* Calm line appears as distance increases */}
        {distance > 0.3 && (
          <motion.line x1="0" y1="40" x2="240" y2="40"
            stroke={verse.palette.primary}
            strokeWidth={0.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: distance * 0.12 }}
          />
        )}
      </svg>

      {/* Mic-speaker diagram */}
      <div style={navicueStyles.heroCssScene(verse.palette, 260 / 50)}>
        {/* Speaker icon (fixed right) */}
        <div style={{
          position: 'absolute', right: 10, top: 10,
          width: 30, height: 30, borderRadius: 4,
          border: `1px solid ${verse.palette.primaryGlow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ ...navicueType.micro, color: verse.palette.textFaint, fontSize: 11 }}>spkr</span>
        </div>
        {/* Mic (draggable) */}
        <motion.div
          {...drag.dragProps}
          style={{
            ...drag.dragProps.style,
            ...navicueInteraction.dragTrack,
            position: 'absolute',
            left: `${(1 - distance) * 60}%`,
            top: 5,
            width: 40, height: 40, borderRadius: '50%',
            background: verse.palette.primaryFaint,
            border: `1px solid ${verse.palette.primaryGlow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'grab',
          }}
        >
          <span style={{ ...navicueType.micro, color: verse.palette.text, fontSize: 11 }}>mic</span>
        </motion.div>
      </div>

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint }}>
        {resolved ? 'silence' : distance > 0.5 ? 'fading...' : 'drag the mic away'}
      </div>
    </div>
  );
}