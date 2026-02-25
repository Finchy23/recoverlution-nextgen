/**
 * BROADCAST #7 — The Presence Radar
 * "Someone you love is calm right now. Feel their peace."
 * ARCHETYPE: Pattern A (Tap) — Tap to ping the radar, green dots appear
 * ENTRY: Reverse Reveal — green dots already glowing, then the meaning reveals
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'reveal' | 'active' | 'resonant' | 'afterglow';

// Pre-computed dot positions on the radar
const DOTS = [
  { x: 65, y: 40, delay: 0.5 },
  { x: 130, y: 70, delay: 1.2 },
  { x: 45, y: 95, delay: 2.0 },
];

export default function Broadcast_PresenceRadar({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const [pings, setPings] = useState(0);
  const [sweepAngle, setSweepAngle] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2200);
    const sweep = setInterval(() => setSweepAngle(a => (a + 3) % 360), 50);
    return () => { T.current.forEach(clearTimeout); clearInterval(sweep); };
  }, []);

  const click = () => {
    if (stage !== 'active' || pings >= 3) return;
    const n = pings + 1;
    setPings(n);
    if (n >= 3) t(() => { setStage('resonant'); t(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2500);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rev" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px' }}>
              {/* Radar rings */}
              {[30, 50, 70].map((r, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${70 - r}px`, top: `${70 - r}px`,
                  width: `${r * 2}px`, height: `${r * 2}px`, borderRadius: '50%',
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 5)}`,
                }} />
              ))}
              {/* Green dot already visible */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute', left: '63px', top: '38px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: 'hsla(140, 30%, 45%, 0.4)',
                }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1.2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>someone is calm</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={click}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: pings >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Someone you love is calm right now. Feel their peace. You are connected. Tap to ping the network. Each ping reveals another presence.
            </div>
            <div style={{ position: 'relative', width: '160px', height: '160px' }}>
              {/* Radar rings */}
              {[35, 55, 75].map((r, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${80 - r}px`, top: `${80 - r}px`,
                  width: `${r * 2}px`, height: `${r * 2}px`, borderRadius: '50%',
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 5)}`,
                }} />
              ))}
              {/* Sweep line */}
              <div style={{
                position: 'absolute', left: '79px', top: '80px', width: '1px', height: '75px',
                background: `linear-gradient(to bottom, ${themeColor(TH.accentHSL, 0.12, 8)}, transparent)`,
                transformOrigin: 'top center', transform: `rotate(${sweepAngle}deg)`,
              }} />
              {/* Presence dots */}
              {DOTS.slice(0, pings).map((dot, i) => (
                <motion.div key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: [0.25, 0.4, 0.25] }}
                  transition={{ opacity: { duration: 2, repeat: Infinity }, scale: { duration: 0.5 } }}
                  style={{
                    position: 'absolute', left: `${dot.x}px`, top: `${dot.y}px`,
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: 'hsla(140, 30%, 45%, 0.4)',
                    boxShadow: '0 0 8px hsla(140, 30%, 45%, 0.15)',
                  }} />
              ))}
              {/* Center point */}
              <div style={{
                position: 'absolute', left: '77px', top: '77px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.15, 8),
              }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2].map(i => (
                <motion.div key={i} style={{ width: '24px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < pings ? 'hsla(140, 30%, 45%, 0.4)' : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
            {pings < 3 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>ping</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Passive Social Awareness. Knowing that a connection exists without requiring active interaction provides social support buffering without the cognitive load of conversation. Ambient Intimacy {'\u2014'} someone is calm, somewhere, and you can feel it from here.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Connected.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}