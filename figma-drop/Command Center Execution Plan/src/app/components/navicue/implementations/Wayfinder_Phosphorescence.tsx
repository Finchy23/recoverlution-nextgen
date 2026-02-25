/**
 * WAYFINDER #7 -- 1167. The Phosphorescence (The Light)
 * "Stir the water. Your action creates the illumination."
 * INTERACTION: Pitch black water. Drag/stir it. It glows green. Life.
 * STEALTH KBE: Activation -- hope generation (E)
 *
 * COMPOSITOR: sensory_cinema / Compass / night / embodying / drag / 1167
 */
import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Wayfinder_Phosphorescence({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Compass',
        chrono: 'night',
        kbe: 'e',
        hook: 'drag',
        specimenSeed: 1167,
        isSeal: false,
      }}
      arrivalText="Pitch black water."
      prompt="The darkness is full of light. You just have to agitate it. Stir the water. Your action creates the illumination."
      resonantText="Activation. The water was dark until you moved it. The light was always there, dormant in the cells, waiting for agitation. Hope generation is the same. Move and it glows."
      afterglowCoda="Life."
      onComplete={onComplete}
    >
      {(verse) => <PhosphorescenceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

interface GlowPoint { x: number; y: number; age: number; id: number; }

function PhosphorescenceInteraction({ verse }: { verse: any }) {
  const [glowPoints, setGlowPoints] = useState<GlowPoint[]>([]);
  const [totalStir, setTotalStir] = useState(0);
  const [done, setDone] = useState(false);
  const idRef = useRef(0);
  const STIR_TARGET = 100;

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    const motion = Math.abs(info.delta.x) + Math.abs(info.delta.y);
    setTotalStir(prev => {
      const next = Math.min(STIR_TARGET, prev + motion * 0.3);
      if (next >= STIR_TARGET) {
        setDone(true);
        setTimeout(() => verse.advance(), 2500);
      }
      return next;
    });

    // Add glow point near drag position
    if (motion > 1) {
      const newPoint: GlowPoint = {
        x: 80 + info.point.x * 0.1 + (Math.random() - 0.5) * 40,
        y: 50 + info.point.y * 0.05 + (Math.random() - 0.5) * 30,
        age: 0,
        id: idRef.current++,
      };
      setGlowPoints(prev => [...prev.slice(-30), newPoint]);
    }
  }, [done, verse]);

  // Fade old points
  const pct = totalStir / STIR_TARGET;
  const ambientGlow = pct * 0.3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      {/* Dark water */}
      <div style={{
        ...navicueStyles.heroCssScene(verse.palette, 160 / 110),
        borderRadius: 8,
        background: `radial-gradient(ellipse at center, hsla(160, 40%, ${Math.round(5 + pct * 15)}%, ${ambientGlow}), hsla(0,0%,3%,0.3))`,
      }}>
        <svg viewBox="0 0 160 110" style={navicueStyles.heroSvg}>
          {/* Glow points */}
          {glowPoints.map(pt => (
            <motion.circle key={pt.id}
              cx={Math.max(5, Math.min(155, pt.x))}
              cy={Math.max(5, Math.min(105, pt.y))}
              r={3}
              fill={done ? verse.palette.accent : 'hsla(140, 60%, 50%, 0.6)'}
              initial={{ opacity: 0.7, r: 2 }}
              animate={{ opacity: 0, r: 8 }}
              transition={{ duration: 2 }}
            />
          ))}

          {/* Ambient bioluminescence when near done */}
          {pct > 0.6 && (
            <>
              {[...Array(Math.floor((pct - 0.6) * 15))].map((_, i) => (
                <motion.circle key={`ambient${i}`}
                  cx={20 + (i * 37) % 130}
                  cy={20 + (i * 23) % 70}
                  r={1.5}
                  fill="hsla(140, 50%, 50%, 0.3)"
                  animate={{ opacity: [0, 0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                />
              ))}
            </>
          )}
        </svg>

        {/* Label */}
        {done && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={{
              position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)',
              ...navicueType.hint, fontSize: 10, color: verse.palette.accent,
            }}
          >
            life
          </motion.span>
        )}
      </div>

      {/* Stir control */}
      {!done ? (
        <motion.div
          drag
          dragConstraints={{ top: -20, bottom: 20, left: -40, right: 40 }}
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
          stir the water
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          illuminated
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'hope generation' : `glow: ${Math.round(pct * 100)}%`}
      </div>
    </div>
  );
}