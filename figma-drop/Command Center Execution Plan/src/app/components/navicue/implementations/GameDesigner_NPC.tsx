/**
 * GAME DESIGNER #4 -- 1394. The NPC (Non-Player Character)
 * "Most people are running scripts. They are NPCs."
 * INTERACTION: Rude script: "I hate you." Realize it's a script. Don't react.
 * STEALTH KBE: Depersonalization -- Emotional Detachment (E)
 *
 * COMPOSITOR: koan_paradox / Pulse / night / embodying / tap / 1394
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function GameDesigner_NPC({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'e',
        hook: 'tap',
        specimenSeed: 1394,
        isSeal: false,
      }}
      arrivalText="A rude person."
      prompt="Most people are running scripts. They are NPCs in their own lives. Do not get angry at a script. Just navigate around the bot."
      resonantText="Depersonalization. You saw the script and did not react. Emotional detachment: the insult was not personal. It was a subroutine. The NPC cannot choose. You can. Navigate around."
      afterglowCoda="Navigate around the bot."
      onComplete={onComplete}
    >
      {(verse) => <NPCInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NPCInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'script' | 'seeing' | 'code' | 'navigated'>('script');

  useEffect(() => {
    if (phase === 'script') {
      const t = setTimeout(() => {}, 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleSee = () => {
    if (phase !== 'script') return;
    setPhase('seeing');
    setTimeout(() => setPhase('code'), 800);
  };

  const handleNavigate = () => {
    if (phase !== 'code') return;
    setPhase('navigated');
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 220, H = 155;
  const CX = W / 2;

  const NPC_X = CX - 30, NPC_Y = 55;
  const YOU_X = CX + 40;
  const codeVisible = phase === 'code' || phase === 'navigated';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>perception</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'navigated' ? verse.palette.accent
            : codeVisible ? verse.palette.text : verse.palette.shadow,
        }}>
          {phase === 'navigated' ? 'clear (script detected)'
            : codeVisible ? 'it is a script'
              : phase === 'seeing' ? 'looking closer...'
                : 'reactive'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* NPC */}
          <motion.g
            animate={{
              opacity: phase === 'navigated' ? 0.4 : 1,
            }}
          >
            <circle cx={NPC_X} cy={NPC_Y} r={14}
              fill={verse.palette.shadow} opacity={safeOpacity(0.08)} />
            <circle cx={NPC_X} cy={NPC_Y} r={14}
              fill="none" stroke={verse.palette.shadow}
              strokeWidth={1} opacity={safeOpacity(0.12)} />

            {/* NPC label */}
            {codeVisible && (
              <motion.rect
                x={NPC_X - 12} y={NPC_Y - 5} width={24} height={10} rx={2}
                fill={verse.palette.shadow} opacity={safeOpacity(0.06)}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.06) }}
              />
            )}
            <text x={NPC_X} y={NPC_Y + 3} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: codeVisible ? '7px' : '8px', fontFamily: codeVisible ? 'monospace' : 'inherit' }}
              opacity={0.25}>
              {codeVisible ? 'NPC' : '?'}
            </text>

            {/* Speech bubble */}
            {phase === 'script' && (
              <motion.g
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <rect x={NPC_X - 35} y={NPC_Y - 35} width={70} height={18} rx={4}
                  fill={verse.palette.shadow} opacity={safeOpacity(0.06)} />
                <text x={NPC_X} y={NPC_Y - 23} textAnchor="middle"
                  fill={verse.palette.shadow} style={{ fontSize: '9px' }}>
                  "I hate you."
                </text>
              </motion.g>
            )}

            {/* Code overlay (script revealed) */}
            {codeVisible && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <rect x={NPC_X - 40} y={NPC_Y - 38} width={80} height={28} rx={3}
                  fill={verse.palette.primary} opacity={safeOpacity(0.06)} />
                <text x={NPC_X - 32} y={NPC_Y - 26}
                  fill={verse.palette.textFaint} style={{ fontSize: '6px', fontFamily: 'monospace' }}
                  opacity={0.25}>
                  if (stranger) {'{'} say("hate"); {'}'}
                </text>
                <text x={NPC_X - 32} y={NPC_Y - 18}
                  fill={verse.palette.textFaint} style={{ fontSize: '6px', fontFamily: 'monospace' }}
                  opacity={0.2}>
                  // not personal. script.
                </text>
              </motion.g>
            )}
          </motion.g>

          {/* You */}
          <motion.g
            animate={{
              x: phase === 'navigated' ? 30 : 0,
            }}
            transition={{ duration: 0.6 }}
          >
            <circle cx={YOU_X} cy={NPC_Y + 10} r={10}
              fill={phase === 'navigated' ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(phase === 'navigated' ? 0.15 : 0.08)} />
            <text x={YOU_X} y={NPC_Y + 13} textAnchor="middle"
              fill={phase === 'navigated' ? verse.palette.accent : verse.palette.text}
              style={{ fontSize: '7px' }}
              opacity={phase === 'navigated' ? 0.4 : 0.2}>
              you
            </text>
          </motion.g>

          {/* Navigation path (around the NPC) */}
          {phase === 'navigated' && (
            <motion.path
              d={`M ${YOU_X},${NPC_Y + 10} Q ${CX + 10},${NPC_Y + 45} ${YOU_X + 30},${NPC_Y + 10}`}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1} strokeDasharray="4 3"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.2) }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Reaction indicator (suppressed) */}
          {codeVisible && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
            >
              <text x={YOU_X} y={NPC_Y + 30} textAnchor="middle"
                fill={verse.palette.textFaint} style={{ fontSize: '7px' }}>
                {phase === 'navigated' ? 'no reaction' : 'no anger'}
              </text>
            </motion.g>
          )}

          {/* Result */}
          {phase === 'navigated' && (
            <motion.text x={CX} y={H - 5} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}>
              it was a subroutine. you navigated around.
            </motion.text>
          )}
        </svg>
      </div>

      {phase === 'script' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleSee}>
          look closer
        </motion.button>
      )}

      {phase === 'code' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleNavigate}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          navigate around
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'navigated' ? 'the NPC cannot choose. you can.'
          : codeVisible ? 'it is a script. not personal. a subroutine.'
            : phase === 'seeing' ? 'looking closer...'
              : '"I hate you." but is it personal?'}
      </span>

      {phase === 'navigated' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          emotional detachment
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'navigated' ? 'depersonalization' : 'do not get angry at a script'}
      </div>
    </div>
  );
}
