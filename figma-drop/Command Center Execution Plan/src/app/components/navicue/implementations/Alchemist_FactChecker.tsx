/**
 * ALCHEMIST COLLECTION #8
 * The Fact Checker
 *
 * "Your alarm system is designed to lie to keep you safe. Check the data."
 *
 * A statement appears: "Everyone hates me." A slider appears.
 * As you slide toward False, the text disintegrates.
 * The feeling was real. The story wasn't.
 *
 * INTERACTION: A dramatic statement rendered as truth. A slider
 * from True to False. Slide it. Watch the lie crumble.
 * The prefrontal cortex overrides the alarm.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } =
  navicueQuickstart('science_x_soul', 'Cognitive Restructuring', 'knowing', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

const STATEMENTS = [
  'Everyone hates me.',
  'I will always feel this way.',
  'Nothing ever works out.',
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_FactChecker({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [statementIndex, setStatementIndex] = useState(0);
  const [sliderValue, setSliderValue] = useState(0); // 0 = True, 100 = False
  const [checksCompleted, setChecksCompleted] = useState(0);
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

  const handleSlide = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val >= 90) {
      const next = checksCompleted + 1;
      setChecksCompleted(next);
      if (next >= 2) {
        addTimer(() => {
          setStage('resonant');
          addTimer(() => {
            setStage('afterglow');
            onComplete?.();
          }, 5000);
        }, 1500);
      } else {
        addTimer(() => {
          setSliderValue(0);
          setStatementIndex(prev => (prev + 1) % STATEMENTS.length);
        }, 1500);
      }
    }
  };

  const dissolution = sliderValue / 100;
  const statement = STATEMENTS[statementIndex];

  return (
    <NaviCueShell
      signatureKey="science_x_soul"
      mechanism="Cognitive Restructuring"
      kbe="knowing"
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
            Is that true?
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
              Check the data.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              slide toward the truth
            </div>
          </motion.div>
        )}

        {stage === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', width: '100%', maxWidth: '320px' }}
          >
            {/* The statement -- dissolves as slider moves */}
            <motion.div
              style={{
                ...navicueType.prompt,
                color: palette.text,
                textAlign: 'center',
                opacity: 1 - dissolution * 0.8,
                filter: `blur(${dissolution * 6}px)`,
                transform: `scale(${1 - dissolution * 0.1})`,
                letterSpacing: `${dissolution * 8}px`,
                transition: 'all 0.15s ease',
              }}
            >
              "{statement}"
            </motion.div>

            {/* Slider */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ ...navicueType.hint, color: dissolution < 0.5 ? palette.text : palette.textFaint, opacity: 0.5 }}>
                  feels true
                </span>
                <span style={{ ...navicueType.hint, color: dissolution >= 0.5 ? palette.accent : palette.textFaint, opacity: 0.5 }}>
                  is it though?
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSlide}
                style={{
                  width: '100%',
                  accentColor: palette.accent,
                  cursor: 'pointer',
                  height: '4px',
                }}
              />
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
              The feeling was real.
              <br />
              The story wasn't.
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5, duration: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}
            >
              Your alarm is designed to overreact. That's its job.
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
            You checked the data. That's power.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}