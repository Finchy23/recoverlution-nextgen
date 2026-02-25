/**
 * CATALYST III #1 -- 1221. The Phase Change (Ice to Water)
 * "Latent heat. The temperature is rising inside the solid. The melt is instant."
 * INTERACTION: Hold to apply heat -- no visual change for 5s, then sudden crack + flow
 * STEALTH KBE: Perseverance -- Faith in Latent Progress (B)
 *
 * COMPOSITOR: koan_paradox / Glacier / night / believing / hold / 1221
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveHoldButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

interface Props { data?: any; onComplete?: () => void; }

export default function CatalystIII_PhaseChange({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Glacier',
        chrono: 'night',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1221,
        isSeal: false,
      }}
      arrivalText="A block of ice. Solid. Still."
      prompt="Latent heat. You put energy in, but you see no change. Keep heating. The temperature is rising inside the solid. The melt is instant."
      resonantText="Perseverance. The ice looked the same at 1 degree below zero as it did at 10 below. But the energy was accumulating. Faith in latent progress means trusting the invisible work."
      afterglowCoda="The melt is instant."
      onComplete={onComplete}
    >
      {(verse) => <PhaseChangeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PhaseChangeInteraction({ verse }: { verse: any }) {
  const [internalTemp, setInternalTemp] = useState(-20);
  const [melted, setMelted] = useState(false);
  const [cracking, setCracking] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 7000,
    tickRate: 50,
    onComplete: () => {
      setCracking(true);
      setTimeout(() => {
        setMelted(true);
        setTimeout(() => verse.advance(), 2800);
      }, 800);
    },
  });

  // Internal temp rises while holding but NO visual change on the ice
  useEffect(() => {
    if (!hold.isHolding || melted) return;
    const interval = setInterval(() => {
      setInternalTemp(prev => Math.min(0, prev + 0.5));
    }, 50);
    return () => clearInterval(interval);
  }, [hold.isHolding, melted]);

  const btn = immersiveHoldButton(verse.palette, 90, 24);
  const SCENE_W = 200;
  const SCENE_H = 140;

  const tempDisplay = Math.round(internalTemp);
  const nearMelt = internalTemp > -3 && !melted;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Ice / Water visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {!melted ? (
            // Ice block -- deliberately static until crack
            <motion.g>
              <rect x={50} y={30} width={100} height={80} rx={4}
                fill={verse.palette.primary}
                opacity={safeOpacity(0.12)}
                stroke={verse.palette.primary}
                strokeWidth={1}
              />
              {/* Crystal facets inside */}
              <line x1={70} y1={40} x2={90} y2={70}
                stroke={verse.palette.primary} strokeWidth={0.5} opacity={safeOpacity(0.08)} />
              <line x1={120} y1={45} x2={100} y2={80}
                stroke={verse.palette.primary} strokeWidth={0.5} opacity={safeOpacity(0.08)} />
              <line x1={80} y1={95} x2={130} y2={60}
                stroke={verse.palette.primary} strokeWidth={0.5} opacity={safeOpacity(0.08)} />

              {/* Cracks appear at threshold */}
              {cracking && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: safeOpacity(0.5) }}
                  transition={{ duration: 0.3 }}
                >
                  <path d="M100,30 L95,55 L105,70 L98,110"
                    fill="none" stroke={verse.palette.accent} strokeWidth={1.5} />
                  <path d="M80,50 L95,55"
                    fill="none" stroke={verse.palette.accent} strokeWidth={1} />
                  <path d="M120,65 L105,70"
                    fill="none" stroke={verse.palette.accent} strokeWidth={1} />
                </motion.g>
              )}

              {/* "No change" text -- appears while heating */}
              {hold.isHolding && internalTemp > -15 && internalTemp < -5 && (
                <motion.text
                  x={100} y={25}
                  textAnchor="middle"
                  fill={verse.palette.textFaint}
                  style={navicueType.micro}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  nothing yet
                </motion.text>
              )}
            </motion.g>
          ) : (
            // Water -- flowing ripples
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Water pool */}
              <ellipse cx={100} cy={90} rx={80} ry={20}
                fill={verse.palette.accent}
                opacity={safeOpacity(0.1)} />

              {/* Ripples */}
              {[0, 1, 2].map(i => (
                <motion.ellipse
                  key={i}
                  cx={100} cy={85}
                  rx={20 + i * 25} ry={6 + i * 5}
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={0.8}
                  animate={{
                    rx: [20 + i * 25, 30 + i * 25, 20 + i * 25],
                    opacity: [safeOpacity(0.2), safeOpacity(0.1), safeOpacity(0.2)],
                  }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
                />
              ))}

              {/* Flow particles */}
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.circle
                  key={i}
                  r={2}
                  fill={verse.palette.accent}
                  animate={{
                    cx: [60 + i * 20, 70 + i * 20, 60 + i * 20],
                    cy: [75, 90, 75],
                    opacity: [0, safeOpacity(0.3), 0],
                  }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.25 }}
                />
              ))}
            </motion.g>
          )}
        </svg>
      </div>

      {/* Temperature readout -- rises but ice looks the same */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>internal</span>
        <span style={{
          ...navicueType.data,
          color: nearMelt ? verse.palette.accent : verse.palette.text,
        }}>
          {tempDisplay}&deg;C
        </span>
      </div>

      {/* Hold zone */}
      {!melted && !cracking && (
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
          <div style={btn.label}>
            {hold.isHolding ? 'heating...' : 'hold to heat'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {melted
          ? 'water flows'
          : cracking
            ? 'crack'
            : hold.isHolding
              ? 'keep going. trust the process.'
              : 'apply heat to the ice'}
      </span>

      {melted && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          faith in latent progress
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {melted ? 'perseverance' : 'latent heat'}
      </div>
    </div>
  );
}
