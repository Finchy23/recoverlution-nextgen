/**
 * AVIATOR #5 -- 1145. The Headwind (Resistance)
 * "If you turn, it is a turbocharger."
 * INTERACTION: Flying into headwind (slow) -- turn 180 -- tailwind (fast)
 * STEALTH KBE: Strategic Alignment -- resourcefulness (K)
 *
 * COMPOSITOR: poetic_precision / Drift / work / knowing / tap / 1145
 */
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Aviator_Headwind({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Drift',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1145,
        isSeal: false,
      }}
      arrivalText="Flying into a storm. Ground speed dropping."
      prompt="The wind is neutral. If you fight it, it is an enemy. If you turn, it is a turbocharger. Align your goal with the prevailing wind."
      resonantText="Strategic Alignment. You turned, and the resistance became propulsion. The wind did not change. Your direction did. Resourcefulness is not fighting the current. It is reading it."
      afterglowCoda="Tailwind."
      onComplete={onComplete}
    >
      {(verse) => <HeadwindInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function HeadwindInteraction({ verse }: { verse: any }) {
  const [heading, setHeading] = useState<'into' | 'turning' | 'with'>('into');
  const [speed, setSpeed] = useState(40);
  const [windParticles, setWindParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Wind particles always blow left-to-right
  useEffect(() => {
    const interval = setInterval(() => {
      setWindParticles(prev => {
        const next = prev
          .map(p => ({ ...p, x: p.x + 3 }))
          .filter(p => p.x < 200);
        if (Math.random() > 0.4) {
          next.push({ id: Date.now(), x: -5, y: 15 + Math.random() * 70 });
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Speed change after turning
  useEffect(() => {
    if (heading !== 'with') return;
    const interval = setInterval(() => {
      setSpeed(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => verse.advance(), 1800);
          return 95;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [heading, verse]);

  const turn = useCallback(() => {
    if (heading !== 'into') return;
    setHeading('turning');
    setTimeout(() => setHeading('with'), 800);
  }, [heading]);

  const planeDir = heading === 'into' ? -1 : heading === 'with' ? 1 : 0;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 100)}>
        {/* Wind particles */}
        {windParticles.map(p => (
          <div key={p.id} style={{
            position: 'absolute', left: p.x, top: p.y,
            width: 10, height: 1,
            background: 'hsla(0, 0%, 60%, 0.15)',
            borderRadius: 1,
          }} />
        ))}

        {/* Plane */}
        <motion.div
          animate={{
            scaleX: planeDir,
            x: heading === 'turning' ? [85, 90, 85] : heading === 'with' ? 100 : 70,
          }}
          transition={{ duration: heading === 'turning' ? 0.8 : 0.3 }}
          style={{
            position: 'absolute', top: 40,
            width: 24, height: 8,
            background: `hsla(210, 20%, 50%, 0.35)`,
            borderRadius: '60% 40% 40% 60%',
            border: `1px solid ${verse.palette.primaryGlow}`,
          }}
        />

        {/* Speed readout */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          ...navicueType.micro,
          color: speed < 50 ? verse.palette.shadow : verse.palette.accent,
        }}>
          {Math.round(speed)} kts
        </div>

        {/* Wind direction label */}
        <span style={{
          position: 'absolute', bottom: 5, left: 8,
          ...navicueStyles.annotation(verse.palette, 0.3),
        }}>
          wind {'>>'}
        </span>

        {/* Heading label */}
        <span style={{
          position: 'absolute', bottom: 5, right: 8,
          ...navicueStyles.annotation(verse.palette),
        }}>
          {heading === 'into' ? 'headwind' : heading === 'with' ? 'tailwind' : 'turning...'}
        </span>
      </div>

      {/* Action */}
      {heading === 'into' && (
        <motion.button onClick={turn}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          turn 180
        </motion.button>
      )}
      {heading === 'turning' && (
        <span style={navicueStyles.interactionHint(verse.palette)}>
          turning...
        </span>
      )}
      {heading === 'with' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          {speed >= 95 ? 'aligned' : 'accelerating...'}
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {speed >= 95 ? 'resourcefulness' : heading === 'into' ? 'fighting the wind' : 'strategic alignment'}
      </div>
    </div>
  );
}