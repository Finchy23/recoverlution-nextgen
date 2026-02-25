/**
 * TENSEGRITY #9 -- 1159. The Network Node
 * "Build a web. If one string breaks, the others hold you."
 * INTERACTION: One string breaks, structure sags. Add extra strings. Cut string no longer collapses.
 * STEALTH KBE: Diversification -- resilience (K)
 *
 * COMPOSITOR: sacred_ordinary / Lattice / work / knowing / tap / 1159
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const STRING_LABELS = ['work', 'hobby', 'friend', 'health', 'creative'];

export default function Tensegrity_NetworkNode({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Lattice',
        chrono: 'work',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1159,
        isSeal: false,
      }}
      arrivalText="One string. The structure hangs by a thread."
      prompt="If your happiness depends on one string, you are fragile. Build a web. If one string breaks, the others hold you."
      resonantText="Diversification. You added strings and the cut one did not matter. The structure held. Resilience is not one strong rope. It is many ordinary threads."
      afterglowCoda="Redundant."
      onComplete={onComplete}
    >
      {(verse) => <NetworkNodeInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function NetworkNodeInteraction({ verse }: { verse: any }) {
  const [strings, setStrings] = useState<Set<number>>(new Set([0])); // start with just "work"
  const [cut, setCut] = useState(false);
  const [done, setDone] = useState(false);
  const NEEDED = 4;

  const addString = useCallback((idx: number) => {
    if (done || strings.has(idx)) return;
    setStrings(prev => {
      const next = new Set(prev);
      next.add(idx);
      if (next.size >= NEEDED && !cut) {
        // Now cut the first string to test
        setTimeout(() => {
          setCut(true);
          setTimeout(() => {
            setDone(true);
            setTimeout(() => verse.advance(), 2000);
          }, 1000);
        }, 600);
      }
      return next;
    });
  }, [done, strings, cut, verse]);

  const centerY = 50;
  const topY = 10;

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroScene(verse.palette, 180 / 100)}>
        <svg viewBox="0 0 180 100" style={navicueStyles.heroSvg}>
          {/* Ceiling */}
          <line x1={10} y1={topY} x2={170} y2={topY}
            stroke={verse.palette.primaryGlow} strokeWidth={1} opacity={0.15} />

          {/* Strings */}
          {STRING_LABELS.map((label, i) => {
            const active = strings.has(i);
            const isCutString = i === 0 && cut;
            const x = 25 + i * 32;
            return (
              <g key={i}>
                {active && !isCutString && (
                  <line x1={x} y1={topY} x2={90} y2={centerY}
                    stroke={done ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.35)'}
                    strokeWidth={1}
                    opacity={0.4}
                  />
                )}
                {isCutString && (
                  <>
                    <line x1={x} y1={topY} x2={x} y2={topY + 15}
                      stroke="hsla(0, 30%, 50%, 0.3)" strokeWidth={1}
                      strokeDasharray="3 2" opacity={0.3} />
                  </>
                )}
                {/* Anchor point label */}
                <text x={x} y={topY - 3} textAnchor="middle"
                  style={{ ...navicueType.micro }}
                  fill={active ? (isCutString ? verse.palette.shadow : verse.palette.textFaint) : verse.palette.textFaint}
                  opacity={active ? 0.5 : 0.2}>
                  {label}
                </text>
              </g>
            );
          })}

          {/* Central node (the thing being held) */}
          <motion.circle
            animate={{
              cy: cut && strings.size < NEEDED ? centerY + 20 : centerY,
            }}
            cx={90} r={8}
            fill={done ? verse.palette.accent : 'hsla(210, 20%, 50%, 0.3)'}
            stroke={verse.palette.primaryGlow}
            strokeWidth={1}
            opacity={0.5}
          />
          <text x={90} y={centerY + 3} textAnchor="middle"
            style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.4}>
            you
          </text>

          {/* Cut indicator */}
          {cut && (
            <text x={25} y={35} textAnchor="middle"
              style={{ ...navicueType.micro }}
              fill="hsla(0, 30%, 50%, 0.5)">
              cut
            </text>
          )}
        </svg>
      </div>

      {/* Add strings */}
      {!cut && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STRING_LABELS.map((label, i) => (
            !strings.has(i) && (
              <motion.button key={i} onClick={() => addString(i)}
                whileTap={immersiveTapButton(verse.palette, 'primary', 'small').active}
                style={immersiveTapButton(verse.palette, 'primary', 'small').base}>
                +{label}
              </motion.button>
            )
          ))}
        </div>
      )}
      {cut && !done && (
        <span style={navicueStyles.accentReadout(verse.palette, 0.6)}>
          string cut... holding.
        </span>
      )}
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          held
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'resilience' : `strings: ${strings.size}/${NEEDED}`}
      </div>
    </div>
  );
}