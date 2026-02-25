/**
 * SIMULATOR #2 -- 1242. The Resolution Upgrade
 * "Low resolution implies malice. High resolution reveals suffering."
 * INTERACTION: Swipe/tap to upscale from pixelated block to high-res detail
 * STEALTH KBE: Empathy -- Nuance (B)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / social / believing / tap / 1242
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

export default function Simulator_ResolutionUpgrade({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1242,
        isSeal: false,
      }}
      arrivalText="A pixelated face. 'They are mean.'"
      prompt="Low resolution implies malice. High resolution reveals suffering. Upscale the image. Look closer before you judge."
      resonantText="Empathy. The pixels hid the wrinkles, the fear, the exhaustion. At low resolution you saw an enemy. At high resolution you saw a person. Nuance is the upgrade from judgment to understanding."
      afterglowCoda="Look closer."
      onComplete={onComplete}
    >
      {(verse) => <ResolutionUpgradeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ResolutionUpgradeInteraction({ verse }: { verse: any }) {
  const [resolution, setResolution] = useState(0); // 0=pixel, 1=medium, 2=4k
  const [done, setDone] = useState(false);

  const handleUpscale = () => {
    if (resolution >= 2) return;
    const next = resolution + 1;
    setResolution(next);
    if (next === 2) {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 200;
  const SCENE_H = 200;

  // Pixel sizes decrease as resolution increases
  const pixelSize = resolution === 0 ? 20 : resolution === 1 ? 8 : 3;
  const gridSize = Math.ceil(SCENE_W / pixelSize);

  // Face-like pattern generator
  const isPartOfFace = (gx: number, gy: number, total: number) => {
    const cx = total / 2;
    const cy = total / 2;
    const dx = (gx - cx) / cx;
    const dy = (gy - cy) / cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Oval face
    if (dist > 0.85) return 0;
    // Eyes
    if (Math.abs(dy + 0.2) < 0.12 && Math.abs(Math.abs(dx) - 0.3) < 0.1) return 0.6;
    // Mouth (subtle line at high res)
    if (resolution >= 2 && Math.abs(dy - 0.25) < 0.06 && Math.abs(dx) < 0.25) return 0.3;
    // Wrinkles (only at 4K)
    if (resolution >= 2) {
      if (Math.abs(dy + 0.05) < 0.03 && dx > 0.15 && dx < 0.5) return 0.15;
      if (Math.abs(dy + 0.05) < 0.03 && dx < -0.15 && dx > -0.5) return 0.15;
      if (Math.abs(dy - 0.1) < 0.02 && Math.abs(dx) < 0.15) return 0.12;
    }
    // Face fill
    return dist < 0.7 ? 0.08 : 0.04;
  };

  const labels = [
    '"they are mean"',
    '"they seem... tired?"',
    '"they are scared"',
  ];

  const resLabels = ['8-bit', '480p', '4K'];

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Resolution indicator */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {resLabels.map((label, i) => (
          <motion.span
            key={label}
            style={{
              ...navicueType.micro,
              color: i <= resolution ? verse.palette.accent : verse.palette.textFaint,
            }}
            animate={{ opacity: i <= resolution ? 0.7 : 0.2 }}
          >
            {label}
          </motion.span>
        ))}
      </div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Border */}
          <rect x={0} y={0} width={SCENE_W} height={SCENE_H} rx={8}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.1)} />

          {/* Pixel grid */}
          {Array.from({ length: gridSize }).map((_, gy) =>
            Array.from({ length: gridSize }).map((_, gx) => {
              const intensity = isPartOfFace(gx, gy, gridSize);
              if (intensity <= 0) return null;
              return (
                <motion.rect
                  key={`${gx}-${gy}`}
                  x={gx * pixelSize}
                  y={gy * pixelSize}
                  width={pixelSize - (resolution === 2 ? 0.3 : resolution === 1 ? 0.5 : 1)}
                  height={pixelSize - (resolution === 2 ? 0.3 : resolution === 1 ? 0.5 : 1)}
                  rx={resolution === 2 ? 0.5 : 0}
                  fill={verse.palette.accent}
                  animate={{ opacity: safeOpacity(intensity) }}
                  transition={{ duration: 0.4 }}
                />
              );
            })
          )}
        </svg>
      </div>

      {/* Label */}
      <motion.span
        key={resolution}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 0.6, y: 0 }}
        style={{
          ...navicueType.choice,
          color: resolution === 2 ? verse.palette.accent : verse.palette.textFaint,
        }}
      >
        {labels[resolution]}
      </motion.span>

      {/* Upscale button */}
      {!done && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleUpscale}
        >
          upscale
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the pixels hid the pain'
          : resolution === 1
            ? 'still blurry. look closer.'
            : 'low resolution hides the truth'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          nuance
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'empathy' : 'upgrade the resolution'}
      </div>
    </div>
  );
}
