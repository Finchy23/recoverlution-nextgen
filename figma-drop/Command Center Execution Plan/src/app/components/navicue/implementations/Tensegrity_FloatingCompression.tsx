/**
 * TENSEGRITY #1 -- 1151. The Floating Compression
 * "Islands of compression in a sea of tension. Be elastic."
 * INTERACTION: Push a tensegrity structure -- it deforms but bounces back
 * STEALTH KBE: Systemic Resilience -- flexibility is strength (K)
 *
 * COMPOSITOR: science_x_soul / Lattice / morning / knowing / tap / 1151
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Tensegrity_FloatingCompression({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Lattice',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1151,
        isSeal: false,
      }}
      arrivalText="Sticks and strings. Floating."
      prompt="Islands of compression in a sea of tension. Your bones do not touch. Your fascia holds them up. Be elastic."
      resonantText="Systemic Resilience. You pushed and it yielded. Then it returned. Rigidity would have cracked. Flexibility held. The structure floats because it bends. So can you."
      afterglowCoda="Elastic."
      onComplete={onComplete}
    >
      {(verse) => <FloatingCompressionInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FloatingCompressionInteraction({ verse }: { verse: any }) {
  const [pushCount, setPushCount] = useState(0);
  const [pushing, setPushing] = useState(false);
  const [done, setDone] = useState(false);
  const PUSHES_NEEDED = 4;

  // Strut positions (tensegrity triangle)
  const struts = [
    { x1: 40, y1: 20, x2: 80, y2: 85 },
    { x1: 120, y1: 20, x2: 60, y2: 85 },
    { x1: 80, y1: 15, x2: 100, y2: 90 },
  ];

  const push = useCallback(() => {
    if (done) return;
    setPushing(true);
    setTimeout(() => {
      setPushing(false);
      setPushCount(prev => {
        const next = prev + 1;
        if (next >= PUSHES_NEEDED) {
          setDone(true);
          setTimeout(() => verse.advance(), 2200);
        }
        return next;
      });
    }, 600);
  }, [done, verse]);

  const deform = pushing ? 8 : 0;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Tensegrity structure */}
      <div style={navicueStyles.heroScene(verse.palette, 160 / 110)}>
        <svg viewBox="0 0 160 110" style={navicueStyles.heroSvg}>
          {/* Tension strings (cables) */}
          {[
            [40 + deform, 20, 120 - deform, 20],
            [80 + deform, 85, 60 - deform * 0.5, 85],
            [100, 90, 120, 20],
            [40, 20, 60, 85],
            [80, 15, 100, 90],
            [80, 85, 120, 20],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={`s${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={done ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.25)'}
              strokeWidth={1}
              opacity={pushing ? 0.5 : 0.3}
            />
          ))}

          {/* Compression struts (floating bars) */}
          {struts.map((s, i) => (
            <motion.line key={`strut${i}`}
              animate={{
                x1: s.x1 + (pushing ? deform * (i === 0 ? 1 : i === 1 ? -1 : 0.5) : 0),
                y1: s.y1 + (pushing ? deform * 0.3 : 0),
                x2: s.x2 + (pushing ? deform * (i === 0 ? -0.5 : i === 1 ? 0.5 : -0.3) : 0),
                y2: s.y2 + (pushing ? -deform * 0.2 : 0),
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              stroke={done ? verse.palette.accent : 'hsla(210, 20%, 50%, 0.5)'}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.5}
            />
          ))}

          {/* Nodes */}
          {[[40, 20], [120, 20], [80, 15], [80, 85], [60, 85], [100, 90]].map(([x, y], i) => (
            <motion.circle key={`n${i}`}
              animate={{
                cx: x + (pushing ? (i < 3 ? deform * 0.5 : -deform * 0.3) : 0),
                cy: y + (pushing ? deform * 0.2 : 0),
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              r={3}
              fill={done ? verse.palette.accent : 'hsla(180, 25%, 50%, 0.4)'}
              opacity={0.5}
            />
          ))}
        </svg>

        {/* Float label */}
        {!pushing && pushCount > 0 && (
          <span style={{
            position: 'absolute', top: 45, left: '50%', transform: 'translateX(-50%)',
            ...navicueStyles.annotation(verse.palette, 0.3),
          }}>
            floating
          </span>
        )}
      </div>

      {/* Action */}
      {!done ? (
        <motion.button onClick={push}
          style={{
            ...immersiveTapButton(verse.palette).base,
            opacity: pushing ? 0.4 : 1,
            cursor: pushing ? 'default' : 'pointer',
          }}
          whileTap={immersiveTapButton(verse.palette).active}>
          {pushing ? 'bouncing back...' : 'push'}
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          elastic
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'systemic resilience' : `push ${pushCount}/${PUSHES_NEEDED}`}
      </div>
    </div>
  );
}