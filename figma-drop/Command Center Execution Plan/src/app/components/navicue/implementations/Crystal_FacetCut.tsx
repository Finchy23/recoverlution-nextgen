/**
 * CRYSTAL #3 -- 1123. The Facet Cut
 * "The pain of the wheel is the price of the shine. Hold still."
 * INTERACTION: Hold a rough stone against a grinding wheel -- light flashes as facets appear
 * STEALTH KBE: Endurance -- gritty acceptance (E)
 *
 * COMPOSITOR: sensory_cinema / Glacier / work / embodying / hold / 1123
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Crystal_FacetCut({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sensory_cinema',
        form: 'Glacier',
        chrono: 'work',
        kbe: 'e',
        hook: 'hold',
        specimenSeed: 1123,
        isSeal: false,
      }}
      arrivalText="A rough stone. Dull."
      prompt="The stone wants to stay rough. The light wants to get out. The pain of the wheel is the price of the shine. Hold still."
      resonantText="Endurance. You held the stone against the wheel. The grinding was uncomfortable, but the brilliance appeared. Gritty acceptance is not suffering. It is sculpting."
      afterglowCoda="Brilliance."
      onComplete={onComplete}
    >
      {(verse) => <FacetCutInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function FacetCutInteraction({ verse }: { verse: any }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [facets, setFacets] = useState(0);
  const [done, setDone] = useState(false);
  const FACET_COUNT = 5;
  const HOLD_PER_FACET = 20; // ticks

  useEffect(() => {
    if (!holding || done) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        if (next >= HOLD_PER_FACET) {
          setFacets(f => {
            const nf = f + 1;
            if (nf >= FACET_COUNT) {
              setDone(true);
              clearInterval(interval);
              setTimeout(() => verse.advance(), 2200);
            }
            return nf;
          });
          return 0;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [holding, done, verse]);

  const startHold = useCallback(() => { if (!done) setHolding(true); }, [done]);
  const endHold = useCallback(() => setHolding(false), []);

  const brilliance = facets / FACET_COUNT;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Stone */}
      <div style={navicueStyles.heroCssScene(verse.palette, 140 / 120)}>
        <motion.div
          animate={{
            borderRadius: done ? '8px' : `${20 - facets * 3}px`,
            boxShadow: done
              ? `0 0 24px hsla(45, 60%, 65%, 0.4), 0 0 40px hsla(45, 60%, 65%, 0.15)`
              : `0 0 ${Math.round(brilliance * 12)}px hsla(45, 50%, 60%, ${brilliance * 0.3})`,
          }}
          style={{
            width: 55, height: 55,
            background: done
              ? `linear-gradient(135deg, hsla(45, 50%, 70%, 0.6), hsla(200, 40%, 60%, 0.4), hsla(320, 30%, 55%, 0.3))`
              : `linear-gradient(135deg, hsla(30, 15%, ${35 + brilliance * 20}%, 0.5), hsla(30, 10%, ${30 + brilliance * 15}%, 0.4))`,
            border: `1px solid ${done ? 'hsla(45, 50%, 70%, 0.4)' : verse.palette.primaryGlow}`,
            clipPath: facets >= 3
              ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
              : facets >= 1
              ? 'polygon(25% 5%, 75% 5%, 95% 35%, 95% 75%, 70% 95%, 30% 95%, 5% 65%, 5% 25%)'
              : 'none',
          }}
        />

        {/* Light flashes on new facet */}
        {holding && progress > HOLD_PER_FACET - 3 && (
          <motion.div
            animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5] }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', top: '40%', left: '55%',
              width: 6, height: 6, borderRadius: '50%',
              background: 'hsla(45, 70%, 75%, 0.7)',
            }}
          />
        )}

        {/* Grinding wheel indicator */}
        {holding && !done && (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            style={{
              position: 'absolute', bottom: 5, right: 15,
              width: 20, height: 20, borderRadius: '50%',
              border: `2px dashed hsla(0, 0%, 50%, 0.3)`,
            }}
          />
        )}

        {/* Facet count */}
        <div style={{ position: 'absolute', top: 5, right: 5, display: 'flex', gap: 3 }}>
          {Array.from({ length: FACET_COUNT }).map((_, i) => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: 1,
              background: i < facets ? 'hsla(45, 50%, 65%, 0.6)' : verse.palette.primaryGlow,
              opacity: i < facets ? 0.7 : 0.15,
            }} />
          ))}
        </div>
      </div>

      {/* Action */}
      {!done ? (
        <motion.button
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}
        >
          {holding ? 'grinding...' : 'hold against the wheel'}
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: 'hsla(45, 60%, 65%, 0.9)', fontSize: 11 }}>
          brilliant
        </motion.div>
      )}

      {/* Current facet progress */}
      {holding && !done && (
        <div style={{ width: 60, height: 2, borderRadius: 1, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${(progress / HOLD_PER_FACET) * 100}%` }}
            style={{ height: '100%', background: 'hsla(45, 50%, 60%, 0.5)', borderRadius: 1 }}
          />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'endurance' : `facets: ${facets}/${FACET_COUNT}`}
      </div>
    </div>
  );
}