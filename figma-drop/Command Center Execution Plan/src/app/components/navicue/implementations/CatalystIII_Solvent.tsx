/**
 * CATALYST III #5 -- 1225. The Solvent (Dissolve)
 * "Dissolve it. Be fluid for a moment. Remold the clay."
 * INTERACTION: Tap to pour curiosity. Structure dissolves. Tap to reshape.
 * STEALTH KBE: Plasticity -- Growth Mindset (B)
 *
 * COMPOSITOR: sacred_ordinary / Ocean / social / believing / tap / 1225
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function CatalystIII_Solvent({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Ocean',
        chrono: 'social',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1225,
        isSeal: false,
      }}
      arrivalText="A rigid shape. Old identity."
      prompt="You are stuck in a shape that no longer fits. Dissolve it. Be fluid for a moment. Remold the clay before it hardens."
      resonantText="Plasticity. The old shape was not wrong. It was outgrown. Growth mindset means willingness to become formless before becoming formed. The liquid state is not weakness. It is potential."
      afterglowCoda="Remold."
      onComplete={onComplete}
    >
      {(verse) => <SolventInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SolventInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'solid' | 'dissolving' | 'fluid' | 'reformed'>('solid');
  const [dissolveProgress, setDissolveProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handlePour = () => {
    if (phase !== 'solid') return;
    setPhase('dissolving');

    let p = 0;
    const interval = setInterval(() => {
      p += 0.02;
      setDissolveProgress(p);
      if (p >= 1) {
        clearInterval(interval);
        setPhase('fluid');
      }
    }, 40);
  };

  const handleReshape = () => {
    if (phase !== 'fluid') return;
    setPhase('reformed');
    setDone(true);
    setTimeout(() => verse.advance(), 2800);
  };

  const btn = immersiveTapButton(verse.palette, 'accent');
  const SCENE_W = 200;
  const SCENE_H = 140;

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Rigid box (old identity) -- dissolves */}
          {phase === 'solid' && (
            <motion.rect
              x={60} y={30} width={80} height={80} rx={4}
              fill={verse.palette.primary}
              opacity={safeOpacity(0.15)}
              stroke={verse.palette.primary}
              strokeWidth={1.5}
            />
          )}

          {/* Dissolving state */}
          {phase === 'dissolving' && (
            <motion.g>
              {/* Fragmenting rectangle */}
              {Array.from({ length: 12 }).map((_, i) => {
                const col = i % 4;
                const row = Math.floor(i / 4);
                const bx = 60 + col * 20;
                const by = 30 + row * 27;
                const drift = dissolveProgress * (Math.random() * 30 - 15);
                const drop = dissolveProgress * dissolveProgress * 40;
                return (
                  <motion.rect
                    key={i}
                    x={bx + drift}
                    y={by + drop}
                    width={18} height={24} rx={dissolveProgress * 8}
                    fill={verse.palette.primary}
                    animate={{
                      opacity: safeOpacity(0.15 * (1 - dissolveProgress * 0.7)),
                      rx: dissolveProgress * 10,
                    }}
                  />
                );
              })}

              {/* Solvent drops falling */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.circle
                  key={`drop-${i}`}
                  cx={80 + i * 20}
                  r={3}
                  fill={verse.palette.accent}
                  animate={{
                    cy: [15, 60],
                    opacity: [safeOpacity(0.4), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: i * 0.25,
                  }}
                />
              ))}
            </motion.g>
          )}

          {/* Fluid state -- amorphous blob */}
          {phase === 'fluid' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.ellipse
                cx={100} cy={90}
                rx={60} ry={20}
                fill={verse.palette.accent}
                opacity={safeOpacity(0.1)}
                animate={{
                  rx: [55, 65, 55],
                  ry: [18, 22, 18],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <motion.text
                x={100} y={65}
                textAnchor="middle"
                fill={verse.palette.textFaint}
                style={navicueType.micro}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                fluid
              </motion.text>
            </motion.g>
          )}

          {/* Reformed shape -- organic, new */}
          {phase === 'reformed' && (
            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Organic new shape */}
              <motion.path
                d="M100,25 Q140,35 135,70 Q130,100 100,110 Q70,100 65,70 Q60,35 100,25"
                fill={verse.palette.accent}
                opacity={safeOpacity(0.1)}
                stroke={verse.palette.accent}
                strokeWidth={1.5}
              />
              <motion.circle
                cx={100} cy={70} r={40}
                fill={verse.palette.accent}
                animate={{ opacity: [0.02, 0.05, 0.02] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
              <text x={100} y={72} textAnchor="middle"
                fill={verse.palette.accent} style={navicueType.hint}>
                new
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* Actions */}
      {phase === 'solid' && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handlePour}>
          pour curiosity
        </motion.button>
      )}

      {phase === 'fluid' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={btn.base}
          whileTap={btn.active}
          onClick={handleReshape}
        >
          reshape
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done
          ? 'reformed'
          : phase === 'fluid'
            ? 'the clay is soft. shape it.'
            : phase === 'dissolving'
              ? 'dissolving...'
              : 'a rigid structure'}
      </span>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          growth mindset
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'plasticity' : 'dissolve and reform'}
      </div>
    </div>
  );
}
