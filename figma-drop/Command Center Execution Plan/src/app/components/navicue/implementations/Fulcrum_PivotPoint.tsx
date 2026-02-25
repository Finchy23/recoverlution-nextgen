/**
 * FULCRUM #1 -- 1201. The Pivot Point (Positioning)
 * "Stop pushing harder. Move the pivot."
 * INTERACTION: Drag the fulcrum closer to the rock, then tap to push
 * STEALTH KBE: Strategic Positioning -- Strategy > Effort (K)
 *
 * COMPOSITOR: science_x_soul / Lattice / work / knowing / drag / 1201
 */
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  navicueInteraction,
  immersiveTap,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Fulcrum_PivotPoint({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1201,
        isSeal: false,
      }}
      arrivalText="A heavy rock. A lever. A fulcrum."
      prompt="Stop pushing harder. Move the pivot. If the fulcrum is too far from the problem, your effort is wasted. Get close to the issue."
      resonantText="Strategic positioning. The rock did not change. The lever did not change. You changed where you placed the fulcrum. Strategy is not about more force. It is about better geometry."
      afterglowCoda="Move the pivot."
      onComplete={onComplete}
    >
      {(verse) => <PivotInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PivotInteraction({ verse }: { verse: any }) {
  const [fulcrumX, setFulcrumX] = useState(0.3); // 0=left (far from rock), 1=right (close to rock)
  const [pushed, setPushed] = useState(false);
  const [rockFlying, setRockFlying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const SCENE_W = 260;
  const SCENE_H = 140;
  const THRESHOLD = 0.7; // fulcrum must be past 70% to succeed

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || pushed) return;
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0.1, Math.min(0.9, (e.clientX - rect.left) / rect.width));
    setFulcrumX(x);
  }, [pushed]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handlePush = () => {
    if (pushed) return;
    setAttempt(prev => prev + 1);
    if (fulcrumX >= THRESHOLD) {
      setPushed(true);
      setRockFlying(true);
      setTimeout(() => verse.advance(), 2500);
    }
  };

  const leverAngle = pushed && rockFlying ? -25 : 0;
  const effort = fulcrumX < THRESHOLD ? 'heavy' : 'light';
  const rockY = rockFlying ? -80 : 0;
  const rockOpacity = rockFlying ? 0.2 : 0.7;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Physics scene */}
      <div
        ref={trackRef}
        style={{
          ...immersiveTap(verse.palette).zone,
          position: 'relative',
          width: SCENE_W,
          height: SCENE_H,
          overflow: 'visible',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Ground line */}
        <div style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          height: 1, background: verse.palette.primary, opacity: 0.1,
        }} />

        {/* Lever beam */}
        <motion.div
          animate={{ rotate: leverAngle }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            height: 2,
            background: verse.palette.primary,
            opacity: safeOpacity(0.25),
            transformOrigin: `${fulcrumX * 100}% 100%`,
          }}
        />

        {/* Fulcrum triangle */}
        <motion.div
          animate={{ left: `${fulcrumX * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          style={{
            position: 'absolute',
            bottom: 8,
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: `12px solid ${verse.palette.accent}`,
            opacity: safeOpacity(0.5 + fulcrumX * 0.3),
            cursor: 'ew-resize',
          }}
        />

        {/* Rock (right side) */}
        <motion.div
          animate={{
            y: rockY,
            opacity: rockOpacity,
            scale: rockFlying ? 0.5 : 1,
          }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 20,
            width: 44,
            height: 36,
            borderRadius: 6,
            background: `radial-gradient(ellipse at 40% 35%, ${verse.palette.primary}, transparent 80%)`,
            opacity: 0.7,
          }}
        />

        {/* Push arrow (left side) */}
        {!pushed && (
          <motion.div
            animate={{ x: [0, 4, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{
              position: 'absolute',
              bottom: 26,
              left: 12,
              ...navicueType.micro,
              color: verse.palette.textFaint,
            }}
          >
            push
          </motion.div>
        )}

        {/* Effort indicator */}
        {attempt > 0 && !pushed && (
          <motion.div
            key={attempt}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              bottom: 40, right: 30,
              ...navicueType.micro,
              color: verse.palette.shadow,
            }}
          >
            stuck
          </motion.div>
        )}
      </div>

      {/* Tap to push */}
      {!pushed && (
        <motion.button
          onClick={handlePush}
          style={{
            ...navicueInteraction.tapButton,
            color: fulcrumX >= THRESHOLD ? verse.palette.accent : verse.palette.textFaint,
            border: `1px solid ${fulcrumX >= THRESHOLD ? verse.palette.accentGlow : verse.palette.primaryGlow}`,
            borderRadius: 8,
            boxShadow: fulcrumX >= THRESHOLD
              ? `0 0 12px ${verse.palette.accentGlow}`
              : `0 0 8px ${verse.palette.primaryFaint}`,
            position: 'relative' as const,
            zIndex: 2,
          }}
          whileTap={{ scale: 0.97 }}
        >
          {fulcrumX >= THRESHOLD ? 'push lightly' : 'push'}
        </motion.button>
      )}

      {/* Status hint */}
      <span style={navicueStyles.interactionHint(verse.palette)}>
        {pushed
          ? 'it flies'
          : fulcrumX < 0.5
            ? 'slide the fulcrum closer to the rock'
            : fulcrumX < THRESHOLD
              ? 'closer'
              : 'the geometry is right'}
      </span>

      {/* KBE label */}
      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {pushed ? 'strategic positioning' : 'drag the fulcrum'}
      </div>
    </div>
  );
}
