/**
 * SIMULATOR #4 -- 1244. The Sandbox Mode
 * "It's a Dev Server. Crash the system. It's just a test."
 * INTERACTION: Toggle from High Stakes to Sandbox, then take the risk
 * STEALTH KBE: Psychological Safety -- Growth Mindset (B)
 *
 * COMPOSITOR: koan_paradox / Circuit / morning / believing / tap / 1244
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Simulator_SandboxMode({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Circuit',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1244,
        isSeal: false,
      }}
      arrivalText="HIGH STAKES MODE. One mistake = Game Over."
      prompt="Fear freezes you because you think it is a Live Server. It is a Dev Server. Test the code. Crash the system. It is just a test."
      resonantText="Psychological safety. You switched modes and took the risk. Growth mindset is not the absence of fear. It is reframing the stakes. In sandbox mode, every crash is data."
      afterglowCoda="It is just a test."
      onComplete={onComplete}
    >
      {(verse) => <SandboxModeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SandboxModeInteraction({ verse }: { verse: any }) {
  const [mode, setMode] = useState<'live' | 'sandbox'>('live');
  const [crashed, setCrashed] = useState(false);
  const [learned, setLearned] = useState(false);
  const [done, setDone] = useState(false);

  const handleToggle = () => {
    if (mode === 'sandbox') return;
    setMode('sandbox');
  };

  const handleRisk = () => {
    if (crashed) return;
    setCrashed(true);
    setTimeout(() => {
      setLearned(true);
      setDone(true);
      setTimeout(() => verse.advance(), 2800);
    }, 1500);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 240;
  const SCENE_H = 100;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Mode indicator */}
      <div style={{
        display: 'flex', gap: 16, alignItems: 'center',
        padding: '8px 16px',
        borderRadius: 8,
        border: `1px solid`,
        borderColor: mode === 'live'
          ? `rgba(${verse.palette.shadowRgb || '180,60,60'}, 0.2)`
          : `rgba(${verse.palette.accentRgb || '100,180,100'}, 0.15)`,
      }}>
        <motion.div
          style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: mode === 'live' ? verse.palette.shadow : verse.palette.accent,
          }}
          animate={{
            opacity: mode === 'live' ? [0.5, 1, 0.5] : 0.6,
          }}
          transition={mode === 'live' ? { repeat: Infinity, duration: 1 } : {}}
        />
        <span style={{
          ...navicueType.choice,
          color: mode === 'live' ? verse.palette.shadow : verse.palette.accent,
        }}>
          {mode === 'live' ? 'PRODUCTION' : 'SANDBOX'}
        </span>
      </div>

      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Terminal window */}
          <rect x={10} y={10} width={SCENE_W - 20} height={SCENE_H - 20}
            rx={6} fill={verse.palette.primary}
            opacity={safeOpacity(0.05)} />
          <rect x={10} y={10} width={SCENE_W - 20} height={18}
            rx={6} fill={verse.palette.primary}
            opacity={safeOpacity(0.04)} />

          {/* Terminal dots */}
          {[28, 40, 52].map((x, i) => (
            <circle key={i} cx={x} cy={19} r={3}
              fill={verse.palette.primary}
              opacity={safeOpacity(0.15)} />
          ))}

          {/* Code lines */}
          <text x={20} y={44} fill={verse.palette.textFaint}
            style={{ ...navicueType.micro, fontFamily: 'monospace' }}>
            {mode === 'live' ? '$ deploy --production' : '$ run --sandbox'}
          </text>

          {crashed && !learned && (
            <motion.text
              x={20} y={62}
              fill={verse.palette.shadow}
              style={{ ...navicueType.micro, fontFamily: 'monospace' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            >
              {'> error: system crashed'}
            </motion.text>
          )}

          {learned && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <text x={20} y={62}
                fill={verse.palette.accent}
                style={{ ...navicueType.micro, fontFamily: 'monospace' }}>
                {'> crash logged. lesson extracted.'}
              </text>
              <text x={20} y={78}
                fill={verse.palette.accent}
                style={{ ...navicueType.micro, fontFamily: 'monospace' }}
                opacity={0.5}>
                {'> no damage. it was just a test.'}
              </text>
            </motion.g>
          )}

          {/* Stakes label */}
          {mode === 'live' && (
            <motion.text
              x={SCENE_W / 2} y={75}
              textAnchor="middle"
              fill={verse.palette.shadow}
              style={navicueType.micro}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              one mistake = game over
            </motion.text>
          )}
        </svg>
      </div>

      {/* Actions */}
      {mode === 'live' && (
        <motion.button
          style={btn.base}
          whileTap={btn.active}
          onClick={handleToggle}
        >
          switch to sandbox
        </motion.button>
      )}

      {mode === 'sandbox' && !crashed && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={handleRisk}
        >
          take the risk
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'crash = data. not damage.'
          : crashed
            ? 'crash detected...'
            : mode === 'sandbox'
              ? 'safe to fail. test something.'
              : 'frozen. the stakes are too high.'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          growth mindset
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'psychological safety' : 'change the mode'}
      </div>
    </div>
  );
}
