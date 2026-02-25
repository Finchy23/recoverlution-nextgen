/**
 * ALCHEMIST COLLECTION #7
 * The Council of Elders
 *
 * "You are not thinking alone. Borrow a brain."
 *
 * Three empty chairs in a beautiful void. You tap one.
 * A quote appears (Stoic, Spiritual, or Scientific).
 * You are not alone in this -- the library of human wisdom is yours.
 *
 * INTERACTION: Three ethereal chairs. Tap each for a different
 * perspective. The council has been waiting.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } =
  navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

const CHAIRS = [
  {
    label: 'The Stoic',
    color: 'hsla(210, 30%, 55%, 0.5)',
    wisdom: 'You have power over your mind, not outside events. Realize this, and you will find strength.',
  },
  {
    label: 'The Sage',
    color: 'hsla(35, 45%, 55%, 0.5)',
    wisdom: 'The wound is the place where the light enters you. Do not turn away.',
  },
  {
    label: 'The Scientist',
    color: 'hsla(170, 35%, 50%, 0.5)',
    wisdom: 'Your brain rewires through repetition, not revelation. Do the small thing again.',
  },
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_CouncilOfElders({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tappedChairs, setTappedChairs] = useState<Set<number>>(new Set());
  const [activeWisdom, setActiveWisdom] = useState<{ text: string; color: string } | null>(null);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleTap = (index: number) => {
    if (stage !== 'active') return;
    const newSet = new Set(tappedChairs);
    newSet.add(index);
    setTappedChairs(newSet);
    setActiveWisdom({ text: CHAIRS[index].wisdom, color: CHAIRS[index].color });

    if (newSet.size >= 3) {
      addTimer(() => {
        setStage('resonant');
        addTimer(() => {
          setStage('afterglow');
          onComplete?.();
        }, 5000);
      }, 3000);
    }
  };

  return (
    <NaviCueShell
      signatureKey="witness_ritual"
      mechanism="Metacognition"
      kbe="believing"
      form="Ember"
      mode="immersive"
      isAfterglow={stage === 'afterglow'}
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
            You are not thinking alone.
          </motion.div>
        )}

        {stage === 'present' && (
          <motion.div
            key="present"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}
          >
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The council has been waiting.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              tap each chair to hear wisdom
            </div>
          </motion.div>
        )}

        {stage === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', width: '100%' }}
          >
            {/* Three chairs */}
            <div style={{ display: 'flex', gap: '32px', justifyContent: 'center' }}>
              {CHAIRS.map((chair, i) => {
                const isTapped = tappedChairs.has(i);
                return (
                  <motion.button
                    key={i}
                    onClick={() => handleTap(i)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: '72px',
                      height: '88px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: 0,
                    }}
                  >
                    {/* Chair shape -- simple arc + legs */}
                    <motion.div
                      animate={{
                        opacity: isTapped ? 0.8 : 0.3,
                        boxShadow: isTapped ? `0 0 20px ${chair.color}` : 'none',
                      }}
                      style={{
                        width: '48px',
                        height: '56px',
                        borderRadius: `${radius.md} ${radius.md} ${radius.xs} ${radius.xs}`,
                        background: isTapped
                          ? `linear-gradient(180deg, ${chair.color}, transparent)`
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isTapped ? chair.color : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.5s ease',
                      }}
                    />
                    <span style={{
                      ...navicueType.hint,
                      color: isTapped ? chair.color.replace('0.5', '0.8') : palette.textFaint,
                      fontSize: '11px',
                    }}>
                      {chair.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Wisdom text */}
            <AnimatePresence mode="wait">
              {activeWisdom && (
                <motion.div
                  key={activeWisdom.text}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    ...navicueType.texture,
                    color: palette.text,
                    textAlign: 'center',
                    maxWidth: '300px',
                    lineHeight: 1.7,
                  }}
                >
                  "{activeWisdom.text}"
                </motion.div>
              )}
            </AnimatePresence>
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
              Borrow a brain when yours is loud.
            </div>
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
            The library of human wisdom is yours.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}