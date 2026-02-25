/**
 * WEAVER PATTERN #7 -- 1287. The Patchwork (Repair)
 * "The patch is the strongest part of the cloth."
 * INTERACTION: Tap to select gold thread, stitch over the tear -- kintsugi
 * STEALTH KBE: Post-Traumatic Growth -- Resilience Narrative (K)
 *
 * COMPOSITOR: poetic_precision / Arc / night / knowing / tap / 1287
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

export default function WeaverPattern_Patchwork({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Arc',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1287,
        isSeal: false,
      }}
      arrivalText="A torn coat."
      prompt="The tear is an invitation to upgrade. Do not hide the scar. Highlight it. The patch is the strongest part of the cloth."
      resonantText="Post-traumatic growth. You chose the gold thread. The tear became the most beautiful part of the garment. Resilience narrative is kintsugi for the self: the repair is the art."
      afterglowCoda="Highlight the scar."
      onComplete={onComplete}
    >
      {(verse) => <PatchworkInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PatchworkInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'torn' | 'stitching' | 'done'>('torn');

  const handleStitch = () => {
    if (phase !== 'torn') return;
    setPhase('stitching');
    setTimeout(() => {
      setPhase('done');
      setTimeout(() => verse.advance(), 3000);
    }, 2000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 180;
  const CX = W / 2, CY = H / 2;

  // Gold thread color
  const gold = '#d4a853';

  // Tear path
  const tearPath = `M ${CX - 5},${CY - 35} Q ${CX + 8},${CY - 15} ${CX - 3},${CY} Q ${CX + 5},${CY + 15} ${CX - 2},${CY + 35}`;

  // Stitch cross paths
  const stitches = Array.from({ length: 7 }).map((_, i) => {
    const y = CY - 30 + i * 10;
    const xOff = Math.sin(i * 0.8) * 3;
    return {
      d: `M ${CX - 8 + xOff},${y - 3} L ${CX + 8 + xOff},${y + 3}`,
      delay: i * 0.15,
    };
  });

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Coat/fabric body */}
          <rect x={30} y={25} width={W - 60} height={H - 50} rx={8}
            fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
          <rect x={30} y={25} width={W - 60} height={H - 50} rx={8}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={0.5} opacity={safeOpacity(0.12)} />

          {/* Fabric texture lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i}
              x1={40} y1={40 + i * 20} x2={W - 40} y2={40 + i * 20}
              stroke={verse.palette.primary} strokeWidth={0.3}
              opacity={safeOpacity(0.05)} />
          ))}

          {/* Tear */}
          <motion.path
            d={tearPath}
            fill="none"
            stroke={phase === 'done' ? gold : verse.palette.shadow}
            strokeLinecap="round"
            animate={{
              strokeWidth: phase === 'done' ? 2.5 : 1.5,
              opacity: safeOpacity(phase === 'done' ? 0.6 : 0.25),
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Tear shadow (gap) */}
          {phase === 'torn' && (
            <path d={tearPath}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={4} opacity={safeOpacity(0.04)} />
          )}

          {/* Gold patch behind tear */}
          {(phase === 'stitching' || phase === 'done') && (
            <motion.path
              d={`M ${CX - 18},${CY - 40} Q ${CX + 15},${CY} ${CX - 18},${CY + 40} Q ${CX + 25},${CY} ${CX - 18},${CY - 40}`}
              fill={gold}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(phase === 'done' ? 0.12 : 0.06) }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Gold cross-stitches */}
          {(phase === 'stitching' || phase === 'done') && stitches.map((stitch, i) => (
            <motion.path key={i}
              d={stitch.d}
              fill="none" stroke={gold}
              strokeWidth={1.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: safeOpacity(0.5),
              }}
              transition={{
                duration: 0.2,
                delay: stitch.delay,
              }}
            />
          ))}

          {/* Gold thread glow */}
          {phase === 'done' && (
            <motion.path
              d={tearPath}
              fill="none" stroke={gold}
              strokeWidth={6} strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.08) }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          )}

          {/* "Stronger" label */}
          {phase === 'done' && (
            <motion.text
              x={CX} y={H - 10}
              textAnchor="middle"
              fill={gold}
              style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8 }}
            >
              stronger
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'torn' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleStitch}>
          gold thread
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'done' ? 'the repair became the art'
          : phase === 'stitching' ? 'stitching gold...'
            : 'do not hide the tear. highlight it.'}
      </span>

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: gold }}>
          resilience narrative
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'done' ? 'post-traumatic growth' : 'repair with gold'}
      </div>
    </div>
  );
}
