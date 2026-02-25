/**
 * POLITICIAN #6 -- 1356. The Compromise
 * "Perfect is the enemy of the deal."
 * INTERACTION: Slider. You want 100%. They want 0%. Settle at 60%. Deal.
 * STEALTH KBE: Satisficing -- Pragmatic Resolution (K)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / morning / knowing / drag / 1356
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

export default function Politician_Compromise({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'k',
        hook: 'drag',
        specimenSeed: 1356,
        isSeal: false,
      }}
      arrivalText="You want 100%. They want 0%."
      prompt="Perfect is the enemy of the deal. Take the 60%. Live to fight another day. A partial win is better than a total war."
      resonantText="Satisficing. You accepted 60% and walked away with a deal. Pragmatic resolution: the leader who demands 100% gets 0%, because the other side walks. 60% today beats 0% tomorrow."
      afterglowCoda="Take the 60%."
      onComplete={onComplete}
    >
      {(verse) => <CompromiseInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function CompromiseInteraction({ verse }: { verse: any }) {
  const [value, setValue] = useState(100);
  const [done, setDone] = useState(false);
  const trackRef = useRef<SVGLineElement>(null);

  const W = 240, H = 130;
  const CX = W / 2;
  const TRACK_X1 = 30, TRACK_X2 = W - 30;
  const TRACK_Y = 65;
  const TRACK_W = TRACK_X2 - TRACK_X1;

  const handleX = value === 100 ? TRACK_X2 : TRACK_X1 + (value / 100) * TRACK_W;
  const dealZone = value >= 55 && value <= 65;
  const tooLow = value < 55;

  const handleDrag = (e: React.PointerEvent<SVGCircleElement>) => {
    if (done) return;
    const svg = (e.target as SVGCircleElement).ownerSVGElement;
    if (!svg) return;

    const move = (ev: PointerEvent) => {
      const rect = svg.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, ((x - TRACK_X1) / TRACK_W) * 100));
      setValue(Math.round(pct));
    };

    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const handleAccept = () => {
    if (done || !dealZone) return;
    setDone(true);
    setTimeout(() => verse.advance(), 3000);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>offer</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent
            : dealZone ? verse.palette.accent
              : tooLow ? verse.palette.shadow : verse.palette.text,
        }}>
          {done ? 'deal' : `${value}%`}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Track */}
          <line ref={trackRef}
            x1={TRACK_X1} y1={TRACK_Y} x2={TRACK_X2} y2={TRACK_Y}
            stroke={verse.palette.primary} strokeWidth={2} strokeLinecap="round"
            opacity={safeOpacity(0.1)} />

          {/* Deal zone highlight (55-65%) */}
          <rect
            x={TRACK_X1 + 0.55 * TRACK_W} y={TRACK_Y - 12}
            width={0.1 * TRACK_W} height={24} rx={3}
            fill={verse.palette.accent}
            opacity={safeOpacity(done ? 0.1 : 0.04)} />
          <text
            x={TRACK_X1 + 0.6 * TRACK_W} y={TRACK_Y - 16}
            textAnchor="middle" fill={verse.palette.accent}
            style={{ fontSize: '7px' }} opacity={dealZone || done ? 0.4 : 0.15}>
            deal zone
          </text>

          {/* Your side (100%) */}
          <text x={TRACK_X2 + 5} y={TRACK_Y + 4}
            fill={verse.palette.text} style={{ fontSize: '8px' }} opacity={0.2}>
            you
          </text>
          <text x={TRACK_X2} y={TRACK_Y + 16}
            textAnchor="end" fill={verse.palette.textFaint}
            style={{ fontSize: '7px' }} opacity={0.15}>
            100%
          </text>

          {/* Their side (0%) */}
          <text x={TRACK_X1 - 5} y={TRACK_Y + 4}
            textAnchor="end" fill={verse.palette.text}
            style={{ fontSize: '8px' }} opacity={0.2}>
            them
          </text>
          <text x={TRACK_X1} y={TRACK_Y + 16}
            fill={verse.palette.textFaint}
            style={{ fontSize: '7px' }} opacity={0.15}>
            0%
          </text>

          {/* Filled portion */}
          <line x1={TRACK_X1} y1={TRACK_Y} x2={handleX} y2={TRACK_Y}
            stroke={dealZone || done ? verse.palette.accent : verse.palette.primary}
            strokeWidth={2} strokeLinecap="round"
            opacity={safeOpacity(dealZone || done ? 0.3 : 0.15)} />

          {/* Handle */}
          {!done && (
            <circle
              cx={handleX} cy={TRACK_Y} r={10}
              fill={dealZone ? verse.palette.accent : verse.palette.primary}
              opacity={safeOpacity(dealZone ? 0.2 : 0.1)}
              style={{ cursor: 'grab', touchAction: 'none' }}
              onPointerDown={handleDrag}
            />
          )}

          {/* Current value label */}
          {!done && (
            <text x={handleX} y={TRACK_Y - 16} textAnchor="middle"
              fill={dealZone ? verse.palette.accent : verse.palette.text}
              style={{ fontSize: '11px' }} opacity={0.4}>
              {value}%
            </text>
          )}

          {/* Deal indicator */}
          {done && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <circle
                cx={TRACK_X1 + 0.6 * TRACK_W} cy={TRACK_Y} r={10}
                fill={verse.palette.accent} opacity={safeOpacity(0.2)} />
              <text
                x={TRACK_X1 + 0.6 * TRACK_W} y={TRACK_Y + 3}
                textAnchor="middle" fill={verse.palette.accent}
                style={{ fontSize: '8px', fontWeight: 500 }} opacity={0.6}>
                60
              </text>
            </motion.g>
          )}

          {/* Status messages */}
          {!done && value > 80 && (
            <text x={CX} y={H - 10} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '8px' }} opacity={0.2}>
              they will never accept this
            </text>
          )}
          {!done && tooLow && (
            <text x={CX} y={H - 10} textAnchor="middle"
              fill={verse.palette.shadow} style={{ fontSize: '8px' }} opacity={0.25}>
              you are giving away too much
            </text>
          )}
          {done && (
            <motion.text
              x={CX} y={H - 10} textAnchor="middle"
              fill={verse.palette.accent} style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.5 }}
            >
              partial win. total peace.
            </motion.text>
          )}
        </svg>
      </div>

      {dealZone && !done && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleAccept}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          accept {value}%
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'a partial win is better than a total war.'
          : dealZone ? 'the deal zone. accept?'
            : tooLow ? 'too generous. drag right.'
              : 'drag toward the middle. find the deal.'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          pragmatic resolution
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'satisficing' : 'take the 60%'}
      </div>
    </div>
  );
}
