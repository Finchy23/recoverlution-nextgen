/**
 * CHRONOMANCER #1 -- 1011. The Past Edit (Reconsolidation)
 * "You cannot change the event. You can change the soundtrack."
 * INTERACTION: Tap to cycle through emotional filters on a memory.
 * Each filter recolors and rescores the same scene, demonstrating
 * that meaning is editable while facts are fixed.
 * STEALTH KBE: K (Knowing) -- Narrative Revision / Memory Reconsolidation
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueInteraction,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const FILTERS = [
  { id: 'raw',      label: 'Raw Memory',    hue: 0,   sat: 0,  desc: 'Unedited. As it felt then.' },
  { id: 'gold',     label: 'Gold Filter',   hue: 42,  sat: 50, desc: 'The inciting incident of your victory.' },
  { id: 'silver',   label: 'Silver Lens',   hue: 210, sat: 15, desc: 'Data. Nothing more.' },
  { id: 'emerald',  label: 'Emerald Grade', hue: 155, sat: 35, desc: 'The soil from which you grew.' },
];

export default function Chronomancer_PastEdit({ onComplete }: Props) {
  const [filterIdx, setFilterIdx] = useState(0);
  const [committed, setCommitted] = useState(false);

  const handleTap = useCallback(() => {
    if (committed) return;
    setFilterIdx(i => (i + 1) % FILTERS.length);
  }, [committed]);

  const handleCommit = useCallback((advance: () => void) => {
    setCommitted(true);
    setTimeout(() => advance(), 2200);
  }, []);

  const f = FILTERS[filterIdx];

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'poetic_precision',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'knowing',
        hook: 'tap',
        specimenSeed: 1011,
        isSeal: false,
      }}
      arrivalText="A memory surfaces..."
      prompt="Tap to change the filter. The event is fixed. The meaning is not."
      resonantText="You cannot change the event. You can change the soundtrack."
      afterglowCoda="Reconsolidated."
      onComplete={onComplete}
      mechanism="Memory Reconsolidation"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          {/* Memory frame */}
          <motion.div
            onClick={handleTap}
            animate={{
              borderColor: f.sat > 0
                ? `hsla(${f.hue}, ${f.sat}%, 45%, 0.3)`
                : verse.palette.primaryGlow,
            }}
            style={{
              width: 240, height: 160, borderRadius: 8,
              border: `1px solid ${verse.palette.primaryGlow}`,
              position: 'relative', overflow: 'hidden', cursor: 'pointer',
            }}
          >
            <svg viewBox="0 0 240 160" style={{ width: '100%', height: '100%' }}>
              {/* Memory scene -- abstract landscape */}
              <rect width={240} height={160} fill="none" />
              <motion.rect
                x={0} y={100} width={240} height={60}
                animate={{ fill: f.sat > 0 ? `hsla(${f.hue}, ${f.sat}%, 20%, 0.2)` : 'rgba(255,255,255,0.03)' }}
                transition={{ duration: 0.8 }}
              />
              <motion.circle
                cx={180} cy={40} r={18}
                animate={{
                  fill: f.sat > 0 ? `hsla(${f.hue}, ${f.sat}%, 50%, 0.15)` : 'rgba(255,255,255,0.04)',
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.line
                x1={60} y1={100} x2={120} y2={60}
                stroke={verse.palette.primary}
                strokeWidth={0.5}
                animate={{ opacity: f.sat > 0 ? 0.2 : 0.06 }}
                transition={{ duration: 0.8 }}
              />
              <motion.line
                x1={120} y1={60} x2={180} y2={80}
                stroke={verse.palette.primary}
                strokeWidth={0.5}
                animate={{ opacity: f.sat > 0 ? 0.15 : 0.04 }}
                transition={{ duration: 0.8 }}
              />
              {/* Film grain dots */}
              {Array.from({ length: 12 }, (_, i) => (
                <motion.circle
                  key={i}
                  cx={20 + (i % 6) * 40} cy={20 + Math.floor(i / 6) * 80}
                  r={0.6} fill={verse.palette.accent}
                  animate={{ opacity: [0, 0.08, 0] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </svg>
            {/* Filter overlay */}
            {f.sat > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.12 }}
                transition={{ duration: 0.6 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: `hsla(${f.hue}, ${f.sat}%, 40%, 0.25)`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </motion.div>

          {/* Filter label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ ...navicueType.subheading, color: verse.palette.text, marginBottom: 6 }}>
                {f.label}
              </div>
              <div style={{ ...navicueType.texture, color: verse.palette.textFaint, maxWidth: 260 }}>
                {f.desc}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Commit */}
          {!committed && filterIdx > 0 && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              onClick={() => handleCommit(verse.advance)}
              whileTap={immersiveTapButton(verse.palette, 'accent').active}
              style={immersiveTapButton(verse.palette, 'accent').base}
            >
              keep this version
            </motion.button>
          )}
          {committed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
              style={{ ...navicueType.hint, color: verse.palette.textFaint }}
            >
              The memory holds its new light.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}