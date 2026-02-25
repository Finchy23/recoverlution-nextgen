/**
 * WAYFINDER #4 -- 1164. The Bird Sign (The Messenger)
 * "The bird does not fly far from home. Trust the small signs."
 * INTERACTION: Empty ocean. A white tern flies by. Follow the bird.
 * STEALTH KBE: Sign Detection -- hope (B)
 *
 * COMPOSITOR: witness_ritual / Compass / social / believing / tap / 1164
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Wayfinder_BirdSign({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Compass',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1164,
        isSeal: false,
      }}
      arrivalText="Empty ocean. Nothing."
      prompt="The bird does not fly far from home. If you see the messenger, the destination is close. Trust the small signs."
      resonantText="Sign Detection. The ocean was vast and empty. Then a single bird crossed your vision and you followed. Hope is not the grand horizon. It is the small sign that says: close."
      afterglowCoda="Near."
      onComplete={onComplete}
    >
      {(verse) => <BirdSignInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function BirdSignInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'empty' | 'bird' | 'following' | 'land'>('empty');
  const [birdX, setBirdX] = useState(-20);

  // Bird flies across
  useEffect(() => {
    if (phase !== 'bird') return;
    const interval = setInterval(() => {
      setBirdX(prev => {
        if (prev > 180) {
          clearInterval(interval);
          return prev;
        }
        return prev + 0.8;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [phase]);

  // Start bird after a moment of emptiness
  useEffect(() => {
    if (phase !== 'empty') return;
    const timeout = setTimeout(() => {
      setPhase('bird');
    }, 1500);
    return () => clearTimeout(timeout);
  }, [phase]);

  const followBird = useCallback(() => {
    if (phase !== 'bird') return;
    setPhase('following');
    setTimeout(() => {
      setPhase('land');
      setTimeout(() => verse.advance(), 2200);
    }, 1800);
  }, [phase, verse]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroCssScene(verse.palette, 160 / 100)}>
        {/* Ocean */}
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Horizon */}
          <line x1={0} y1={60} x2={160} y2={60}
            stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.12} />

          {/* Waves */}
          {[0, 1, 2].map(i => (
            <path key={i}
              d={`M 0 ${70 + i * 10} Q 40 ${68 + i * 10} 80 ${70 + i * 10} Q 120 ${72 + i * 10} 160 ${70 + i * 10}`}
              fill="none" stroke="hsla(200, 20%, 45%, 0.1)" strokeWidth={0.8}
            />
          ))}

          {/* Bird */}
          {(phase === 'bird' || phase === 'following') && (
            <motion.g
              animate={{
                x: phase === 'following' ? 200 : birdX,
                y: phase === 'following' ? -20 : Math.sin(birdX * 0.05) * 5,
              }}
              transition={phase === 'following' ? { duration: 1.5 } : {}}
            >
              {/* Bird shape (tern) */}
              <path d={`M ${0} 30 Q ${3} 26 ${8} 28 Q ${3} 24 ${0} 30`}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={1.2}
                opacity={0.5}
              />
            </motion.g>
          )}

          {/* Land appearing */}
          {phase === 'land' && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              d="M 100 58 Q 120 50 140 55 Q 155 52 160 58"
              fill="none" stroke={verse.palette.accent} strokeWidth={1.5}
            />
          )}
        </svg>

        {/* Empty label */}
        {phase === 'empty' && (
          <motion.span
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: 'absolute', top: 25, left: '50%', transform: 'translateX(-50%)',
              ...navicueType.hint, fontSize: 9, color: verse.palette.textFaint,
            }}
          >
            empty ocean
          </motion.span>
        )}

        {phase === 'land' && (
          <span style={{
            position: 'absolute', top: 42, right: 15,
            ...navicueType.hint, fontSize: 8, color: verse.palette.accent, opacity: 0.5,
          }}>
            land
          </span>
        )}
      </div>

      {/* Action */}
      {phase === 'bird' && birdX > 20 && birdX < 140 && (
        <motion.button onClick={followBird}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          follow the bird
        </motion.button>
      )}
      {phase === 'empty' && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 10, opacity: 0.3 }}>
          waiting...
        </span>
      )}
      {phase === 'following' && (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          following...
        </span>
      )}
      {phase === 'land' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          near
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {phase === 'land' ? 'hope' : 'trust the small signs'}
      </div>
    </div>
  );
}