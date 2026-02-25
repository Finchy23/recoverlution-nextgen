/**
 * RECEIVER #6 -- 1176. The Interference Pattern
 * "Uncross the wires. Isolate the desire from the fear."
 * INTERACTION: Two signals crossing. Chaos. Drag to separate them into two clear streams.
 * STEALTH KBE: Differentiation -- clarity (K)
 *
 * COMPOSITOR: pattern_glitch / Pulse / work / knowing / drag / 1176
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Receiver_InterferencePattern({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'work',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1176,
        isSeal: false,
      }}
      arrivalText="Two signals crossing. Chaos."
      prompt="You are mixing your signals. I want this. I fear that. Uncross the wires. Isolate the desire from the fear."
      resonantText="Differentiation. Two waves were tangled into one knot of noise. You pulled them apart and each became music. Clarity is not one truth. It is two truths, separated."
      afterglowCoda="Two streams."
      onComplete={onComplete}
    >
      {(verse) => <InterferenceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InterferenceInteraction({ verse }: { verse: any }) {
  const [separation, setSeparation] = useState(0);
  const [done, setDone] = useState(false);
  const SEP_TARGET = 60;

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    const delta = Math.abs(info.delta.y);
    setSeparation(prev => {
      const next = Math.min(SEP_TARGET, prev + delta * 0.5);
      if (next >= SEP_TARGET) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, verse]);

  const sepPct = separation / SEP_TARGET;
  const offset = sepPct * 18;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Signal A (desire) -- rises as separated */}
          <path
            d={Array.from({ length: 50 }).map((_, i) => {
              const x = 10 + i * 3;
              const y = 50 - offset + Math.sin(i * 0.3) * 8;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.4)'}
            strokeWidth={1.5}
            opacity={0.3 + sepPct * 0.4}
          />

          {/* Signal B (fear) -- drops as separated */}
          <path
            d={Array.from({ length: 50 }).map((_, i) => {
              const x = 10 + i * 3;
              const y = 50 + offset + Math.sin(i * 0.3 + 2) * 8;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke={done ? verse.palette.accent : 'hsla(340, 20%, 50%, 0.3)'}
            strokeWidth={1.5}
            opacity={0.3 + sepPct * 0.4}
          />

          {/* Interference zone (center, shrinks) */}
          {!done && (
            <rect
              x={10} y={50 - 2 + offset * 0.3}
              width={140} height={Math.max(0, 4 - offset * 0.2)}
              rx={1}
              fill="hsla(0, 20%, 50%, 0.1)"
            />
          )}

          {/* Labels */}
          {sepPct > 0.5 && (
            <>
              <text x={150} y={50 - offset - 3} textAnchor="end"
                style={{ ...navicueType.micro }}
                fill={done ? verse.palette.accent : 'hsla(200, 30%, 55%, 0.4)'}
                opacity={sepPct}>
                desire
              </text>
              <text x={150} y={50 + offset + 10} textAnchor="end"
                style={{ ...navicueType.micro }}
                fill="hsla(340, 20%, 50%, 0.3)"
                opacity={sepPct}>
                fear
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Drag control */}
      {!done ? (
        <motion.div
          drag="y"
          dragConstraints={{ top: -30, bottom: 30 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDrag={handleDrag}
          style={{
            ...immersiveTapButton(verse.palette).base,
            cursor: 'grab',
            touchAction: 'none',
          }}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          separate
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          isolated
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'clarity' : `separation: ${Math.round(sepPct * 100)}%`}
      </div>
    </div>
  );
}