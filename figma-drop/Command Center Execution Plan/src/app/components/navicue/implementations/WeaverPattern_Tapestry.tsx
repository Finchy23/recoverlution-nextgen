/**
 * WEAVER PATTERN #3 -- 1283. The Tapestry (Reverse View)
 * "Do not judge your life by the loose ends. Flip the perspective."
 * INTERACTION: Tap to flip the tapestry from messy back to beautiful front
 * STEALTH KBE: Reframing -- Self-Compassion (B)
 *
 * COMPOSITOR: koan_paradox / Arc / night / believing / tap / 1283
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function WeaverPattern_Tapestry({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1283,
        isSeal: false,
      }}
      arrivalText="The back of a tapestry. Messy threads."
      prompt="The messy side is the work. The beautiful side is the result. Do not judge your life by the loose ends. Flip the perspective."
      resonantText="Reframing. You flipped the tapestry and the chaos became art. Self-compassion is the willingness to see the front of the fabric while you are still working on the back."
      afterglowCoda="Flip the perspective."
      onComplete={onComplete}
    >
      {(verse) => <TapestryInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TapestryInteraction({ verse }: { verse: any }) {
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const handleFlip = () => {
    if (flipped) return;
    setFlipped(true);
    setDone(true);
    setTimeout(() => verse.advance(), 3500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 240, H = 170;

  // Messy thread paths (chaotic)
  const messyPaths = [
    'M 30,30 Q 80,15 120,45 Q 100,80 60,70 Q 90,55 140,65',
    'M 50,20 Q 130,50 90,90 Q 150,100 180,60 Q 200,30 210,55',
    'M 25,60 Q 70,100 120,80 Q 80,120 160,110 Q 200,95 215,80',
    'M 40,100 Q 100,70 140,120 Q 170,90 200,130 Q 180,140 210,125',
    'M 60,130 Q 120,105 90,140 Q 150,130 180,150',
    'M 200,25 Q 170,45 210,70 Q 190,85 220,55',
    'M 30,140 Q 60,110 45,130 Q 90,125 80,145',
  ];

  // Beautiful ordered pattern (geometric)
  const beautyPaths = [
    'M 30,40 Q 70,25 120,40 Q 170,55 210,40',
    'M 30,65 Q 70,50 120,65 Q 170,80 210,65',
    'M 30,90 Q 70,75 120,90 Q 170,105 210,90',
    'M 30,115 Q 70,100 120,115 Q 170,130 210,115',
    'M 30,140 Q 70,125 120,140 Q 170,155 210,140',
  ];

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Side indicator */}
      <motion.span
        style={{ ...navicueType.micro, color: flipped ? verse.palette.accent : verse.palette.textFaint }}
        animate={{ opacity: 0.5 }}
      >
        {flipped ? 'front / the art' : 'back / the work'}
      </motion.span>

      <motion.div
        style={{
          position: 'relative', width: W, height: H,
          perspective: 800,
        }}
      >
        <motion.div
          style={{
            width: W, height: H,
            transformStyle: 'preserve-3d',
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* BACK (messy) */}
          <div style={{
            position: 'absolute', width: W, height: H,
            backfaceVisibility: 'hidden',
          }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
              <rect x={5} y={5} width={W - 10} height={H - 10} rx={6}
                fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
              <rect x={5} y={5} width={W - 10} height={H - 10} rx={6}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} opacity={safeOpacity(0.1)} />

              {messyPaths.map((d, i) => (
                <path key={i} d={d}
                  fill="none"
                  stroke={verse.palette.primary}
                  strokeWidth={1 + Math.random() * 1.5}
                  strokeLinecap="round"
                  opacity={safeOpacity(0.1 + (i % 3) * 0.05)} />
              ))}

              {/* Loose thread ends */}
              {[
                [140, 65, 155, 58], [180, 60, 195, 52],
                [90, 90, 75, 82], [200, 130, 215, 138],
                [80, 145, 65, 150],
              ].map(([x1, y1, x2, y2], i) => (
                <line key={`loose-${i}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={verse.palette.shadow}
                  strokeWidth={0.8}
                  strokeDasharray="2 2"
                  opacity={safeOpacity(0.12)} />
              ))}

              <text x={W / 2} y={H / 2 + 4} textAnchor="middle"
                fill={verse.palette.shadow} style={navicueType.micro} opacity={0.25}>
                chaos
              </text>
            </svg>
          </div>

          {/* FRONT (beautiful) */}
          <div style={{
            position: 'absolute', width: W, height: H,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
              <rect x={5} y={5} width={W - 10} height={H - 10} rx={6}
                fill={verse.palette.accent} opacity={safeOpacity(0.04)} />
              <rect x={5} y={5} width={W - 10} height={H - 10} rx={6}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.2)} />

              {beautyPaths.map((d, i) => (
                <path key={i} d={d}
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  opacity={safeOpacity(0.15 + i * 0.04)} />
              ))}

              {/* Diamond pattern overlay */}
              {[0, 1, 2, 3].map(i => (
                <path key={`d-${i}`}
                  d={`M ${60 + i * 45},30 L ${82 + i * 45},85 L ${60 + i * 45},140 L ${38 + i * 45},85 Z`}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  opacity={safeOpacity(0.1)} />
              ))}

              <text x={W / 2} y={H / 2 + 4} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro} opacity={0.35}>
                order
              </text>
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {!flipped && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleFlip}>
          flip the tapestry
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'the mess was the art all along'
          : 'the back is always messy'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          self-compassion
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'reframing' : 'do not judge the loose ends'}
      </div>
    </div>
  );
}
