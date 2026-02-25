/**
 * ENGINE #5 -- 1055. The Insulation
 * "Your environment is stealing your heat. Insulate your life."
 * INTERACTION: Tap to add insulation layers -- heat loss stops
 * STEALTH KBE: Environment design -- protective strategy (K)
 *
 * COMPOSITOR: relational_ghost / Circuit / social / knowing / tap / 1055
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueInteraction, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const LAYERS = ['walls', 'roof', 'windows'];

export default function Engine_Insulation({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'relational_ghost',
        form: 'Circuit',
        chrono: 'social',
        kbe: 'k',
        hook: 'tap',
        specimenSeed: 1055,
        isSeal: false,
      }}
      arrivalText="A house in winter. Heat escaping."
      prompt="Your environment is stealing your heat. Insulate your life. Close the door to the cold draft."
      resonantText="Environment design. You cannot outwork a leaking house. Fix the structure. Then the warmth stays without effort."
      afterglowCoda="Close the draft."
      onComplete={onComplete}
    >
      {(verse) => <InsulationInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function InsulationInteraction({ verse }: { verse: any }) {
  const [insulated, setInsulated] = useState<string[]>([]);
  const [temp, setTemp] = useState(65);
  const allDone = insulated.length >= LAYERS.length;

  // Heat escapes from uninsulated areas
  useEffect(() => {
    if (allDone) return;
    const leakRate = (LAYERS.length - insulated.length) * 0.3;
    const iv = setInterval(() => {
      setTemp(prev => Math.max(prev - leakRate, 20));
    }, 200);
    return () => clearInterval(iv);
  }, [insulated, allDone]);

  // Heat recovers when fully insulated
  useEffect(() => {
    if (!allDone) return;
    const iv = setInterval(() => {
      setTemp(prev => {
        if (prev >= 72) { clearInterval(iv); return 72; }
        return prev + 1;
      });
    }, 80);
    setTimeout(() => verse.advance(), 3000);
    return () => clearInterval(iv);
  }, [allDone, verse]);

  const handleInsulate = (layer: string) => {
    if (insulated.includes(layer)) return;
    setInsulated(prev => [...prev, layer]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* House visualization */}
      <div style={{
        width: 160,
        height: 120,
        position: 'relative',
      }}>
        {/* Roof */}
        <svg width="160" height="50" viewBox="0 0 160 50" style={{ position: 'absolute', top: 0 }}>
          <polygon points="80,5 155,48 5,48"
            fill="none"
            stroke={insulated.includes('roof') ? verse.palette.accent : verse.palette.primaryGlow}
            strokeWidth={insulated.includes('roof') ? 1.5 : 0.8}
            opacity={insulated.includes('roof') ? 0.5 : 0.2}
          />
          {/* Heat escaping from roof */}
          {!insulated.includes('roof') && Array.from({ length: 3 }, (_, i) => (
            <motion.line
              key={i}
              x1={60 + i * 20} y1="10" x2={60 + i * 20} y2="-5"
              stroke="hsla(0, 50%, 50%, 0.2)"
              strokeWidth={1}
              animate={{ y1: [10, 0], opacity: [0.2, 0] }}
              transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
        </svg>

        {/* Walls */}
        <div style={{
          position: 'absolute',
          top: 45,
          left: 15,
          right: 15,
          bottom: 0,
          border: `1px solid ${insulated.includes('walls') ? verse.palette.accent : verse.palette.primaryGlow}`,
          borderBottom: 'none',
          opacity: insulated.includes('walls') ? 0.5 : 0.2,
          borderWidth: insulated.includes('walls') ? 1.5 : 0.8,
        }}>
          {/* Windows */}
          <div style={{
            position: 'absolute',
            width: 20,
            height: 18,
            border: `1px solid ${insulated.includes('windows') ? verse.palette.accent : verse.palette.primaryGlow}`,
            left: 15,
            top: 15,
            opacity: insulated.includes('windows') ? 0.5 : 0.2,
          }} />
          <div style={{
            position: 'absolute',
            width: 20,
            height: 18,
            border: `1px solid ${insulated.includes('windows') ? verse.palette.accent : verse.palette.primaryGlow}`,
            right: 15,
            top: 15,
            opacity: insulated.includes('windows') ? 0.5 : 0.2,
          }} />
        </div>

        {/* Internal warmth glow */}
        <motion.div
          style={{
            position: 'absolute',
            top: 55,
            left: 30,
            right: 30,
            bottom: 10,
            borderRadius: 4,
            background: `radial-gradient(circle, hsla(30, 40%, ${20 + temp * 0.3}%, ${temp / 200}), transparent)`,
          }}
        />
      </div>

      {/* Temperature */}
      <div style={{ ...navicueType.status, color: temp < 40 ? 'hsla(200, 40%, 50%, 0.6)' : verse.palette.textFaint }}>
        {Math.round(temp)}F
      </div>

      {/* Layer buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {LAYERS.map(layer => {
          const done = insulated.includes(layer);
          const btn = immersiveTapButton(verse.palette, 'primary', 'small');
          return (
            <motion.button
              key={layer}
              onClick={() => !done && handleInsulate(layer)}
              whileTap={done ? {} : btn.active}
              style={{
                ...btn.base,
                opacity: done ? 0.4 : 1,
                ...(done ? btn.disabled : {}),
              }}
            >
              {layer}
            </motion.button>
          );
        })}
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}
        >
          warm
        </motion.div>
      )}
    </div>
  );
}