/**
 * CATALYST #1 -- 1061. The Phase Change (Ice to Water)
 * "Latent heat. You put energy in, but you see no change. Keep heating."
 * INTERACTION: Hold to apply heat -- nothing changes for 5s, then sudden melt
 * STEALTH KBE: Perseverance -- faith in latent progress (B)
 *
 * COMPOSITOR: sacred_ordinary / Glacier / morning / believing / hold / 1061
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Catalyst_PhaseChange({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Glacier',
        chrono: 'morning',
        kbe: 'b',
        hook: 'hold',
        specimenSeed: 1061,
        isSeal: false,
      }}
      arrivalText="A block of ice. Frozen solid."
      prompt="Latent heat. You put energy in, but you see no change. The temperature is rising inside the solid. Keep heating. The melt is instant."
      resonantText="Perseverance. The change was happening all along. You just could not see it. The phase change only becomes visible at the threshold."
      afterglowCoda="The melt is instant."
      onComplete={onComplete}
    >
      {(verse) => <PhaseInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function PhaseInteraction({ verse }: { verse: any }) {
  const [heating, setHeating] = useState(false);
  const [heatTime, setHeatTime] = useState(0);
  const [melted, setMelted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MELT_THRESHOLD = 5; // seconds of sustained heat

  useEffect(() => {
    if (heating && !melted) {
      intervalRef.current = setInterval(() => {
        setHeatTime(prev => {
          const next = prev + 0.1;
          if (next >= MELT_THRESHOLD) {
            setMelted(true);
            setHeating(false);
            setTimeout(() => verse.advance(), 2500);
            return MELT_THRESHOLD;
          }
          return next;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [heating, melted]);

  const progress = heatTime / MELT_THRESHOLD;
  // Ice shows NO visual change until 90% -- latent heat concept
  const visualChange = progress > 0.9 ? (progress - 0.9) * 10 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* Ice / Water visual */}
      <div style={{
        width: 140,
        height: 100,
        borderRadius: melted ? 40 : 8,
        border: `1px solid ${verse.palette.primaryGlow}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-radius 0.6s',
      }}>
        {/* Ice block */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, hsla(200, 30%, 70%, ${0.3 - visualChange * 0.3}), hsla(210, 25%, 55%, ${0.2 - visualChange * 0.2}))`,
          }}
          animate={{ opacity: melted ? 0 : 1 }}
          transition={{ duration: 0.8 }}
        />
        {/* Crack lines -- appear at melt */}
        {melted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 50% 60%, ${verse.palette.primaryFaint}, transparent 70%)`,
            }}
          />
        )}
        {/* Water flow */}
        {melted && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 0.4 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: `linear-gradient(to top, ${verse.palette.accent}40, transparent)`,
            }}
          />
        )}
        {/* State label */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <motion.span
            style={{ ...navicueType.hint, color: verse.palette.textFaint }}
            animate={{ opacity: melted ? 0 : 1 }}
          >
            {heating && !melted ? 'no visible change' : melted ? '' : 'frozen'}
          </motion.span>
          {melted && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ ...navicueType.hint, color: verse.palette.accent }}
            >
              water flows
            </motion.span>
          )}
        </div>
      </div>

      {/* Hidden progress -- invisible to match latent heat */}
      {heating && !melted && (
        <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.3, fontSize: 11 }}>
          internal temperature rising...
        </div>
      )}

      {/* Heat button */}
      {!melted && (
        <button
          onPointerDown={() => setHeating(true)}
          onPointerUp={() => setHeating(false)}
          onPointerLeave={() => setHeating(false)}
          style={{
            ...immersiveTapButton(verse.palette).base,
            background: heating ? verse.palette.primaryFaint : 'transparent',
          }}
        >
          {heating ? 'heating...' : 'apply heat'}
        </button>
      )}
    </div>
  );
}