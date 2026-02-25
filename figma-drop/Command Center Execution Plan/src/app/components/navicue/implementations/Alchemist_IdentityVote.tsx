/**
 * ALCHEMIST COLLECTION #10
 * The Identity Vote
 *
 * "Every action is a vote for the person you wish to become."
 *
 * A ballot box. Cast a vote: Old Self vs New Self.
 * The majority wins. Small actions build the evidence
 * for a new identity. You are what you repeatedly do.
 *
 * INTERACTION: Two ballot options appear. You choose.
 * The vote drops in. A tally updates. The identity shifts.
 * Not a revolution -- an election, one vote at a time.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } =
  navicueQuickstart('koan_paradox', 'Values Clarification', 'embodying', 'Ember');

type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Alchemist_IdentityVote({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [voted, setVoted] = useState(false);
  const [choice, setChoice] = useState<'old' | 'new' | null>(null);
  const [dropAnimation, setDropAnimation] = useState(false);
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

  const handleVote = (side: 'old' | 'new') => {
    if (voted) return;
    setChoice(side);
    setVoted(true);
    setDropAnimation(true);
    addTimer(() => setDropAnimation(false), 1200);
    addTimer(() => {
      setStage('resonant');
      addTimer(() => {
        setStage('afterglow');
        onComplete?.();
      }, 5000);
    }, 2500);
  };

  return (
    <NaviCueShell
      signatureKey="koan_paradox"
      mechanism="Values Clarification"
      kbe="embodying"
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
            Who are you becoming?
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
              Every action is a vote.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              cast yours
            </div>
          </motion.div>
        )}

        {stage === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}
          >
            {/* Ballot box */}
            <div style={{
              position: 'relative',
              width: '120px',
              height: '80px',
              border: `1px solid rgba(255,255,255,0.08)`,
              borderRadius: `${radius.xs} ${radius.xs} ${radius.sm} ${radius.sm}`,
              background: 'rgba(255,255,255,0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {/* Slot */}
              <div style={{
                position: 'absolute',
                top: '-1px',
                width: '50px',
                height: '4px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '0 0 2px 2px',
              }} />
              {/* Dropping ballot */}
              {dropAnimation && (
                <motion.div
                  initial={{ y: -60, opacity: 0.8, scale: 1 }}
                  animate={{ y: 20, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'absolute',
                    width: '30px',
                    height: '20px',
                    background: choice === 'new' ? palette.accent : 'rgba(255,255,255,0.15)',
                    borderRadius: '3px',
                    boxShadow: choice === 'new' ? `0 0 12px ${palette.accentGlow}` : 'none',
                  }}
                />
              )}
            </div>

            {/* Two choices */}
            {!voted && (
              <div style={{ display: 'flex', gap: '24px' }}>
                <motion.button
                  onClick={() => handleVote('old')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '14px 24px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: radius.sm,
                    cursor: 'pointer',
                    ...navicueType.choice,
                    color: palette.textFaint,
                  }}
                >
                  the old pattern
                </motion.button>
                <motion.button
                  onClick={() => handleVote('new')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '14px 24px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${palette.accentGlow}`,
                    borderRadius: radius.sm,
                    cursor: 'pointer',
                    ...navicueType.choice,
                    color: palette.text,
                  }}
                >
                  the new direction
                </motion.button>
              </div>
            )}

            {voted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.8, duration: 1 }}
                style={{ ...navicueType.texture, color: palette.text, textAlign: 'center' }}
              >
                Vote cast.
              </motion.div>
            )}
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
              {choice === 'new'
                ? 'The majority is shifting.'
                : 'Even knowing there was a choice. That is the vote.'}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5, duration: 2 }}
              style={{ ...navicueType.texture, color: palette.textFaint }}
            >
              You become what you repeatedly choose.
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
            The majority wins. Keep voting.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}