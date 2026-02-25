/**
 * GAME DESIGNER #3 -- 1393. The Mod (Rule Breaking)
 * "The rules of society are made up. The rules of physics are real."
 * INTERACTION: Wall too high. Open console. gravity = 0.5. Jump over.
 * STEALTH KBE: Lateral Thinking -- Innovation (K)
 *
 * COMPOSITOR: pattern_glitch / Arc / work / knowing / type / 1393
 */
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function GameDesigner_Mod({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'type',
        specimenSeed: 1393,
        isSeal: false,
      }}
      arrivalText="The wall is too high."
      prompt="The rules of society are made up. The rules of physics are real. Distinguish the two. Hack the social rules."
      resonantText="Lateral thinking. You opened the console and changed gravity and jumped over the wall. Innovation: the wall was never real. The rule that made it impassable was a social construct. Change the rule, change the world."
      afterglowCoda="Hack the social rules."
      onComplete={onComplete}
    >
      {(verse) => <ModInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function ModInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'blocked' | 'console' | 'typing' | 'modded' | 'jumped'>('blocked');
  const [typed, setTyped] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const TARGET = 'gravity = 0.5';

  const handleConsole = () => {
    if (phase !== 'blocked') return;
    setPhase('console');
    setTimeout(() => {
      setPhase('typing');
      setTimeout(() => inputRef.current?.focus(), 200);
    }, 500);
  };

  const handleType = (v: string) => {
    setTyped(v);
    if (v.toLowerCase().includes('0.5') || v.toLowerCase().includes('gravity')) {
      if (v.length >= 8) {
        setPhase('modded');
        setTimeout(() => {
          setPhase('jumped');
          setTimeout(() => verse.advance(), 3000);
        }, 1200);
      }
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 155;
  const CX = W / 2;

  // Wall
  const WALL_X = CX, WALL_Y = 30, WALL_H = 70, WALL_W = 12;
  // Player
  const PLAYER_X = CX - 40;
  const playerY = phase === 'jumped' ? WALL_Y - 5 : WALL_Y + WALL_H - 15;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>gravity</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'jumped' ? verse.palette.accent
            : phase === 'modded' ? verse.palette.text : verse.palette.shadow,
          fontFamily: 'monospace',
        }}>
          {phase === 'jumped' ? '0.5 (modded)'
            : phase === 'modded' ? 'applying...'
              : '1.0 (default)'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Ground */}
          <line x1={20} y1={WALL_Y + WALL_H} x2={W - 20} y2={WALL_Y + WALL_H}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.08)} />

          {/* Wall */}
          <motion.rect
            x={WALL_X - WALL_W / 2} y={WALL_Y}
            width={WALL_W} height={WALL_H} rx={2}
            fill={verse.palette.primary}
            animate={{
              opacity: safeOpacity(phase === 'jumped' ? 0.03 : 0.08),
            }}
          />
          <rect x={WALL_X - WALL_W / 2} y={WALL_Y}
            width={WALL_W} height={WALL_H} rx={2}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1} opacity={safeOpacity(0.12)} />
          <text x={WALL_X} y={WALL_Y + WALL_H / 2 + 3} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }}
            opacity={0.12} transform={`rotate(-90, ${WALL_X}, ${WALL_Y + WALL_H / 2})`}>
            social rule
          </text>

          {/* Player */}
          <motion.g
            animate={{
              x: phase === 'jumped' ? 80 : 0,
              y: phase === 'jumped' ? -(WALL_H - 10) : 0,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <circle cx={PLAYER_X} cy={playerY} r={7}
              fill={phase === 'jumped' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'jumped' ? 0.2 : 0.1)} />
            <line x1={PLAYER_X} y1={playerY + 7}
              x2={PLAYER_X} y2={playerY + 18}
              stroke={phase === 'jumped' ? verse.palette.accent : verse.palette.primary}
              strokeWidth={1.5}
              opacity={safeOpacity(0.12)} />
          </motion.g>

          {/* Jump arc trail */}
          {phase === 'jumped' && (
            <motion.path
              d={`M ${PLAYER_X},${WALL_Y + WALL_H - 15} Q ${CX},${WALL_Y - 25} ${PLAYER_X + 80},${WALL_Y - 5}`}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1} strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.15) }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Console window */}
          {(phase === 'console' || phase === 'typing') && (
            <motion.g
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <rect x={25} y={H - 45} width={W - 50} height={30} rx={3}
                fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
              <rect x={25} y={H - 45} width={W - 50} height={30} rx={3}
                fill="none" stroke={verse.palette.primary}
                strokeWidth={0.5} opacity={safeOpacity(0.12)} />
              <text x={32} y={H - 32}
                fill={verse.palette.textFaint} style={{ fontSize: '7px', fontFamily: 'monospace' }}
                opacity={0.2}>
                {'> '}
              </text>
              {phase === 'typing' && typed && (
                <text x={42} y={H - 32}
                  fill={verse.palette.accent} style={{ fontSize: '8px', fontFamily: 'monospace' }}
                  opacity={0.4}>
                  {typed}
                </text>
              )}
            </motion.g>
          )}

          {/* Result */}
          {phase === 'jumped' && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              the wall was never real
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'blocked' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleConsole}>
          open console
        </motion.button>
      )}

      {phase === 'typing' && (
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={e => handleType(e.target.value)}
          placeholder="gravity = 0.5"
          style={{
            background: 'transparent',
            border: `1px solid ${verse.palette.primary}`,
            borderRadius: 6,
            padding: '6px 10px',
            color: verse.palette.text,
            fontSize: '13px',
            fontFamily: 'monospace',
            outline: 'none',
            opacity: 0.6,
            width: 170,
          }}
        />
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'jumped' ? 'the rule was social. you changed it. you jumped.'
          : phase === 'modded' ? 'gravity modified...'
            : phase === 'typing' ? 'type: gravity = 0.5'
              : phase === 'console' ? 'console opening...'
                : 'the wall is too high. by the current rules.'}
      </span>

      {phase === 'jumped' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          innovation
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'jumped' ? 'lateral thinking' : 'hack the social rules'}
      </div>
    </div>
  );
}
