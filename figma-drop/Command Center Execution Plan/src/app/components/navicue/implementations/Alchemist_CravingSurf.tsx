/**
 * ALCHEMIST COLLECTION #1
 * The Craving Surf
 *
 * "You cannot stop the wave, but you can learn to surf."
 *
 * A generative wave form rises, crests, and breaks.
 * You tilt (or drag) to ride the line without falling off.
 * The wave is just energy. Watch it pass.
 *
 * INTERACTION: A living wave you ride. The craving rises,
 * peaks, and breaks -- every time. You don't fight it.
 * You ride it. Then it's gone. Proof: waves always end.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
  navicueLayout,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, atmosphere, motion: motionConfig } =
  navicueQuickstart('sensory_cinema', 'Exposure', 'believing', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_CravingSurf({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [wavePhase, setWavePhase] = useState(0);
  const [riderY, setRiderY] = useState(0);
  const [score, setScore] = useState(0);
  const [waveCount, setWaveCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 4000);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Wave animation
  useEffect(() => {
    if (stage !== 'active') return;
    let frame = 0;
    const tick = () => {
      frame++;
      const phase = (frame * 0.02) % (Math.PI * 2);
      setWavePhase(phase);
      // Wave height follows sin curve -- rises, crests, breaks
      const waveY = Math.sin(phase) * 80;
      // Check if rider is close to wave
      const diff = Math.abs(riderY - waveY);
      if (diff < 30) {
        setScore(prev => Math.min(prev + 0.5, 100));
      }
      // Wave completed a cycle
      if (phase < 0.05 && frame > 100) {
        setWaveCount(prev => {
          const next = prev + 1;
          if (next >= 3) {
            setStage('resonant');
            addTimer(() => {
              setStage('afterglow');
              onComplete?.();
            }, 5000);
          }
          return next;
        });
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [stage, riderY]);

  const handleDrag = useCallback((e: React.PointerEvent) => {
    if (stage !== 'active' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 160;
    setRiderY(relY);
  }, [stage]);

  const waveY = Math.sin(wavePhase) * 80;
  const wavePoints = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * 100;
    const y = Math.sin(wavePhase + (i / 59) * Math.PI * 2) * 35;
    return `${x},${50 + y}`;
  }).join(' ');

  return (
    <NaviCueShell
      signatureKey="sensory_cinema"
      mechanism="Exposure"
      kbe="believing"
      form="Ember"
      mode="immersive"
      isAfterglow={stage === 'afterglow'}
    >
      <div
        ref={containerRef}
        onPointerMove={handleDrag}
        style={{
          width: '100%',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {stage === 'arriving' && (
            <motion.div
              key="arriving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}
            >
              A wave is coming.
            </motion.div>
          )}

          {stage === 'present' && (
            <motion.div
              key="present"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}
            >
              <div style={{ ...navicueType.prompt, color: palette.text }}>
                You cannot stop the wave.
              </div>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                follow it with your finger
              </div>
            </motion.div>
          )}

          {stage === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', height: '300px', position: 'relative' }}
            >
              {/* Wave line */}
              <svg
                viewBox="0 0 100 100"
                style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                preserveAspectRatio="none"
              >
                <polyline
                  points={wavePoints}
                  fill="none"
                  stroke={palette.primary}
                  strokeWidth="0.5"
                  opacity={0.6}
                />
              </svg>
              {/* Rider dot */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: `calc(50% + ${riderY * 0.5}px)`,
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: palette.accent,
                  boxShadow: `0 0 20px ${palette.accentGlow}`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
              {/* Score feedback */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                ...navicueType.hint,
                color: palette.textFaint,
                opacity: 0.5,
              }}>
                wave {waveCount + 1} of 3
              </div>
            </motion.div>
          )}

          {stage === 'resonant' && (
            <motion.div
              key="resonant"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2 }}
              style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}
            >
              <div style={{ ...navicueType.prompt, color: palette.text }}>
                It rose. It crested. It broke.
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.5, duration: 2 }}
                style={{ ...navicueType.texture, color: palette.textFaint }}
              >
                Every wave ends.
              </motion.div>
            </motion.div>
          )}

          {stage === 'afterglow' && (
            <motion.div
              key="afterglow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 3 }}
              style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}
            >
              The ocean is still here. So are you.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NaviCueShell>
  );
}