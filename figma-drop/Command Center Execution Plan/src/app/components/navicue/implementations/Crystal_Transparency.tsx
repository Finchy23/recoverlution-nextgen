/**
 * CRYSTAL #7 -- 1127. The Transparency
 * "Secrets make you opaque. Truth makes you transparent."
 * INTERACTION: Smoky quartz -- drag to polish/wipe -- becomes clear
 * STEALTH KBE: Honesty -- radical honesty (B)
 *
 * COMPOSITOR: witness_ritual / Glacier / morning / believing / drag / 1127
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Crystal_Transparency({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Glacier',
        chrono: 'morning',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1127,
        isSeal: false,
      }}
      arrivalText="Smoky quartz. Hiding."
      prompt="Secrets make you opaque. Truth makes you transparent. If you have nothing to hide, the light passes straight through."
      resonantText="Honesty. You polished away the smoke. The stone did not lose anything. It gained light. Radical honesty is not exposure. It is clarity."
      afterglowCoda="Clear."
      onComplete={onComplete}
    >
      {(verse) => <TransparencyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TransparencyInteraction({ verse }: { verse: any }) {
  const [clarity, setClarity] = useState(0); // 0-100
  const [done, setDone] = useState(false);

  const handleDrag = useCallback((_: any, info: any) => {
    if (done) return;
    const motion = Math.abs(info.delta.x) + Math.abs(info.delta.y);
    setClarity(prev => {
      const next = Math.min(100, prev + motion * 0.4);
      if (next >= 100 && !done) {
        setDone(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [done, verse]);

  const pct = clarity / 100;
  const smokeOpacity = 0.5 * (1 - pct);
  const clearOpacity = 0.1 + pct * 0.5;

  return (
    <div style={navicueStyles.interactionContainer()}>
      {/* Crystal */}
      <div style={navicueStyles.heroCssScene(verse.palette, 140 / 130)}>
        {/* Light source behind */}
        <motion.div
          animate={{ opacity: pct * 0.3 }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 80, height: 80, borderRadius: '50%',
            background: `radial-gradient(circle, hsla(45, 50%, 70%, 0.3), transparent)`,
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Crystal body */}
        <motion.div
          animate={{
            background: `linear-gradient(135deg, 
              hsla(30, ${Math.round(20 - pct * 15)}%, ${Math.round(30 + pct * 30)}%, ${0.4 - smokeOpacity * 0.3}),
              hsla(0, 0%, ${Math.round(40 + pct * 30)}%, ${clearOpacity})
            )`,
            boxShadow: done
              ? `0 0 24px hsla(0, 0%, 80%, 0.2)`
              : 'none',
          }}
          style={{
            width: 55, height: 70,
            clipPath: 'polygon(50% 0%, 90% 25%, 90% 75%, 50% 100%, 10% 75%, 10% 25%)',
            border: `1px solid hsla(0, 0%, ${60 + pct * 20}%, ${0.2 + pct * 0.2})`,
            position: 'relative',
          }}
        >
          {/* Smoke overlay */}
          {!done && (
            <motion.div
              animate={{ opacity: smokeOpacity }}
              style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle, hsla(30, 15%, 30%, 0.4), hsla(30, 10%, 25%, 0.3))`,
                borderRadius: 'inherit',
              }}
            />
          )}

          {/* Light passing through */}
          {pct > 0.5 && (
            <motion.div
              animate={{ opacity: (pct - 0.5) * 0.6 }}
              style={{
                position: 'absolute', top: '20%', left: '30%',
                width: 3, height: '60%',
                background: 'hsla(45, 60%, 75%, 0.3)',
                borderRadius: 1,
                transform: 'rotate(10deg)',
              }}
            />
          )}
        </motion.div>

        {/* Polish drag handle */}
        {!done && (
          <motion.div
            drag
            dragConstraints={{ top: -40, bottom: 40, left: -40, right: 40 }}
            dragElastic={0.05}
            dragMomentum={false}
            onDrag={handleDrag}
            style={{
              position: 'absolute', bottom: 10, right: 20,
              width: 28, height: 28, borderRadius: '50%',
              border: `1px solid ${verse.palette.primaryGlow}`,
              cursor: 'grab', touchAction: 'none',
              opacity: 0.4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>~</span>
          </motion.div>
        )}
      </div>

      {/* Status */}
      {done ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          transparent
        </motion.div>
      ) : (
        <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
          polish the smoke away
        </span>
      )}

      {!done && (
        <div style={{ width: 80, height: 3, borderRadius: 2, background: verse.palette.primaryGlow, overflow: 'hidden' }}>
          <motion.div
            animate={{ width: `${pct * 100}%` }}
            style={{ height: '100%', background: verse.palette.accent, borderRadius: 2 }}
          />
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'radical honesty' : `clarity: ${Math.round(clarity)}%`}
      </div>
    </div>
  );
}