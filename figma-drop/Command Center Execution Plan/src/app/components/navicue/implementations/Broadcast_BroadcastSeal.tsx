/**
 * BROADCAST #10 — The Broadcast Seal (The Proof)
 * "The signal is live. Carry it with you."
 * ARCHETYPE: Pattern A (Tap) — Tap the radio tower, waves propagate outward endlessly
 * ENTRY: Cold Open — a radio tower silhouette, static
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'cold' | 'active' | 'resonant' | 'afterglow';

export default function Broadcast_BroadcastSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('cold');
  const [broadcasting, setBroadcasting] = useState(false);
  const [waves, setWaves] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 1800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const activate = () => {
    if (stage !== 'active' || broadcasting) return;
    setBroadcasting(true);
    let count = 0;
    const wave = setInterval(() => {
      count++;
      setWaves(count);
      if (count >= 6) {
        clearInterval(wave);
        t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
      }
    }, 500);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'cold' && (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Radio tower silhouette */}
            <svg width="60" height="80" viewBox="0 0 60 80">
              <line x1="30" y1="20" x2="30" y2="75" stroke={themeColor(TH.primaryHSL, 0.12, 8)} strokeWidth="2" />
              <line x1="20" y1="55" x2="30" y2="30" stroke={themeColor(TH.primaryHSL, 0.08, 6)} strokeWidth="1.5" />
              <line x1="40" y1="55" x2="30" y2="30" stroke={themeColor(TH.primaryHSL, 0.08, 6)} strokeWidth="1.5" />
              <circle cx="30" cy="18" r="3" fill={themeColor(TH.accentHSL, 0.1, 8)} />
            </svg>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={activate}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: broadcasting ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The signal is live. You don{'\u2019'}t need to look at the screen. The screen changes the room. Tap the tower. Begin the broadcast.
            </div>
            <div style={{ position: 'relative', width: '200px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Broadcast waves */}
              {Array.from({ length: waves }, (_, i) => (
                <motion.div key={i}
                  initial={{ scale: 0.2, opacity: 0.3 }}
                  animate={{ scale: 1 + i * 0.5, opacity: 0 }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', top: '20px', left: '70px',
                    width: '60px', height: '60px', borderRadius: '50%',
                    border: `1px solid ${themeColor(TH.accentHSL, 0.15, 10)}`,
                  }} />
              ))}
              {/* Tower */}
              <svg width="60" height="100" viewBox="0 0 60 100" style={{ position: 'relative', zIndex: 1 }}>
                <line x1="30" y1="25" x2="30" y2="95" stroke={themeColor(TH.primaryHSL, 0.15, 8)} strokeWidth="2.5" />
                <line x1="18" y1="70" x2="30" y2="40" stroke={themeColor(TH.primaryHSL, 0.1, 6)} strokeWidth="1.5" />
                <line x1="42" y1="70" x2="30" y2="40" stroke={themeColor(TH.primaryHSL, 0.1, 6)} strokeWidth="1.5" />
                <circle cx="30" cy="22" r="4"
                  fill={broadcasting ? themeColor(TH.accentHSL, 0.3, 12) : themeColor(TH.accentHSL, 0.1, 8)} />
                {broadcasting && (
                  <circle cx="30" cy="22" r="8"
                    fill="none" stroke={themeColor(TH.accentHSL, 0.1, 10)} strokeWidth="1" />
                )}
              </svg>
            </div>
            {!broadcasting && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>tap to broadcast</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Object Permanence. Creating a sense that the support system is active and broadcasting even when not seen increases your sense of security. Secure Attachment Base. The signal is live. Carry it with you. It continues even when you close the window.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Broadcasting.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}
