/**
 * WARRIOR II #6 -- 1366. The Sun at Your Back
 * "Let the environment fight for you."
 * INTERACTION: Facing the sun (blinded). Rotate position. Sun behind you. Enemy blinded.
 * STEALTH KBE: Environmental Awareness -- Tactical Advantage (K)
 *
 * COMPOSITOR: sacred_ordinary / Drift / morning / knowing / tap / 1366
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

export default function WarriorII_SunAtYourBack({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1366,
        isSeal: false,
      }}
      arrivalText="The sun is in your eyes."
      prompt="Let the environment fight for you. Let the sun blind them. Let the wind carry your arrows. Align with the elements."
      resonantText="Environmental awareness. You rotated and let the sun blind the enemy instead. Tactical advantage: do not fight the elements. Harness them. The environment is the largest force on the battlefield."
      afterglowCoda="Align with the elements."
      onComplete={onComplete}
    >
      {(verse) => <SunAtYourBackInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SunAtYourBackInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'blinded' | 'rotating' | 'rotated' | 'advantage'>('blinded');

  const handleRotate = () => {
    if (phase !== 'blinded') return;
    setPhase('rotating');
    setTimeout(() => {
      setPhase('rotated');
      setTimeout(() => {
        setPhase('advantage');
        setTimeout(() => verse.advance(), 3000);
      }, 1500);
    }, 1000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 160;
  const CX = W / 2;

  // Sun position (top)
  const SUN_X = CX, SUN_Y = 20;
  // Positions swap after rotation
  const YOU_BLINDED = { x: CX + 40, y: 100 };
  const ENEMY_SAFE = { x: CX - 40, y: 100 };
  const YOU_SAFE = { x: CX - 40, y: 100 };
  const ENEMY_BLINDED = { x: CX + 40, y: 100 };

  const rotated = phase === 'rotated' || phase === 'advantage';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>vision</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'advantage' ? verse.palette.accent
            : rotated ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'advantage' ? 'clear (they are blind)'
            : rotated ? 'sun behind you'
              : phase === 'rotating' ? 'repositioning...'
                : 'blinded'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Sun */}
          <circle cx={SUN_X} cy={SUN_Y} r={14}
            fill={verse.palette.accent} opacity={safeOpacity(0.12)} />
          <circle cx={SUN_X} cy={SUN_Y} r={14}
            fill="none" stroke={verse.palette.accent}
            strokeWidth={0.5} opacity={safeOpacity(0.2)} />

          {/* Sun rays */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const r1 = 18, r2 = 28;
            return (
              <line key={i}
                x1={SUN_X + Math.cos(angle) * r1}
                y1={SUN_Y + Math.sin(angle) * r1}
                x2={SUN_X + Math.cos(angle) * r2}
                y2={SUN_Y + Math.sin(angle) * r2}
                stroke={verse.palette.accent}
                strokeWidth={0.5} opacity={safeOpacity(0.1)} />
            );
          })}

          {/* Light cone (points at whoever is facing the sun) */}
          <motion.path
            fill={verse.palette.accent}
            animate={{
              d: rotated
                ? `M ${SUN_X},${SUN_Y + 14} L ${ENEMY_BLINDED.x - 15},${ENEMY_BLINDED.y - 10} L ${ENEMY_BLINDED.x + 15},${ENEMY_BLINDED.y - 10} Z`
                : `M ${SUN_X},${SUN_Y + 14} L ${YOU_BLINDED.x - 15},${YOU_BLINDED.y - 10} L ${YOU_BLINDED.x + 15},${YOU_BLINDED.y - 10} Z`,
              opacity: safeOpacity(0.04),
            }}
            transition={{ duration: 0.8 }}
          />

          {/* You */}
          <motion.g
            animate={{
              x: rotated ? YOU_SAFE.x - YOU_BLINDED.x : 0,
            }}
            transition={{ duration: 0.8 }}
          >
            <circle cx={YOU_BLINDED.x} cy={YOU_BLINDED.y} r={12}
              fill={rotated ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(rotated ? 0.15 : 0.08)} />
            <circle cx={YOU_BLINDED.x} cy={YOU_BLINDED.y} r={12}
              fill="none"
              stroke={rotated ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1} opacity={safeOpacity(0.2)} />
            <text x={YOU_BLINDED.x} y={YOU_BLINDED.y + 3} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '9px' }} opacity={0.25}>
              you
            </text>
            {/* Blind indicator */}
            {!rotated && (
              <motion.g
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                <line x1={YOU_BLINDED.x - 6} y1={YOU_BLINDED.y - 2}
                  x2={YOU_BLINDED.x + 6} y2={YOU_BLINDED.y - 2}
                  stroke={verse.palette.shadow} strokeWidth={2} />
              </motion.g>
            )}
          </motion.g>

          {/* Enemy */}
          <motion.g
            animate={{
              x: rotated ? ENEMY_BLINDED.x - ENEMY_SAFE.x : 0,
            }}
            transition={{ duration: 0.8 }}
          >
            <circle cx={ENEMY_SAFE.x} cy={ENEMY_SAFE.y} r={12}
              fill={verse.palette.shadow} opacity={safeOpacity(0.06)} />
            <circle cx={ENEMY_SAFE.x} cy={ENEMY_SAFE.y} r={12}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={1} opacity={safeOpacity(0.12)} />
            <text x={ENEMY_SAFE.x} y={ENEMY_SAFE.y + 3} textAnchor="middle"
              fill={verse.palette.text} style={{ fontSize: '9px' }} opacity={0.2}>
              enemy
            </text>
            {/* Blind indicator (on enemy after rotation) */}
            {rotated && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                <line x1={ENEMY_SAFE.x - 6} y1={ENEMY_SAFE.y - 2}
                  x2={ENEMY_SAFE.x + 6} y2={ENEMY_SAFE.y - 2}
                  stroke={verse.palette.shadow} strokeWidth={2} />
              </motion.g>
            )}
          </motion.g>

          {/* Advantage text */}
          {phase === 'advantage' && (
            <motion.text
              x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3 }}
            >
              the environment fights for you
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'blinded' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleRotate}>
          rotate position
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'advantage' ? 'sun behind you. they cannot see.'
          : rotated ? 'the sun is at your back now.'
            : phase === 'rotating' ? 'rotating...'
              : 'you face the sun. blinded.'}
      </span>

      {phase === 'advantage' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          tactical advantage
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'advantage' ? 'environmental awareness' : 'align with the elements'}
      </div>
    </div>
  );
}
