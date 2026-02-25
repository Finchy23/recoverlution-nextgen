/**
 * RECEIVER #3 -- 1173. The Squelch (Threshold)
 * "Turn up the squelch. Only open the gate for something real."
 * INTERACTION: Low-level anxiety buzz. Turn up squelch threshold. Silence. Only real signals pass.
 * STEALTH KBE: Boundaries -- cognitive filtering (B)
 *
 * COMPOSITOR: sacred_ordinary / Pulse / morning / believing / tap / 1173
 */
import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Receiver_Squelch({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Pulse',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1173,
        isSeal: false,
      }}
      arrivalText="A constant low-level buzz."
      prompt="You are listening to the background radiation of your own fear. Turn up the squelch. Only open the gate for something real."
      resonantText="Boundaries. The buzz was not information. It was anxiety pretending to be vigilance. You raised the threshold and the silence arrived. Cognitive filtering: not everything that is loud is important."
      afterglowCoda="Silence."
      onComplete={onComplete}
    >
      {(verse) => <SquelchInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SquelchInteraction({ verse }: { verse: any }) {
  const [squelchLevel, setSquelchLevel] = useState(0);
  const [done, setDone] = useState(false);
  const MAX_SQUELCH = 6;

  const raiseSquelch = useCallback(() => {
    if (done) return;
    setSquelchLevel(prev => {
      const next = prev + 1;
      if (next >= MAX_SQUELCH) {
        setDone(true);
        setTimeout(() => verse.advance(), 2400);
      }
      return next;
    });
  }, [done, verse]);

  const pct = squelchLevel / MAX_SQUELCH;
  const buzzOpacity = Math.max(0, 0.5 - pct * 0.5);
  const buzzLines = Math.max(0, Math.round(15 * (1 - pct)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, minHeight: 240 }}>
      <div style={navicueStyles.heroScene(verse.palette, 160 / 90)}>
        <svg viewBox="0 0 160 90" style={navicueStyles.heroSvg}>
          {/* Buzz lines (anxiety static) */}
          {Array.from({ length: buzzLines }).map((_, i) => {
            const x = 10 + (i / 15) * 140;
            const h = (Math.random() * 12 + 4) * (1 - pct);
            return (
              <motion.line key={i}
                x1={x} y1={45 - h} x2={x} y2={45 + h}
                stroke="hsla(0, 20%, 50%, 0.2)"
                strokeWidth={1.5}
                animate={{ opacity: [buzzOpacity, buzzOpacity * 0.5, buzzOpacity] }}
                transition={{ repeat: Infinity, duration: 0.3 + Math.random() * 0.3, delay: i * 0.05 }}
              />
            );
          })}

          {/* Squelch threshold line */}
          <line x1={10} y1={45 - pct * 25} x2={150} y2={45 - pct * 25}
            stroke={done ? verse.palette.accent : 'hsla(180, 20%, 50%, 0.3)'}
            strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
          <line x1={10} y1={45 + pct * 25} x2={150} y2={45 + pct * 25}
            stroke={done ? verse.palette.accent : 'hsla(180, 20%, 50%, 0.3)'}
            strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />

          {/* Gate label */}
          <text x={155} y={45 - pct * 25 - 3} textAnchor="end"
            style={{ ...navicueType.micro }}
            fill={verse.palette.textFaint} opacity={0.3}>
            gate
          </text>

          {/* Silence indicator */}
          {done && (
            <motion.text
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              x={80} y={48} textAnchor="middle"
              style={{ ...navicueType.hint, fontSize: 10 }}
              fill={verse.palette.accent}>
              silence
            </motion.text>
          )}

          {/* Squelch level indicator */}
          <text x={80} y={12} textAnchor="middle"
            style={{ ...navicueType.hint, fontSize: 8 }}
            fill={done ? verse.palette.accent : verse.palette.textFaint}
            opacity={0.4}>
            squelch: {squelchLevel}/{MAX_SQUELCH}
          </text>
        </svg>
      </div>

      {/* Action */}
      {!done ? (
        <motion.button onClick={raiseSquelch}
          style={immersiveTapButton(verse.palette).base}
          whileTap={immersiveTapButton(verse.palette).active}>
          raise squelch
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}>
          filtered
        </motion.div>
      )}

      <div style={{ ...navicueType.hint, color: verse.palette.textFaint, opacity: 0.35, fontSize: 10 }}>
        {done ? 'cognitive filtering' : 'only let the real through'}
      </div>
    </div>
  );
}