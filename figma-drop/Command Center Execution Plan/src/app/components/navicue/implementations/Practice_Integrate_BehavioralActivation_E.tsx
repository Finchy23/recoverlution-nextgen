/**
 * Practice · Integrate · Behavioral Activation · Embodying
 * 
 * ESSENCE: The action IS the practice — rhythm becomes second nature
 * 
 * VISUAL: A pulsing rhythm circle that user syncs with by tapping.
 * Beat-matching: the body learns the tempo of action. Kinetic.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { magicSignatures, navicueTypography, spacing } from '@/design-tokens';

type Stage = 'dormant' | 'syncing' | 'matched' | 'complete';

interface NaviCueProps {
  primary_prompt: string;
  cta_primary: string;
  onComplete?: () => void;
}

export default function Practice_Integrate_BehavioralActivation_E({
  primary_prompt, cta_primary, onComplete,
}: NaviCueProps) {
  const sig = magicSignatures.sacred_ordinary;
  const [stage, setStage] = useState<Stage>('dormant');
  const [beatPhase, setBeatPhase] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const beatInterval = useRef<NodeJS.Timeout | null>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (stage === 'dormant') return;
    beatInterval.current = setInterval(() => {
      setBeatPhase(p => (p + 1) % 4);
    }, 700);
    return () => { if (beatInterval.current) clearInterval(beatInterval.current); };
  }, [stage]);

  const handleTap = () => {
    if (stage === 'dormant') { setStage('syncing'); return; }
    if (stage === 'matched' || stage === 'complete') return;
    // Check if tap is on beat (phase 0 or 1)
    if (beatPhase <= 1) {
      const next = matchCount + 1;
      setMatchCount(next);
      if (next >= 6) {
        setStage('matched');
        safeTimeout(() => { setStage('complete'); onComplete?.(); }, 2000);
      }
    }
  };

  if (!mounted) return null;

  const isOnBeat = beatPhase <= 1;

  return (
    <div style={{
      width: '100%', maxWidth: '600px', margin: '0 auto', padding: spacing.xl,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xl,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ ...navicueTypography.contemplative.primary, textAlign: 'center' }}
      >{primary_prompt}</motion.div>

      <motion.div
        onClick={handleTap}
        style={{
          position: 'relative', width: '200px', height: '200px',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* Beat ring */}
        <motion.div
          animate={{
            scale: isOnBeat && stage === 'syncing' ? 1.15 : 1,
            opacity: isOnBeat ? 0.8 : 0.3,
          }}
          transition={{ duration: 0.15 }}
          style={{
            width: '160px', height: '160px', borderRadius: '50%',
            border: `3px solid ${sig.colors.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.div
            animate={{
              scale: isOnBeat && stage === 'syncing' ? 1.2 : 1,
              backgroundColor: isOnBeat ? sig.colors.accent : sig.colors.primary,
            }}
            transition={{ duration: 0.1 }}
            style={{
              width: '60px', height: '60px', borderRadius: '50%',
              backgroundColor: sig.colors.primary,
            }}
          />
        </motion.div>

        {/* Match indicators */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const r = 90;
          return (
            <motion.div
              key={i}
              animate={{
                backgroundColor: i < matchCount ? sig.colors.accent : sig.colors.glow,
                scale: i < matchCount ? 1 : 0.7,
              }}
              style={{
                position: 'absolute',
                left: `${100 + Math.cos(angle) * r - 5}px`,
                top: `${100 + Math.sin(angle) * r - 5}px`,
                width: '10px', height: '10px', borderRadius: '50%',
              }}
            />
          );
        })}

        {/* Completion glow */}
        {(stage === 'matched' || stage === 'complete') && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              position: 'absolute',
              width: '160px', height: '160px', borderRadius: '50%',
              border: `2px solid ${sig.colors.accent}`,
            }}
          />
        )}
      </motion.div>

      <motion.div animate={{ opacity: 0.5 }}
        style={{ ...navicueTypography.contemplative.whisper, textAlign: 'center' }}>
        {stage === 'dormant' && 'Tap to start the rhythm'}
        {stage === 'syncing' && 'Find the rhythm'}
        {(stage === 'matched' || stage === 'complete') && 'In rhythm'}
      </motion.div>
    </div>
  );
}