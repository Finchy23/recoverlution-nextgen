/**
 * ALCHEMIST COLLECTION #2
 * The Story Edit
 *
 * "The events are real. The story is yours. Change the adjective, change the world."
 *
 * Your internal thought appears as text. The cursor blinks.
 * You tap a word to replace it. "I have to" → "I get to".
 * One word changes everything.
 *
 * INTERACTION: A sentence with a swappable word. Tap to cycle
 * through reframes. Watch the emotional temperature shift
 * as the language changes. The events don't move. The story does.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
  navicueLayout,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } =
  navicueQuickstart('poetic_precision', 'Cognitive Restructuring', 'believing', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

const REFRAMES = [
  { old: 'I have to', new: 'I get to' },
  { old: 'I can\'t', new: 'I haven\'t yet' },
  { old: 'This is breaking me', new: 'This is remaking me' },
  { old: 'I failed', new: 'I learned' },
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_StoryEdit({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [frameIndex, setFrameIndex] = useState(0);
  const [isReframed, setIsReframed] = useState(false);
  const [editsCompleted, setEditsCompleted] = useState(0);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  useEffect(() => {
    addTimer(() => setStage('present'), 1000);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleTapWord = () => {
    if (stage !== 'active' || isReframed) return;
    setIsReframed(true);
    const nextEdits = editsCompleted + 1;
    setEditsCompleted(nextEdits);

    addTimer(() => {
      if (nextEdits >= 3) {
        setStage('resonant');
        addTimer(() => {
          setStage('afterglow');
          onComplete?.();
        }, 5000);
      } else {
        setIsReframed(false);
        setFrameIndex(prev => (prev + 1) % REFRAMES.length);
      }
    }, 2000);
  };

  const current = REFRAMES[frameIndex];

  return (
    <NaviCueShell
      signatureKey="poetic_precision"
      mechanism="Cognitive Restructuring"
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
            The events are real.
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
              The story is yours.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              tap the underlined words to edit
            </div>
          </motion.div>
        )}

        {stage === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}
          >
            {/* The editable sentence */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ ...navicueType.prompt, color: palette.textFaint }}>
                "
              </span>
              <motion.button
                onClick={handleTapWord}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  ...navicueType.prompt,
                  color: isReframed ? palette.accent : palette.text,
                  background: 'none',
                  border: 'none',
                  borderBottom: isReframed ? 'none' : `1px solid ${palette.textFaint}`,
                  cursor: isReframed ? 'default' : 'pointer',
                  padding: '2px 4px',
                  transition: 'color 0.8s ease',
                  fontFamily: fonts.secondary,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isReframed ? 'new' : 'old'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    {isReframed ? current.new : current.old}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <span style={{ ...navicueType.prompt, color: palette.textFaint }}>
                "
              </span>
            </div>

            {/* Cursor blink indicator */}
            {!isReframed && (
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                  width: '2px',
                  height: '20px',
                  background: palette.primary,
                }}
              />
            )}

            {/* Progress */}
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>
              {editsCompleted} of 3
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
              Same events. Different world.
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5, duration: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}
            >
              Change the adjective, change the world.
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
            The author was always you.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}