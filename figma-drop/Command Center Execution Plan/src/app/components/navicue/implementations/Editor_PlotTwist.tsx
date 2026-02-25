/**
 * EDITOR #6 -- 1256. The Plot Twist
 * "Do not accept 'The End.' Write 'But then...'"
 * INTERACTION: Type "But then..." after "The End" to continue the story
 * STEALTH KBE: Hope -- Open-Endedness (B)
 *
 * COMPOSITOR: koan_paradox / Arc / morning / believing / type / 1256
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Editor_PlotTwist({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'b',
        hook: 'type',
        specimenSeed: 1256,
        isSeal: false,
      }}
      arrivalText='"The End."'
      prompt="A dead end is just a plot twist waiting to happen. Do not accept the end. Write but then and turn the page."
      resonantText="Hope. You refused the ending. You wrote two words and the story continued. Open-endedness is the refusal to let the period be final. Every but then is a door."
      afterglowCoda="But then..."
      onComplete={onComplete}
    >
      {(verse) => <PlotTwistInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PlotTwistInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'end' | 'typing' | 'continued' | 'done'>('end');
  const [typed, setTyped] = useState('');
  const targetText = 'But then...';
  const [cursorOn, setCursorOn] = useState(true);

  const handleBegin = () => {
    if (phase !== 'end') return;
    setPhase('typing');
  };

  // Auto-type animation
  useEffect(() => {
    if (phase !== 'typing') return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(targetText.slice(0, i));
      if (i >= targetText.length) {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('continued');
          setPhase('done');
          setTimeout(() => verse.advance(), 3000);
        }, 800);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [phase, verse]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorOn(v => !v), 530);
    return () => clearInterval(interval);
  }, []);

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 260;
  const SCENE_H = 140;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Page/manuscript lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i}
              x1={40} y1={25 + i * 18}
              x2={SCENE_W - 40} y2={25 + i * 18}
              stroke={verse.palette.primary}
              strokeWidth={0.3}
              opacity={safeOpacity(0.08)} />
          ))}

          {/* "Story" text lines (faded, representing past narrative) */}
          {[0, 1, 2].map(i => (
            <rect key={`story-${i}`}
              x={45} y={21 + i * 18}
              width={80 + i * 20} height={3} rx={1}
              fill={verse.palette.primary}
              opacity={safeOpacity(0.06)} />
          ))}

          {/* "The End." */}
          <motion.text
            x={SCENE_W / 2} y={82}
            textAnchor="middle"
            fill={verse.palette.text}
            style={{ ...navicueType.choice, fontStyle: 'italic' }}
            animate={{
              opacity: phase === 'done' ? 0.2 : 0.5,
              textDecoration: phase === 'done' ? 'line-through' : 'none',
            }}
          >
            The End.
          </motion.text>

          {/* "But then..." typed text */}
          {(phase === 'typing' || phase === 'done') && (
            <motion.g>
              <motion.text
                x={SCENE_W / 2}
                y={108}
                textAnchor="middle"
                fill={verse.palette.accent}
                style={{ ...navicueType.choice, fontStyle: 'italic' }}
                animate={{ opacity: 0.7 }}
              >
                {typed}
                {phase === 'typing' && (
                  <tspan fill={verse.palette.accent}
                    opacity={cursorOn ? 0.7 : 0}>
                    |
                  </tspan>
                )}
              </motion.text>
            </motion.g>
          )}

          {/* Continuation lines (the story goes on) */}
          {phase === 'done' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1].map(i => (
                <motion.rect
                  key={`cont-${i}`}
                  x={45} y={115 + i * 12}
                  height={2} rx={1}
                  fill={verse.palette.accent}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: 100 + i * 30,
                    opacity: safeOpacity(0.12),
                  }}
                  transition={{ duration: 0.6, delay: 0.8 + i * 0.2 }}
                />
              ))}
            </motion.g>
          )}
        </svg>
      </div>

      {/* Begin writing button */}
      {phase === 'end' && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleBegin}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          refuse the ending
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'done'
          ? 'the story continues'
          : phase === 'typing'
            ? 'writing...'
            : 'the period is not final'}
      </span>

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          open-endedness
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'done' ? 'hope' : 'turn the page'}
      </div>
    </div>
  );
}
