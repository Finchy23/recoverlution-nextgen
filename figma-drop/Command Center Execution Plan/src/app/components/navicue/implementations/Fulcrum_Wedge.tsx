/**
 * FULCRUM #5 -- 1205. The Wedge (Splitting)
 * "Don't beat the wood. Find the crack."
 * INTERACTION: Tap the log with hammer (bounce). Find the crack, insert wedge.
 * STEALTH KBE: Decomposition -- Tactical Entry (K)
 *
 * COMPOSITOR: koan_paradox / Storm / morning / knowing / tap / 1205
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTap,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const SEGMENTS = [
  { id: 'top', hasCrack: false },
  { id: 'mid-left', hasCrack: false },
  { id: 'center', hasCrack: true },
  { id: 'mid-right', hasCrack: false },
  { id: 'bottom', hasCrack: false },
];

export default function Fulcrum_Wedge({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Storm',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1205,
        isSeal: false,
      }}
      arrivalText="A solid log."
      prompt="Do not beat the wood. Find the crack. Insert the wedge. Let the geometry do the splitting. One small opening breaks the whole log."
      resonantText="Decomposition. The log was not defeated by force. It was opened by precision. Tactical entry means finding the one crack that lets geometry do the work."
      afterglowCoda="Find the crack."
      onComplete={onComplete}
    >
      {(verse) => <WedgeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function WedgeInteraction({ verse }: { verse: any }) {
  const [hammerHits, setHammerHits] = useState(0);
  const [foundCrack, setFoundCrack] = useState(false);
  const [wedgeInserted, setWedgeInserted] = useState(false);
  const [split, setSplit] = useState(false);
  const [bounceIdx, setBounceIdx] = useState(-1);

  const handleHammer = (idx: number) => {
    if (foundCrack || split) return;
    setHammerHits(prev => prev + 1);
    setBounceIdx(idx);
    setTimeout(() => setBounceIdx(-1), 400);

    if (SEGMENTS[idx].hasCrack) {
      setFoundCrack(true);
    }
  };

  const insertWedge = () => {
    if (wedgeInserted) return;
    setWedgeInserted(true);
    setTimeout(() => {
      setSplit(true);
      setTimeout(() => verse.advance(), 2500);
    }, 800);
  };

  const SCENE_W = 200;
  const SCENE_H = 160;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Log visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Log body -- splits when wedge is inserted */}
          <motion.rect
            x={split ? 30 : 60}
            y={20}
            width={split ? 35 : 80}
            height={120}
            rx={6}
            fill={verse.palette.primary}
            opacity={safeOpacity(0.15)}
            stroke={verse.palette.primary}
            strokeWidth={0.8}
            animate={{
              x: split ? 30 : 60,
              opacity: safeOpacity(split ? 0.1 : 0.15),
            }}
            transition={{ duration: 0.6 }}
          />
          {split && (
            <motion.rect
              x={135}
              y={20}
              width={35}
              height={120}
              rx={6}
              fill={verse.palette.primary}
              opacity={safeOpacity(0.1)}
              stroke={verse.palette.primary}
              strokeWidth={0.8}
              initial={{ x: 105, opacity: 0 }}
              animate={{ x: 135, opacity: safeOpacity(0.1) }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Segment tap zones (invisible hit areas shown as subtle lines) */}
          {!foundCrack && SEGMENTS.map((seg, i) => {
            const y = 20 + i * 24;
            return (
              <g key={seg.id}>
                <line
                  x1={65} y1={y + 12} x2={135} y2={y + 12}
                  stroke={verse.palette.primary}
                  strokeWidth={0.5}
                  opacity={0.05}
                />
                <rect
                  x={60} y={y} width={80} height={24}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleHammer(i)}
                />
                {/* Bounce feedback */}
                {bounceIdx === i && !seg.hasCrack && (
                  <motion.text
                    x={150} y={y + 16}
                    fill={verse.palette.shadow}
                    style={navicueType.micro}
                    initial={{ opacity: 0.6, x: 148 }}
                    animate={{ opacity: 0, x: 160 }}
                    transition={{ duration: 0.4 }}
                  >
                    bounce
                  </motion.text>
                )}
              </g>
            );
          })}

          {/* Crack revealed */}
          {foundCrack && !split && (
            <motion.line
              x1={100} y1={68} x2={100} y2={92}
              stroke={verse.palette.accent}
              strokeWidth={wedgeInserted ? 3 : 1.5}
              initial={{ opacity: 0 }}
              animate={{
                opacity: safeOpacity(0.6),
                strokeWidth: wedgeInserted ? 6 : 1.5,
              }}
              transition={{ duration: wedgeInserted ? 0.6 : 0.3 }}
            />
          )}

          {/* Wedge triangle */}
          {wedgeInserted && !split && (
            <motion.polygon
              points="97,72 103,72 100,88"
              fill={verse.palette.accent}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: safeOpacity(0.5), y: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </svg>
      </div>

      {/* Action area */}
      <AnimatePresence mode="wait">
        {!foundCrack && (
          <motion.span
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={navicueStyles.interactionHint(verse.palette)}
          >
            {hammerHits === 0
              ? 'tap the log to find the crack'
              : hammerHits < 3
                ? 'not there. keep looking.'
                : 'the crack is hidden. look closer.'}
          </motion.span>
        )}

        {foundCrack && !wedgeInserted && (
          <motion.div
            key="found"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              ...immersiveTap(verse.palette).zone,
              flexDirection: 'column',
              gap: 8,
              cursor: 'pointer',
            }}
            onClick={insertWedge}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.accent }}>
              crack found
            </span>
            <span style={navicueStyles.interactionHint(verse.palette)}>
              tap to insert wedge
            </span>
          </motion.div>
        )}

        {split && (
          <motion.div
            key="split"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            style={{ ...navicueType.hint, color: verse.palette.accent }}
          >
            crack
          </motion.div>
        )}
      </AnimatePresence>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {split ? 'tactical entry' : foundCrack ? 'insert the wedge' : 'find the opening'}
      </div>
    </div>
  );
}
