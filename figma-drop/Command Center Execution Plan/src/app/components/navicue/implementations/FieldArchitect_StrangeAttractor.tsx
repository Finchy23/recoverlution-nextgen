/**
 * FIELD ARCHITECT #3 -- 1103. The Strange Attractor
 * "Hold your center, and the chaos will dance for you."
 * INTERACTION: Hold finger/pointer still -- chaotic line forms a butterfly orbit
 * STEALTH KBE: Stability -- non-reactivity (E)
 *
 * COMPOSITOR: pattern_glitch / Stellar / social / embodying / hold / 1103
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton, immersiveHoldButton } from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function FieldArchitect_StrangeAttractor({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Stellar',
        chrono: 'social',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1103,
        isSeal: false,
      }}
      arrivalText="Chaos swirling."
      prompt="Chaos theory says hidden patterns emerge from disorder. Be the strange attractor. Hold your center, and the chaos will dance for you."
      resonantText="Stability. You did not chase the line. You held still, and the line found its orbit. Non-reactivity is not passivity. It is the gravity that shapes the dance."
      afterglowCoda="The chaos dances."
      onComplete={onComplete}
    >
      {(verse) => <StrangeAttractorInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function StrangeAttractorInteraction({ verse }: { verse: any }) {
  const [complete, setComplete] = useState(false);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const HOLD_TARGET = 4; // seconds
  const tRef = useRef(0);
  const frameRef = useRef<number>();

  const hold = useHoldInteraction({
    maxDuration: HOLD_TARGET * 1000,
    onComplete: () => {
      setComplete(true);
      setTimeout(() => verse.advance(), 2200);
    },
  });

  // Lorenz-inspired butterfly trace
  useEffect(() => {
    const animate = () => {
      tRef.current += 0.03;
      const t = tRef.current;
      const cx = 100, cy = 80;
      const coherence = hold.isHolding ? hold.tension : 0.15;

      // More coherent = tighter butterfly, less = chaotic scatter
      const chaos = 1 - coherence;
      const bx = cx + Math.sin(t * 2.1) * (30 + chaos * 40) + Math.cos(t * 5.3) * chaos * 20;
      const by = cy + Math.cos(t * 1.7) * (25 + chaos * 30) + Math.sin(t * 4.1) * chaos * 15;

      setTrail(prev => [...prev.slice(-80), { x: bx, y: by }]);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [hold.isHolding, hold.tension]);

  const progressPct = hold.tension;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 200 / 160)}>
        <svg viewBox="0 0 200 160" style={navicueStyles.heroSvg}>
          <polyline
            points={trail.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth={1.2}
            opacity={0.4 + progressPct * 0.4}
          />
        </svg>
        {/* Center dot (attractor) */}
        <motion.div
          animate={{
            scale: hold.isHolding ? [1, 1.15, 1] : 1,
            opacity: hold.isHolding ? 0.8 : 0.3,
          }}
          transition={hold.isHolding ? { repeat: Infinity, duration: 2 } : {}}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 10, height: 10, borderRadius: '50%',
            background: verse.palette.accent,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Hold zone */}
      {!complete ? (() => {
        const btn = immersiveHoldButton(verse.palette);
        return (
          <motion.div
            {...hold.holdProps}
            animate={hold.isHolding ? btn.holding : {}}
            transition={{ duration: 0.2 }}
            style={{ ...hold.holdProps.style, ...btn.base }}
          >
            <svg viewBox="0 0 90 90" style={btn.progressRing.svg}>
              <circle {...btn.progressRing.track} />
              <circle {...btn.progressRing.fill(hold.tension)} />
            </svg>
            <div style={btn.label}>{hold.isHolding ? 'holding center...' : 'hold still'}</div>
          </motion.div>
        );
      })() : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
          >
            pattern emerged
          </motion.div>
        </AnimatePresence>
      )}

      {/* Progress */}
      {!complete && (
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${progressPct * 100}%` }}
            style={{ height: '100%', background: verse.palette.accent, borderRadius: 2 }}
          />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {complete ? 'non-reactivity' : hold.isHolding ? 'chaos settling' : 'swirling'}
      </div>
    </div>
  );
}