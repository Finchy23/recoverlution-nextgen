/**
 * CONDUCTOR #5 -- 1215. The Transformer (Adaptation)
 * "The raw reality is too high voltage. Step it down."
 * INTERACTION: Tap to add step-down transformer. Crisis becomes task list.
 * STEALTH KBE: Scope Reduction -- Adaptability (K)
 *
 * COMPOSITOR: poetic_precision / Circuit / work / knowing / tap / 1215
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

export default function Conductor_Transformer({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1215,
        isSeal: false,
      }}
      arrivalText="High voltage. A fragile bulb."
      prompt="The raw reality is too high voltage. Step it down. Break the crisis into manageable tasks. Do not plug directly into the sun."
      resonantText="Scope reduction. The crisis did not shrink. The voltage did. Adaptability is the transformer between what is and what you can handle right now."
      afterglowCoda="Step it down."
      onComplete={onComplete}
    >
      {(verse) => <TransformerInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TransformerInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'raw' | 'blown' | 'transformer' | 'gentle'>('raw');
  const [done, setDone] = useState(false);

  const btn = immersiveTapButton(verse.palette, 'accent');

  const handlePlug = () => {
    if (phase !== 'raw') return;
    setPhase('blown');
  };

  const handleAddTransformer = () => {
    if (phase !== 'blown') return;
    setPhase('transformer');
    setTimeout(() => {
      setPhase('gentle');
      setDone(true);
      setTimeout(() => verse.advance(), 2500);
    }, 1500);
  };

  const SCENE_W = 240;
  const SCENE_H = 110;

  const voltageIn = phase === 'gentle' ? 12 : 10000;
  const bulbAlive = phase !== 'blown';

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      {/* Circuit visualization */}
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Source (left) */}
          <motion.g animate={{ opacity: safeOpacity(0.5) }}>
            {/* Lightning bolt icon */}
            <polygon
              points="25,25 35,25 30,45 40,45 20,75 28,50 18,50"
              fill={verse.palette.accent}
              opacity={safeOpacity(0.35)}
            />
            <text x={28} y={90} textAnchor="middle"
              fill={verse.palette.textFaint} style={navicueType.micro}>
              {voltageIn}V
            </text>
          </motion.g>

          {/* Wire to transformer/bulb */}
          <line x1={45} y1={50} x2={phase === 'transformer' || phase === 'gentle' ? 95 : 170} y2={50}
            stroke={verse.palette.primary} strokeWidth={1} opacity={safeOpacity(0.2)} />

          {/* Transformer (appears after blown) */}
          {(phase === 'transformer' || phase === 'gentle') && (
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <rect x={95} y={30} width={40} height={40} rx={4}
                fill="none" stroke={verse.palette.accent}
                strokeWidth={1} opacity={safeOpacity(0.4)} />
              {/* Coil symbols */}
              <path d="M105,40 Q110,35 115,40 Q120,45 125,40" fill="none"
                stroke={verse.palette.accent} strokeWidth={0.8} opacity={safeOpacity(0.3)} />
              <path d="M105,55 Q110,50 115,55 Q120,60 125,55" fill="none"
                stroke={verse.palette.accent} strokeWidth={0.8} opacity={safeOpacity(0.3)} />
              <text x={115} y={85} textAnchor="middle"
                fill={verse.palette.textFaint} style={navicueType.micro}>
                step-down
              </text>
              {/* Output wire */}
              <line x1={135} y1={50} x2={170} y2={50}
                stroke={verse.palette.primary} strokeWidth={1} opacity={safeOpacity(0.2)} />
            </motion.g>
          )}

          {/* Bulb */}
          <motion.g
            animate={{
              opacity: phase === 'blown' ? safeOpacity(0.15) : safeOpacity(0.6),
            }}
          >
            <circle cx={185} cy={45} r={15} fill="none"
              stroke={verse.palette.primary} strokeWidth={1}
              opacity={safeOpacity(phase === 'blown' ? 0.1 : 0.3)} />

            {/* Filament */}
            {phase !== 'blown' && (
              <motion.path
                d="M180,45 Q183,38 185,45 Q187,52 190,45"
                fill="none"
                stroke={phase === 'gentle' ? verse.palette.accent : verse.palette.primary}
                strokeWidth={0.8}
                animate={{
                  opacity: phase === 'gentle'
                    ? [safeOpacity(0.4), safeOpacity(0.6), safeOpacity(0.4)]
                    : safeOpacity(0.2),
                }}
                transition={phase === 'gentle' ? { repeat: Infinity, duration: 2 } : {}}
              />
            )}

            {/* Blown X */}
            {phase === 'blown' && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
              >
                <line x1={178} y1={38} x2={192} y2={52}
                  stroke={verse.palette.shadow} strokeWidth={1} />
                <line x1={192} y1={38} x2={178} y2={52}
                  stroke={verse.palette.shadow} strokeWidth={1} />
              </motion.g>
            )}

            {/* Glow when gentle */}
            {phase === 'gentle' && (
              <motion.circle
                cx={185} cy={45} r={25}
                fill={verse.palette.accent}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.04, 0.08, 0.04] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
            )}
          </motion.g>
        </svg>
      </div>

      {/* Actions */}
      <AnimatePresence mode="wait">
        {phase === 'raw' && (
          <motion.button
            key="plug"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ ...immersiveTapButton(verse.palette).base }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePlug}
          >
            plug in directly
          </motion.button>
        )}

        {phase === 'blown' && (
          <motion.div
            key="blown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
          >
            <span style={{ ...navicueType.hint, color: verse.palette.shadow }}>
              bulb blown. too much voltage.
            </span>
            <motion.button
              style={btn.base}
              whileTap={btn.active}
              onClick={handleAddTransformer}
            >
              add transformer
            </motion.button>
          </motion.div>
        )}

        {phase === 'transformer' && (
          <motion.span
            key="stepping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            style={{ ...navicueType.hint, color: verse.palette.textFaint }}
          >
            stepping down...
          </motion.span>
        )}
      </AnimatePresence>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'the bulb lights gently'
          : phase === 'blown'
            ? 'the raw reality was too much'
            : phase === 'raw'
              ? '10,000 volts into a 12V bulb'
              : 'transforming voltage'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          adaptability
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'scope reduction' : 'match the voltage'}
      </div>
    </div>
  );
}
