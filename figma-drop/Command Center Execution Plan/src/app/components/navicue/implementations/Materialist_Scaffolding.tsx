/**
 * MATERIALIST #5 -- 1035. The Scaffolding
 * "The scaffolding is ugly. It is also necessary. Do not confuse the temporary with the permanent."
 * INTERACTION: A building with metal scaffolding poles. Tap to toggle
 * between seeing the ugly scaffolding and the building it protects.
 * The lesson: support structures are not the final product.
 * STEALTH KBE: K (Knowing) -- Distinguishing Process from Product
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Materialist_Scaffolding({ onComplete }: Props) {
  const [showScaffolding, setShowScaffolding] = useState(true);
  const [toggleCount, setToggleCount] = useState(0);
  const [committed, setCommitted] = useState(false);

  const handleToggle = useCallback(() => {
    if (committed) return;
    setShowScaffolding(s => !s);
    setToggleCount(c => c + 1);
  }, [committed]);

  const handleCommit = useCallback((advance: () => void) => {
    setCommitted(true);
    setTimeout(() => advance(), 2000);
  }, []);

  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'koan_paradox',
        form: 'Ember',
        chrono: 'social',
        kbe: 'knowing',
        hook: 'tap',
        specimenSeed: 1035,
        isSeal: false,
      }}
      arrivalText="Construction..."
      prompt="Tap to see through the scaffolding. Then look again."
      resonantText="The scaffolding is ugly. It is also necessary."
      afterglowCoda="Temporary is not permanent."
      onComplete={onComplete}
      mechanism="Process Acceptance"
    >
      {(verse) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
          <motion.div
            onClick={handleToggle}
            style={{ ...navicueStyles.heroScene(verse.palette, 220 / 200), cursor: 'pointer' }}
          >
            <svg viewBox="0 0 220 200" style={{ width: '100%', height: '100%' }}>
              {/* Building */}
              <motion.rect
                x={60} y={30} width={100} height={150} rx={3}
                fill="none" stroke={verse.palette.accent} strokeWidth={0.8}
                animate={{ opacity: showScaffolding ? 0.08 : 0.2 }}
                transition={{ duration: 0.8 }}
              />
              {/* Windows */}
              {Array.from({ length: 6 }, (_, i) => (
                <motion.rect
                  key={i}
                  x={75 + (i % 2) * 50} y={45 + Math.floor(i / 2) * 45}
                  width={20} height={25} rx={1}
                  fill="none" stroke={verse.palette.accent} strokeWidth={0.4}
                  animate={{ opacity: showScaffolding ? 0.04 : 0.12 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
              {/* Door */}
              <motion.rect
                x={95} y={145} width={30} height={35} rx={2}
                fill="none" stroke={verse.palette.accent} strokeWidth={0.5}
                animate={{ opacity: showScaffolding ? 0.05 : 0.15 }}
                transition={{ duration: 0.6 }}
              />

              {/* Scaffolding */}
              <motion.g
                animate={{ opacity: showScaffolding ? 0.2 : 0.02 }}
                transition={{ duration: 0.8 }}
              >
                {/* Vertical poles */}
                {[45, 95, 145, 175].map((x, i) => (
                  <line key={`v${i}`}
                    x1={x} y1={20} x2={x} y2={185}
                    stroke={verse.palette.primary} strokeWidth={0.8} />
                ))}
                {/* Horizontal bars */}
                {[40, 80, 120, 160].map((y, i) => (
                  <line key={`h${i}`}
                    x1={40} y1={y} x2={180} y2={y}
                    stroke={verse.palette.primary} strokeWidth={0.6} />
                ))}
                {/* Cross braces */}
                <line x1={45} y1={40} x2={95} y2={80}
                  stroke={verse.palette.primary} strokeWidth={0.3} />
                <line x1={145} y1={80} x2={175} y2={120}
                  stroke={verse.palette.primary} strokeWidth={0.3} />
                <line x1={45} y1={120} x2={95} y2={160}
                  stroke={verse.palette.primary} strokeWidth={0.3} />
              </motion.g>
            </svg>
          </motion.div>

          {/* Toggle label */}
          <motion.div
            animate={{ opacity: 0.5 }}
            style={{ ...navicueType.data, color: verse.palette.textFaint, textAlign: 'center' }}
          >
            {showScaffolding ? 'scaffolding visible' : 'building revealed'}
          </motion.div>

          {!committed && toggleCount >= 2 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }}
              transition={{ duration: 0.6 }}
              onClick={() => handleCommit(verse.advance)}
              whileTap={{ scale: 0.95 }}
              style={{
                ...immersiveTapButton,
                ...navicueType.hint,
                color: verse.palette.accent,
                cursor: 'pointer',
              }}
            >
              both are needed
            </motion.div>
          )}

          {committed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
              transition={{ duration: 1.5 }}
              style={{ ...navicueType.texture, color: verse.palette.textFaint, fontStyle: 'italic' }}
            >
              The mess is the method.
            </motion.div>
          )}
        </div>
      )}
    </NaviCueVerse>
  );
}