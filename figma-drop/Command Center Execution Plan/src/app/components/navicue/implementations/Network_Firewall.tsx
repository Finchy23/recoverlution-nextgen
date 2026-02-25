/**
 * NETWORK #8 -- 1318. The Firewall
 * "Filter the traffic. Let the love in. Keep the malware out."
 * INTERACTION: Hold to raise the firewall -- toxic inputs get blocked, safe inputs pass
 * STEALTH KBE: Boundaries -- Digital Hygiene (E)
 *
 * COMPOSITOR: pattern_glitch / Pulse / night / embodying / hold / 1318
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

export default function Network_Firewall({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Pulse',
        chrono: 'night',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1318,
        isSeal: false,
      }}
      arrivalText="Incoming traffic. Unfiltered."
      prompt="Openness is good. Vulnerability is bad. Filter the traffic. Let the love in. Keep the malware out."
      resonantText="Boundaries. You raised the firewall and the toxic inputs stopped. Digital hygiene is the discipline of selective permeability: open enough to receive, closed enough to survive."
      afterglowCoda="Access denied."
      onComplete={onComplete}
    >
      {(verse) => <FirewallInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FirewallInteraction({ verse }: { verse: any }) {
  const [done, setDone] = useState(false);

  const hold = useHoldInteraction({
    maxDuration: 4500,
    onComplete: () => {
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    },
  });

  const btn = immersiveHoldButton(verse.palette, 90, 26);
  const W = 240, H = 150;
  const WALL_X = W / 2;

  // Firewall height based on tension
  const wallHeight = hold.tension * (H - 30);

  // Incoming packets (mix of safe and toxic)
  const packets = [
    { y: 25, safe: true, label: 'trust' },
    { y: 50, safe: false, label: 'toxic' },
    { y: 75, safe: true, label: 'growth' },
    { y: 100, safe: false, label: 'drain' },
    { y: 125, safe: true, label: 'joy' },
  ];

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>firewall</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'active' : `${Math.round(hold.tension * 100)}%`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Protected zone (right side) */}
          <rect x={WALL_X + 5} y={5} width={W - WALL_X - 10} height={H - 10} rx={4}
            fill={verse.palette.accent}
            opacity={safeOpacity(done ? 0.04 : 0.02)} />

          {/* Firewall barrier */}
          <motion.rect
            x={WALL_X - 2} width={4} rx={2}
            fill={done ? verse.palette.accent : verse.palette.primary}
            animate={{
              y: H - 15 - wallHeight,
              height: wallHeight,
              opacity: safeOpacity(done ? 0.4 : hold.tension * 0.3),
            }}
            transition={{ duration: 0.15 }}
          />

          {/* Firewall glow */}
          {hold.tension > 0.3 && (
            <motion.rect
              x={WALL_X - 6} width={12} rx={6}
              fill={verse.palette.accent}
              animate={{
                y: H - 15 - wallHeight,
                height: wallHeight,
                opacity: [safeOpacity(0.03), safeOpacity(0.06), safeOpacity(0.03)],
              }}
              transition={{
                y: { duration: 0.15 },
                height: { duration: 0.15 },
                opacity: { repeat: Infinity, duration: 1 },
              }}
            />
          )}

          {/* Incoming packets */}
          {packets.map((pkt, i) => {
            const blocked = !pkt.safe && hold.tension > (pkt.y / H);
            const passed = pkt.safe || hold.tension < (pkt.y / H);

            return (
              <motion.g key={i}>
                {/* Packet */}
                <motion.rect
                  y={pkt.y - 4} width={8} height={8} rx={2}
                  fill={pkt.safe ? verse.palette.accent : verse.palette.shadow}
                  animate={{
                    x: blocked
                      ? [10, WALL_X - 15]
                      : done && pkt.safe
                        ? [10, W - 20]
                        : [10, WALL_X - 15, 10],
                    opacity: blocked
                      ? [safeOpacity(0.3), safeOpacity(0.3)]
                      : done && pkt.safe
                        ? [safeOpacity(0.3), safeOpacity(0.3)]
                        : [safeOpacity(0.3), safeOpacity(0.3), safeOpacity(0.3)],
                  }}
                  transition={{
                    repeat: blocked || (done && pkt.safe) ? 0 : Infinity,
                    duration: blocked ? 0.8 : 2,
                    ease: 'linear',
                  }}
                />

                {/* Blocked indicator */}
                {blocked && (
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                  >
                    <text x={WALL_X + 12} y={pkt.y + 3}
                      fill={verse.palette.shadow} style={{ fontSize: '8px' }}>
                      denied
                    </text>
                  </motion.g>
                )}

                {/* Passed indicator */}
                {done && pkt.safe && (
                  <motion.text
                    x={W - 25} y={pkt.y + 3}
                    fill={verse.palette.accent}
                    style={{ fontSize: '8px' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    {pkt.label}
                  </motion.text>
                )}

                {/* Label on left */}
                <text x={5} y={pkt.y + 3}
                  fill={pkt.safe ? verse.palette.accent : verse.palette.shadow}
                  style={{ fontSize: '7px' }}
                  opacity={0.25}>
                  {pkt.label}
                </text>
              </motion.g>
            );
          })}

          {/* You (protected side) */}
          <circle cx={W - 30} cy={H / 2} r={8}
            fill={verse.palette.accent} opacity={safeOpacity(0.1)} />
          <text x={W - 30} y={H / 2 + 20} textAnchor="middle"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
            you
          </text>
        </svg>
      </div>

      {!done && (
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
            {hold.isHolding ? 'raising...' : 'raise firewall'}
          </div>
        </motion.div>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'love in. malware out.'
          : hold.isHolding ? 'filtering traffic...'
            : 'unfiltered. vulnerable.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          digital hygiene
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'boundaries' : 'selective permeability'}
      </div>
    </div>
  );
}
