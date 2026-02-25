/**
 * TENSEGRITY #5 -- 1155. The Fascial Release
 * "Release the restriction to fix the system."
 * INTERACTION: Knot in the web -- drag/massage it -- whole web expands and relaxes
 * STEALTH KBE: Somatic Release -- body awareness (E)
 *
 * COMPOSITOR: witness_ritual / Lattice / night / embodying / drag / 1155
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tensegrity_FascialRelease({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Lattice',
        chrono: 'night',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1155,
        isSeal: false,
      }}
      arrivalText="A knot. The whole web is twisted."
      prompt="The pain is not where the problem is. The knot in your shoulder is pulling your hip. Release the restriction to fix the system."
      resonantText="Somatic Release. You massaged the knot and the whole web breathed. The tension was not local. It was systemic. Body awareness begins where the feeling is, not where the problem is."
      afterglowCoda="Released."
      onComplete={onComplete}
    >
      {(verse) => <FascialReleaseInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FascialReleaseInteraction({ verse }: { verse: any }) {
  const [release, setRelease] = useState(0);
  const [done, setDone] = useState(false);

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    const motion = Math.abs(info.delta.x) + Math.abs(info.delta.y);
    setRelease(prev => {
      const next = Math.min(100, prev + motion * 0.25);
      if (next >= 100) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, verse]);

  const pct = release / 100;
  const knotSize = 12 - pct * 8;
  const webExpansion = pct * 10;

  // Web nodes
  const nodes = [
    { x: 30 - webExpansion, y: 20 - webExpansion * 0.5 },
    { x: 130 + webExpansion, y: 20 - webExpansion * 0.5 },
    { x: 20 - webExpansion, y: 80 + webExpansion * 0.5 },
    { x: 140 + webExpansion, y: 80 + webExpansion * 0.5 },
    { x: 80, y: 50 }, // center (knot location)
    { x: 55, y: 35 },
    { x: 105, y: 35 },
    { x: 55, y: 65 },
    { x: 105, y: 65 },
  ];

  const edges: [number, number][] = [
    [0, 5], [5, 4], [4, 6], [6, 1],
    [0, 7], [7, 4], [4, 8], [8, 1],
    [2, 7], [7, 4], [4, 8], [8, 3],
    [2, 5], [5, 4], [4, 6], [6, 3],
  ];

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Web with knot */}
      <div style={navicueStyles.heroScene(verse.palette, 160 / 100)}>
        <svg viewBox="0 0 160 100" style={navicueStyles.heroSvg}>
          {/* Web lines */}
          {edges.map(([a, b], i) => (
            <motion.line key={i}
              x1={nodes[a].x} y1={nodes[a].y}
              x2={nodes[b].x} y2={nodes[b].y}
              animate={{
                x1: nodes[a].x, y1: nodes[a].y,
                x2: nodes[b].x, y2: nodes[b].y,
              }}
              stroke={done ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.25)'}
              strokeWidth={1}
              opacity={0.2 + pct * 0.15}
              transition={{ type: 'spring', stiffness: 60 }}
            />
          ))}

          {/* Nodes */}
          {nodes.map((n, i) => (
            <motion.circle key={i}
              cx={n.x} cy={n.y}
              animate={{ cx: n.x, cy: n.y }}
              r={i === 4 ? knotSize : 2}
              fill={i === 4
                ? (done ? verse.palette.accent : `hsla(0, ${Math.round(30 - pct * 30)}%, ${Math.round(40 + pct * 10)}%, ${0.4 - pct * 0.2})`)
                : (done ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.3)')}
              opacity={i === 4 ? 0.5 : 0.3}
            />
          ))}
        </svg>

        {/* Knot label */}
        {!done && pct < 0.5 && (
          <span style={{
            position: 'absolute', top: 42, left: 72,
            ...navicueType.micro, color: verse.palette.shadow,
          }}>
            knot
          </span>
        )}
      </div>

      {/* Massage area */}
      {!done ? (
        <motion.div
          drag
          dragConstraints={{ top: -20, bottom: 20, left: -30, right: 30 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDrag={handleDrag}
          style={{
            ...immersiveTapButton(verse.palette).base,
            cursor: 'grab',
            touchAction: 'none',
          }}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          massage the knot
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          released
        </motion.div>
      )}

      {!done && (
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${pct * 100}%` }}
            style={{ height: '100%', background: verse.palette.accent, borderRadius: 2, opacity: 0.5 }} />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'body awareness' : `release: ${Math.round(release)}%`}
      </div>
    </div>
  );
}