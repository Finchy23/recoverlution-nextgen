/**
 * NETWORK #9 -- 1319. The Neural Net (Learning)
 * "Failure is just back-propagation. Use the error to rewire the net."
 * INTERACTION: Observe the net fail, rewire, and succeed -- plasticity
 * STEALTH KBE: Iterative Learning -- Antifragility (K)
 *
 * COMPOSITOR: science_x_soul / Circuit / night / knowing / observe / 1319
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

export default function Network_NeuralNet({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Circuit',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1319,
        isSeal: false,
      }}
      arrivalText="A brain. Untrained."
      prompt="Failure is just back-propagation. It updates the weights. Do not regret the error. Use it to rewire the net."
      resonantText="Iterative learning. The net failed, rewired, and succeeded. Antifragility is neural plasticity: the system that uses errors as data gets stronger with every failure."
      afterglowCoda="Rewire the net."
      onComplete={onComplete}
    >
      {(verse) => <NeuralNetInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NeuralNetInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState<'idle' | 'attempt1' | 'fail' | 'rewire' | 'attempt2' | 'success'>('idle');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('attempt1'), 1500);
    const t2 = setTimeout(() => setPhase('fail'), 3500);
    const t3 = setTimeout(() => setPhase('rewire'), 5500);
    const t4 = setTimeout(() => setPhase('attempt2'), 8000);
    const t5 = setTimeout(() => {
      setPhase('success');
      setTimeout(() => verse.advance(), 3000);
    }, 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [verse]);

  const W = 240, H = 180;

  // 3-layer neural net layout
  const layers = [
    // Input (3 nodes)
    [{ x: 35, y: 40 }, { x: 35, y: 90 }, { x: 35, y: 140 }],
    // Hidden (4 nodes)
    [{ x: 105, y: 30 }, { x: 105, y: 65 }, { x: 105, y: 100 }, { x: 105, y: 135 }],
    // Output (2 nodes)
    [{ x: 175, y: 65 }, { x: 175, y: 115 }],
  ];

  // Connection weights (change on rewire)
  const preWeights = [0.2, 0.1, 0.3, 0.1, 0.2, 0.1, 0.15, 0.1, 0.2, 0.3, 0.1, 0.2];
  const postWeights = [0.4, 0.05, 0.1, 0.35, 0.05, 0.3, 0.3, 0.05, 0.1, 0.4, 0.35, 0.15];
  const isRewired = phase === 'rewire' || phase === 'attempt2' || phase === 'success';
  const weights = isRewired ? postWeights : preWeights;

  // Generate all connections
  const connections: { from: { x: number; y: number }; to: { x: number; y: number }; weight: number }[] = [];
  let wIdx = 0;
  for (let l = 0; l < layers.length - 1; l++) {
    for (const from of layers[l]) {
      for (const to of layers[l + 1]) {
        connections.push({ from, to, weight: weights[wIdx % weights.length] });
        wIdx++;
      }
    }
  }

  // Signal flowing (during attempts)
  const signaling = phase === 'attempt1' || phase === 'attempt2';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      {/* Status */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>epoch</span>
        <motion.span style={{
          ...navicueType.data,
          color: phase === 'success' ? verse.palette.accent
            : phase === 'fail' ? verse.palette.shadow : verse.palette.text,
        }}>
          {phase === 'idle' ? 'untrained'
            : phase === 'attempt1' ? 'forward pass...'
              : phase === 'fail' ? 'error'
                : phase === 'rewire' ? 'back-propagation...'
                  : phase === 'attempt2' ? 'retry...'
                    : 'success'}
        </motion.span>
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Connections */}
          {connections.map((conn, i) => (
            <motion.line key={i}
              x1={conn.from.x} y1={conn.from.y}
              x2={conn.to.x} y2={conn.to.y}
              stroke={isRewired && conn.weight > 0.25
                ? verse.palette.accent : verse.palette.primary}
              animate={{
                strokeWidth: conn.weight * 4,
                opacity: safeOpacity(conn.weight * 0.6 + 0.05),
              }}
              transition={{ duration: 0.5 }}
            />
          ))}

          {/* Nodes */}
          {layers.map((layer, l) =>
            layer.map((node, n) => (
              <motion.g key={`${l}-${n}`}>
                <circle cx={node.x} cy={node.y} r={8}
                  fill={phase === 'success' && l === 2 && n === 0
                    ? verse.palette.accent : verse.palette.primary}
                  opacity={safeOpacity(0.1)} />
                <circle cx={node.x} cy={node.y} r={8}
                  fill="none"
                  stroke={phase === 'success' && l === 2 && n === 0
                    ? verse.palette.accent : verse.palette.primary}
                  strokeWidth={0.8}
                  opacity={safeOpacity(0.2)} />
              </motion.g>
            ))
          )}

          {/* Signal propagation */}
          {signaling && (
            <motion.g>
              {layers[0].map((node, i) => (
                <motion.circle key={`sig-${i}`}
                  r={3}
                  fill={phase === 'attempt2' ? verse.palette.accent : verse.palette.primary}
                  animate={{
                    cx: [node.x, layers[1][i % 4].x, layers[2][i % 2].x],
                    cy: [node.y, layers[1][i % 4].y, layers[2][i % 2].y],
                    opacity: [safeOpacity(0.3), safeOpacity(0.2), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.g>
          )}

          {/* Error indicator */}
          {phase === 'fail' && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <circle cx={layers[2][1].x} cy={layers[2][1].y} r={12}
                fill="none" stroke={verse.palette.shadow}
                strokeWidth={1} opacity={0.3} />
              <text x={layers[2][1].x + 16} y={layers[2][1].y + 4}
                fill={verse.palette.shadow} style={{ fontSize: '9px' }} opacity={0.4}>
                error
              </text>
            </motion.g>
          )}

          {/* Rewire animation */}
          {phase === 'rewire' && (
            <motion.g>
              {connections.filter((_, i) => postWeights[i % postWeights.length] !== preWeights[i % preWeights.length])
                .slice(0, 6).map((conn, i) => (
                  <motion.line key={`rw-${i}`}
                    x1={conn.from.x} y1={conn.from.y}
                    x2={conn.to.x} y2={conn.to.y}
                    stroke={verse.palette.accent}
                    strokeWidth={1.5}
                    animate={{
                      opacity: [0, safeOpacity(0.3), 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.1,
                    }}
                  />
                ))}
            </motion.g>
          )}

          {/* Success output */}
          {phase === 'success' && (
            <motion.g>
              <motion.circle
                cx={layers[2][0].x} cy={layers[2][0].y} r={15}
                fill={verse.palette.accent}
                initial={{ opacity: 0 }}
                animate={{ opacity: safeOpacity(0.08) }}
              />
              <motion.text
                x={layers[2][0].x + 18} y={layers[2][0].y + 4}
                fill={verse.palette.accent} style={{ fontSize: '11px' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.3 }}
              >
                plasticity
              </motion.text>
            </motion.g>
          )}

          {/* Layer labels */}
          {['input', 'hidden', 'output'].map((label, i) => (
            <text key={label}
              x={[35, 105, 175][i]} y={H - 5} textAnchor="middle"
              fill={verse.palette.textFaint} style={{ fontSize: '7px' }} opacity={0.2}>
              {label}
            </text>
          ))}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {phase === 'success' ? 'the error rewired the net'
          : phase === 'rewire' ? 'updating weights...'
            : phase === 'fail' ? 'the net failed. but the data remains.'
              : phase === 'attempt1' ? 'first attempt...'
                : 'observe the learning'}
      </span>

      {phase === 'success' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          antifragility
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase === 'success' ? 'iterative learning' : 'observe'}
      </div>
    </div>
  );
}
