/**
 * DREAMWALKER #5 — The Recurring Door
 * "The dream keeps sending this door. What is it trying to tell you?"
 * ARCHETYPE: Pattern A (Tap ×5) — A door that keeps reappearing.
 * Each tap opens it to something different: a room, a field, a mirror,
 * a cliff, yourself standing on the other side. Recurring dreams as messages.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const REVEALS = [
  { label: 'AN EMPTY ROOM', desc: 'space for what{\\u2019}s next', fill: [245, 20, 8] },
  { label: 'A GREEN FIELD', desc: 'permission to breathe', fill: [140, 18, 10] },
  { label: 'A MIRROR', desc: 'the question looking back', fill: [200, 15, 12] },
  { label: 'A CLIFF EDGE', desc: 'the leap you keep postponing', fill: [30, 12, 8] },
  { label: 'YOURSELF', desc: 'standing on the other side, waving', fill: [185, 18, 15] },
];

export default function DreamWalker_RecurringDoor({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const [doorOpen, setDoorOpen] = useState(false);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const openDoor = () => {
    if (stage !== 'active' || taps >= REVEALS.length || doorOpen) return;
    setDoorOpen(true);
    addTimer(() => {
      setDoorOpen(false);
      const next = taps + 1;
      setTaps(next);
      if (next >= REVEALS.length) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
      }
    }, 2500);
  };

  const reveal = REVEALS[Math.min(taps, REVEALS.length - 1)];
  const rc = (a: number, lo = 0) => `hsla(${reveal.fill[0]}, ${reveal.fill[1]}%, ${Math.min(100, reveal.fill[2] + lo)}%, ${a})`;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            That door again...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The same door keeps appearing in your dreams. Your subconscious is not random — it is persistent. A recurring dream is a message you haven{'\u2019'}t read yet.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap the door to open it</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={openDoor}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= REVEALS.length || doorOpen ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '180px', height: '200px' }}>
              <svg width="100%" height="100%" viewBox="0 0 180 200">
                {/* Dark hallway */}
                <rect width="180" height="200" fill={themeColor(TH.voidHSL, 0.98, 0)} />

                {/* What's behind — revealed when open */}
                <AnimatePresence>
                  {doorOpen && (
                    <motion.rect x="50" y="30" width="80" height="140" rx="2"
                      fill={rc(0.9)}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }} />
                  )}
                </AnimatePresence>

                {/* The door frame */}
                <rect x="48" y="28" width="84" height="144" rx="3"
                  fill="none" stroke={themeColor(TH.primaryHSL, 0.08, 10)} strokeWidth="1" />

                {/* The door panel — swings open */}
                <motion.g
                  animate={{ scaleX: doorOpen ? 0.1 : 1 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 60 }}
                  style={{ transformOrigin: '50px 100px' }}>
                  <rect x="50" y="30" width="80" height="140" rx="2"
                    fill={themeColor(TH.primaryHSL, 0.06, 4)}
                    stroke={themeColor(TH.primaryHSL, 0.06, 8)} strokeWidth="0.5" />
                  {/* Door panels */}
                  <rect x="55" y="40" width="30" height="55" rx="1"
                    fill="none" stroke={themeColor(TH.primaryHSL, 0.04, 6)} strokeWidth={safeSvgStroke(0.3)} />
                  <rect x="55" y="105" width="30" height="55" rx="1"
                    fill="none" stroke={themeColor(TH.primaryHSL, 0.04, 6)} strokeWidth={safeSvgStroke(0.3)} />
                  <rect x="95" y="40" width="30" height="55" rx="1"
                    fill="none" stroke={themeColor(TH.primaryHSL, 0.04, 6)} strokeWidth={safeSvgStroke(0.3)} />
                  <rect x="95" y="105" width="30" height="55" rx="1"
                    fill="none" stroke={themeColor(TH.primaryHSL, 0.04, 6)} strokeWidth={safeSvgStroke(0.3)} />
                  {/* Doorknob */}
                  <circle cx="122" cy="100" r="3"
                    fill={themeColor(TH.accentHSL, 0.1, 15)}
                    stroke={themeColor(TH.accentHSL, 0.06, 12)} strokeWidth="0.5" />
                </motion.g>

                {/* Reveal text when door is open */}
                {doorOpen && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    <text x="90" y="95" textAnchor="middle" fontSize="11" fontFamily="monospace"
                      fill={rc(0.2, 25)} letterSpacing="0.1em">
                      {reveal.label}
                    </text>
                    <text x="90" y="108" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic"
                      fill={rc(0.12, 20)}>
                      {reveal.desc}
                    </text>
                  </motion.g>
                )}

                {/* Door number */}
                <text x="90" y="188" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.accentHSL, 0.08, 10)} letterSpacing="0.1em">
                  DOOR {taps + 1} OF {REVEALS.length}
                </text>
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {REVEALS.map((_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.2, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Five openings. Behind the last one — you. The recurring dream stops when you finally receive the message. The door was always a mirror.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>recurring means unread</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>The message was always for you.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}