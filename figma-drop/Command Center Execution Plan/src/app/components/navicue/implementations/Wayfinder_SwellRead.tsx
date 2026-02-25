/**
 * WAYFINDER #2 -- 1162. The Swell Read (The Pulse)
 * "Close your eyes. Feel the interruption in the rhythm."
 * INTERACTION: Canoe rocking gently. Feel a cross-swell. Steer into it. Land ahead.
 * STEALTH KBE: Somatic Sensing -- intuitive sensing (E)
 *
 * COMPOSITOR: sensory_cinema / Compass / morning / embodying / drag / 1162
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Wayfinder_SwellRead({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Compass',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1162,
        isSeal: false,
      }}
      arrivalText="A canoe. The ocean rocks."
      prompt="The land sends a pulse through the water. It bounces back. Close your eyes. Feel the interruption in the rhythm."
      resonantText="Somatic Sensing. You steered by feel, not sight. The swell carried the signal. The land whispered through the water and you listened with your body. Intuitive sensing is the oldest navigation."
      afterglowCoda="Land ahead."
      onComplete={onComplete}
    >
      {(verse) => <SwellReadInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SwellReadInteraction({ verse }: { verse: any }) {
  const [crossSwellDir, setCrossSwellDir] = useState<'left' | 'right'>('right');
  const [steered, setSteered] = useState(false);
  const [done, setDone] = useState(false);
  const [rockPhase, setRockPhase] = useState(0);
  const [swellCount, setSwellCount] = useState(0);
  const SWELL_TARGET = 3;

  // Rocking motion
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setRockPhase(prev => prev + 0.08);
    }, 50);
    return () => clearInterval(interval);
  }, [done]);

  // Change swell direction periodically
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setCrossSwellDir(Math.random() > 0.5 ? 'left' : 'right');
      setSteered(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [done]);

  const handleDrag = useCallback((_: any, info: any) => {
    if (done || steered) return;
    const steerDir = info.delta.x > 0 ? 'right' : 'left';
    if (steerDir === crossSwellDir) {
      setSteered(true);
      setSwellCount(prev => {
        const next = prev + 1;
        if (next >= SWELL_TARGET) {
          setDone(true);
          setTimeout(() => verse.advance(), 2200);
        }
        return next;
      });
    }
  }, [done, steered, crossSwellDir, verse]);

  const rockAngle = Math.sin(rockPhase) * 4;
  const crossBump = Math.sin(rockPhase * 1.7) * 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      {/* Ocean scene */}
      <motion.div
        animate={{ rotate: rockAngle + crossBump }}
        style={{ ...navicueStyles.heroCssScene(verse.palette, 160 / 100), transformOrigin: 'center bottom' }}
      >
        {/* Waves */}
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {[0, 1, 2, 3].map(i => (
            <motion.path key={i}
              animate={{
                d: `M 0 ${65 + i * 8} Q ${40 + Math.sin(rockPhase + i) * 10} ${60 + i * 8 + Math.sin(rockPhase + i * 0.7) * 3} ${80} ${65 + i * 8} Q ${120 + Math.sin(rockPhase + i + 1) * 10} ${60 + i * 8 + Math.sin(rockPhase + i * 0.7 + 1) * 3} 160 ${65 + i * 8}`,
              }}
              fill="none"
              stroke={done ? verse.palette.accent : 'hsla(200, 25%, 45%, 0.2)'}
              strokeWidth={0.8}
              opacity={0.15 + i * 0.05}
            />
          ))}

          {/* Canoe */}
          <path d="M 55 55 Q 80 48 105 55" fill="none"
            stroke={done ? verse.palette.accent : 'hsla(30, 20%, 45%, 0.4)'}
            strokeWidth={2} strokeLinecap="round" />
          <line x1={80} y1={48} x2={80} y2={35}
            stroke={done ? verse.palette.accent : 'hsla(30, 20%, 45%, 0.3)'}
            strokeWidth={1} />

          {/* Cross-swell indicator */}
          {!done && !steered && (
            <motion.text
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              x={crossSwellDir === 'right' ? 130 : 30} y={55}
              textAnchor="middle"
              style={{ ...navicueType.hint, fontSize: 8 }}
              fill="hsla(200, 30%, 50%, 0.5)"
            >
              {crossSwellDir === 'right' ? '~>' : '<~'}
            </motion.text>
          )}
        </svg>

        {/* Swell label */}
        <span style={{
          position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)',
          ...navicueType.hint, fontSize: 8, color: verse.palette.textFaint, opacity: 0.4,
        }}>
          {done ? 'land ahead' : steered ? 'reading...' : 'feel the swell'}
        </span>
      </motion.div>

      {/* Steer control */}
      {!done ? (
        <motion.div
          drag="x"
          dragConstraints={{ left: -40, right: 40 }}
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
          steer
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          found
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'intuitive sensing' : `swells read: ${swellCount}/${SWELL_TARGET}`}
      </div>
    </div>
  );
}