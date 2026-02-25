/**
 * CRYSTAL #6 -- 1126. The Annealing (Heat)
 * "Warm up again. Cool down slowly."
 * INTERACTION: Glass cools too fast and cracks -- choose slow cool (processing) over fast freeze
 * STEALTH KBE: Trauma Processing -- healing logic (K)
 *
 * COMPOSITOR: pattern_glitch / Glacier / night / knowing / tap / 1126
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Crystal_Annealing({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Glacier',
        chrono: 'night',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1126,
        isSeal: false,
      }}
      arrivalText="Glass cooling. Too fast."
      prompt="You cooled down too fast after the trauma. The tension is locked inside. Warm up again. Cool down slowly."
      resonantText="Trauma Processing. You chose the slow path. The glass did not crack. Healing logic is not speed. It is temperature control. Feel, then process, then release."
      afterglowCoda="Strong."
      onComplete={onComplete}
    >
      {(verse) => <AnnealingInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function AnnealingInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'fast' | 'cracked' | 'reheating' | 'slow_cooling' | 'strong'>('fast');
  const [temp, setTemp] = useState(100);
  const [coolProgress, setCoolProgress] = useState(0);

  // Fast cool demo
  useEffect(() => {
    if (phase !== 'fast') return;
    const interval = setInterval(() => {
      setTemp(prev => {
        const next = prev - 5;
        if (next <= 20) {
          setPhase('cracked');
          clearInterval(interval);
        }
        return Math.max(next, 20);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase]);

  const reheat = useCallback(() => {
    if (phase !== 'cracked') return;
    setPhase('reheating');
    setTemp(20);
    const heat = setInterval(() => {
      setTemp(prev => {
        if (prev >= 100) {
          clearInterval(heat);
          setPhase('slow_cooling');
          return 100;
        }
        return prev + 3;
      });
    }, 60);
  }, [phase]);

  // Slow cool
  useEffect(() => {
    if (phase !== 'slow_cooling') return;
    const interval = setInterval(() => {
      setCoolProgress(prev => {
        const next = prev + 0.5;
        setTemp(t => Math.max(25, t - 0.8));
        if (next >= 100) {
          setPhase('strong');
          clearInterval(interval);
          setTimeout(() => verse.advance(), 2000);
        }
        return Math.min(next, 100);
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase, verse]);

  const heatColor = `hsla(${Math.round(temp < 50 ? 210 : 20 - (temp - 50))}, ${Math.round(30 + temp * 0.3)}%, ${Math.round(30 + temp * 0.2)}%, 0.5)`;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Glass */}
      <div style={navicueStyles.heroCssScene(verse.palette, 140 / 100)}>
        <motion.div
          animate={{
            background: heatColor,
            boxShadow: phase === 'strong'
              ? `0 0 20px hsla(210, 40%, 55%, 0.3)`
              : temp > 60
              ? `0 0 ${Math.round((temp - 60) * 0.3)}px hsla(20, 50%, 50%, 0.2)`
              : 'none',
          }}
          style={{
            width: 70, height: 40, borderRadius: 6,
            border: `1px solid ${verse.palette.primaryGlow}`,
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Crack lines */}
          {phase === 'cracked' && (
            <svg width={70} height={40} style={{ position: 'absolute', top: 0, left: 0 }}>
              <line x1={15} y1={0} x2={35} y2={40} stroke="hsla(0, 0%, 60%, 0.4)" strokeWidth={1} />
              <line x1={50} y1={5} x2={30} y2={35} stroke="hsla(0, 0%, 60%, 0.3)" strokeWidth={0.8} />
            </svg>
          )}

          {/* Temp */}
          <span style={{ ...navicueStyles.annotation(verse.palette, 0.5), zIndex: 1 }}>
            {Math.round(temp)}
          </span>
        </motion.div>

        {/* Status label */}
        <span style={{
          position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
          ...navicueType.micro, color: phase === 'cracked' ? verse.palette.shadow : verse.palette.textFaint,
          opacity: 0.5,
        }}>
          {phase === 'cracked' ? 'too brittle' : phase === 'reheating' ? 'warming...' : phase === 'slow_cooling' ? 'slow cooling...' : phase === 'strong' ? 'strong' : 'cooling fast'}
        </span>
      </div>

      {/* Action */}
      {phase === 'cracked' && (
        <motion.button onClick={reheat}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          warm up again
        </motion.button>
      )}
      {phase === 'slow_cooling' && (
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${coolProgress}%` }}
            style={{ height: '100%', background: verse.palette.accent, borderRadius: 2 }}
          />
        </div>
      )}
      {phase === 'strong' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          annealed
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'strong' ? 'healing logic' : phase === 'cracked' ? 'tension locked' : phase === 'slow_cooling' ? 'processing' : 'thermal'}
      </div>
    </div>
  );
}