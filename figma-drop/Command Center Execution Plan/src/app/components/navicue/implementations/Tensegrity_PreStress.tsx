/**
 * TENSEGRITY #2 -- 1152. The Pre-Stress (Readiness)
 * "You need some tension. Tighten the wire until it sings."
 * INTERACTION: Slack string -- structure collapsed -- drag to tighten -- structure stands
 * STEALTH KBE: Activation -- optimal arousal (E)
 *
 * COMPOSITOR: sensory_cinema / Lattice / morning / embodying / drag / 1152
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tensegrity_PreStress({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Lattice',
        chrono: 'morning',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1152,
        isSeal: false,
      }}
      arrivalText="A slack string. The structure collapsed."
      prompt="A slack string makes no sound and holds no weight. You need some tension. Tighten the wire until it sings."
      resonantText="Activation. You tightened and the structure rose. Too slack is collapse. Too tight is snap. The wire that sings is the wire that holds. Optimal arousal is the tension that makes you stand."
      afterglowCoda="Tuned."
      onComplete={onComplete}
    >
      {(verse) => <PreStressInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PreStressInteraction({ verse }: { verse: any }) {
  const [tension, setTension] = useState(10); // 0-100
  const [done, setDone] = useState(false);
  const OPTIMAL_MIN = 65;
  const OPTIMAL_MAX = 85;

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    setTension(prev => {
      const next = Math.max(0, Math.min(100, prev + info.delta.x * 0.4));
      if (next >= OPTIMAL_MIN && next <= OPTIMAL_MAX) {
        setDone(true);
        setTimeout(() => verse.advance(), 2000);
      }
      return next;
    });
  }, [done, verse]);

  const tPct = tension / 100;
  const collapsed = tension < 30;
  const strutHeight = Math.min(60, tension * 0.7);

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Structure */}
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Base */}
          <line x1={30} y1={85} x2={130} y2={85}
            stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.15} />

          {/* Struts rising with tension */}
          <motion.line
            animate={{ x1: 50, y1: 85, x2: 50, y2: 85 - strutHeight }}
            stroke="hsla(210, 20%, 50%, 0.4)" strokeWidth={3} strokeLinecap="round"
          />
          <motion.line
            animate={{ x1: 110, y1: 85, x2: 110, y2: 85 - strutHeight }}
            stroke="hsla(210, 20%, 50%, 0.4)" strokeWidth={3} strokeLinecap="round"
          />

          {/* Top beam */}
          <motion.line
            animate={{
              x1: 50, y1: 85 - strutHeight,
              x2: 110, y2: 85 - strutHeight,
              opacity: collapsed ? 0.1 : 0.3,
            }}
            stroke={done ? verse.palette.accent : 'hsla(210, 20%, 50%, 0.4)'}
            strokeWidth={2} strokeLinecap="round"
          />

          {/* Tension wire */}
          <motion.path
            animate={{
              d: collapsed
                ? `M 30 85 Q 80 ${90 - tension * 0.05} 130 85`
                : `M 30 ${85 - strutHeight} Q 80 ${85 - strutHeight - (tension > 50 ? 3 : 10)} 130 ${85 - strutHeight}`,
            }}
            fill="none"
            stroke={done ? verse.palette.accent : 'hsla(180, 30%, 50%, 0.4)'}
            strokeWidth={1.5}
          />

          {/* Tension label */}
          <text x={80} y={15} textAnchor="middle"
            style={navicueType.micro}
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            opacity={0.5}>
            {done ? 'tuned' : collapsed ? 'slack' : `tension: ${Math.round(tension)}%`}
          </text>
        </svg>
      </div>

      {/* Tension control */}
      {!done ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <motion.div
            drag="x"
            dragConstraints={{ left: -60, right: 60 }}
            dragElastic={0.05}
            dragMomentum={false}
            onDrag={handleDrag}
            style={{
              ...immersiveTapButton(verse.palette).base,
              cursor: 'grab',
              touchAction: 'none',
            }}
            whileTap={immersiveTapButton(verse.palette).active}
          >
            tighten
          </motion.div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          singing
        </motion.div>
      )}

      {!done && (
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${tPct * 100}%` }}
            style={{
              height: '100%', borderRadius: 2,
              background: tension > OPTIMAL_MAX ? verse.palette.shadow :
                tension >= OPTIMAL_MIN ? verse.palette.accent : 'hsla(200, 30%, 50%, 0.4)',
            }} />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'optimal arousal' : 'find the tension'}
      </div>
    </div>
  );
}