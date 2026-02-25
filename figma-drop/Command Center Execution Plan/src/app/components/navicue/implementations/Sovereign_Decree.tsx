/**
 * SOVEREIGN #5 -- 1375. The Decree (The Word)
 * "If you break your word to yourself, the citizens will rebel."
 * INTERACTION: Declare "I will run." Do it. Kingdom cheers. Break it. Kingdom riots.
 * STEALTH KBE: Integrity -- Self-Trust (E)
 *
 * COMPOSITOR: witness_ritual / Arc / morning / embodying / tap / 1375
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Sovereign_Decree({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Arc',
        chrono: 'morning',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1375,
        isSeal: false,
      }}
      arrivalText="The decree."
      prompt="Your word is the law. If you break your word to yourself, the citizens will rebel. Keep the decree."
      resonantText="Integrity. You kept the decree and the kingdom cheered. Self-trust: the relationship between you and your word is the foundation of the entire state. Break it once and every future decree is questioned."
      afterglowCoda="Keep the decree."
      onComplete={onComplete}
    >
      {(verse) => <DecreeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DecreeInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'decree' | 'declared' | 'choice' | 'kept' | 'broken'>('decree');

  const handleDeclare = () => {
    if (phase !== 'decree') return;
    setPhase('declared');
    setTimeout(() => setPhase('choice'), 1500);
  };

  const handleKeep = () => {
    if (phase !== 'choice') return;
    setPhase('kept');
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 150;
  const CX = W / 2;

  // Citizens (dots arranged in rows below the decree)
  const citizens = Array.from({ length: 15 }).map((_, i) => ({
    x: 35 + (i % 5) * 38,
    y: 95 + Math.floor(i / 5) * 16,
  }));

  // Stability meter
  const METER_X = 15, METER_Y = 30, METER_H = 80;
  const stability = phase === 'kept' ? 0.95
    : phase === 'broken' ? 0.1
      : phase === 'choice' ? 0.5 : 0.6;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>stability</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'kept' ? verse.palette.accent
            : phase === 'broken' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'kept' ? 'cheering'
            : phase === 'broken' ? 'rioting'
              : phase === 'choice' ? 'watching...'
                : phase === 'declared' ? 'listening'
                  : 'waiting'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Decree scroll (top center) */}
          <rect x={CX - 60} y={15} width={120} height={35} rx={3}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <rect x={CX - 60} y={15} width={120} height={35} rx={3}
            fill="none"
            stroke={phase === 'kept' ? verse.palette.accent : verse.palette.primary}
            strokeWidth={1}
            opacity={safeOpacity(phase === 'kept' ? 0.25 : 0.12)} />

          {/* Decree text */}
          <text x={CX} y={28} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
            decree
          </text>
          {phase !== 'decree' && (
            <motion.text
              x={CX} y={42} textAnchor="middle"
              fill={phase === 'kept' ? verse.palette.accent : verse.palette.text}
              style={{ fontSize: '11px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'kept' ? 0.5 : 0.3 }}
            >
              "I will run."
            </motion.text>
          )}

          {/* Stability meter */}
          <rect x={METER_X} y={METER_Y} width={8} height={METER_H} rx={2}
            fill={verse.palette.primary} opacity={safeOpacity(0.04)} />
          <motion.rect
            x={METER_X} width={8} rx={2}
            fill={phase === 'kept' ? verse.palette.accent
              : phase === 'broken' ? verse.palette.shadow : verse.palette.primary}
            animate={{
              y: METER_Y + METER_H * (1 - stability),
              height: METER_H * stability,
              opacity: safeOpacity(phase === 'kept' ? 0.25 : 0.1),
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Citizens */}
          {citizens.map((c, i) => (
            <motion.circle key={i}
              cx={c.x} cy={c.y} r={4}
              fill={phase === 'kept' ? verse.palette.accent
                : phase === 'broken' ? verse.palette.shadow : verse.palette.primary}
              animate={{
                opacity: safeOpacity(phase === 'kept' ? 0.15 : 0.06),
                x: phase === 'broken'
                  ? [(i % 2 === 0 ? -3 : 3), (i % 2 === 0 ? 3 : -3)]
                  : 0,
              }}
              transition={{
                x: { repeat: Infinity, duration: 0.2 },
                opacity: { duration: 0.3 },
              }}
            />
          ))}

          {/* Kept checkmark */}
          {phase === 'kept' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Upward arrows from citizens (cheering) */}
              {[0, 2, 4, 7, 9, 12, 14].map(i => (
                <motion.line key={`cheer-${i}`}
                  x1={citizens[i].x} y1={citizens[i].y - 6}
                  x2={citizens[i].x} y2={citizens[i].y - 14}
                  stroke={verse.palette.accent} strokeWidth={0.8}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.2) }}
                  transition={{ delay: 0.1 * i }}
                />
              ))}
              <text x={CX} y={H - 3} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.micro}
                opacity={0.5}>
                the word was kept. trust compounds.
              </text>
            </motion.g>
          )}

          {/* Arrow connecting decree to citizens */}
          <line x1={CX} y1={50} x2={CX} y2={85}
            stroke={verse.palette.primary} strokeWidth={0.3}
            strokeDasharray="3 3" opacity={safeOpacity(0.06)} />
        </svg>
      </div>

      {phase === 'decree' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleDeclare}>
          declare: "I will run"
        </motion.button>
      )}

      {phase === 'choice' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleKeep}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          keep the decree (run)
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'kept' ? 'you kept your word. the kingdom cheers.'
          : phase === 'choice' ? 'the kingdom watches. will you keep it?'
            : phase === 'declared' ? 'the decree is made. the citizens hear it.'
              : 'you are about to make a promise to yourself.'}
      </span>

      {phase === 'kept' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          self-trust
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'kept' ? 'integrity' : 'your word is the law'}
      </div>
    </div>
  );
}
