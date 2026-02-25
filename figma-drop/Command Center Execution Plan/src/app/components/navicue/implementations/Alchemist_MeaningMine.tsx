/**
 * ALCHEMIST COLLECTION #5
 * The Meaning Mine
 *
 * "Suffering is sand. Wisdom is the gold hidden inside."
 *
 * A chaotic rock field. You tap a rock, it cracks open
 * to reveal a gem (a lesson). Find the gold in the pain.
 *
 * INTERACTION: Dark rocks scattered across the screen.
 * Tap one -- it cracks, light spills out, a lesson appears.
 * Three rocks, three gems. The mine was always full.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette } =
  navicueQuickstart('sacred_ordinary', 'Values Clarification', 'believing', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

const ROCKS = [
  { x: 25, y: 35, size: 52, gem: 'Patience is being forged here.', hue: 42 },
  { x: 62, y: 28, size: 44, gem: 'This taught you what matters.', hue: 280 },
  { x: 45, y: 60, size: 48, gem: 'You are stronger at the broken places.', hue: 160 },
  { x: 78, y: 55, size: 38, gem: 'The struggle made the skill.', hue: 350 },
  { x: 18, y: 65, size: 42, gem: 'Compassion was born in this.', hue: 200 },
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_MeaningMine({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [crackedRocks, setCrackedRocks] = useState<Set<number>>(new Set());
  const [activeGem, setActiveGem] = useState<string | null>(null);
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

  const handleCrack = (index: number) => {
    if (stage !== 'active' || crackedRocks.has(index)) return;
    const newSet = new Set(crackedRocks);
    newSet.add(index);
    setCrackedRocks(newSet);
    setActiveGem(ROCKS[index].gem);

    if (newSet.size >= 3) {
      addTimer(() => {
        setStage('resonant');
        addTimer(() => {
          setStage('afterglow');
          onComplete?.();
        }, 5000);
      }, 2500);
    }
  };

  return (
    <NaviCueShell
      signatureKey="sacred_ordinary"
      mechanism="Values Clarification"
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
            There is gold in here.
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
              Find the gold in this pain.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              tap the stones to crack them open
            </div>
          </motion.div>
        )}

        {stage === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'relative', width: '100%', height: '320px' }}
          >
            {ROCKS.map((rock, i) => {
              const isCracked = crackedRocks.has(i);
              return (
                <motion.button
                  key={i}
                  onClick={() => handleCrack(i)}
                  whileHover={!isCracked ? { scale: 1.1 } : undefined}
                  whileTap={!isCracked ? { scale: 0.9 } : undefined}
                  animate={isCracked ? {
                    scale: [1, 1.2, 0.8],
                    opacity: [1, 1, 0.5],
                  } : undefined}
                  transition={isCracked ? { duration: 0.6 } : undefined}
                  style={{
                    position: 'absolute',
                    left: `${rock.x}%`,
                    top: `${rock.y}%`,
                    width: `${rock.size}px`,
                    height: `${rock.size}px`,
                    borderRadius: '30% 50% 40% 60%',
                    background: isCracked
                      ? `radial-gradient(circle, hsla(${rock.hue}, 60%, 65%, 0.6), hsla(${rock.hue}, 40%, 45%, 0.3))`
                      : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06), rgba(0,0,0,0.4))`,
                    border: isCracked ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: isCracked
                      ? `0 0 30px hsla(${rock.hue}, 60%, 55%, 0.3)`
                      : '0 4px 12px rgba(0,0,0,0.3)',
                    cursor: isCracked ? 'default' : 'pointer',
                    transform: 'translate(-50%, -50%)',
                    padding: 0,
                    transition: 'all 0.5s ease',
                  }}
                />
              );
            })}

            {/* Active gem text */}
            <AnimatePresence>
              {activeGem && (
                <motion.div
                  key={activeGem}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    ...navicueType.texture,
                    color: palette.text,
                    textAlign: 'center',
                    width: '80%',
                  }}
                >
                  {activeGem}
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
              The mine was always full.
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5, duration: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}
            >
              Suffering is sand. Wisdom is the gold hidden inside.
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
            You know how to dig now.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}