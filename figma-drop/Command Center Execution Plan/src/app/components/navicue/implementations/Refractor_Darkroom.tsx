/**
 * REFRACTOR #9 -- 1049. The Darkroom (Development)
 * "The image needs darkness to develop. Do not expose your dreams too soon."
 * INTERACTION: Hold presence in the dark -- image slowly emerges in the tray
 * STEALTH KBE: Incubation -- creative gestation (B)
 *
 * COMPOSITOR: sacred_ordinary / Stellar / night / believing / hold / 1049
 */
import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Refractor_Darkroom({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Stellar',
        chrono: 'night',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1049,
        isSeal: false,
      }}
      arrivalText="A red room. Safelight on."
      prompt="The image needs darkness to develop. Do not expose your dreams to the light too soon. Let them harden in the dark."
      resonantText="Incubation. The photograph exists before you see it. The chemistry needs time and stillness. Impatience is overexposure."
      afterglowCoda="Let them harden."
      onComplete={onComplete}
    >
      {(verse) => <DarkroomInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DarkroomInteraction({ verse }: { verse: any }) {
  const [development, setDevelopment] = useState(0);
  const [developed, setDeveloped] = useState(false);
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startHold = useCallback(() => {
    if (developed) return;
    holdRef.current = setInterval(() => {
      setDevelopment(prev => {
        const next = Math.min(prev + 1.2, 100);
        if (next >= 100) {
          clearInterval(holdRef.current!);
          setDeveloped(true);
          setTimeout(() => verse.advance(), 2500);
        }
        return next;
      });
    }, 80);
  }, [developed, verse]);

  const endHold = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Developer tray */}
      <div style={{
        width: 180,
        height: 120,
        borderRadius: 6,
        border: `1px solid hsla(0, 30%, 30%, 0.3)`,
        background: `hsla(0, 15%, 8%, 0.9)`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Red safelight ambient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, hsla(0, 40%, 20%, 0.15), transparent 70%)`,
        }} />

        {/* Developing image -- abstract shapes emerging */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Image layers that fade in at different development stages */}
          <motion.div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${verse.palette.primaryFaint} 0%, transparent 50%)`,
            opacity: development > 20 ? (development - 20) / 80 * 0.3 : 0,
          }} />
          <motion.div style={{
            position: 'absolute',
            width: 60,
            height: 40,
            left: '30%',
            top: '25%',
            borderRadius: 4,
            background: verse.palette.primaryGlow,
            opacity: development > 40 ? (development - 40) / 60 * 0.25 : 0,
          }} />
          <motion.div style={{
            position: 'absolute',
            width: 30,
            height: 50,
            left: '50%',
            top: '20%',
            borderRadius: 3,
            background: verse.palette.accentGlow,
            opacity: development > 60 ? (development - 60) / 40 * 0.2 : 0,
          }} />

          {/* Final clear image hint */}
          {development > 85 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              style={{
                position: 'absolute',
                inset: 0,
                border: `1px solid ${verse.palette.accent}`,
                borderRadius: 3,
              }}
            />
          )}
        </motion.div>

        {/* Development percentage */}
        <div style={{
          position: 'absolute',
          bottom: 4,
          right: 8,
          ...navicueType.micro,
          color: 'hsla(0, 30%, 50%, 0.4)',
          fontSize: 11,
        }}>
          {Math.round(development)}%
        </div>
      </div>

      {/* Hold zone */}
      {!developed && (
        <motion.div
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: `1px solid hsla(0, 25%, 35%, 0.4)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          <span style={{ ...navicueType.hint, color: 'hsla(0, 30%, 50%, 0.5)' }}>
            wait
          </span>
        </motion.div>
      )}

      {developed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          developed
        </motion.div>
      )}
    </div>
  );
}