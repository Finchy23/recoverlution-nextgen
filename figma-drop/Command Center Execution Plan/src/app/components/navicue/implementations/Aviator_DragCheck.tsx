/**
 * AVIATOR #1 -- 1141. The Drag Check (Streamlining)
 * "Thrust is expensive. Streamlining is free. Clean the fuselage."
 * INTERACTION: Plane covered in barnacles -- tap to scrape them off -- plane accelerates
 * STEALTH KBE: Subtraction -- efficiency (K)
 *
 * COMPOSITOR: pattern_glitch / Drift / morning / knowing / tap / 1141
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const BARNACLES = [
  { id: 0, x: 35, y: 22, label: 'resentment' },
  { id: 1, x: 60, y: 18, label: 'grudge' },
  { id: 2, x: 85, y: 25, label: 'regret' },
  { id: 3, x: 50, y: 35, label: 'guilt' },
  { id: 4, x: 75, y: 32, label: 'envy' },
  { id: 5, x: 100, y: 20, label: 'shame' },
];

export default function Aviator_DragCheck({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1141,
        isSeal: false,
      }}
      arrivalText="A plane. Slow. Shaking."
      prompt="Thrust is expensive. Streamlining is free. You do not need a bigger engine. You need less drag. Clean the fuselage."
      resonantText="Subtraction. You did not add power. You removed drag. Every barnacle was energy wasted on the past. Efficiency is not about doing more. It is about carrying less."
      afterglowCoda="Smooth."
      onComplete={onComplete}
    >
      {(verse) => <DragCheckInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DragCheckInteraction({ verse }: { verse: any }) {
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  const removeBarnacle = useCallback((id: number) => {
    if (done) return;
    setRemoved(prev => {
      const next = new Set(prev);
      next.add(id);
      if (next.size >= BARNACLES.length) {
        setDone(true);
        setTimeout(() => verse.advance(), 2000);
      }
      return next;
    });
  }, [done, verse]);

  const cleanPct = removed.size / BARNACLES.length;
  const shake = (1 - cleanPct) * 3;

  return (
    <div style={navicueStyles.heroCssScene(verse.palette, 160 / 65)}>
      {/* Plane */}
      <motion.div
        animate={{
          x: done ? 0 : [-(shake), shake, -(shake * 0.5)],
        }}
        transition={done ? {} : { repeat: Infinity, duration: 0.3 }}
        style={{ position: 'relative', width: '100%', aspectRatio: '160/65' }}
      >
        {/* Fuselage */}
        <div style={{
          position: 'absolute', top: 20, left: 20, right: 20,
          height: 20, borderRadius: '10px 20px 10px 4px',
          background: `hsla(210, 15%, ${40 + cleanPct * 15}%, ${0.2 + cleanPct * 0.15})`,
          border: `1px solid ${verse.palette.primaryGlow}`,
          boxShadow: done ? `0 0 15px hsla(200, 30%, 55%, 0.2)` : 'none',
          transition: 'all 0.3s',
        }} />
        {/* Wing */}
        <div style={{
          position: 'absolute', top: 28, left: 45, right: 55,
          height: 3, borderRadius: 1,
          background: `hsla(210, 15%, 45%, ${0.2 + cleanPct * 0.1})`,
        }} />
        {/* Tail */}
        <div style={{
          position: 'absolute', top: 10, left: 18,
          width: 3, height: 14, borderRadius: '2px 2px 0 0',
          background: `hsla(210, 15%, 45%, 0.2)`,
        }} />

        {/* Barnacles */}
        {BARNACLES.map(b => (
          <AnimatePresence key={b.id}>
            {!removed.has(b.id) && (
              <motion.button
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => removeBarnacle(b.id)}
                style={{
                  position: 'absolute', left: b.x, top: b.y,
                  width: 14, height: 10, borderRadius: 3,
                  background: 'hsla(30, 20%, 35%, 0.35)',
                  border: `1px solid hsla(30, 15%, 40%, 0.3)`,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0,
                }}
              >
                <span style={{ ...navicueType.micro, color: verse.palette.textFaint, opacity: 0.6 }}>
                  {b.label.slice(0, 3)}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        ))}

        {/* Speed indicator */}
        <div style={{
          position: 'absolute', right: 0, top: 28,
          display: 'flex', gap: 2,
        }}>
          {Array.from({ length: Math.floor(cleanPct * 4) }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
              style={{ width: 8, height: 1, background: verse.palette.accent, borderRadius: 1 }} />
          ))}
        </div>
      </motion.div>

      {/* Status */}
      {done ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={navicueStyles.accentHint(verse.palette)}>
          streamlined
        </motion.div>
      ) : (
        <span style={navicueStyles.interactionHint(verse.palette)}>
          tap each barnacle to remove ({removed.size}/{BARNACLES.length})
        </span>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'subtraction' : `drag: ${Math.round((1 - cleanPct) * 100)}%`}
      </div>
    </div>
  );
}