/**
 * ARCHITECT #5 -- 1325. The Stock and Flow
 * "Plug the leak first. Then turn up the tap."
 * INTERACTION: Tap to plug the drain, then turn up the tap -- water level rises
 * STEALTH KBE: Resource Management -- Financial/Energetic Literacy (K)
 *
 * COMPOSITOR: science_x_soul / Arc / work / knowing / tap / 1325
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Architect_StockAndFlow({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Arc',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1325,
        isSeal: false,
      }}
      arrivalText="A bathtub. The water is draining."
      prompt="You are focused on income. You are ignoring expenses. Plug the leak first. Then turn up the tap."
      resonantText="Resource management. You plugged the drain and the level rose. Financial and energetic literacy is the stock-and-flow truth: it does not matter how fast the tap runs if the drain is wide open."
      afterglowCoda="Plug the leak."
      onComplete={onComplete}
    >
      {(verse) => <StockAndFlowInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function StockAndFlowInteraction({ verse }: { verse: any }) {
  const [plugged, setPlugged] = useState(false);
  const [tapped, setTapped] = useState(false);
  const [level, setLevel] = useState(40); // 0-100
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLevel(prev => {
        const inflow = tapped ? 3 : 1;
        const outflow = plugged ? 0 : 2.5;
        const next = Math.max(0, Math.min(100, prev + inflow - outflow));
        if (next >= 85 && !done) {
          setDone(true);
          setTimeout(() => verse.advance(), 2800);
        }
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [plugged, tapped, done, verse]);

  const handlePlug = () => {
    if (plugged) return;
    setPlugged(true);
  };

  const handleTap = () => {
    if (tapped || !plugged) return;
    setTapped(true);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const W = 200, H = 180;

  // Bathtub geometry
  const TUB_X = 50, TUB_Y = 40, TUB_W = 100, TUB_H = 110;
  const waterH = (level / 100) * TUB_H;

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>level</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : level < 20 ? verse.palette.shadow : verse.palette.text,
        }}>
          {done ? 'full' : `${Math.round(level)}%`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Bathtub outline */}
          <rect x={TUB_X} y={TUB_Y} width={TUB_W} height={TUB_H} rx={4}
            fill="none" stroke={verse.palette.primary}
            strokeWidth={1.5} opacity={safeOpacity(0.15)} />

          {/* Water fill */}
          <motion.rect
            x={TUB_X + 2} width={TUB_W - 4} rx={2}
            fill={verse.palette.accent}
            animate={{
              y: TUB_Y + TUB_H - waterH + 2,
              height: Math.max(0, waterH - 4),
              opacity: safeOpacity(0.12),
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Tap (inflow) at top */}
          <g>
            <rect x={TUB_X + TUB_W / 2 - 4} y={TUB_Y - 20}
              width={8} height={20} rx={2}
              fill={verse.palette.primary} opacity={safeOpacity(0.1)} />
            {/* Tap handle */}
            <rect x={TUB_X + TUB_W / 2 - 8} y={TUB_Y - 22}
              width={16} height={4} rx={2}
              fill={tapped ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(tapped ? 0.25 : 0.1)} />

            {/* Water stream from tap */}
            <motion.rect
              x={TUB_X + TUB_W / 2 - 1}
              y={TUB_Y}
              width={tapped ? 3 : 1.5}
              height={TUB_H - waterH}
              fill={verse.palette.accent}
              animate={{
                opacity: safeOpacity(tapped ? 0.2 : 0.08),
              }}
            />

            <text x={TUB_X + TUB_W / 2} y={TUB_Y - 28} textAnchor="middle"
              fill={tapped ? verse.palette.accent : verse.palette.textFaint}
              style={{ fontSize: '7px' }} opacity={tapped ? 0.5 : 0.2}>
              inflow{tapped ? ' (max)' : ''}
            </text>
          </g>

          {/* Drain (outflow) at bottom */}
          <g>
            <rect x={TUB_X + TUB_W / 2 - 4} y={TUB_Y + TUB_H}
              width={8} height={15} rx={2}
              fill={verse.palette.primary} opacity={safeOpacity(0.1)} />

            {/* Drain flow */}
            {!plugged && (
              <motion.g>
                {[0, 1, 2].map(i => (
                  <motion.circle key={i}
                    cx={TUB_X + TUB_W / 2}
                    r={2}
                    fill={verse.palette.shadow}
                    animate={{
                      cy: [TUB_Y + TUB_H + 5, TUB_Y + TUB_H + 25],
                      opacity: [safeOpacity(0.3), 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.g>
            )}

            {/* Plug indicator */}
            {plugged && (
              <motion.rect
                x={TUB_X + TUB_W / 2 - 6} y={TUB_Y + TUB_H - 1}
                width={12} height={5} rx={2}
                fill={verse.palette.accent}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.3) }}
              />
            )}

            <text x={TUB_X + TUB_W / 2} y={TUB_Y + TUB_H + 30} textAnchor="middle"
              fill={plugged ? verse.palette.accent : verse.palette.shadow}
              style={{ fontSize: '7px' }} opacity={plugged ? 0.4 : 0.3}>
              {plugged ? 'plugged' : 'drain (open)'}
            </text>
          </g>

          {/* Flow rate indicators */}
          <text x={TUB_X - 5} y={TUB_Y + TUB_H / 2} textAnchor="end"
            fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.15}>
            stock
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {!plugged && (
          <motion.button style={btn.base} whileTap={btn.active} onClick={handlePlug}>
            plug the drain
          </motion.button>
        )}
        {plugged && !tapped && (
          <motion.button style={btn.base} whileTap={btn.active} onClick={handleTap}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          >
            turn up the tap
          </motion.button>
        )}
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'drain plugged. tap open. level rising.'
          : tapped ? 'filling...'
            : plugged ? 'leak stopped. now increase inflow.'
              : 'draining faster than it fills'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          financial literacy
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'resource management' : 'plug the leak first'}
      </div>
    </div>
  );
}
