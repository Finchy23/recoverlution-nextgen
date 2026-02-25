/**
 * SIMULATOR #8 -- 1248. The Compression (The Gist)
 * "Zip it up. Put it in your pocket."
 * INTERACTION: Tap to compress a massive Worries file from 100GB to 1MB
 * STEALTH KBE: Compartmentalization -- Cognitive Load Management (B)
 *
 * COMPOSITOR: poetic_precision / Pulse / night / believing / tap / 1248
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Simulator_Compression({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1248,
        isSeal: false,
      }}
      arrivalText="A massive file: Worries.raw / 100 GB."
      prompt="You cannot carry the uncompressed data. Zip it up. Label it things to do later. Put it in your pocket."
      resonantText="Compartmentalization. The worries did not disappear. They compressed. Cognitive load management is not denial. It is packaging. You can carry 1MB. You cannot carry 100GB."
      afterglowCoda="Zip it up."
      onComplete={onComplete}
    >
      {(verse) => <CompressionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CompressionInteraction({ verse }: { verse: any }) {
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleCompress = () => {
    if (compressing) return;
    setCompressing(true);
  };

  // Animate compression progress
  useEffect(() => {
    if (!compressing || done) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.02;
        if (next >= 1) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => verse.advance(), 3000);
          return 1;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [compressing, done, verse]);

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 240;
  const SCENE_H = 140;

  // File size interpolation
  const currentSize = done ? 1 : Math.round(100 * (1 - progress * 0.99));
  const currentUnit = done ? 'MB' : 'GB';
  const fileWidth = done ? 30 : 180 * (1 - progress * 0.83);
  const fileHeight = done ? 25 : 80 * (1 - progress * 0.69);

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* File info */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{
          ...navicueType.micro,
          color: verse.palette.textFaint,
        }}>
          {done ? 'worries.zip' : 'worries.raw'}
        </span>
        <motion.span
          style={{
            ...navicueType.data,
            color: done ? verse.palette.accent : verse.palette.text,
          }}
        >
          {currentSize} {currentUnit}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* File rectangle -- shrinks */}
          <motion.rect
            rx={done ? 4 : 6}
            fill={done ? verse.palette.accent : verse.palette.primary}
            animate={{
              x: (SCENE_W - fileWidth) / 2,
              y: (SCENE_H - fileHeight) / 2,
              width: fileWidth,
              height: fileHeight,
              opacity: safeOpacity(done ? 0.2 : 0.08 + progress * 0.08),
            }}
            transition={{ duration: 0.1 }}
          />

          {/* File border */}
          <motion.rect
            rx={done ? 4 : 6}
            fill="none"
            stroke={done ? verse.palette.accent : verse.palette.primary}
            strokeWidth={done ? 1 : 0.5}
            animate={{
              x: (SCENE_W - fileWidth) / 2,
              y: (SCENE_H - fileHeight) / 2,
              width: fileWidth,
              height: fileHeight,
              opacity: safeOpacity(done ? 0.4 : 0.15),
            }}
            transition={{ duration: 0.1 }}
          />

          {/* Worry lines inside (disappear as compressed) */}
          {!done && Array.from({ length: Math.ceil((1 - progress) * 8) }).map((_, i) => (
            <motion.line
              key={i}
              x1={(SCENE_W - fileWidth) / 2 + 8}
              y1={(SCENE_H - fileHeight) / 2 + 10 + i * 8}
              x2={(SCENE_W - fileWidth) / 2 + fileWidth - 8}
              y2={(SCENE_H - fileHeight) / 2 + 10 + i * 8}
              stroke={verse.palette.primary}
              strokeWidth={1}
              opacity={safeOpacity(0.1 * (1 - progress))}
            />
          ))}

          {/* Compression arrows */}
          {compressing && !done && (
            <motion.g
              animate={{ opacity: [safeOpacity(0.2), safeOpacity(0.4), safeOpacity(0.2)] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              {/* Top arrow pointing down */}
              <path
                d={`M ${SCENE_W / 2},${(SCENE_H - fileHeight) / 2 - 15} L ${SCENE_W / 2},${(SCENE_H - fileHeight) / 2 - 5}`}
                stroke={verse.palette.accent} strokeWidth={1} markerEnd="none"
              />
              <path
                d={`M ${SCENE_W / 2 - 4},${(SCENE_H - fileHeight) / 2 - 9} L ${SCENE_W / 2},${(SCENE_H - fileHeight) / 2 - 5} L ${SCENE_W / 2 + 4},${(SCENE_H - fileHeight) / 2 - 9}`}
                fill="none" stroke={verse.palette.accent} strokeWidth={1}
              />
              {/* Bottom arrow pointing up */}
              <path
                d={`M ${SCENE_W / 2},${(SCENE_H + fileHeight) / 2 + 15} L ${SCENE_W / 2},${(SCENE_H + fileHeight) / 2 + 5}`}
                stroke={verse.palette.accent} strokeWidth={1}
              />
              <path
                d={`M ${SCENE_W / 2 - 4},${(SCENE_H + fileHeight) / 2 + 9} L ${SCENE_W / 2},${(SCENE_H + fileHeight) / 2 + 5} L ${SCENE_W / 2 + 4},${(SCENE_H + fileHeight) / 2 + 9}`}
                fill="none" stroke={verse.palette.accent} strokeWidth={1}
              />
            </motion.g>
          )}

          {/* Zip label when done */}
          {done && (
            <motion.text
              x={SCENE_W / 2} y={SCENE_H / 2 + 4}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            >
              .zip
            </motion.text>
          )}

          {/* Label: things to do later */}
          {done && (
            <motion.text
              x={SCENE_W / 2} y={SCENE_H / 2 + 28}
              textAnchor="middle"
              fill={verse.palette.textFaint}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.5 }}
            >
              things to do later
            </motion.text>
          )}
        </svg>
      </div>

      {/* Compress button */}
      {!compressing && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleCompress}
        >
          compress
        </motion.button>
      )}

      {/* Progress bar */}
      {compressing && !done && (
        <div style={{
          width: 200, height: 3, borderRadius: 2,
          backgroundColor: verse.palette.primary + '15',
        }}>
          <motion.div
            style={{
              height: '100%', borderRadius: 2,
              backgroundColor: verse.palette.accent,
            }}
            animate={{ width: `${progress * 100}%`, opacity: 0.4 }}
          />
        </div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'fits in your pocket now'
          : compressing
            ? `compressing... ${Math.round(progress * 100)}%`
            : '100 GB of worry. too heavy to carry.'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          cognitive load management
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'compartmentalization' : 'zip the worries'}
      </div>
    </div>
  );
}
